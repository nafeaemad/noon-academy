"use client";

import Link from "next/link";
import { Globe2, Menu, X, UserRound } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "./language-provider";
import { Logo } from "./logo";
import { t } from "@/lib/content";

export function Header() {
  const { locale, setLocale, isArabic } = useLanguage();
  const { data: session, status } = useSession();
  const c = t[locale];
  const [open, setOpen] = useState(false);
  const links = [["/", c.home], ["/#programs", c.programs], ["/teachers", c.teachers], ["/pricing", c.pricing], ["/about", c.about], ["/reviews", c.reviews], ["/contact", c.contact]];
  return <header className="site-header"><div className="nav-shell">
    <Link href="/" className="logo-link"><Logo /></Link>
    <nav className={`main-nav ${open ? "nav-open" : ""}`} aria-label="Main navigation">
      {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
      <Link href="/booking" className="mobile-book" onClick={() => setOpen(false)}>{c.book}</Link>
    </nav>
    <div className="nav-actions">
      <button className="language-button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")} aria-label="Change language"><Globe2 size={17}/><span>{locale === "ar" ? "EN" : "العربية"}</span></button>
      <Link href={status === "authenticated" ? "/account" : "/login"} className="account-link" onClick={() => setOpen(false)}>
        <UserRound size={17}/><span>{status === "authenticated" ? session?.user?.name?.split(" ")[0] : (isArabic ? "حسابي" : "Account")}</span>
      </Link>
      <Link href="/booking" className="button button-primary header-cta">{c.book}</Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Open menu">{open ? <X/> : <Menu/>}</button>
    </div>
  </div></header>;
}
