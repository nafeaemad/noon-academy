"use client";
import { useLanguage } from "./language-provider";
export function PageHero({ label, title, description }:{label:{ar:string;en:string};title:{ar:string;en:string};description:{ar:string;en:string}}){const{locale}=useLanguage();return <section className="page-hero"><div className="pattern"/><div className="container"><span className="section-label" style={{justifyContent:"center"}}>{label[locale]}</span><h1>{title[locale]}</h1><p>{description[locale]}</p></div></section>}
