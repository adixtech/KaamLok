import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Logo({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="KaamLok home">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-500 shadow-soft transition-transform duration-300 group-hover:scale-105">
        <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
      </span>
      <span className={`font-display text-xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-ink-900'}`}>
        Kaam<span className="gradient-text">Lok</span>
      </span>
    </Link>
  );
}
