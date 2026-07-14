import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
export { Dialog } from "./dialog";
export { Toast } from "./toast";

export function BrandMark({ mark, name }: { mark: string; name: string }) { return <span className="brand"><span className="brand-mark" aria-hidden>{mark}</span><span>{name}</span></span>; }
export function Button({ type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} type={type} className={`button ${props.className ?? ""}`} />; }
export function Badge({ children }: { children: ReactNode }) { return <span className="badge">{children}</span>; }
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section>; }
export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) { return <header className="page-header">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</header>; }
export function FormField({ id, label, hint, error, children }: { id?: string; label: string; hint?: string; error?: string; children: ReactNode }) { return <label className="field" htmlFor={id}><span>{label}</span>{children}{hint && <small id={id ? `${id}-hint` : undefined}>{hint}</small>}{error && <small className="field-error" id={id ? `${id}-error` : undefined} role="alert">{error}</small>}</label>; }
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} />; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} />; }
export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} type="checkbox" />; }
export function Notice({ children, variant = "info" }: { children: ReactNode; variant?: "info" | "success" | "warning" | "error" }) { return <div className={`notice notice-${variant}`} role={variant === "error" ? "alert" : "status"}>{children}</div>; }
export function NavTabs({ children, label }: { children: ReactNode; label: string }) { return <nav aria-label={label} className="tabs">{children}</nav>; }
export const Tabs = NavTabs;
export function Popover({ summary, children }: { summary: string; children: ReactNode }) { return <details className="popover"><summary>{summary}</summary><div>{children}</div></details>; }
export function Skeleton({ label = "Loading content" }: { label?: string }) { return <div aria-label={label} className="skeleton" role="status"><span /><span /><span /></div>; }
export function StatePanel({ kind, kindLabel, title, description }: { kind: "loading" | "empty" | "error" | "forbidden" | "disabled"; kindLabel?: string; title: string; description: string }) { return <Card><Badge>{kindLabel ?? kind}</Badge><h2>{title}</h2><p>{description}</p>{kind === "loading" ? <Skeleton /> : null}</Card>; }
export const Panel = Card;
export function SectionHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) { return <header className="section-header"><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>{action ? <div>{action}</div> : null}</header>; }
export function ProgressBar({ value, label = "Progress" }: { value: number; label?: string }) { const bounded = Math.max(0, Math.min(100, value)); return <div aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={bounded} className="progress" role="progressbar"><span style={{ width: `${bounded}%` }} /></div>; }
export function EmptyState(props: { title: string; description: string }) { return <StatePanel kind="empty" {...props} />; }
export function LoadingState({ title = "Loading", description = "Content is loading." }: { title?: string; description?: string }) { return <StatePanel kind="loading" title={title} description={description} />; }
export function ErrorState(props: { title: string; description: string }) { return <StatePanel kind="error" {...props} />; }
export function LongContent({ label, children }: { label: string; children: ReactNode }) { return <Card className="long-content"><p className="eyebrow">{label}</p><div>{children}</div></Card>; }
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`ui-container ${className}`}>{children}</div>; }
export function Stack({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`ui-stack ${className}`}>{children}</div>; }
export function Grid({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`ui-grid ${className}`}>{children}</div>; }
