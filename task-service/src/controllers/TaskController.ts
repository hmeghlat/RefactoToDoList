import type { Request, Response } from 'express';
import type { RabbitClient } from '../messaging/rabbitmq.js';
import type { TasksRepository } from '../repository/tasksRepository.js';
import {
    fetchProjectDates,
    validateDueDateAgainstProject,
    fetchProjectStatus,
} from '../service/projectServiceClient.js';
import { isNonEmptyString,parsePositiveInt,isTaskPriority,isTaskStatus,parseNullableDate} from '../service/taskService.js';

const getAuthToken = (req: Request): string => {
    return req.headers.authorization ?? '';
};

export const createTaskController = (params: {
    repo: TasksRepository;
    rabbit: RabbitClient;
}) => {
    const { repo, rabbit } = params;

    const listTasks = async (req: Request, res: Response) => {
        try {
            const projectId = parsePositiveInt(req.query.projectId);
            const tasks = await repo.list(
                projectId ? { projectId } : undefined,
            );
            res.status(200).json({ tasks });
        } catch (error) {
            console.error('listTasks error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    const createTask = async (req: Request, res: Response) => {
        try {
            const body = (req.body ?? {}) as Record<string, unknown>;
            const projectId = parsePositiveInt(body.projectId);
            const userId = parsePositiveInt(body.userId);
            const name = isNonEmptyString(body.name) ? body.name.trim() : '';
            const description =
                body.description === undefined
                    ? undefined
                    : body.description === null
                      ? null
                      : String(body.description);
            const priority =
                body.priority !== undefined
                    ? isTaskPriority(body.priority)
                        ? body.priority
                        : null
                    : undefined;
            const status =
                body.status !== undefined
                    ? isTaskStatus(body.status)
                        ? body.status
                        : null
                    : undefined;
            const dueDate = parseNullableDate(body.dueDate);

            if (!projectId || !userId || !name) {
                res.status(400).json({
                    message: 'projectId, userId, and name are required',
                });
                return;
            }
            if (priority === null) {
                res.status(400).json({
                    message: 'priority must be one of LOW|MEDIUM|HIGH',
                });
                return;
            }
            if (status === null) {
                res.status(400).json({
                    message:
                        'status must be one of TODO|IN_PROGRESS|DONE|CANCELLED',
                });
                return;
            }
            if (body.dueDate !== undefined && dueDate === undefined) {
                res.status(400).json({
                    message:
                        'dueDate must be an ISO date string (YYYY-MM-DD) or null',
                });
                return;
            }

            if (dueDate) {
                const projectDates = await fetchProjectDates(
                    projectId,
                    getAuthToken(req),
                );
                if (!projectDates) {
                    res.status(404).json({ message: 'Project not found' });
                    return;
                }
                const dateError = validateDueDateAgainstProject(
                    dueDate,
                    projectDates,
                );
                if (dateError) {
                    res.status(422).json({ message: dateError });
                    return;
                }
            }

            const task = await repo.create({
                projectId,
                userId,
                name,
                description: description ?? null,
                ...(priority !== undefined ? { priority } : {}),
                ...(status !== undefined ? { status } : {}),
                dueDate: dueDate ?? null,
            });

            rabbit.publishEvent({
                type: 'TaskCreated',
                occurredAt: new Date().toISOString(),
                data: { taskId: task.id, projectId: task.projectId },
            });

            res.status(201).json({ task });
        } catch (error) {
            console.error('createTask error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    const getTask = async (req: Request, res: Response) => {
        try {
            const id = parsePositiveInt(req.params.id);
            if (!id) {
                res.status(400).json({ message: 'Invalid task ID' });
                return;
            }

            const task = await repo.getById(id);
            if (!task) {
                res.status(404).json({ message: 'Task not found' });
                return;
            }

            res.status(200).json({ task });
        } catch (error) {
            console.error('getTask error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    const updateTask = async (req: Request, res: Response) => {
        try {
            const id = parsePositiveInt(req.params.id);

            if (!id) {
                res.status(400).json({ message: 'Invalid task ID' });
                return;
            }

            const body = (req.body ?? {}) as Record<string, unknown>;
            const name =
                body.name !== undefined
                    ? isNonEmptyString(body.name)
                        ? body.name.trim()
                        : ''
                    : undefined;
            const description =
                body.description !== undefined
                    ? body.description === null
                        ? null
                        : String(body.description)
                    : undefined;
            const userId =
                body.userId !== undefined
                    ? parsePositiveInt(body.userId)
                    : undefined;
            const priority =
                body.priority !== undefined
                    ? isTaskPriority(body.priority)
                        ? body.priority
                        : null
                    : undefined;
            const status =
                body.status !== undefined
                    ? isTaskStatus(body.status)
                        ? body.status
                        : null
                    : undefined;
            const dueDate = parseNullableDate(body.dueDate);
            const existingTask = await repo.getById(id);
            if (name !== undefined && !name) {
                res.status(400).json({ message: 'name cannot be empty' });
                return;
            }
            if (body.userId !== undefined && userId === undefined) {
                res.status(400).json({
                    message: 'userId must be a positive integer',
                });
                return;
            }
            if (priority === null) {
                res.status(400).json({
                    message: 'priority must be one of LOW|MEDIUM|HIGH',
                });
                return;
            }
            if (status === null) {
                res.status(400).json({
                    message:
                        'status must be one of TODO|IN_PROGRESS|DONE|CANCELLED',
                });
                return;
            }
            if (body.dueDate !== undefined && dueDate === undefined) {
                res.status(400).json({
                    message:
                        'dueDate must be an ISO date string (YYYY-MM-DD) or null',
                });
                return;
            }

            if (dueDate) {
                if (!existingTask) {
                    res.status(404).json({ message: 'Task not found' });
                    return;
                }
                const projectDates = await fetchProjectDates(
                    existingTask.projectId,
                    getAuthToken(req),
                );
                if (!projectDates) {
                    res.status(404).json({ message: 'Project not found' });
                    return;
                }

                const dateError = validateDueDateAgainstProject(
                    dueDate,
                    projectDates,
                );
                if (dateError) {
                    res.status(422).json({ message: dateError });
                    return;
                }
            }
            const projectStatus = await fetchProjectStatus(
              existingTask?.projectId ?? -1,
              getAuthToken(req),
          );
          if (projectStatus == 'DONE') {
              res.status(422).json({
                  message:
                      'Le projet est terminer, aucune tache peut etre modifier',
              });
              return;
          }
            const result = await repo.update(id, {
                ...(name !== undefined ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(userId !== undefined && userId !== null ? { userId } : {}),
                ...(priority !== undefined ? { priority } : {}),
                ...(status !== undefined ? { status } : {}),
                ...(dueDate !== undefined ? { dueDate } : {}),
            });

            if (!result) {
                res.status(404).json({ message: 'Task not found' });
                return;
            }

            const { before, after } = result;
            if (before.status !== after.status) {
                if (before.status !== 'DONE' && after.status === 'DONE') {
                    rabbit.publishEvent({
                        type: 'TaskCompleted',
                        occurredAt: new Date().toISOString(),
                        data: { taskId: after.id, projectId: after.projectId },
                    });
                } else if (
                    before.status === 'DONE' &&
                    after.status !== 'DONE'
                ) {
                    rabbit.publishEvent({
                        type: 'TaskReopened',
                        occurredAt: new Date().toISOString(),
                        data: { taskId: after.id, projectId: after.projectId },
                    });
                }
            }

            res.status(200).json({ task: after });
        } catch (error) {
            console.error('updateTask error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    const deleteTask = async (req: Request, res: Response) => {
        try {
            const id = parsePositiveInt(req.params.id);
            if (!id) {
                res.status(400).json({ message: 'Invalid task ID' });
                return;
            }

            const deleted = await repo.remove(id);
            if (!deleted) {
                res.status(404).json({ message: 'Task not found' });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('deleteTask error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    return { listTasks, createTask, getTask, updateTask, deleteTask };
};
