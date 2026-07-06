"use client";

import { useState } from "react";

import { CatCarePlusCircleIcon, CatCareTrashIcon } from "../catcare-action-icons";
import { CatCareTimeInput } from "../routines/routine-schedule-control";

function parseTimes(value: string | null | undefined) {
  const seen = new Set<string>();
  const times = String(value ?? "")
    .split(/[，,、;\n]+/)
    .map((time) => time.trim())
    .filter((time) => {
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time) || seen.has(time)) {
        return false;
      }

      seen.add(time);
      return true;
    });

  return times.length > 0 ? times : ["08:30"];
}

export function PlanTaskTimeInputs({
  initialTime,
  name
}: {
  initialTime?: string | null;
  name: string;
}) {
  const [times, setTimes] = useState(() => parseTimes(initialTime));

  return (
    <div className="grid gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {times.map((time, index) => (
          <div
            className={times.length > 1 ? "grid grid-cols-[minmax(0,1fr)_auto] gap-2" : "grid gap-2"}
            key={index}
          >
            <CatCareTimeInput
              name={name}
              onChange={(value) => {
                const next = [...times];
                next[index] = value;
                setTimes(Array.from(new Set(next)));
              }}
              value={time}
            />
            {times.length > 1 ? (
              <button
                aria-label="移除时间"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#f0c9c1] bg-[#fffaf9] text-[#b7352c] transition hover:bg-[#fff1ef]"
                onClick={() => setTimes(times.filter((_, itemIndex) => itemIndex !== index))}
                type="button"
              >
                <CatCareTrashIcon />
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <button
        className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-xl border border-[#07847f] bg-white px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#f2fbf8]"
        onClick={() => setTimes([...times, "18:30"])}
        type="button"
      >
        <CatCarePlusCircleIcon />
        添加时间
      </button>
    </div>
  );
}
