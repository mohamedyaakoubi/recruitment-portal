"use client";

import React from 'react';
import { FiFileText, FiClipboard, FiImage, FiLink } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { InfoCard } from './InfoCard';

interface DocumentsAndLinksCardProps {
    candidate: Candidate;
}

const DocumentsAndLinksCard: React.FC<DocumentsAndLinksCardProps> = ({ candidate }) => {
    return (
        <InfoCard title="Documents & Links" icon={<FiFileText size={20} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <a href={candidate.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                    <FiFileText className="mr-2" /> View CV/Resume
                </a>
                <a href={candidate.passportUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                    <FiClipboard className="mr-2" /> View ID/Passport
                </a>
                {candidate.photoUrl && (
                    <a href={candidate.photoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                        <FiImage className="mr-2" /> View Photo
                    </a>
                )}
            </div>
            {candidate.websites && candidate.websites.length > 0 && (
                <div className="pt-3 space-y-2">
                    {candidate.websites.map((site, index) => (
                        <a key={index} href={site.startsWith('http') ? site : `https://${site}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline break-all">
                            <FiLink size={14} className="mr-2" /> {site}
                        </a>
                    ))}
                </div>
            )}
        </InfoCard>
    );
};

export default DocumentsAndLinksCard;
