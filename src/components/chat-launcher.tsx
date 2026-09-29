"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Send } from "lucide-react";
import { useLanguage } from "./language-provider";
import { useSiteSettings, whatsappDigits } from "@/lib/use-site-settings";

export function ChatLauncher() {
  const { isArabic } = useLanguage();
  const { status } = useSession();
  const settings = useSiteSettings();
  const [open, setOpen] = useState(false);
  const waDigits = whatsappDigits(settings.whatsapp);
  const waText = encodeURIComponent(
    isArabic ? "السلام عليكم، أريد معرفة المزيد عن أكاديمية نون وحجز حصة تجريبية." : "Hello, I would like to know more about Noon Academy and book a trial lesson.",
  );
  const chatHref = status === "authenticated" ? "/account/chat" : "/login?callbackUrl=/account/chat";

  return (
    <div className="chat-launcher">
      {open && (
        <div className="chat-launcher-menu">
          <button className="chat-launcher-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </button>
          <p>{isArabic ? "تحب تتواصل معانا إزاي؟" : "How would you like to reach us?"}</p>
          <a href={`https://wa.me/${waDigits}?text=${waText}`} target="_blank" rel="noreferrer" className="chat-launcher-option" onClick={() => setOpen(false)}>
            <MessageCircle size={18} />
            <div>
              <strong>WhatsApp</strong>
              <small>{isArabic ? "رد أسرع من تطبيق واتساب" : "Faster reply over WhatsApp"}</small>
            </div>
          </a>
          <Link href={chatHref} className="chat-launcher-option" onClick={() => setOpen(false)}>
            <Send size={18} />
            <div>
              <strong>{isArabic ? "شات مباشر على الموقع" : "Direct chat on the site"}</strong>
              <small>{isArabic ? "هيتحفظ عندك في حسابك" : "Saved to your account"}</small>
            </div>
          </Link>
        </div>
      )}
      <button className="whatsapp-float" onClick={() => setOpen((v) => !v)} aria-label="Contact us">
        {open ? <X /> : <MessageCircle />}
      </button>
    </div>
  );
}
