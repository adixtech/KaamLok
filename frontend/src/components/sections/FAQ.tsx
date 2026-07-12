import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'Are the programs on KaamLok really free?',
    a: 'Yes. Every program listed on KaamLok is 100% free for students. They are funded through corporate CSR (Corporate Social Responsibility) initiatives and run by verified NGOs. You will never be asked to pay a fee to apply or enroll.',
  },
  {
    q: 'Who can apply for these programs?',
    a: 'KaamLok is built for a wide range of learners — 10th pass students, 12th pass students, graduates, diploma holders, freshers, job seekers, women returning to work, and rural & urban youth. Each program lists its specific eligibility, so you can filter by what fits you.',
  },
  {
    q: 'How does KaamLok verify NGOs?',
    a: 'We background-check every partner NGO — including their registration, past impact, funding sources, and placement records — before listing them. Only organizations that pass our verification process receive the "Verified NGO" badge.',
  },
  {
    q: 'Do these programs offer placement assistance?',
    a: 'Most programs include placement support such as mock interviews, resume building, and connections to hiring partners. Placement rates vary by program and are shown on each program page so you can make an informed choice.',
  },
  {
    q: 'Are the programs online, offline, or hybrid?',
    a: 'All three. You can filter programs by mode — online, offline, or hybrid — based on what works for your location and schedule. Many NGOs offer hybrid options so students in smaller towns can also participate.',
  },
  {
    q: 'I am an NGO. How do I partner with KaamLok?',
    a: 'Click "Partner as NGO" anywhere on the site to start the onboarding process. You will submit your organization details, complete our verification, and once approved, you can list your free programs and start receiving matched student applications.',
  },
  {
    q: 'Will I get a certificate after completing a program?',
    a: 'Yes. Verified programs issue a certificate of completion that you can showcase on your resume and LinkedIn. Many certificates are recognized by hiring partners across India.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Left: heading + contact */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title={
                <>
                  Questions? <span className="gradient-text">We have answers.</span>
                </>
              }
              description="Everything you need to know about KaamLok, our programs, and how the platform works."
            />
            <Reveal delay={200}>
              <div className="mt-8 rounded-3xl bg-gradient-to-br from-brand-50 to-teal-50 p-6 ring-1 ring-inset ring-brand-100">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-brand-600 shadow-soft">
                  <HelpCircle className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-ink-900">Still have questions?</h3>
                <p className="mt-1.5 text-sm text-ink-500">
                  Our team is here to help students and NGOs find the right fit.
                </p>
                //only changes in this page is add link around the button for opening the contact form
                <Link to="/contact">
                <Button variant="secondary" size="sm" className="mt-4">
                  Contact Support
                </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right: accordion */}
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={f.q} delay={i * 50}>
                  <div
                    className={`overflow-hidden rounded-2xl bg-white ring-1 ring-inset transition-all duration-300 ${
                      isOpen ? 'ring-brand-200 shadow-soft' : 'ring-ink-200/50 hover:ring-ink-300'
                    }`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-semibold text-ink-900">{f.q}</span>
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                          isOpen ? 'bg-brand-600 text-white rotate-0' : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500">{f.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
