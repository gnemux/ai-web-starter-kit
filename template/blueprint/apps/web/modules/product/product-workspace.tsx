"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Card, Checkbox, Dialog, FormField, PageHeader, Popover, ProgressBar, SectionHeader, Select, StatePanel, Tabs, Textarea, Toast } from "@xwlc/ui";
import type { CapabilityRegistryEntry } from "@xwlc/platform";
import { productConfig } from "@/config/product.config";
import type { platformMessages } from "@/modules/platform/i18n/messages";

type Messages = (typeof platformMessages)[keyof typeof platformMessages];

export function ProductWorkspace({ capabilities, messages, copy }: { capabilities: CapabilityRegistryEntry[]; messages: Messages; copy: (typeof productConfig.localized)[keyof typeof productConfig.localized] }) {
  const [completed, setCompleted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return <div className="page">
    <PageHeader eyebrow={messages.productBoundary} title={copy.navigation[0]?.label ?? productConfig.identity.name} description={messages.productDescription} />
    <Tabs label={messages.primaryNavigation}><Link aria-current="page" href={productConfig.paths.product}>{messages.workspaceOverview}</Link><Link href={productConfig.paths.account}>{messages.workspaceAccount}</Link></Tabs>
    <SectionHeader title={messages.workspaceTitle} description={messages.workspaceDescription} />
    <div className="workspace-grid">
      <StatePanel kind="empty" kindLabel={messages.stateEmpty} title={messages.readyTitle} description={messages.readyDescription} />
      <Card><h2>{messages.capabilityRegistry}</h2><ul>{capabilities.map((entry) => <li key={entry.id}><strong>{entry.id}</strong>: {entry.mode} · {entry.state}</li>)}</ul><Popover summary={messages.capabilityHelp}><p>{messages.capabilityHelpText}</p></Popover></Card>
      <Card><h2>{messages.interactionTitle}</h2><p>{messages.interactionDescription}</p><ProgressBar label={messages.previewProgress} value={100} /><div className="form"><FormField label={messages.previewWorkflow}><Textarea defaultValue={messages.previewWorkflowValue} readOnly /></FormField><FormField label={messages.previewState}><Select defaultValue="draft"><option value="draft">{messages.previewDraft}</option><option value="ready">{messages.previewReady}</option></Select></FormField><label className="checkbox-row"><Checkbox defaultChecked />{messages.previewReview}</label><Button onClick={() => setConfirming(true)} type="button">{messages.reviewInteraction}</Button></div></Card>
    </div>
    <Toast open={completed} onDismiss={() => setCompleted(false)}>{messages.interactionConfirmed}</Toast>
    <Dialog open={confirming} onOpenChange={setConfirming} title={messages.dialogTitle} description={messages.dialogDescription}><Button onClick={() => { setConfirming(false); setCompleted(true); }}>{messages.close}</Button></Dialog>
  </div>;
}
