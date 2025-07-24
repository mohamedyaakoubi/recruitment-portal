"use client";

import React from 'react';
import Image from 'next/image';

// Helper component for social media icons in the footer
const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
    {children}
  </a>
);

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#003A70] text-white">
            <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <Image src="/logo-skills-white.png" alt="International Skills" width={180} height={45} className="mb-4" />
                        <p className="text-sm text-slate-300">
                            Connecting talented professionals with international opportunities.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">Contact</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-300">
                            <p className="flex items-center"><span className="mr-2 opacity-80">📧</span> wassim@internationalskills.fi</p>
                            <p className="flex items-center"><span className="mr-2 opacity-80">📞</span> +358 452644966</p>
                            <p className="flex items-center"><span className="mr-2 opacity-80">📞</span> +216 29 581 180</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">Suivez-nous</h3>
                        <div className="mt-4 flex space-x-5">
                            <SocialIcon href="https://www.linkedin.com/company/international-skills-labor-company/">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/></svg>
                            </SocialIcon>
                            <SocialIcon href="https://www.facebook.com/profile.php?id=61571369068485">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </SocialIcon>
                            <SocialIcon href="https://www.instagram.com/internationalskillscompany?igsh=MTI4enh4ODNzOGN5Mw%3D%3D">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" clipRule="evenodd" /><path d="M16.95 6.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z" /></svg>
                            </SocialIcon>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-700 pt-8 text-center">
                    <p className="text-sm text-slate-400">© 2025 Wassim Abbessi. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
