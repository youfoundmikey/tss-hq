"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { STATUS_TABS, useDashboardTab } from "./tab-context";

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { tab, setTab } = useDashboardTab();
  const onDashboard = pathname === "/";

  return (
    <nav className="tabbar">
      {STATUS_TABS.map((t) => (
        <button
          key={t}
          className="tabbar-item"
          data-active={onDashboard && tab === t}
          onClick={() => {
            setTab(t);
            if (!onDashboard) router.push("/");
          }}
        >
          {t}
        </button>
      ))}
      <Link
        href="/chat"
        className="tabbar-item"
        data-active={pathname === "/chat"}
      >
        Chat
      </Link>
    </nav>
  );
}
