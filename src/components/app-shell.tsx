"use client";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "./language-provider";
import { ContentProvider } from "./content-provider";
import { Header } from "./header";
import { Footer } from "./footer";
export function AppShell({ children }: { children: ReactNode }) { return <SessionProvider><LanguageProvider><ContentProvider><Header/>{children}<Footer/></ContentProvider></LanguageProvider></SessionProvider>; }
