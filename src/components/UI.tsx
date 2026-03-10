import React from 'react';
import { cn } from '../types';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  key?: React.Key;
}

export function GlassCard({ children, className, hover = false, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass rounded-2xl p-6 overflow-hidden",
        hover && "glass-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h2>
      {subtitle && <p className="text-white/50 text-sm uppercase tracking-widest font-medium">{subtitle}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = {
    default: "bg-white/10 text-white/70",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant])}>
      {children}
    </span>
  );
}
