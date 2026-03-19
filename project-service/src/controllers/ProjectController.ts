import type { Request, Response } from 'express';
import type { Connection, ResultSetHeader, RowDataPacket } from 'mysql2';

import {
    toProject,
    type Project,
    type ProjectRow,
    type ProjectStatus,
} from '../models/project.js';

type ProjectRowPacket = RowDataPacket & ProjectRow;

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const parsePositiveInt = (value: unknown): number | null => {
    if (isFiniteNumber(value)) {
        if (!Number.isInteger(value) || value <= 0) return null;
        return value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length === 0) return null;
        const parsed = Number.parseInt(trimmed, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) return null;
        return parsed;
    }

    return null;
};

const allowedProjectStatuses: ReadonlySet<ProjectStatus> = new Set([
    'NOT_STARTED',
    'PENDING',
    'IN_PROGRESS',
    'DONE',
]);

const parseProjectStatus = (value: unknown): ProjectStatus | null => {
    if (!isNonEmptyString(value)) return null;
    const status = value.trim().toUpperCase() as ProjectStatus;
    return allowedProjectStatuses.has(status) ? status : null;
};

const isValidDateOnly = (value: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseDateOnlyOrNull = (value: unknown): string | null => {
    if (value === undefined || value === null) return null;
    if (!isNonEmptyString(value)) return null;
    const trimmed = value.trim();
    if (!isValidDateOnly(trimmed)) return null;
    return trimmed;
};

const parseBudgetOrDefault = (value: unknown): number => {
    if (value === undefined || value === null || value === '') return 0;
    if (isFiniteNumber(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

const badRequest = (req: Request, res: Response, message: string) => {
    res.status(400).json({
        message,
        received: {
            contentType: req.header('content-type'),
            keys: Object.keys((req.body ?? {}) as Record<string, unknown>),
        },
    });
};

const getProjectById = async (
    db: Connection,
    id: number,
): Promise<Project | null> => {
    const [rows] = await db
        .promise()
        .query<
            ProjectRowPacket[]
        >('SELECT id, owner_user_id, name, description, start_date, due_date, budget, status, created_at, updated_at FROM projects WHERE id = ? LIMIT 1', [id]);

    const firstRow = rows[0];
    if (!firstRow) return null;
    return toProject(firstRow);
};

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
            const startDate = parseDateOnlyOrNull(body.startDate);
            const dueDate = parseDateOnlyOrNull(body.dueDate);
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

            const name = isNonEmptyString(body.name) ? body.name.trim() : existing.name;
            const description = body.description !== undefined
                ? (isNonEmptyString(body.description) ? body.description.trim() : null)
                : existing.description;
            const startDate = body.startDate !== undefined
                ? parseDateOnlyOrNull(body.startDate)
                : existing.startDate;
            const dueDate = body.dueDate !== undefined
                ? parseDateOnlyOrNull(body.dueDate)
                : existing.dueDate;
            const budget = body.budget !== undefined
                ? parseBudgetOrDefault(body.budget)
                : existing.budget;
            const status = parseProjectStatus(body.status) ?? existing.status;

            await db.promise().execute(
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

            await db.promise().execute('DELETE FROM projects WHERE id = ?', [id]);
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
            const [rows] = await db
                .promise()
                .query<ProjectRowPacket[]>('SELECT * FROM projects');

            const projects = rows.map(toProject);
            res.status(200).json({ projects });
        } catch (error) {
            console.error('getAllProjects error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    return { getAllProjects };
};
