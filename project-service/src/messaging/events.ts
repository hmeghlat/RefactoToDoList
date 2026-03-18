export type TaskCompletedEvent = {
  type: "TaskCompleted";
  occurredAt: string;
  data: {
    taskId: number;
    projectId: number;
  };
};

export type TaskReopenedEvent = {
  type: "TaskReopened";
  occurredAt: string;
  data: {
    taskId: number;
    projectId: number;
  };
};

export type TaskDomainEvent = TaskCompletedEvent | TaskReopenedEvent;

export type ProjectCompletedEvent = {
  type: "ProjectCompleted";
  occurredAt: string;
  data: {
    projectId: number;
    ownerUserId: number;
  };
};

export type OutgoingEvent = ProjectCompletedEvent;

export const routingKeyForOutgoing = (event: OutgoingEvent): string => {
  switch (event.type) {
    case "ProjectCompleted":
      return "project.completed";
  }
};
