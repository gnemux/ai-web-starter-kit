export function CatCareBrand({
  href = "/",
  size = "md",
  subtitle
}: {
  href?: string;
  size?: "md" | "lg";
  subtitle?: string | null;
}) {
  const markClass = size === "lg" ? "h-16 w-16" : "h-14 w-14";
  const titleClass = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <a className="flex min-w-0 items-center gap-3" href={href}>
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center overflow-hidden ${markClass}`}
      >
        <img
          alt=""
          aria-hidden="true"
          className={`object-contain ${markClass}`}
          decoding="async"
          src="/catcare/brand-mark.png"
        />
      </span>
      <span className="min-w-0">
        <span className={`block truncate font-bold text-slate-950 ${titleClass}`}>
          CatCare
        </span>
        {subtitle ? (
          <span className="block truncate text-xs text-slate-500">
            {subtitle}
          </span>
        ) : null}
      </span>
    </a>
  );
}
