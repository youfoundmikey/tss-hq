"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar">
      <Link href="/" data-active={pathname === "/"}>
        Dashboard
      </Link>
      <Link href="/chat" data-active={pathname === "/chat"}>
        Chat
      </Link>
    </nav>
  );
}
