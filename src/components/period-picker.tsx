"use client";

import { useState, useRef, useEffect } from "react";

type ViewMode = "week" | "month" | "year";

interface PeriodPickerProps {
  mode: ViewMode;
  label: string;
  onSelect: (offset: number) => void;
  /** Current offset from today (0 = current period) */
  offset: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function PeriodPicker({ mode, label, onSelect, offset }: PeriodPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 rounded-xl border border-border bg-card shadow-xl p-3 min-w-[280px]">
          {mode === "month" && (
            <MonthPicker
              offset={offset}
              onSelect={(o) => { onSelect(o); setOpen(false); }}
            />
          )}
          {mode === "week" && (
            <WeekPicker
              offset={offset}
              onSelect={(o) => { onSelect(o); setOpen(false); }}
            />
          )}
          {mode === "year" && (
            <YearPicker
              offset={offset}
              onSelect={(o) => { onSelect(o); setOpen(false); }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// --- Month Picker: 3×4 grid of months with year nav ---

function MonthPicker({ offset, onSelect }: { offset: number; onSelect: (o: number) => void }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Derive selected month/year from offset
  const selectedDate = new Date(currentYear, currentMonth + offset, 1);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  const isSelected = (m: number) =>
    viewYear === selectedDate.getFullYear() && m === selectedDate.getMonth();
  const isCurrent = (m: number) =>
    viewYear === currentYear && m === currentMonth;
  const isFuture = (m: number) =>
    viewYear > currentYear || (viewYear === currentYear && m > currentMonth);

  const handleSelect = (m: number) => {
    if (isFuture(m)) return;
    const diff = (viewYear - currentYear) * 12 + (m - currentMonth);
    onSelect(diff);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setViewYear((y) => y - 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm">&larr;</button>
        <span className="text-sm font-semibold">{viewYear}</span>
        <button
          type="button"
          onClick={() => setViewYear((y) => Math.min(y + 1, currentYear))}
          disabled={viewYear >= currentYear}
          className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm disabled:opacity-30 disabled:cursor-default"
        >&rarr;</button>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {MONTHS.map((name, i) => (
          <button
            key={name}
            type="button"
            disabled={isFuture(i)}
            onClick={() => handleSelect(i)}
            className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer
              ${isSelected(i) ? "bg-emerald-500 text-white" : ""}
              ${isCurrent(i) && !isSelected(i) ? "ring-1 ring-emerald-500/50 text-emerald-400" : ""}
              ${!isSelected(i) && !isCurrent(i) && !isFuture(i) ? "text-foreground hover:bg-secondary" : ""}
              ${isFuture(i) ? "text-muted-foreground/30 cursor-default" : ""}
            `}
          >
            {name}
          </button>
        ))}
      </div>
    </>
  );
}

// --- Week Picker: mini calendar ---

function WeekPicker({ offset, onSelect }: { offset: number; onSelect: (o: number) => void }) {
  const now = new Date();

  // Get the Monday of the currently selected week
  const selectedMonday = getMonday(new Date(
    now.getFullYear(), now.getMonth(), now.getDate() + offset * 7,
  ));

  const [viewMonth, setViewMonth] = useState(selectedMonday.getMonth());
  const [viewYear, setViewYear] = useState(selectedMonday.getFullYear());

  const todayMonday = getMonday(now);

  // Build calendar grid for the view month
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const isWeekSelected = (weekDays: (number | null)[]) => {
    const firstDay = weekDays.find((d) => d !== null);
    if (!firstDay) return false;
    const monday = getMonday(new Date(viewYear, viewMonth, firstDay));
    return monday.getTime() === selectedMonday.getTime();
  };

  const isWeekFuture = (weekDays: (number | null)[]) => {
    const firstDay = weekDays.find((d) => d !== null);
    if (!firstDay) return true;
    const monday = getMonday(new Date(viewYear, viewMonth, firstDay));
    return monday.getTime() > todayMonday.getTime();
  };

  const handleWeekSelect = (weekDays: (number | null)[]) => {
    const firstDay = weekDays.find((d) => d !== null);
    if (!firstDay) return;
    const monday = getMonday(new Date(viewYear, viewMonth, firstDay));
    const diffMs = monday.getTime() - todayMonday.getTime();
    const diffWeeks = Math.round(diffMs / (7 * 86_400_000));
    onSelect(diffWeeks);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prevMonth} className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm">&larr;</button>
        <span className="text-sm font-semibold">{MONTHS[viewMonth]} {viewYear}</span>
        <button
          type="button"
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm disabled:opacity-30 disabled:cursor-default"
        >&rarr;</button>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center mb-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-[10px] text-muted-foreground font-medium py-1">{d}</span>
        ))}
      </div>
      <div className="space-y-0.5">
        {weeks.map((weekDays, wi) => {
          const selected = isWeekSelected(weekDays);
          const future = isWeekFuture(weekDays);
          return (
            <div
              key={wi}
              role="button"
              tabIndex={future ? -1 : 0}
              onClick={() => !future && handleWeekSelect(weekDays)}
              onKeyDown={(e) => { if (!future && (e.key === "Enter" || e.key === " ")) handleWeekSelect(weekDays); }}
              className={`grid grid-cols-7 text-center rounded-lg py-1 transition-colors
                ${selected ? "bg-emerald-500/20 ring-1 ring-emerald-500" : ""}
                ${!selected && !future ? "hover:bg-secondary cursor-pointer" : ""}
                ${future ? "opacity-30" : ""}
              `}
            >
              {weekDays.map((day, di) => {
                const isToday = day !== null && viewYear === now.getFullYear() && viewMonth === now.getMonth() && day === now.getDate();
                return (
                  <span
                    key={di}
                    className={`text-xs tabular-nums py-0.5
                      ${isToday ? "font-bold text-emerald-400" : ""}
                      ${selected && day !== null ? "text-emerald-300 font-medium" : ""}
                    `}
                  >
                    {day ?? ""}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

// --- Year Picker: grid of years ---

function YearPicker({ offset, onSelect }: { offset: number; onSelect: (o: number) => void }) {
  const currentYear = new Date().getFullYear();
  const selectedYear = currentYear + offset;

  // Show a range of years
  const startYear = Math.min(selectedYear, currentYear) - 4;
  const years = Array.from({ length: 9 }, (_, i) => startYear + i).filter((y) => y <= currentYear);

  return (
    <>
      <p className="text-xs text-muted-foreground text-center mb-3">Select Year</p>
      <div className="grid grid-cols-3 gap-1.5">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onSelect(y - currentYear)}
            className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer
              ${y === selectedYear ? "bg-emerald-500 text-white" : ""}
              ${y === currentYear && y !== selectedYear ? "ring-1 ring-emerald-500/50 text-emerald-400" : ""}
              ${y !== selectedYear && y !== currentYear ? "text-foreground hover:bg-secondary" : ""}
            `}
          >
            {y}
          </button>
        ))}
      </div>
    </>
  );
}

// --- Helpers ---

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
