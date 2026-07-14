import Link from "next/link";
import { StatePanel } from "@xwlc/ui";
export default function NotFound() { return <div className="page"><StatePanel kind="error" title="Page not found" description="This route does not exist in the current product." /><Link className="button" href="/">Return home</Link></div>; }
