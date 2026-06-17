import { productTracks } from "@starter/core";
import { Badge } from "@starter/ui";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <Badge>Starter Kit</Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal sm:text-6xl">
            Build commercial Web products with specs, AI, and reusable systems.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            This repository is the baseline for a reusable Web product template:
            product shell, auth, payment, analytics, deployment, and AI-readable
            engineering context.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productTracks.map((track) => (
            <div
              key={track.name}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
            >
              <h2 className="text-sm font-medium text-slate-100">{track.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {track.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
