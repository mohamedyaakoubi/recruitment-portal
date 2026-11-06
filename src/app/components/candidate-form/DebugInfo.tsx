'use client';

import React from 'react';

interface DebugInfoProps {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: string;
  city: string;
  country: string;
  nationality: string;
  selectedCategory: string;
  jobTitle: string;
  specialty: string;
  availableSpecialties: string[];
  cvFile: File | null;
  passportFile: File | null;
  photoFile: File | null;
  calculateAge: (dob: string) => number | null;
}

const DebugInfo: React.FC<DebugInfoProps> = ({
  firstName,
  lastName,
  email,
  gender,
  countryCode,
  phoneNumber,
  dateOfBirth,
  city,
  country,
  nationality,
  selectedCategory,
  jobTitle,
  specialty,
  availableSpecialties,
  cvFile,
  passportFile,
  photoFile,
  calculateAge,
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg bg-gray-100 p-4">
      <h3 className="mb-2 font-bold text-gray-800">Debug Information:</h3>
      <div className="space-y-1 text-xs text-gray-600">
        <p>
          First Name: "{firstName}" {firstName ? '✅' : '❌'}
        </p>
        <p>
          Last Name: "{lastName}" {lastName ? '✅' : '❌'}
        </p>
        <p>
          Email: "{email}" {email ? '✅' : '❌'}
        </p>
        <p>
          Gender: "{gender}" {gender ? '✅' : '❌'}
        </p>
        <p>
          Country Code: "{countryCode}" {countryCode ? '✅' : '❌'}
        </p>
        <p>
          Phone: "{phoneNumber}" {phoneNumber ? '✅' : '❌'}
        </p>
        <p>
          Date of Birth: "{dateOfBirth}" {dateOfBirth ? '✅' : '❌'}
        </p>
        <p>
          City: "{city}" {city ? '✅' : '❌'}
        </p>
        <p>
          Country: "{country}" {country ? '✅' : '❌'}
        </p>
        <p>
          Nationality: "{nationality}" {nationality ? '✅' : '❌'}
        </p>
        <p>
          Category: "{selectedCategory}" {selectedCategory ? '✅' : '❌'}
        </p>
        <p>
          Job Title: "{jobTitle}" {jobTitle ? '✅' : '❌'}
        </p>
        <p>
          Specialty: "{specialty}" {specialty ? '✅' : '❌'}
        </p>
        <p>Available Specialties: [{availableSpecialties.join(', ')}]</p>
        <p>Specialty Valid: {availableSpecialties.includes(specialty) ? '✅' : '❌'}</p>
        <p>CV File: {cvFile ? `${cvFile.name} ✅` : 'Missing ❌'}</p>
        <p>Passport File: {passportFile ? `${passportFile.name} ✅` : 'Missing ❌'}</p>
        <p>Photo File: {photoFile ? `${photoFile.name} ✅` : 'Not provided'}</p>
        <p>Age Valid: {dateOfBirth && (calculateAge(dateOfBirth) ?? 0) >= 18 ? '✅' : '❌'}</p>
        {dateOfBirth && <p>Calculated Age: {calculateAge(dateOfBirth)} years</p>}
      </div>
    </div>
  );
};

export default DebugInfo;
