"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useLanguage } from "./language-provider";

export type CarouselReview = {
  firstName: string;
  country: string;
  program: string;
  category: string;
  rating: number;
  content: string;
};

const AUTO_MS = 6000;
const FLIP_MS = 700;

function ReviewCard({ r, state }: { r: CarouselReview; state: "in" | "out" | "idle" }) {
  return (
    <article className={`rc-card ${state === "in" ? "rc-in" : state === "out" ? "rc-out" : ""}`}>
      <Quote className="rc-quote" aria-hidden />
      <div className="rc-stars" aria-label={`${r.rating}/5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={i < r.rating ? "on" : ""} />
        ))}
      </div>
      <p className="rc-text">{r.content}</p>
      <div className="rc-who">
        <span className="rc-avatar">{r.firstName.trim().charAt(0).toUpperCase()}</span>
        <div>
          <strong>
            {r.firstName} · {r.country}
          </strong>
          <small>{r.program}</small>
        </div>
        {r.category && <span className="rc-chip">{r.category}</span>}
      </div>
    </article>
  );
}

/** Reviews as a stack of cards that flip over one after another (auto-play, arrows, dots, swipe). */
export function ReviewCarousel({ items }: { items: CarouselReview[] }) {
  const { isArabic } = useLanguage();
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // restarts the progress bar after each change
  const touchX = useRef<number | null>(null);
  const curRef = useRef(0);
  const n = items.length;

  const go = useCallback(
    (to: number) => {
      if (n < 2) return;
      const next = ((to % n) + n) % n;
      if (next === curRef.current) return;
      setPrev(curRef.current);
      curRef.current = next;
      setCur(next);
      setTick((t) => t + 1);
    },
    [n],
  );

  // Drop the outgoing card once its flip finished.
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), FLIP_MS);
    return () => clearTimeout(t);
  }, [prev, cur]);

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setTimeout(() => go(cur + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [cur, paused, n, go, tick]);

  if (!n) return null;
  const Prev = isArabic ? ChevronRight : ChevronLeft;
  const Next = isArabic ? ChevronLeft : ChevronRight;

  return (
    <div
      className="rc-wrap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        setPaused(false);
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1) * (isArabic ? -1 : 1));
      }}
    >
      <div className="rc-stage">
        {n > 1 && <span className="rc-back rc-back1" aria-hidden />}
        {n > 2 && <span className="rc-back rc-back2" aria-hidden />}
        <div className="rc-slot">
          {prev !== null && <ReviewCard key={`out-${prev}-${cur}`} r={items[prev]} state="out" />}
          <ReviewCard key={`cur-${cur}`} r={items[cur]} state={prev !== null ? "in" : "idle"} />
        </div>
      </div>

      {n > 1 && (
        <div className="rc-controls">
          <button type="button" onClick={() => go(cur - 1)} aria-label="previous">
            <Prev size={18} />
          </button>
          <div className="rc-dots">
            {items.map((_, i) => (
              <button key={i} type="button" className={i === cur ? "on" : ""} onClick={() => go(i)} aria-label={`review ${i + 1}`} />
            ))}
          </div>
          <button type="button" onClick={() => go(cur + 1)} aria-label="next">
            <Next size={18} />
          </button>
        </div>
      )}
      {n > 1 && (
        <div className="rc-progress" aria-hidden>
          <span key={`${cur}-${tick}`} className={paused ? "paused" : ""} style={{ animationDuration: `${AUTO_MS}ms` }} />
        </div>
      )}
    </div>
  );
}
