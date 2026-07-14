"use client";
import { StatePanel } from "@xwlc/ui";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="page"><StatePanel kind="error" title="Something went wrong" description="The request could not be completed safely." /><button className="button" onClick={reset}>Try again</button></div>; }
