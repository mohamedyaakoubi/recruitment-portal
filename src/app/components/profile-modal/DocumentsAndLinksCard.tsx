'use client';

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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href={candidate.cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <FiFileText className="mr-2" /> View CV/Resume
        </a>
        <a
          href={candidate.passportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <FiClipboard className="mr-2" /> View ID/Passport
        </a>
        {candidate.photoUrl && (
          <a
            href={candidate.photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <FiImage className="mr-2" /> View Photo
          </a>
        )}
      </div>
      {candidate.websites && candidate.websites.length > 0 && (
        <div className="space-y-2 pt-3">
          {candidate.websites.map((site, index) => (
            <a
              key={index}
              href={site.startsWith('http') ? site : `https://${site}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center break-all text-blue-600 hover:underline dark:text-blue-400"
            >
              <FiLink size={14} className="mr-2" /> {site}
            </a>
          ))}
        </div>
      )}
    </InfoCard>
  );
};

export default DocumentsAndLinksCard;
