-- Enable realtime for job status tracking
alter publication supabase_realtime add table generation_jobs;
alter publication supabase_realtime add table assets;
