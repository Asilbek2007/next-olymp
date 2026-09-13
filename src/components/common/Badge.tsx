import React from 'react';
import { clsx } from 'clsx';
import { Subject, OlympiadStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  status?: OlympiadStatus;
  subject?: Subject;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'neutral' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  subject,
  variant,
  size = 'md',
  className,
}) => {
  let computedClass = "bg-accent-100 text-accent-700 border-accent-200";
  let label = children;

  if (status) {
    if (status === 'active') {
      computedClass = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold animate-pulse";
      label = label || "Davom etmoqda";
    } else if (status === 'upcoming') {
      computedClass = "bg-amber-50 text-amber-700 border-amber-200";
      label = label || "Kutilmoqda";
    } else {
      computedClass = "bg-slate-100 text-slate-600 border-slate-200";
      label = label || "Yakunlangan";
    }
  } else if (subject) {
    const subjectMap: Record<Subject, { class: string; label: string }> = {
      math: { class: "bg-blue-50 text-blue-700 border-blue-200", label: "Matematika" },
      physics: { class: "bg-purple-50 text-purple-700 border-purple-200", label: "Fizika" },
      chemistry: { class: "bg-teal-50 text-teal-700 border-teal-200", label: "Kimyo" },
      biology: { class: "bg-green-50 text-green-700 border-green-200", label: "Biologiya" },
      informatics: { class: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Informatika" },
      other: { class: "bg-slate-50 text-slate-700 border-slate-200", label: "Boshqa" },
    };
    const info = subjectMap[subject];
    computedClass = info.class;
    label = label || info.label;
  } else if (variant) {
    const variantMap = {
      primary: "bg-primary-50 text-primary-700 border-primary-200",
      secondary: "bg-secondary-50 text-secondary-700 border-secondary-200",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      neutral: "bg-accent-100 text-accent-700 border-accent-200",
      danger: "bg-rose-50 text-rose-700 border-rose-200",
    };
    computedClass = variantMap[variant];
  }

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-medium rounded-full border tracking-wide uppercase",
        sizes[size],
        computedClass,
        className
      )}
    >
      {label}
    </span>
  );
};
