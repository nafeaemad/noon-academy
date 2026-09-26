"use client";
import { useLanguage } from "./language-provider";
import { useEditableBilingual } from "./content-provider";

export function PageHero({
  contentKey,
  label,
  title,
  description,
}: {
  contentKey: string;
  label: { ar: string; en: string };
  title: { ar: string; en: string };
  description: { ar: string; en: string };
}) {
  const { locale } = useLanguage();
  const editedLabel = useEditableBilingual(`${contentKey}.label`, label.ar, label.en);
  const editedTitle = useEditableBilingual(`${contentKey}.title`, title.ar, title.en);
  const editedDescription = useEditableBilingual(`${contentKey}.description`, description.ar, description.en);
  return (
    <section className="page-hero">
      <div className="pattern" />
      <div className="container">
        <span className="section-label" style={{ justifyContent: "center" }}>
          {editedLabel[locale]}
        </span>
        <h1>{editedTitle[locale]}</h1>
        <p>{editedDescription[locale]}</p>
      </div>
    </section>
  );
}
