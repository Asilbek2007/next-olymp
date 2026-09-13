import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'shadow' | 'border' | 'flat' | 'gradient';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'border',
  hoverEffect = false,
  className,
  ...props
}) => {
  const base = "rounded-xl bg-white transition-all duration-200";

  const variants = {
    border: "border border-border shadow-xs",
    shadow: "border border-border/50 shadow-md hover:shadow-lg",
    flat: "bg-surface border border-transparent",
    gradient: "bg-gradient-to-br from-white to-surface border border-primary-100 shadow-sm",
  };

  const hover = hoverEffect ? "hover:-translate-y-1 hover:border-primary-300 hover:shadow-md cursor-pointer" : "";

  return (
    <div className={clsx(base, variants[variant], hover, className)} {...props}>
      {children}
    </div>
  );
};
