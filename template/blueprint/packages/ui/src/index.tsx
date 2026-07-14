import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function BrandMark({ mark, name }: { mark: string; name: string }) { return <span className="brand"><span className="brand-mark" aria-hidden>{mark}</span><span>{name}</span></span>; }
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`button ${props.className ?? ""}`} />; }
export function Badge({ children }: { children: ReactNode }) { return <span className="badge">{children}</span>; }
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section>; }
export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) { return <header className="page-header">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</header>; }
export function FormField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>; }
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} />; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} />; }
export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} type="checkbox" />; }
export function Notice({ children }: { children: ReactNode }) { return <div className="notice" role="status">{children}</div>; }
export function Tabs({ items, label }: { items: Array<{ label: string; href: string; current?: boolean }>; label: string }) { return <nav aria-label={label} className="tabs">{items.map((item) => <a aria-current={item.current ? "page" : undefined} href={item.href} key={item.href}>{item.label}</a>)}</nav>; }
export function Dialog({ open = false, title, description, children }: { open?: boolean; title: string; description: string; children?: ReactNode }) { return <dialog aria-labelledby="foundation-dialog-title" open={open}><h2 id="foundation-dialog-title">{title}</h2><p>{description}</p>{children}</dialog>; }
export function Popover({ summary, children }: { summary: string; children: ReactNode }) { return <details className="popover"><summary>{summary}</summary><div>{children}</div></details>; }
export function Toast({ children }: { children: ReactNode }) { return <div aria-live="polite" className="toast" role="status">{children}</div>; }
export function Skeleton({ label = "Loading content" }: { label?: string }) { return <div aria-label={label} className="skeleton" role="status"><span /><span /><span /></div>; }
export function StatePanel({ kind, title, description }: { kind: "loading" | "empty" | "error" | "forbidden" | "disabled"; title: string; description: string }) { return <Card><Badge>{kind}</Badge><h2>{title}</h2><p>{description}</p>{kind === "loading" ? <Skeleton /> : null}</Card>; }
