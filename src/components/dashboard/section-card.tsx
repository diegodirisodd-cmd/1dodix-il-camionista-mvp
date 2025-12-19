import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  subtle?: boolean;
  id?: string;
};

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  subtle,
  id,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={`${subtle ? "card-muted" : "card"} ${className ?? ""}`.trim()}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description ? <p className="text-sm text-neutral-100/80">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5 space-y-4 text-sm text-neutral-100/80">{children}</div>
    </section>
  );
}
