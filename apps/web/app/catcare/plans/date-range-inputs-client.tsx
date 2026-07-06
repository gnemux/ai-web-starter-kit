"use client";

import { useMemo, useState } from "react";

import { CatCareCalendarIcon } from "../catcare-action-icons";
import { catCareInputClass } from "../owner-flow-components";

export function DateRangeInputsClient() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CatCarePlanDateInput label="开始日期" name="startOn" required />
      <CatCarePlanDateInput label="结束日期" name="endOn" />
    </div>
  );
}

function CatCarePlanDateInput({
  label,
  name,
  required = false
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  const today = useMemo(() => formatDateInput(new Date()), []);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(parseDateInput(today));

  return (
    <div className="grid content-start gap-3 text-[#243653]">
      <span className="text-sm font-semibold">{label}</span>
      <div
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpen(false);
          }
        }}
      >
        <input name={name} type="hidden" value={value} />
        <button
          aria-expanded={open}
          className={`${catCareInputClass} flex items-center justify-between gap-3 text-left ${!value ? "text-[#98a4b5]" : ""}`}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span>{value ? formatDateDisplay(value) : "年 /月/日"}</span>
          <CatCareCalendarIcon className="h-5 w-5 shrink-0 text-[#07847f]" />
        </button>
        {open ? (
          <DatePicker
            maxDate={null}
            onClear={
              required
                ? undefined
                : () => {
                    setValue("");
                    setOpen(false);
                  }
            }
            onMonthChange={setVisibleMonth}
            onSelect={(nextValue) => {
              setValue(nextValue);
              setVisibleMonth(parseDateInput(nextValue));
              setOpen(false);
            }}
            selectedDate={value}
            today={today}
            visibleMonth={visibleMonth}
          />
        ) : null}
      </div>
    </div>
  );
}

function DatePicker({
  onClear,
  onMonthChange,
  onSelect,
  selectedDate,
  today,
  visibleMonth
}: {
  maxDate: string | null;
  onClear?: () => void;
  onMonthChange: (date: Date) => void;
  onSelect: (date: string) => void;
  selectedDate: string;
  today: string;
  visibleMonth: Date;
}) {
  const monthDays = getMonthDays(visibleMonth);

  return (
    <div className="absolute left-0 z-30 mt-2 w-full min-w-[21rem] rounded-2xl border border-[#d9e0ea] bg-white p-4 shadow-xl shadow-slate-900/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-[#101a32]">
          {visibleMonth.getFullYear()}年{visibleMonth.getMonth() + 1}月
        </p>
        <div className="flex items-center gap-2">
          {[-1, 1].map((offset) => (
            <button
              aria-label={offset < 0 ? "上个月" : "下个月"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9e0ea] text-[#07847f] transition hover:bg-[#eef8f4]"
              key={offset}
              onClick={() =>
                onMonthChange(
                  new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth() + offset,
                    1
                  )
                )
              }
              type="button"
            >
              {offset < 0 ? "‹" : "›"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {["日", "一", "二", "三", "四", "五", "六"].map((weekday) => (
          <span
            className="flex h-8 items-center justify-center text-xs font-semibold text-[#6d7890]"
            key={weekday}
          >
            {weekday}
          </span>
        ))}
        {monthDays.map((date, index) => {
          if (!date) {
            return <span aria-hidden="true" key={`empty-${index}`} />;
          }

          const dateValue = formatDateInput(date);

          return (
            <button
              className={`flex h-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                dateValue === selectedDate
                  ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/20"
                  : "text-[#16233b] hover:bg-[#eef8f4]"
              }`}
              key={dateValue}
              onClick={() => onSelect(dateValue)}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        {onClear ? (
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-[#526177] ring-1 ring-[#d9e0ea] transition hover:bg-[#f7fbfa]"
            onClick={onClear}
            type="button"
          >
            清除
          </button>
        ) : null}
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#eef8f4] px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#dff4ee]"
          onClick={() => onSelect(today)}
          type="button"
        >
          今天
        </button>
      </div>
    </div>
  );
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateDisplay(value: string) {
  return value.replaceAll("-", "/");
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<Date | null> = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}
