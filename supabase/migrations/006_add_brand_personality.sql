-- Add brand_personality column to brand_guidelines
alter table brand_guidelines
  add column if not exists brand_personality text;

-- Add unique constraint on workspace_id to enable safe upserts and enforce integrity
alter table brand_guidelines
  add constraint brand_guidelines_workspace_id_key unique (workspace_id);
