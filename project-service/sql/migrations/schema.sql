-- Project Service schema (MySQL 8+)

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_date DATE NULL,
  due_date DATE NULL,
  budget DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('NOT_STARTED','PENDING','IN_PROGRESS','DONE') NOT NULL DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_projects_owner_user_id (owner_user_id),
  INDEX idx_projects_status (status),
  INDEX idx_projects_due_date (due_date)
);

-- tasks are owned by a separate task-service.
-- project-service only stores associations to external task ids.
CREATE TABLE IF NOT EXISTS project_tasks (
  project_id BIGINT UNSIGNED NOT NULL,
  task_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, task_id),
  CONSTRAINT fk_project_tasks_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_project_tasks_task_id (task_id)
);
