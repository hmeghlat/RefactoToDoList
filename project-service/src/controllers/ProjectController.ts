import type { Request, Response } from 'express';
import type { Connection, ResultSetHeader, RowDataPacket } from 'mysql2';

import { toProject, type ProjectRow } from '../models/project.js';
type ProjectRowPacket = RowDataPacket & ProjectRow;

import {
    isNonEmptyString,
    badRequest,
    datesAreValid,
    getProjectById,
    parseBudgetOrDefault,
    parseDateOnlyOrNull,
    parsePositiveInt,
    parseProjectStatus,
} from '../service/projectService.js';
export const createProjectController = (db: Connection) => {
    const createProject = async (req: Request, res: Response) => {
        try {
            const body = (req.body ?? {}) as Record<string, unknown>;
            const ownerUserIdFromAuth = parsePositiveInt(req.auth?.userId);
            const ownerUserIdFromBody = parsePositiveInt(body.ownerUserId);
            const ownerUserId = ownerUserIdFromAuth ?? ownerUserIdFromBody;
            const name = isNonEmptyString(body.name) ? body.name.trim() : '';
            const description = isNonEmptyString(body.description)
                ? body.description.trim()
                : null;
            const startDate = new Date(
                parseDateOnlyOrNull(body.startDate) || '',
            );
            const dueDate = new Date(parseDateOnlyOrNull(body.dueDate) || '');

            if (!datesAreValid(startDate, dueDate)) {
                badRequest(
                    req,
                    res,
                    'Les dates sont invalides : la date de fin doit être supérieure ou égale à la date de début, et les dates doivent être superieur ou egale à la date actuelle.',
                );
                return;
            }
            const budget = parseBudgetOrDefault(body.budget);
            const status = parseProjectStatus(body.status) ?? 'NOT_STARTED';

            if (
                ownerUserIdFromAuth &&
                ownerUserIdFromBody &&
                ownerUserIdFromAuth !== ownerUserIdFromBody
            ) {
                res.status(403).json({
                    message: 'ownerUserId does not match authenticated user',
                });
                return;
            }

            if (!ownerUserId || !name) {
                badRequest(
                    req,
                    res,
                    'name is required (ownerUserId comes from auth token)',
                );
                return;
            }

            // Vérification du nom de projet unique pour l'utilisateur
            const [existingRows] = await db
                .promise()
                .query<
                    ProjectRowPacket[]
                >('SELECT id FROM projects WHERE owner_user_id = ? AND name = ?', [ownerUserId, name]);
            if (existingRows.length > 0) {
                res.status(409).json({
                    message:
                        'Un projet avec ce nom existe déjà pour cet utilisateur.',
                });
                return;
            }

            const [result] = await db
                .promise()
                .execute<ResultSetHeader>(
                    'INSERT INTO projects (owner_user_id, name, description, start_date, due_date, budget, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        ownerUserId,
                        name,
                        description,
                        startDate,
                        dueDate,
                        budget,
                        status,
                    ],
                );

            const created = await getProjectById(db, result.insertId);
            if (!created) {
                res.status(500).json({ message: 'Project creation failed' });
                return;
            }

            res.status(201).json({ project: created });
        } catch (error) {
            console.error('createProject error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    return { createProject };
};

export const getProjectController = (db: Connection) => {
    const getProject = async (req: Request, res: Response) => {
        try {
            const id = parsePositiveInt(req.params.id);
            if (!id) {
                badRequest(req, res, 'Invalid project ID');
                return;
            }

            const project = await getProjectById(db, id);
            if (!project) {
                res.status(404).json({ message: 'Project not found' });
                return;
            }

            res.status(200).json({ project });
        } catch (error) {
            console.error('getProject error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    return { getProject };
};

export const updateProjectController = (db: Connection) => {
    const updateProject = async (req: Request, res: Response) => {
        try {
            const id = parsePositiveInt(req.params.id);
            if (!id) {
                badRequest(req, res, 'Invalid project ID');
                return;
            }

            const existing = await getProjectById(db, id);
            if (!existing) {
                res.status(404).json({ message: 'Project not found' });
                return;
            }

            const body = (req.body ?? {}) as Record<string, unknown>;

            const name = isNonEmptyString(body.name)
                ? body.name.trim()
                : existing.name;
            const description =
                body.description !== undefined
                    ? isNonEmptyString(body.description)
                        ? body.description.trim()
                        : null
                    : existing.description;
            const startDate =
                body.startDate !== undefined
                    ? new Date(parseDateOnlyOrNull(body.startDate) || '')
                    : existing.startDate;
            const dueDate =
                body.dueDate !== undefined
                    ? new Date(parseDateOnlyOrNull(body.dueDate) || '')
                    : existing.dueDate;

            if (!datesAreValid(startDate, dueDate)) {
                badRequest(
                    req,
                    res,
                    'Les dates sont invalides : la date de fin doit être supérieure ou égale à la date de début, et les dates doivent être supérieures ou égales à la date actuelle.',
                );
                return;
            }

            const budget =
                body.budget !== undefined
                    ? parseBudgetOrDefault(body.budget)
                    : existing.budget;
            const status = parseProjectStatus(body.status) ?? existing.status;

            await db
                .promise()
                .execute(
                    'UPDATE projects SET name = ?, description = ?, start_date = ?, due_date = ?, budget = ?, status = ?, updated_at = NOW() WHERE id = ?',
                    [name, description, startDate, dueDate, budget, status, id],
                );

            const updated = await getProjectById(db, id);
            res.status(200).json({ project: updated });
        } catch (error) {
            console.error('updateProject error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    return { updateProject };
};

export const deleteProjectController = (db: Connection) => {
    const deleteProject = async (req: Request, res: Response) => {
        try {
            const id = parsePositiveInt(req.params.id);
            if (!id) {
                badRequest(req, res, 'Invalid project ID');
                return;
            }

            const existing = await getProjectById(db, id);
            if (!existing) {
                res.status(404).json({ message: 'Project not found' });
                return;
            }

            // Récupérer les tâches du projet via task-service
            const taskServiceUrl =
                process.env.TASK_SERVICE_URL || 'http://localhost:3002';
            const response = await fetch(
                `${taskServiceUrl.replace(/\/+$/, '')}/tasks?projectId=${id}`,
                {
                    headers: { accept: 'application/json' },
                },
            );
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                res.status(502).json({
                    message: 'task-service error',
                    status: response.status,
                    body: text,
                });
                return;
            }
            const json = await response.json();
            const tasks = Array.isArray(json.tasks) ? json.tasks : [];

            // Vérifier si toutes les tâches sont DONE
            const allDone =
                tasks.length === 0 ||
                tasks.every((t: any) => t.status === 'DONE');
            const forceDelete =
                req.query.force === 'true' || (req.body as Record<string, unknown> | undefined)?.force === true;

            if (!allDone && !forceDelete) {
                res.status(409).json({
                    message:
                        'Certaines tâches ne sont pas terminées. Ajoutez force=true pour confirmer la suppression.',
                    tasks: tasks.filter((t: any) => t.status !== 'DONE'),
                });
                return;
            }

            await db
                .promise()
                .execute('DELETE FROM projects WHERE id = ?', [id]);
            res.status(204).send();
        } catch (error) {
            console.error('deleteProject error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    return { deleteProject };
};

export const getAllProjectsController = (db: Connection) => {
    const getAllProjects = async (req: Request, res: Response) => {
        try {
            // Récupère l'utilisateur connecté
            const userId = parsePositiveInt(req.auth?.userId);
            if (!userId) {
                res.status(401).json({
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const [rows] = await db
                .promise()
                .query<
                    ProjectRowPacket[]
                >('SELECT * FROM projects WHERE owner_user_id = ?', [userId]);

            const projects = rows.map(toProject);
            res.status(200).json({ projects });
        } catch (error) {
            console.error('getAllProjects error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    return { getAllProjects };
};
