import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const base=process.env.NEXT_PUBLIC_SITE_URL||"https://noonquran.academy"; return ["","/about","/teachers","/pricing","/booking","/reviews","/contact","/blog"].map((p)=>({url:`${base}${p}`,lastModified:new Date(),changeFrequency:p===""?"weekly":"monthly",priority:p===""?1:.8})); }
