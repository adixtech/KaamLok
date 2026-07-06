import { ArrowRight, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Reveal } from '../Reveal';
import { Logo } from '../Logo';

const footerLinks = {
  Company: ['About Us', 'Our Mission', 'Careers', 'Press', 'Blog'],
  Programs: ['IT & Software', 'Retail', 'Healthcare', 'Finance', 'Hospitality', 'Digital Skills'],
  NGOs: ['Partner With Us', 'Verification Process', 'NGO Dashboard', 'Resources'],
  Resources: ['Student Guide', 'Career Tips', 'Success Stories', 'Community', 'Help Center'],
  Support: ['Contact Us', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

const socials = [
  {
    name: 'Twitter',
    href: '#',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
    ),
  },
  {
    name: 'YouTube',
    href: '#',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
    ),
  },
];

export function FinalCTA() {
  return (
    <section id="contact" className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-600 via-brand-700 to-teal-600 px-6 py-16 text-center shadow-glow sm:px-12 lg:py-24">
          <div className="absolute inset-0 bg-dots opacity-10" />
          <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl animate-blob" />
          <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl animate-blob [animation-delay:4s]" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Your future is one click away
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl md:text-5xl md:leading-[1.1] text-balance">
              Ready to Build Your Future?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg text-pretty">
              Join 15,000+ students who discovered free, verified programs and started their career journeys with KaamLok.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/get-started">
                <Button variant="amber" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
                  Explore Programs
                </Button>
              </Link>
              <Link
                to="/register/student"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-7 py-3.5 text-base font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur transition-all hover:bg-white/20"
              >
                Create Free Account
              </Link>
            </div>
            <p className="mt-5 text-xs font-medium text-brand-200">
              No fees. No catch. Just free, verified career training.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-900 pt-16 pb-8">
      <div className="absolute inset-0 bg-dots opacity-5" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="grid gap-8 rounded-4xl bg-white/5 p-6 ring-1 ring-inset ring-white/10 backdrop-blur sm:p-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="text-2xl font-bold text-white text-balance">
              Get new programs in your inbox
            </h3>
            <p className="mt-2 text-sm text-ink-400 text-pretty">
              Join our newsletter for the latest free programs, deadlines, and career tips — no spam, ever.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <Button type="submit" size="md" iconRight={<ArrowRight className="h-4 w-4" />}>
              Subscribe
            </Button>
          </form>
        </div>

        {/* Links */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo dark />
            <p className="mt-4 text-sm leading-relaxed text-ink-400 text-pretty">
              India's Skill Development Discovery Platform. Connecting students with verified NGOs offering free, career-ready training.
            </p>
            <div className="mt-5 space-y-2 text-xs text-ink-400">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> hello@kaamlok.in
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> +91 98765 43210
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Bengaluru, India
              </p>
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-sm font-bold text-white">{heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-ink-400 transition-colors hover:text-brand-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} KaamLok. All rights reserved. Made with care in India.
          </p>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-ink-400 ring-1 ring-inset ring-white/10 transition-all hover:bg-brand-600 hover:text-white"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
