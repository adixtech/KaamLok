import { Star, Quote } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';

type Testimonial = {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  category: 'Student' | 'NGO' | 'CSR Partner';
};

const testimonials: Testimonial[] = [
  {
    name: 'Rahul Verma',
    role: 'Student · Delhi',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'KaamLok made finding a free, genuine program effortless. Within a week I was enrolled in a verified IT course that actually led to a job.',
    category: 'Student',
  },
  {
    name: 'Anita Desai',
    role: 'Program Head · Pratham',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'We reach the right students now. KaamLok\'s verification and matching means our batches fill with candidates who genuinely fit the program.',
    category: 'NGO',
  },
  {
    name: 'Vikram Mehta',
    role: 'CSR Lead · Infosys Foundation',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'The transparency and placement tracking give us confidence our CSR funds create real, measurable career outcomes for India\'s youth.',
    category: 'CSR Partner',
  },
  {
    name: 'Fatima Sheikh',
    role: 'Student · Hyderabad',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'As a woman returning to work, I felt lost. KaamLok\'s career guidance and free digital program gave me skills and the confidence to restart.',
    category: 'Student',
  },
  {
    name: 'Rajesh Nair',
    role: 'Director · Smile Foundation',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'Our admissions process used to be chaotic. KaamLok brought structure, reach, and trust — we now train 3x more students per batch.',
    category: 'NGO',
  },
  {
    name: 'Sunita Kapoor',
    role: 'CSR Head · Tata Trusts',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'Finally a platform that connects CSR funding directly to verified, placement-focused training. The impact dashboards are outstanding.',
    category: 'CSR Partner',
  },
];

const catTone = {
  Student: 'bg-brand-50 text-brand-700 ring-brand-200',
  NGO: 'bg-teal-50 text-teal-700 ring-teal-200',
  'CSR Partner': 'bg-amber-50 text-amber-700 ring-amber-200',
};

export function Testimonials() {
  return (
    <section className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title={
            <>
              Loved by students, <span className="gradient-text">NGOs & CSR partners</span>
            </>
          }
          description="From first-time learners to funding partners — here's what the KaamLok community has to say."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 70}>
              <article className="group relative flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200">
                <Quote className="absolute right-5 top-5 h-8 w-8 text-ink-100 transition-colors group-hover:text-brand-100" />

                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-600 text-pretty">
                  "{t.quote}"
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-ink-100 pt-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    loading="lazy"
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-ink-100"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink-900">{t.name}</p>
                    <p className="text-xs text-ink-500">{t.role}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${catTone[t.category]}`}
                  >
                    {t.category}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
