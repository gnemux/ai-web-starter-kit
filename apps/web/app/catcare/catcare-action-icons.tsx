import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function CatCareActionIcon({
  className = "h-5 w-5",
  children
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      data-catcare-action-icon=""
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

export function CatCareArrowLeftIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M19 12H5" />
      <path d="m12 5-7 7 7 7" />
    </CatCareActionIcon>
  );
}

export function CatCareCalendarIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M7 3.5v3" />
      <path d="M17 3.5v3" />
      <path d="M4.5 8.5h15" />
      <path d="M5.5 5.5h13a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1z" />
      <path d="M8 12h2" />
      <path d="M8 16h2" />
      <path d="M14 12h2" />
    </CatCareActionIcon>
  );
}

export function CatCareChevronDownIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </CatCareActionIcon>
  );
}

export function CatCareXIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </CatCareActionIcon>
  );
}

export function CatCareClockIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
      <path d="M12 8v4.5l3 1.8" />
    </CatCareActionIcon>
  );
}

export function CatCareEditIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M4.5 19.5h4l10.2-10.2a2.1 2.1 0 0 0-3-3L5.5 16.5z" />
      <path d="m14.5 7.5 2 2" />
    </CatCareActionIcon>
  );
}

export function CatCareSaveIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M5.5 4.5h11l2 2v13h-13z" />
      <path d="M8 4.5v5h7v-5" />
      <path d="M8 19.5v-6h8v6" />
    </CatCareActionIcon>
  );
}

export function CatCareLinkIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M10 13a5 5 0 0 0 7.5.5l2.5-2.5a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.5-.5L4 13a5 5 0 0 0 7 7l1.5-1.5" />
    </CatCareActionIcon>
  );
}

export function CatCareCopyIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M8 8.5h9.5v9.5H8z" />
      <path d="M5.5 15.5v-10h10" />
    </CatCareActionIcon>
  );
}

export function CatCareSearchIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z" />
      <path d="m15.5 15.5 4 4" />
    </CatCareActionIcon>
  );
}

export function CatCareTrashIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="m8 10 .5 9h7l.5-9" />
      <path d="M10.5 11.5v5" />
      <path d="M13.5 11.5v5" />
    </CatCareActionIcon>
  );
}

export function CatCareUploadIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M12 16V4.5" />
      <path d="m7.5 9 4.5-4.5L16.5 9" />
      <path d="M5 15.5v3.5h14v-3.5" />
    </CatCareActionIcon>
  );
}

export function CatCarePlusCircleIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
      <path d="M12 8.5v7" />
      <path d="M8.5 12h7" />
    </CatCareActionIcon>
  );
}

export function CatCareBowlActionIcon(props: IconProps) {
  return (
    <CatCareActionIcon {...props}>
      <path d="M5 11.5h14l-1.2 4.2a4 4 0 0 1-3.8 2.8h-4a4 4 0 0 1-3.8-2.8z" />
      <path d="M7.5 8.5c1-1 2-1 3 0s2 1 3 0 2-1 3 0" />
      <path d="M8 21h8" />
    </CatCareActionIcon>
  );
}
