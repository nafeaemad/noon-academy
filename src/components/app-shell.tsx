"use client";
import type { ReactNode } from "react";
import { LanguageProvider } from "./language-provider";
import { Header } from "./header";
import { Footer } from "./footer";
export function AppShell({ children }: { children: ReactNode }) { return <LanguageProvider><Header/>{children}<Footer/></LanguageProvider>; }
