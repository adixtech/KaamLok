import { useState } from 'react';
import { Quote, ArrowLeft, ArrowRight, Briefcase, GraduationCap, TrendingUp, BadgeCheck } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';

type Story = {
  name: string;
  age: string;
  city: string;
  image: string;
  before: string;
  after: string;
  course: string;
  ngo: string;
  job: string;
  quote: string;
};

const stories: Story[] = [
  {
    name: 'Priya Sharma',
    age: '22',
    city: 'Jaipur, Rajasthan',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
    before: '12th pass, no direction',
    after: 'Junior Web Developer',
    course: 'Full-Stack Web Development',
    ngo: 'Pratham Education Foundation',
    job: 'TechMahindra · ₹4.2 LPA',
    quote:
      'I thought a career in tech was impossible without a BTech. KaamLok connected me to a free 6-month program, and today I write code for a living.',
  },
  {
    name: 'Arjun Kumar',
    age: '24',
    city: 'Patna, Bihar',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800',
    before: 'Graduate, working as daily wager',
    after: 'Retail Store Supervisor',
    course: 'Retail & Customer Service',
    ngo: 'Smile Foundation',
    job: 'Reliance Retail · ₹3.0 LPA',
    quote:
      'After graduation I had no job offers. The retail program taught me communication, POS systems, and confidence. I now manage a team of five.',
  },
  {
    name: 'Sneha Reddy',
    age: '21',
    city: 'Hyderabad, Telangana',
    image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=800',
    before: 'Diploma, career break',
    after: 'Digital Marketing Executive',
    course: 'Digital Marketing & SEO',
    ngo: 'Lakshya Foundation',
    job: 'GrowthFolks · ₹3.6 LPA',
    quote:
      'I took a break after my diploma and felt left behind. The free digital marketing program gave me a real career — I now run campaigns for clients.',
  },
  {
    name: 'Mohammed Irfan',
    age: '23',
    city: 'Bengaluru, Karnataka',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800',
    before: '10th pass, delivery rider',
    after: 'Hospitality Team Lead',
    course: 'Hospitality & Hotel Management',
    ngo: 'Anudip Foundation',
    job: 'Taj Hotels · ₹3.2 LPA',
    quote:
      'I was delivering food orders with no future plan. The hospitality program changed everything — I now lead a team at a 5-star hotel.',
  },
];

export function SuccessStories() {
  const [active, setActive] = useState(0);
  const next = () => setActive((a) => (a + 1) % stories.length);
  const prev = () => setActive((a) => (a - 1 + stories.length) % stories.length);
  const s = stories[active];

  return (
    <section id="stories" className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-50 to-brand-50/40" />
      <div className="absolute -left-20 top-24 -z-10 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl animate-blob" />
      <div className="absolute -right-20 bottom-24 -z-10 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl animate-blob [animation-delay:4s]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Success Stories"
          title={
            <>
              Real students. <span className="gradient-text">Real transformations.</span>
            </>
          }
          description="These are the journeys of students who started just like you — and built careers through free, verified programs."
        />

        <Reveal className="mt-14">
          <div className="relative mx-auto max-w-5xl">
            <div className="grid gap-6 rounded-4xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8 lg:grid-cols-[1fr_1.3fr] lg:gap-8">
              {/* Image */}
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[4/3] lg:aspect-[4/5]">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-full w-full object-cover transition-all duration-500"
                    key={s.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-lg font-bold text-white">{s.name}</p>
                    <p className="text-sm text-white/80">{s.age} yrs · {s.city}</p>
                  </div>
                </div>
                <span className="absolute -right-3 -top-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-500 text-white shadow-float">
                  <Quote className="h-6 w-6" />
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center">
                <div key={s.name} className="animate-fade-in">
                  <p className="text-lg font-medium leading-relaxed text-ink-700 sm:text-xl text-pretty">
                    "{s.quote}"
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-3 ring-1 ring-inset ring-rose-100">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose-600">
                        <TrendingUp className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">Before</p>
                        <p className="text-sm font-medium text-ink-700">{s.before}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-100">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Briefcase className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">After</p>
                        <p className="text-sm font-medium text-ink-900">{s.after} · {s.job}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3 ring-1 ring-inset ring-brand-100">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-600">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">Program</p>
                        <p className="text-sm font-medium text-ink-700">{s.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-teal-50 p-3 ring-1 ring-inset ring-teal-100">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-100 text-teal-600">
                        <BadgeCheck className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-600">Verified NGO</p>
                        <p className="text-sm font-medium text-ink-700">{s.ngo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={prev}
                aria-label="Previous story"
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-600 shadow-soft ring-1 ring-inset ring-ink-200 transition-all hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {stories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Go to story ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === active ? 'w-8 bg-brand-600' : 'w-2 bg-ink-200 hover:bg-ink-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="Next story"
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-600 shadow-soft ring-1 ring-inset ring-ink-200 transition-all hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-200"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
