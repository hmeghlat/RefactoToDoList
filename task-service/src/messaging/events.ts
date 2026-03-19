export type TaskId = number;
export type ProjectId = number;

export type TaskCreatedEvent = {
  type: "TaskCreated";
  occurredAt: string;
  data: { taskId: TaskId; projectId: ProjectId };
};

export type TaskCompletedEvent = {
  type: "TaskCompleted";
  occurredAt: string;
  data: { taskId: TaskId; projectId: ProjectId };
};

export type TaskReopenedEvent = {
  type: "TaskReopened";
  occurredAt: string;
  data: { taskId: TaskId; projectId: ProjectId };
};

export type TaskCancelledEvent = {
  type: "TaskCancelled";
  occurredAt: string;
  data: { taskId: TaskId; projectId: ProjectId };
};

export type TaskStartedEvent = {
  type: "TaskStarted";
  occurredAt: string;
  data: { taskId: TaskId; projectId: ProjectId };
};

export type TaskDeletedEvent = {
  type: "TaskDeleted";
  occurredAt: string;
  data: { taskId: TaskId; projectId: ProjectId };
};

export type DomainEvent =
  | TaskCreatedEvent
  | TaskCompletedEvent
  | TaskReopenedEvent
  | TaskCancelledEvent
  | TaskStartedEvent
  | TaskDeletedEvent;

export const getRoutingKey = (event: DomainEvent): string => {
  switch (event.type) {
    case "TaskCreated":    return "task.created";
    case "TaskCompleted":  return "task.completed";
    case "TaskReopened":   return "task.reopened";
    case "TaskCancelled":  return "task.cancelled";
    case "TaskStarted":    return "task.started";
    case "TaskDeleted":    return "task.deleted";
  }
};
