import type { Json } from "./supabase";

export type RealEstateLead = {
  id: string;
  organization_id: string;
  lead_type: "buyer" | "seller" | "inquiry" | "other";
  status: "new" | "contacted" | "qualified" | "nurture" | "converted" | "lost";
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  assigned_agent_external_id: string | null;
  source_system: string;
  external_id: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type RealEstateListing = {
  id: string;
  organization_id: string;
  listing_type: "sale" | "rental";
  status: "draft" | "active" | "pending" | "under_contract" | "sold" | "withdrawn" | "expired";
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
  property_type: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  listing_url: string | null;
  source_system: string;
  external_id: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type RealEstateAppointment = {
  id: string;
  organization_id: string;
  lead_id: string | null;
  listing_id: string | null;
  appointment_type: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  title: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  notes: string | null;
  source_system: string;
  external_id: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
};
