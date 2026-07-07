"use client";

import { useMemo, useState } from "react";

import {
  CatCareBowlActionIcon,
  CatCareCalendarIcon,
  CatCarePlusCircleIcon,
  CatCareSaveIcon,
  CatCareSearchIcon
} from "../catcare-action-icons";
import { CatCareEventTypeIcon } from "../catcare-item-type-icon";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import {
  CatCareButton,
  CatCareField,
  CatCarePanel,
  catCareInputClass
} from "../owner-flow-components";
import { createCatCareEventLocalAction } from "../actions";
import type {
  CatCareCatSummary,
  CatCareEvent,
  CatCareLibraryItem
} from "@/lib/catcare/product-service";

const eventTypes = [
  ["feeding", "喂食"],
  ["treat", "零食"],
  ["health", "健康"],
  ["medicine", "用药"],
  ["vet", "就医"],
  ["travel", "出门"],
  ["behavior", "行为"],
  ["environment", "环境"],
  ["other", "其它"]
] as const;

const severityLabels = {
  normal: "普通",
  urgent: "紧急",
  watch: "需关注"
} as const;
const severityOptions = [
  ["normal", "普通"],
  ["watch", "需关注"],
  ["urgent", "紧急"]
] as const;

export function EventsWorkspaceClient({
  cats,
  events,
  initialCatId,
  libraryItems
}: {
  cats: CatCareCatSummary[];
  events: CatCareEvent[];
  initialCatId: string;
  libraryItems: CatCareLibraryItem[];
}) {
  const [selectedCatId, setSelectedCatId] = useState(initialCatId);
  const [eventList, setEventList] = useState(events);
  const [formKey, setFormKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [rangeMode, setRangeMode] = useState<"30d" | "month" | "custom">("30d");
  const toast = useCatCareToast();
  const [eventType, setEventType] = useState<(typeof eventTypes)[number][0]>(
    "feeding"
  );
  const [severity, setSeverity] =
    useState<(typeof severityOptions)[number][0]>("normal");
  const selectedEvents = useMemo(
    () =>
      filterEventsByRange(
        eventList
          .filter((event) => event.catId === selectedCatId)
          .sort(compareEventsByDateDesc),
        rangeMode
      ),
    [eventList, rangeMode, selectedCatId]
  );
  const relatedItemOptions = useMemo(
    () => Array.from(new Set(libraryItems.map((item) => item.name))),
    [libraryItems]
  );

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-6">
      <CatCareToast message={null} toast={toast.toast} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-semibold text-[#101a32]">
            事件与健康时间线
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {cats.map((cat) => (
            <button
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                cat.id === selectedCatId
                  ? "border-[#07847f] bg-[#07847f] text-white"
                  : "border-[#d9e0ea] bg-white text-[#526177] hover:border-[#07847f]/50 hover:text-[#07847f]"
              }`}
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              type="button"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <EventRangeBar
        rangeMode={rangeMode}
        selectedEvents={selectedEvents}
        onChange={setRangeMode}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_25rem]">
        <CatCarePanel>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#101a32]">时间线</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                近期健康、行为和环境变化会进入照护计划生成参考。
              </p>
            </div>
            <SeverityLegend />
          </div>
          {selectedEvents.length > 0 ? (
            <div className="relative mt-6 grid gap-0">
              {selectedEvents.map((event, index) => (
                <TimelineEventRow
                  event={event}
                  isFirst={index === 0}
                  isLast={index === selectedEvents.length - 1}
                  key={event.id}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#b8c5d8] bg-[#fbfdfc] p-6">
              <h3 className="text-lg font-semibold text-[#101a32]">
                还没有事件记录
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                没有异常也可以继续创建照护计划；如果近期有换粮、软便、用药或行为变化，请在右侧添加。
              </p>
            </div>
          )}
        </CatCarePanel>

        <CatCarePanel>
          <h2 className="text-2xl font-semibold text-[#101a32]">新增事件</h2>
          <form
            action={async (formData) => {
              setPending(true);

              const result = await createCatCareEventLocalAction(formData);

              setPending(false);

              if (!result.ok) {
                toast.showError(result.error.message);
                return;
              }

              setEventList((current) => [result.data, ...current]);
              setEventType("feeding");
              setSeverity("normal");
              setFormKey((current) => current + 1);
              toast.showSuccess("事件已保存，已加入当前猫咪时间线。");
            }}
            className={`mt-5 grid gap-4 ${pending ? "pointer-events-none opacity-70" : ""}`}
            key={formKey}
          >
            <input name="catId" type="hidden" value={selectedCatId} />
            <CatCareField label="类型">
              <input name="eventType" type="hidden" value={eventType} />
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-2">
                {eventTypes.map(([value, label]) => (
                  <button
                    className={`inline-flex min-h-12 items-center justify-start gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                      eventType === value
                        ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/15"
                        : "bg-white text-[#526177] ring-1 ring-[#e2e6ee] hover:text-[#07847f]"
                    }`}
                    key={value}
                    onClick={() => setEventType(value)}
                    type="button"
                  >
                    <CatCareEventTypeIcon className="h-8 w-8" eventType={value} />
                    {label}
                  </button>
                ))}
              </div>
            </CatCareField>
            <CatCareField label="标题">
              <input
                className={catCareInputClass}
                name="title"
                placeholder="例如：最近换粮后软便"
                required
              />
            </CatCareField>
            <CatCareField label="发生日期">
              <EventDateInput name="occurredOn" />
            </CatCareField>
            <CatCareField label="关联食物/用品">
              <RelatedItemInput
                name="relatedItemName"
                options={relatedItemOptions}
              />
            </CatCareField>
            <CatCareField label="程度">
              <input name="severity" type="hidden" value={severity} />
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-2">
                {severityOptions.map(([value, label]) => (
                  <button
                    className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition ${
                      severity === value
                        ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/15"
                        : "bg-white text-[#526177] ring-1 ring-[#e2e6ee] hover:text-[#07847f]"
                    }`}
                    key={value}
                    onClick={() => setSeverity(value)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CatCareField>
            <CatCareField label="说明">
              <textarea
                className={`${catCareInputClass} min-h-28 py-4 leading-6`}
                name="note"
                placeholder="例如：如果连续两天软便，暂停零食并联系主人。"
              />
            </CatCareField>
            <CatCareButton fullWidth type="submit">
              <CatCareSaveIcon />
              保存事件
            </CatCareButton>
          </form>
        </CatCarePanel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CatCareButton href={`/catcare/items?cat_id=${selectedCatId}`} variant="secondary">
          <CatCareBowlActionIcon />
          返回食物用品
        </CatCareButton>
        <CatCareButton href={`/catcare/plans?cat_id=${selectedCatId}`}>
          <CatCareCalendarIcon />
          创建照护计划
        </CatCareButton>
      </div>
    </div>
  );
}

function EventRangeBar({
  rangeMode,
  selectedEvents,
  onChange
}: {
  rangeMode: "30d" | "month" | "custom";
  selectedEvents: CatCareEvent[];
  onChange: (mode: "30d" | "month" | "custom") => void;
}) {
  const rangeLabel = getEventRangeLabel(selectedEvents);

  return (
    <div className="grid gap-3 rounded-2xl border border-[#e2e6ee] bg-white p-3 shadow-sm shadow-slate-900/[0.04] lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
      <div className="grid gap-2 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-2 sm:grid-cols-3">
        {[
          ["30d", "近 30 天"],
          ["month", "本月"],
          ["custom", "自定义"]
        ].map(([value, label]) => (
          <button
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold transition ${
              rangeMode === value
                ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/15"
                : "bg-white text-[#526177] ring-1 ring-[#e2e6ee] hover:text-[#07847f]"
            }`}
            key={value}
            onClick={() => onChange(value as "30d" | "month" | "custom")}
            type="button"
          >
            <CatCareCalendarIcon />
            {label}
          </button>
        ))}
      </div>
      <div className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#d9e0ea] bg-white px-4 text-base font-semibold text-[#243653]">
        <CatCareCalendarIcon className="h-5 w-5 text-[#07847f]" />
        {rangeLabel}
      </div>
    </div>
  );
}

function SeverityLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#526177]">
      {[
        ["#07847f", "正常"],
        ["#f08a00", "关注"],
        ["#d94235", "紧急"]
      ].map(([color, label]) => (
        <span className="inline-flex items-center gap-2" key={label}>
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

function EventDateInput({ name }: { name: string }) {
  const today = useMemo(() => formatDateInput(new Date()), []);
  const [value, setValue] = useState(today);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(parseDateInput(today));

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
      <button
        className={`${catCareInputClass} flex items-center gap-3 text-left`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <CatCareCalendarIcon className="h-5 w-5 shrink-0 text-[#07847f]" />
        <span>{formatDateDisplay(value)}</span>
      </button>
      {open ? (
        <EventDatePicker
          maxDate={today}
          onMonthChange={setVisibleMonth}
          onSelect={(nextValue) => {
            setValue(nextValue);
            setVisibleMonth(parseDateInput(nextValue));
            setOpen(false);
          }}
          selectedDate={value}
          visibleMonth={visibleMonth}
        />
      ) : null}
    </div>
  );
}

function EventDatePicker({
  maxDate,
  onMonthChange,
  onSelect,
  selectedDate,
  visibleMonth
}: {
  maxDate: string;
  onMonthChange: (date: Date) => void;
  onSelect: (date: string) => void;
  selectedDate: string;
  visibleMonth: Date;
}) {
  const max = parseDateInput(maxDate);
  const monthDays = getMonthDays(visibleMonth);

  return (
    <div className="absolute left-0 z-30 mt-2 w-full rounded-2xl border border-[#d9e0ea] bg-white p-4 shadow-xl shadow-slate-900/10">
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
          const disabled = date > max;

          return (
            <button
              className={`flex h-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                dateValue === selectedDate
                  ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/20"
                  : "text-[#16233b] hover:bg-[#eef8f4]"
              } ${disabled ? "cursor-not-allowed text-[#b8c1cf] hover:bg-transparent" : ""}`}
              disabled={disabled}
              key={dateValue}
              onClick={() => onSelect(dateValue)}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <button
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#eef8f4] px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#dff4ee]"
        onClick={() => onSelect(maxDate)}
        type="button"
      >
        今天
      </button>
    </div>
  );
}

function RelatedItemInput({
  name,
  options
}: {
  name: string;
  options: string[];
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    return options
      .filter((item) => !query || item.toLowerCase().includes(query))
      .slice(0, 8);
  }, [options, value]);

  return (
    <div className="relative">
      <CatCareSearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#07847f]" />
      <input
        autoComplete="off"
        className={`${catCareInputClass} pl-12`}
        name={name}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="搜索或输入家庭用品"
        value={value}
      />
      {open && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 grid max-h-56 overflow-auto rounded-xl border border-[#d9e0ea] bg-white p-2 shadow-xl shadow-slate-900/10">
          {suggestions.map((item) => (
            <button
              className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#243653] transition hover:bg-[#e6f7f2] hover:text-[#07847f]"
              key={item}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setValue(item);
                setOpen(false);
              }}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TimelineEventRow({
  event,
  isFirst,
  isLast
}: {
  event: CatCareEvent;
  isFirst: boolean;
  isLast: boolean;
}) {
  const typeLabel =
    eventTypes.find(([value]) => value === event.eventType)?.[1] ?? "事件";
  const severity = getSeverityTone(event.severity);

  return (
    <article className="relative grid gap-3 border-b border-[#e2e6ee] py-5 last:border-b-0 sm:grid-cols-[5rem_4rem_minmax(0,1fr)_8rem] sm:items-center">
      <div className="text-base font-semibold text-[#101a32] sm:text-center">
        {formatEventDate(event.occurredOn)}
      </div>
      <div className="relative hidden h-full min-h-28 items-center justify-center sm:flex">
        <span
          className={`absolute left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#d9e6e3] via-[#82b8b1] to-[#d9e6e3] ${
            isFirst ? "top-1/2" : "top-0"
          } ${isLast ? "bottom-1/2" : "bottom-0"}`}
        />
        <span className="absolute left-1/2 top-1/2 h-16 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm shadow-slate-900/[0.05] ring-1 ring-[#c8d8e5]">
          <CatCareEventTypeIcon className="h-10 w-10" eventType={event.eventType} />
        </span>
      </div>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm shadow-slate-900/[0.04] ring-1 ring-[#e2e6ee] sm:hidden">
        <CatCareEventTypeIcon className="h-8 w-8" eventType={event.eventType} />
      </span>
      <div className="min-w-0">
        <h3 className="break-words text-lg font-semibold text-[#101a32]">
          {event.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-[#526177]">
          {typeLabel}
          {event.relatedItemName ? ` · ${event.relatedItemName}` : ""}
        </p>
        {event.note ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#526177]">
            {event.note}
          </p>
        ) : null}
      </div>
      <span
        className={`inline-flex w-fit items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${severity.badgeClass}`}
      >
        {severityLabels[event.severity]}
      </span>
    </article>
  );
}

function filterEventsByRange(
  events: CatCareEvent[],
  rangeMode: "30d" | "month" | "custom"
) {
  const today = new Date();

  if (rangeMode === "custom") {
    return events;
  }

  return events.filter((event) => {
    const occurredOn = event.occurredOn ? parseDateInput(event.occurredOn) : null;

    if (!occurredOn) {
      return false;
    }

    if (rangeMode === "month") {
      return (
        occurredOn.getFullYear() === today.getFullYear() &&
        occurredOn.getMonth() === today.getMonth()
      );
    }

    const start = new Date(today);
    start.setDate(today.getDate() - 29);

    return occurredOn >= start && occurredOn <= today;
  });
}

function compareEventsByDateDesc(left: CatCareEvent, right: CatCareEvent) {
  return (right.occurredOn ?? "").localeCompare(left.occurredOn ?? "");
}

function getEventRangeLabel(events: CatCareEvent[]) {
  const dates = events
    .map((event) => event.occurredOn)
    .filter((date): date is string => Boolean(date))
    .sort();

  if (dates.length === 0) {
    return "暂无事件";
  }

  return `${formatDateDisplay(dates[0])} - ${formatDateDisplay(dates[dates.length - 1])}`;
}

function getSeverityTone(severity: CatCareEvent["severity"]) {
  return {
    normal: {
      badgeClass: "bg-[#e6f7f2] text-[#07847f]"
    },
    urgent: {
      badgeClass: "bg-[#fff4f2] text-[#b33a2f]"
    },
    watch: {
      badgeClass: "bg-[#fff8e6] text-[#a35a00]"
    }
  }[severity];
}

function formatEventDate(value: string | null) {
  if (!value) {
    return "未记录";
  }

  const [, month, day] = value.split("-");

  return `${month}/${day}`;
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
