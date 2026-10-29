import type { ReactNode } from "react";

interface ActionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}

export const ActionHeaderTA = ({
  eyebrow,
  title,
  description,
  action,
}: ActionHeaderProps) => (
  <div className="action-header">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
    {action}
  </div>
);
