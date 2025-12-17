import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  subtle?: boolean;
};

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  subtle,
}: SectionCardProps) {
  return (
    <section
      className={`card ${
        subtle ? "border-slate-100 bg-white/70 shadow-sm" : "border-slate-200 bg-white"
      } ${className ?? ""}`.trim()}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-brand-900">{title}</h2>
          {description ? <p className="text-sm text-neutral-700">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5 space-y-4 text-sm text-neutral-800">{children}</div>
    </section>
  );
}
