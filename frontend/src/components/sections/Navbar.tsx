import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../Logo';
import { Button } from '../ui/Button';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Programs', to: '/programs' },
  { label: 'NGOs', to: '/#ngos' },
  { label: 'Success Stories', to: '/success-stories' },
  { label: 'About', to: '/#about' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-ink-200/60 shadow-soft' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-brand-700"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/login"
            className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:text-brand-700"
          >
            Login
          </Link>
          <Link
            to="/get-started"
            className="rounded-2xl bg-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-200"
          >
            Register
          </Link>
          <Link to="/programs">
            <Button size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
              Explore Programs
            </Button>
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-ink-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass mx-3 mb-3 rounded-3xl border border-ink-200/60 p-4 shadow-card">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-200/60 pt-3">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-ink-100 px-4 py-3 text-center text-sm font-semibold text-ink-700"
            >
              Login
            </Link>
            <Link
              to="/get-started"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-ink-100 px-4 py-3 text-center text-sm font-semibold text-ink-700"
            >
              Register
            </Link>
          </div>
          <Link to="/programs" onClick={() => setOpen(false)}>
            <Button
              full
              className="mt-2"
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              Explore Programs
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
