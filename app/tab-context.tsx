"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Status } from "@/lib/types";

export type DashboardTab = "All" | Status;

export const STATUS_TABS: DashboardTab[] = [
  "All",
  "Idea",
  "Scripting",
  "Filming",
  "Editing",
  "Posted",
];

const TabContext = createContext<{
  tab: DashboardTab;
  setTab: (t: DashboardTab) => void;
}>({
  tab: "Idea",
  setTab: () => {},
});

export function TabProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<DashboardTab>("Idea");
  return (
    <TabContext.Provider value={{ tab, setTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useDashboardTab() {
  return useContext(TabContext);
}
