import { type ReactNode } from 'react';
import { Reveal } from '../Reveal';
import { Badge } from './Badge';

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  tone?: 'brand' | 'teal' | 'amber';
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'brand',
}: Props) {
  const isCenter = align === 'center';
  return (
    <Reveal className={isCenter ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <div className={isCenter ? 'flex justify-center' : ''}>
          <Badge tone={tone}>{eyebrow}</Badge>
        </div>
      )}
      <h2 className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl md:text-[2.75rem] md:leading-[1.1] text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg text-pretty">
          {description}
        </p>
      )}
    </Reveal>
  );
}
