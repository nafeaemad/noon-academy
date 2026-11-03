"use client";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "./language-provider";
import { ContentProvider } from "./content-provider";
import { Header } from "./header";
import { Footer } from "./footer";
import { DiscountBanner } from "./discount-banner";
export function AppShell({ children }: { children: ReactNode }) { return <SessionProvider><LanguageProvider><ContentProvider><Header/><DiscountBanner/>{children}<Footer/></ContentProvider></LanguageProvider></SessionProvider>; }
