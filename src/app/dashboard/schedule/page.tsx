"use client";

import { CalendarProvider, useCalendar } from "@/components/calendar/calendar-context";
import CalendarHeader from "@/components/calendar/calendar-header";
import MiniCalendar from "@/components/calendar/mini-calendar";
import MonthView from "@/components/calendar/month-view";
import TimeGridView from "@/components/calendar/time-grid-view";
import MobileWeekView from "@/components/calendar/mobile-week-view";
import EventPopover from "@/components/calendar/event-popover";
import ClassDialog from "@/components/calendar/class-dialog";
import Loading from "@/components/ui/loading";

function ScheduleCalendar() {
  const { view, loading } = useCalendar();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      <aside className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
        <MiniCalendar />
      </aside>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <CalendarHeader />
        <div className="min-h-0 flex-1">
          {view === "month" ? (
            <MonthView />
          ) : view === "day" ? (
            <TimeGridView mode="day" />
          ) : (
            <>
              <MobileWeekView className="lg:hidden" />
              <div className="hidden h-full lg:block">
                <TimeGridView mode="week" />
              </div>
            </>
          )}
        </div>
      </div>

      <EventPopover />
      <ClassDialog />
    </div>
  );
}

export default function SchedulePage() {
  return (
    <div className="h-[calc(100dvh-6rem)] min-h-[480px] lg:h-[calc(100dvh-8rem)]">
      <CalendarProvider>
        <ScheduleCalendar />
      </CalendarProvider>
    </div>
  );
}
