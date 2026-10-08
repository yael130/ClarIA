-- These tables pre-existed the learning-platform schema and are not used by
-- the Angular app. Keep them inaccessible through the Data API until an
-- explicit ownership policy is designed for their actual data model.
alter table public.carros enable row level security;
alter table public.usuarios enable row level security;
