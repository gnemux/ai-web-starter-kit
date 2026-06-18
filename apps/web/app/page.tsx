import { capabilityTracks, readinessMetrics } from "@starter/core";
import { Badge, BrandMark, Button, Panel, ProgressBar, StatusBadge } from "@starter/ui";

import { ArrowRightIcon, DashboardIcon } from "../components/app-icons";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandMark />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Landing">
            <a className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950" href="#tracks">
              Tracks
            </a>
            <a className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950" href="/dashboard">
              Dashboard
            </a>
            <a className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950" href="#workflow">
              Workflow
            </a>
          </nav>
          <Button href="/dashboard" icon={<DashboardIcon />}>
            Open dashboard
          </Button>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="min-w-0">
          <Badge tone="ready">Specification driven starter</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Build commercial Web products with a reusable product shell.
          </h1>
          <p className="mt-5 max-w-2xl text-[1.0625rem] font-medium leading-8 tracking-normal text-slate-600 sm:text-lg">
            XM，WW， LZZ， CY 一帮杭州中登的 Token 燃烧之旅
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/dashboard" icon={<ArrowRightIcon />}>
              Enter command center
            </Button>
            <Button href="/dashboard#edge-states" variant="secondary">
              Review UI states
            </Button>
          </div>
        </div>

        <Panel className="p-0">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Template Command Center
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Readiness, modules, and next actions in one workspace.
                </p>
              </div>
              <StatusBadge status="in-progress" />
            </div>
          </div>
          <div className="grid divide-y divide-slate-200 p-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {readinessMetrics.map((metric) => (
              <div className="min-h-28 px-0 py-4 sm:px-4 sm:py-0" key={metric.label}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    {metric.label}
                  </p>
                  <StatusBadge status={metric.status} />
                </div>
                <p className="mt-4 text-2xl font-semibold text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>
          <div id="tracks" className="border-t border-slate-200 p-4">
            <div className="space-y-3">
              {capabilityTracks.slice(0, 4).map((track) => (
                <div
                  className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  key={track.name}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-950">
                        {track.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {track.description}
                      </p>
                    </div>
                    <StatusBadge status={track.status} />
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={track.progress} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      <section id="workflow" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {["Linear issue", "Spec first", "Verified merge"].map((step, index) => (
            <Panel key={step}>
              <p className="text-sm font-semibold text-slate-950">
                {String(index + 1).padStart(2, "0")} · {step}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {index === 0
                  ? "Every change starts from a small tracked issue with a clear owner."
                  : index === 1
                    ? "Product and engineering specs make AI output easier to review."
                    : "Type checks, builds, and edge-state review protect the template."}
              </p>
            </Panel>
          ))}
        </div>
      </section>
    </main>
  );
}
