type ProjectDates = {
  startDate: string | null;
  dueDate: string | null;
};

const getProjectServiceUrl = (): string => {
  const base = process.env.PROJECT_SERVICE_URL ?? "http://localhost:3001";
  return base.replace(/\/+$/, "");
};

export const fetchProjectDates = async (
  projectId: number,
  authToken: string
): Promise<ProjectDates | null> => {
  const url = `${getProjectServiceUrl()}/projects/${projectId}`;
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: authToken,
    },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`project-service error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    project?: { startDate?: string | null; dueDate?: string | null };
  };

  const project = json.project;
  if (!project) return null;

  return {
    startDate: project.startDate ?? null,
    dueDate: project.dueDate ?? null,
  };
};

export const validateDueDateAgainstProject = (
  taskDueDate: Date,
  projectDates: ProjectDates
): string | null => {
  if (projectDates.startDate) {
    const projectStart = new Date(projectDates.startDate);
    if (taskDueDate < projectStart) {
      return `La date d'échéance (${taskDueDate.toISOString().slice(0, 10)}) doit être après le début du projet (${projectDates.startDate})`;
    }
  }

  if (projectDates.dueDate) {
    const projectEnd = new Date(projectDates.dueDate);
    if (taskDueDate > projectEnd) {
      return `La date d'échéance (${taskDueDate.toISOString().slice(0, 10)}) doit être avant la fin du projet (${projectDates.dueDate})`;
    }
  }

  return null;
};
