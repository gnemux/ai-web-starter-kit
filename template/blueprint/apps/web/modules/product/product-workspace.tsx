"use client";
import { useState } from "react";
import { Button, Card, Checkbox, Dialog, FormField, PageHeader, Popover, Select, StatePanel, Tabs, Textarea, Toast } from "@xwlc/ui";
import type { CapabilityRegistryEntry } from "@xwlc/platform";
import { productConfig } from "@/config/product.config";

export function ProductWorkspace({ capabilities }: { capabilities: CapabilityRegistryEntry[] }) {
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return <div className="page">
    <PageHeader eyebrow="Product-owned module" title={`${productConfig.identity.name} workspace`} description="Product copy, use cases, DTOs, events and adapters start in this module. Routes remain a thin authenticated composition boundary." />
    <Tabs label="Workspace sections" items={[{ label: "Overview", href: productConfig.paths.product, current: true }, { label: "Account", href: productConfig.paths.account }]} />
    <div className="workspace-grid">
      <StatePanel kind="empty" title="Ready for a real customer journey" description="Replace this neutral workspace with the first complete product workflow without editing platform or package internals." />
      <Card><h2>Capability registry</h2><ul>{capabilities.map((entry) => <li key={entry.id}><strong>{entry.id}</strong>: {entry.mode} · {entry.state}</li>)}</ul><Popover summary="Why these states are explicit"><p>Disabled capabilities stay off, safe adapters are testable, and external modes report missing configuration instead of pretending to work.</p></Popover></Card>
      <Card><h2>Composable product form</h2><form className="form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><FormField label="First workflow"><Textarea name="workflow" defaultValue="Describe the first complete customer journey." /></FormField><FormField label="Initial state"><Select name="state" defaultValue="draft"><option value="draft">Draft</option><option value="ready">Ready for review</option></Select></FormField><FormField label="Review rule"><span><Checkbox name="review" defaultChecked /> Require human review before external side effects</span></FormField><Button type="submit">Save local draft</Button><Button className="secondary" onClick={() => setConfirming(true)} type="button">Review action pattern</Button></form></Card>
    </div>
    <Toast>{saved ? "Local draft saved without a full-page refresh." : "Product identity and platform capability state are composed without product logic entering the route."}</Toast>
    <Dialog open={confirming} title="Product action confirmation" description="A real product owns the command and server-side authorization; the shared UI owns accessible presentation."><Button onClick={() => setConfirming(false)} type="button">Close</Button></Dialog>
  </div>;
}
