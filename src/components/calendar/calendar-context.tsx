"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ClassService, GuitarClass } from "@/services/class.service";
import type { ViewMode } from "./calendar-types";
import { addDays, dayIndexToName, minutesToTime } from "./calendar-types";

export interface PopoverState {
  cls: GuitarClass;
  x: number;
  y: number;
}

export type DialogState =
  | { mode: "create"; dayOfWeek?: string; start?: string }
  | { mode: "edit"; cls: GuitarClass }
  | null;

interface CalendarContextType {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  goToday: () => void;
  goPrev: () => void;
  goNext: () => void;
  miniDate: Date;
  setMiniDate: (date: Date) => void;
  classes: GuitarClass[];
  loading: boolean;
  refresh: () => Promise<void>;
  createClass: (input: Omit<GuitarClass, "id">) => Promise<void>;
  updateClass: (id: string, input: Partial<Omit<GuitarClass, "id">>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  popover: PopoverState | null;
  openPopover: (state: PopoverState) => void;
  closePopover: () => void;
  dialog: DialogState;
  openCreate: (options?: { dayOfWeek?: string; start?: string }) => void;
  openEdit: (cls: GuitarClass) => void;
  closeDialog: () => void;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [miniDate, setMiniDate] = useState(() => new Date());
  const [classes, setClasses] = useState<GuitarClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);

  const refresh = useCallback(async () => {
    const data = await ClassService.getAllClasses();
    setClasses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    ClassService.getAllClasses().then((data) => {
      if (cancelled) return;
      setClasses(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const createClass = useCallback(async (input: Omit<GuitarClass, "id">) => {
    await ClassService.createClass(input);
    setClasses(await ClassService.getAllClasses());
  }, []);

  const updateClass = useCallback(async (id: string, input: Partial<Omit<GuitarClass, "id">>) => {
    await ClassService.updateClass(id, input);
    setClasses(await ClassService.getAllClasses());
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    await ClassService.deleteClass(id);
    setClasses(await ClassService.getAllClasses());
  }, []);

  const goToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setMiniDate(today);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "month") return new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const amount = view === "day" ? 1 : 7;
      return addDays(d, -amount);
    });
  }, [view]);

  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "month") return new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const amount = view === "day" ? 1 : 7;
      return addDays(d, amount);
    });
  }, [view]);

  const openCreate = useCallback(
    (options?: { dayOfWeek?: string; start?: string }) => {
      const dayOfWeek =
        options?.dayOfWeek ?? dayIndexToName(currentDate.getDay());
      const start = options?.start ?? minutesToTime(18 * 60);
      setDialog({ mode: "create", dayOfWeek, start });
    },
    [currentDate]
  );

  const openEdit = useCallback((cls: GuitarClass) => {
    setDialog({ mode: "edit", cls });
  }, []);

  const openPopover = useCallback((state: PopoverState) => setPopover(state), []);
  const closePopover = useCallback(() => setPopover(null), []);
  const closeDialog = useCallback(() => setDialog(null), []);

  return (
    <CalendarContext.Provider
      value={{
        view,
        setView,
        currentDate,
        setCurrentDate,
        goToday,
        goPrev,
        goNext,
        miniDate,
        setMiniDate,
        classes,
        loading,
        refresh,
        createClass,
        updateClass,
        deleteClass,
        popover,
        openPopover,
        closePopover,
        dialog,
        openCreate,
        openEdit,
        closeDialog,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): CalendarContextType {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}
