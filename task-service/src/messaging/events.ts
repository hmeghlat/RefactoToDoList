export type TaskId = number;
export type ProjectId = number;

export type TaskCompletedEvent = {
  type: "TaskCompleted";
  occurredAt: string;
  data: {
    taskId: TaskId;
    projectId: ProjectId;
  };
};

export type TaskReopenedEvent = {
  type: "TaskReopened";
  occurredAt: string;
  data: {
    taskId: TaskId;
    projectId: ProjectId;
  };
};

export type TaskCreatedEvent = {
  type: "TaskCreated";
  occurredAt: string;
  data: {
    taskId: TaskId;
    projectId: ProjectId;
  };
};

export type DomainEvent = TaskCompletedEvent | TaskReopenedEvent | TaskCreatedEvent;

export const getRoutingKey = (event: DomainEvent): string => {
  switch (event.type) {
    case "TaskCompleted":
      return "task.completed";
    case "TaskReopened":
      return "task.reopened";
    case "TaskCreated":
      return "task.created";
  }
};
