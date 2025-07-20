// src/app/components/ui/SocialIcon.tsx
import React from 'react';

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
    {children}
  </a>
);

export default SocialIcon;