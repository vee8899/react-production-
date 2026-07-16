-- RLS controls which tenant rows are visible; PostgREST still needs schema
-- and table privileges for authenticated portal reads.
grant usage on schema real_estate to authenticated;
grant select on table
  real_estate.leads,
  real_estate.listings,
  real_estate.appointments
to authenticated;
