import type { PropsWithChildren } from 'react';

export function SectionHeading({ children }: PropsWithChildren) {
  return (
    <h2 className="text-4xl md:text-5xl font-extrabold text-center text-foreground mb-4 tracking-tight">
      {children}
    </h2>
  );
}
