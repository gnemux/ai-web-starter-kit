"use client";

import { useState } from "react";

import { CatCareClockIcon } from "../catcare-action-icons";

type FrequencyMode = "daily" | "every_2_days" | "weekly";

const maxFrequencyCount = 12;
const noFixedTimeValue = "__no_fixed_time";

const fallbackTimesByMode = {
  daily: ["08:00", "12:30", "18:30", "21:00"],
  every_2_days: ["12:30", "18:30", "20:30"],
  weekly: ["12:30", "18:30", "20:30", "09:00", "15:00", "17:30", "21:00"]
} as const satisfies Record<FrequencyMode, readonly string[]>;

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const hour = String(Math.floor(index / 4)).padStart(2, "0");
  const minute = String((index % 4) * 15).padStart(2, "0");

  return `${hour}:${minute}`;
});

function splitFrequency(value: string) {
  const text = value.trim();
  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(text);
  const mode = (match?.[1] ?? "daily") as FrequencyMode;

  return {
    count: normalizeCount(match?.[2] ?? "1"),
    mode
  };
}

function normalizeCount(value: string) {
  const count = Number(value);

  return Number.isInteger(count) && count > 0 && count <= maxFrequencyCount
    ? String(count)
    : "1";
}

function getFrequencyValue(mode: FrequencyMode, count: string) {
  if (count === "1") {
    return mode === "weekly" ? "weekly_1" : mode;
  }

  return `${mode}_${count}`;
}

function parseTimes(value?: string | null) {
  const seen = new Set<string>();

  return String(value ?? "")
    .split(/[,\n，、;/]+/)
    .map((time) => time.trim())
    .filter((time) => {
      if (!/^\d{2}:\d{2}$/.test(time) || seen.has(time)) {
        return false;
      }

      seen.add(time);
      return true;
    });
}

function getCountUnit(mode: FrequencyMode, locale: "zh" | "en") {
  if (locale === "en") {
    if (mode === "weekly") {
      return "times / week";
    }

    if (mode === "every_2_days") {
      return "times / 2 days";
    }

    return "times / day";
  }

  if (mode === "weekly") {
    return "次 / 周";
  }

  if (mode === "every_2_days") {
    return "次 / 2 日";
  }

  return "次 / 日";
}

