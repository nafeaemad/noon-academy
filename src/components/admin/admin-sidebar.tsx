"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { adminNav } from "@/lib/admin-nav";

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="admin-side-toggle no-print" onClick={() => setOpen(!open)} aria-label="القائمة">
        {open ? <X size={20} /> : <Menu size={20} />} <span>قائمة الإدارة</span>
      </button>
      <aside className={`admin-sidebar no-print${open ? " open" : ""}`}>
        <div className="admin-side-brand">NOON ADMIN</div>
        <nav>
          {adminNav.map((n) => {
            const active = "exact" in n && n.exact ? pathname === n.href : pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link key={n.href} href={n.href} className={active ? "active" : ""} onClick={() => setOpen(false)}>
                {n.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
