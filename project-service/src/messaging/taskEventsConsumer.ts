import type { Connection, RowDataPacket } from "mysql2";

import type { TaskDomainEvent } from "./events.js";
import type { RabbitContext } from "./rabbitmq.js";
import { safeJson, subscribe } from "./rabbitmq.js";

type TaskFromApi = {
  id: number;
  projectId: number;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
};

type ProjectRowPacket = RowDataPacket & {
  id: number;
  owner_user_id: number;
  status: "NOT_STARTED" | "PENDING" | "IN_PROGRESS" | "DONE";
};

const getTaskServiceUrl = (): string => {
  const baseUrl = process.env.TASK_SERVICE_URL || "http://localhost:3002";
  return baseUrl.replace(/\/+$/, "");
};

const fetchTasksForProject = async (projectId: number): Promise<TaskFromApi[]> => {
  const url = `${getTaskServiceUrl()}/tasks?projectId=${projectId}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`task-service error ${response.status}: ${text}`);
  }
  const json = (await response.json()) as { tasks?: TaskFromApi[] };
  return Array.isArray(json.tasks) ? json.tasks : [];
};

const getProject = async (db: Connection, projectId: number) => {
  const [rows] = await db
    .promise()
    .query<ProjectRowPacket[]>(
      "SELECT id, owner_user_id, status FROM projects WHERE id = ? LIMIT 1",
      [projectId]
    );
  return rows[0] ?? null;
};

const setProjectStatus = async (
  db: Connection,
  projectId: number,
  status: "NOT_STARTED" | "PENDING" | "IN_PROGRESS" | "DONE"
) => {
  await db
    .promise()
    .execute("UPDATE projects SET status = ? WHERE id = ?", [status, projectId]);
};

export const startTaskEventsConsumer = async (params: {
  db: Connection;
  rabbit: RabbitContext;
}) => {
  const { db, rabbit } = params;

  await subscribe({
    channel: rabbit.channel,
    routingKeys: ["task.completed", "task.reopened"],
    onMessage: async (msg) => {
      const event = safeJson<TaskDomainEvent>(msg);
      if (!event || (event.type !== "TaskCompleted" && event.type !== "TaskReopened")) {
        console.warn("project-service: ignoring invalid event", msg.fields.routingKey);
        return;
      }

      const projectId = event.data.projectId;
      const project = await getProject(db, projectId);
      if (!project) {
        console.warn("project-service: project not found for event", { projectId });
        return;
      }

      if (event.type === "TaskReopened") {
        if (project.status === "DONE") {
          await setProjectStatus(db, projectId, "IN_PROGRESS");
        }
        return;
      }

      // TaskCompleted: if all tasks of the project are completed => close project
      const tasks = await fetchTasksForProject(projectId);
      if (tasks.length === 0) return;

      const allDone = tasks.every((t) => t.status === "DONE");
      if (!allDone) {
        if (project.status === "NOT_STARTED" || project.status === "PENDING") {
          await setProjectStatus(db, projectId, "IN_PROGRESS");
        }
        return;
      }

      if (project.status !== "DONE") {
        await setProjectStatus(db, projectId, "DONE");
        rabbit.publish({
          type: "ProjectCompleted",
          occurredAt: new Date().toISOString(),
          data: { projectId, ownerUserId: project.owner_user_id },
        });
      }
    },
  });
};