export function RoutineScheduleControl({
  allowNoFixedTime = false,
  frequencyName,
  initialTime,
  initialValue,
  inline = false,
  locale,
  name,
  showTimes = true,
  timeName
}: {
  allowNoFixedTime?: boolean;
  frequencyName?: string;
  initialTime?: string | null;
  initialValue: string;
  inline?: boolean;
  locale: "zh" | "en";
  name?: string;
  showTimes?: boolean;
  timeName?: string;
}) {
  const initial = splitFrequency(initialValue);
  const initialTimes = parseTimes(initialTime);
  const [mode, setMode] = useState(initial.mode);
  const [count, setCount] = useState(initial.count);
  const [times, setTimes] = useState(initialTimes);
  const [noFixedTime, setNoFixedTime] = useState(
    allowNoFixedTime && initialTimes.length === 0
  );
  const normalizedCount = normalizeCount(count);
  const visibleTimeCount =
    mode === "weekly" ? 1 : Number(normalizedCount);
  const visibleTimes = Array.from(
    { length: visibleTimeCount },
    (_, index) =>
      times[index] ??
      fallbackTimesByMode[mode][index] ??
      fallbackTimesByMode[mode][0]
  );
  const value = getFrequencyValue(mode, normalizedCount);
  const resolvedName = frequencyName ?? name;
  const modes = [
    { label: locale === "en" ? "Daily" : "每日", value: "daily" },
    {
      label: locale === "en" ? "Every 2 days" : "隔日",
      value: "every_2_days"
    },
    { label: locale === "en" ? "Weekly" : "每周", value: "weekly" }
  ] as const;

  return (
    <div className="grid gap-3">
      {resolvedName ? <input name={resolvedName} type="hidden" value={value} /> : null}
      <div className={inline ? "grid gap-3 lg:grid-cols-2" : "grid gap-3"}>
        <div className="grid gap-2">
          {inline ? (
            <span className="text-xs font-semibold text-[#526177]">
              {locale === "en" ? "Repeat" : "频率"}
            </span>
          ) : null}
          <div className="grid h-11 grid-cols-3 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-1">
            {modes.map((option) => (
              <button
                className={`h-9 rounded-lg px-2 text-xs font-semibold transition ${
                  mode === option.value
                    ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/15"
                    : "text-[#526177] hover:bg-white hover:text-[#07847f]"
                }`}
                key={option.value}
                onClick={() => {
                  setMode(option.value);
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-xs font-semibold text-[#526177]">
            {locale === "en" ? "Times" : "次数"}
          </span>
          <label className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-xl border border-[#d9e0ea] bg-white focus-within:border-[#07847f] focus-within:ring-4 focus-within:ring-[#07847f]/10">
            <input
              className="h-11 min-w-0 bg-transparent px-4 text-sm font-semibold text-[#16233b] outline-none"
              inputMode="numeric"
              max={maxFrequencyCount}
              min={1}
              onChange={(event) => setCount(event.currentTarget.value)}
              onBlur={() => setCount(normalizedCount)}
              pattern="[1-9][0-9]*"
              step={1}
              type="number"
              value={count}
            />
            <span className="flex h-11 items-center border-l border-[#d9e0ea] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#526177]">
              {getCountUnit(mode, locale)}
            </span>
          </label>
        </div>
      </div>

      {showTimes && timeName ? (
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#526177]">
              {mode === "weekly"
                ? locale === "en"
                  ? "Default time"
                  : "默认时间"
                : locale === "en"
                  ? "Time points"
                  : "时间点"}
            </span>
            {allowNoFixedTime ? (
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#526177]">
                <input
                  checked={noFixedTime}
                  className="h-4 w-4 accent-[#07847f]"
                  onChange={(event) => setNoFixedTime(event.currentTarget.checked)}
                  type="checkbox"
                />
                {locale === "en" ? "No fixed time" : "无固定时间"}
              </label>
            ) : null}
          </div>
          {noFixedTime ? (
            <label className="relative block">
              <input name={timeName} type="hidden" value={noFixedTimeValue} />
              <CatCareClockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#07847f]" />
              <input
                className="h-11 w-full rounded-xl border border-[#d9e0ea] bg-white px-3 pl-10 text-sm font-semibold text-[#16233b] outline-none"
                readOnly
                value={locale === "en" ? "Any time" : "任意时间"}
              />
            </label>
          ) : (
            <div
              className={
                visibleTimeCount > 1
                  ? "grid gap-2 sm:grid-cols-2"
                  : "grid gap-2"
              }
            >
              {visibleTimes.map((time, index) => (
                <CatCareTimeInput
                  key={index}
                  name={timeName}
                  onChange={(value) => {
                    const nextTimes = [...visibleTimes];
                    nextTimes[index] = value;
                    setTimes(nextTimes);
                  }}
                  value={time}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function CatCareTimeInput({
  name,
  onChange,
  value
}: {
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <input name={name} type="hidden" value={value} />
      <CatCareClockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#07847f]" />
      <button
        className="h-11 w-full rounded-xl border border-[#d9e0ea] bg-white px-3 pl-10 text-left text-sm font-semibold text-[#16233b] outline-none transition hover:border-[#07847f]/50 focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {value}
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 grid max-h-56 min-w-[19rem] grid-cols-4 gap-2 overflow-y-auto rounded-xl border border-[#d9e0ea] bg-white p-2 shadow-xl shadow-slate-900/10">
          {timeOptions.map((option) => (
            <button
              className={`h-9 rounded-lg px-2 text-center font-mono text-sm font-semibold tabular-nums transition ${
                value === option
                  ? "bg-[#07847f] text-white"
                  : "text-[#526177] hover:bg-[#e6f7f2] hover:text-[#07847f]"
              }`}
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { noFixedTimeValue };
