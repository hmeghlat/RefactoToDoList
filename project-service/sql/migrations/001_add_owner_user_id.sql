-- Migration: add owner_user_id to projects
-- We don't manage multi-member projects, so the project is owned by a single user (from auth-service).

ALTER TABLE projects
  ADD COLUMN owner_user_id BIGINT UNSIGNED NULL AFTER id;

CREATE INDEX idx_projects_owner_user_id ON projects(owner_user_id);

-- If you already have projects, you must backfill owner_user_id and then set it to NOT NULL.
-- Example (choose an owner id):
-- UPDATE projects SET owner_user_id = 1 WHERE owner_user_id IS NULL;
-- ALTER TABLE projects MODIFY owner_user_id BIGINT UNSIGNED NOT NULL;
