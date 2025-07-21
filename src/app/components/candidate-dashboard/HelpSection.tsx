"use client";

import React from 'react';

const HelpSection = () => {
    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Need Help?</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300/80 mb-3">
                        If you have questions, please contact us:
                    </p>
                    <div className="space-y-2 text-sm">
                        <p className="text-blue-700 dark:text-blue-300/80">
                            📧 Email:{' '}
                            <a href="mailto:wassim@internationalskills.fi" className="underline hover:text-blue-800 dark:hover:text-blue-200">
                                wassim@internationalskills.fi
                            </a>
                        </p>
                        <p className="text-blue-700 dark:text-blue-300/80">
                            📞 Phone:{' '}
                            <a href="tel:+358452644966" className="underline hover:text-blue-800 dark:hover:text-blue-200">
                                +358 452644966
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSection;
