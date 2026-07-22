import { useEffect, useState } from "react";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { useClient } from "@/hooks/useClient";
import { supabase } from "@/api/supabase/client";

type Mapping = { source: string; destination: string };

const defaultMappings: Mapping[] = [
  { source: "email_address", destination: "email" },
  { source: "full_name", destination: "name" },
];

export default function DataSynchronizationPage() {
  const { data: client, isLoading } = useClient();
  const [source, setSource] = useState("portal");
  const [destination, setDestination] = useState("crm");
  const [direction, setDirection] = useState("source_to_destination");
  const [schedule, setSchedule] = useState("webhook");
  const [dryRun, setDryRun] = useState(true);
  const [mappings, setMappings] = useState<Mapping[]>(defaultMappings);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client?.organization_id) return;
    void supabase.from("feature_subscriptions").select("configuration").eq("organization_id", client.organization_id).eq("feature_key", "system_data_synchronization").maybeSingle().then(({ data }) => {
      const config = data?.configuration;
      if (!config || typeof config !== "object" || Array.isArray(config)) return;
      const sync = (config as Record<string, unknown>).data_sync;
      if (!sync || typeof sync !== "object" || Array.isArray(sync)) return;
      const saved = sync as Record<string, unknown>;
      if (typeof saved.source === "string") setSource(saved.source);
      if (typeof saved.destination === "string") setDestination(saved.destination);
      if (typeof saved.direction === "string") setDirection(saved.direction);
      if (typeof saved.schedule === "string") setSchedule(saved.schedule);
      if (typeof saved.dry_run === "boolean") setDryRun(saved.dry_run);
      if (Array.isArray(saved.mappings)) setMappings(saved.mappings as Mapping[]);
    });
  }, [client?.organization_id]);

  const save = async () => {
    if (!client?.organization_id) return;
    setSaving(true);
    setMessage(null);
    const { data: current, error: readError } = await supabase.from("feature_subscriptions").select("configuration").eq("organization_id", client.organization_id).eq("feature_key", "system_data_synchronization").maybeSingle();
    if (readError) { setMessage("Unable to load synchronization configuration."); setSaving(false); return; }
    const existing = current?.configuration && typeof current.configuration === "object" && !Array.isArray(current.configuration) ? current.configuration as Record<string, unknown> : {};
    const { error } = await supabase.from("feature_subscriptions").update({ configuration: { ...existing, data_sync: { source, destination, direction, schedule, dry_run: dryRun, mappings } } }).eq("organization_id", client.organization_id).eq("feature_key", "system_data_synchronization");
    setSaving(false);
    setMessage(error ? "Unable to save synchronization configuration." : "Configuration saved. Keep dry-run enabled until staging acceptance passes.");
  };

  if (isLoading) return <PageShell><SectionHeader label="04 - Data Synchronization" /><p className="text-label uppercase tracking-[0.08em] text-muted">Loading...</p></PageShell>;
  if (!client) return <PageShell><SectionHeader label="04 - Data Synchronization" /><p className="text-muted">No client workspace found.</p></PageShell>;

  return <><Nav /><main className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]"><div className="mx-auto max-w-[960px]"><SectionHeader label="04 - Data Synchronization" /><p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-muted">Configure how approved records move between a CRM, spreadsheet, or portal. Provider credentials and adapter URLs remain in n8n; this screen stores only workflow configuration.</p><div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-2"><Field label="Source system"><select value={source} onChange={(e) => setSource(e.target.value)}><option value="crm">CRM</option><option value="spreadsheet">Spreadsheet</option><option value="portal">Portal</option></select></Field><Field label="Destination system"><select value={destination} onChange={(e) => setDestination(e.target.value)}><option value="crm">CRM</option><option value="spreadsheet">Spreadsheet</option><option value="portal">Portal</option></select></Field><Field label="Sync direction"><select value={direction} onChange={(e) => setDirection(e.target.value)}><option value="source_to_destination">Source → destination</option><option value="bidirectional">Bidirectional</option></select></Field><Field label="Trigger"><select value={schedule} onChange={(e) => setSchedule(e.target.value)}><option value="webhook">Webhook / event</option><option value="hourly">Hourly</option><option value="daily">Daily</option></select></Field></div><section className="mt-12 border-t border-border pt-8"><p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">Field mapping</p><div className="mt-5 space-y-3">{mappings.map((mapping, index) => <div key={`${index}-${mapping.source}`} className="grid gap-3 sm:grid-cols-2"><input aria-label={`Source field ${index + 1}`} value={mapping.source} onChange={(e) => setMappings((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, source: e.target.value } : item))} placeholder="Source field" /><input aria-label={`Destination field ${index + 1}`} value={mapping.destination} onChange={(e) => setMappings((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, destination: e.target.value } : item))} placeholder="Destination field" /></div>)}<button type="button" className="text-label uppercase tracking-[0.08em] text-muted" onClick={() => setMappings((items) => [...items, { source: "", destination: "" }])}>+ Add mapping</button></div></section><label className="mt-10 flex items-center gap-3 text-sm text-primary"><input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} /> Dry-run mode — do not write destination records</label><div className="mt-8 flex items-center gap-5"><button type="button" onClick={save} disabled={saving} className="border border-primary bg-primary px-5 py-3 text-label uppercase tracking-[0.08em] text-background disabled:opacity-50">{saving ? "Saving..." : "Save configuration"}</button>{message && <p className="text-sm text-muted">{message}</p>}</div></div></main><Footer /></>;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="text-sm text-primary"><span className="mb-2 block font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</span><span className="block border border-border bg-background px-3 py-2 [&>select]:w-full [&>select]:bg-background [&>select]:text-primary [&>select]:outline-none">{children}</span></label>;
const PageShell = ({ children }: { children: React.ReactNode }) => <><Nav /><main className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]"><div className="mx-auto max-w-[960px]">{children}</div></main><Footer /></>;
