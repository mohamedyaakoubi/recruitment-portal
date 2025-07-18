"use client";

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from 'next/image';

import SuccessToast from './components/SuccessToast';

// Helper component for social media icons in the footer
const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
    {children}
  </a>
);

export default function CandidateForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [countryCode, setCountryCode] = useState('+358');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [nationality, setNationality] = useState(''); // ✅ New field
  const [nationalitySearch, setNationalitySearch] = useState(''); // ✅ New field
  const [doubleNationality, setDoubleNationality] = useState(''); // ✅ New field
  const [doubleNationalitySearch, setDoubleNationalitySearch] = useState(''); // ✅ New field
  const [jobTitle, setJobTitle] = useState('');
  const [websites, setWebsites] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState<{type: 'link' | 'file' | 'text', content: string, file?: File}[]>([{type: 'link', content: ''}]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // ✅ New field
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [showNationalityList, setShowNationalityList] = useState(false); // ✅ New field
  const [showDoubleNationalityList, setShowDoubleNationalityList] = useState(false); // ✅ New field
  const countryRef = useRef<HTMLDivElement>(null);
  const nationalityRef = useRef<HTMLDivElement>(null); // ✅ New field
  const doubleNationalityRef = useRef<HTMLDivElement>(null); // ✅ New field

  // ✅ Complete Country codes list with all countries
  const countryCodes = [
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫', iso: 'AF' },
    { code: '+355', country: 'Albania', flag: '🇦🇱', iso: 'AL' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿', iso: 'DZ' },
    { code: '+1684', country: 'American Samoa', flag: '🇦🇸', iso: 'AS' },
    { code: '+376', country: 'Andorra', flag: '🇦🇩', iso: 'AD' },
    { code: '+244', country: 'Angola', flag: '🇦🇴', iso: 'AO' },
    { code: '+1264', country: 'Anguilla', flag: '🇦🇮', iso: 'AI' },
    { code: '+672', country: 'Antarctica', flag: '🇦🇶', iso: 'AQ' },
    { code: '+1268', country: 'Antigua and Barbuda', flag: '🇦🇬', iso: 'AG' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷', iso: 'AR' },
    { code: '+374', country: 'Armenia', flag: '🇦🇲', iso: 'AM' },
    { code: '+297', country: 'Aruba', flag: '🇦🇼', iso: 'AW' },
    { code: '+61', country: 'Australia', flag: '🇦🇺', iso: 'AU' },
    { code: '+43', country: 'Austria', flag: '🇦🇹', iso: 'AT' },
    { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', iso: 'AZ' },
    { code: '+1242', country: 'Bahamas', flag: '🇧🇸', iso: 'BS' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
    { code: '+1246', country: 'Barbados', flag: '🇧🇧', iso: 'BB' },
    { code: '+375', country: 'Belarus', flag: '🇧🇾', iso: 'BY' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪', iso: 'BE' },
    { code: '+501', country: 'Belize', flag: '🇧🇿', iso: 'BZ' },
    { code: '+229', country: 'Benin', flag: '🇧🇯', iso: 'BJ' },
    { code: '+1441', country: 'Bermuda', flag: '🇧🇲', iso: 'BM' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹', iso: 'BT' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴', iso: 'BO' },
    { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦', iso: 'BA' },
    { code: '+267', country: 'Botswana', flag: '🇧🇼', iso: 'BW' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', iso: 'BR' },
    { code: '+246', country: 'British Indian Ocean Territory', flag: '🇮🇴', iso: 'IO' },
    { code: '+673', country: 'Brunei', flag: '🇧🇳', iso: 'BN' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬', iso: 'BG' },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫', iso: 'BF' },
    { code: '+257', country: 'Burundi', flag: '🇧🇮', iso: 'BI' },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭', iso: 'KH' },
    { code: '+237', country: 'Cameroon', flag: '🇨🇲', iso: 'CM' },
    { code: '+1', country: 'Canada', flag: '🇨🇦', iso: 'CA' },
    { code: '+238', country: 'Cape Verde', flag: '🇨🇻', iso: 'CV' },
    { code: '+1345', country: 'Cayman Islands', flag: '🇰🇾', iso: 'KY' },
    { code: '+236', country: 'Central African Republic', flag: '🇨🇫', iso: 'CF' },
    { code: '+235', country: 'Chad', flag: '🇹🇩', iso: 'TD' },
    { code: '+56', country: 'Chile', flag: '🇨🇱', iso: 'CL' },
    { code: '+86', country: 'China', flag: '🇨🇳', iso: 'CN' },
    { code: '+61', country: 'Christmas Island', flag: '🇨🇽', iso: 'CX' },
    { code: '+61', country: 'Cocos Islands', flag: '🇨🇨', iso: 'CC' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴', iso: 'CO' },
    { code: '+269', country: 'Comoros', flag: '🇰🇲', iso: 'KM' },
    { code: '+242', country: 'Congo', flag: '🇨🇬', iso: 'CG' },
    { code: '+243', country: 'Congo (DRC)', flag: '🇨🇩', iso: 'CD' },
    { code: '+682', country: 'Cook Islands', flag: '🇨🇰', iso: 'CK' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷', iso: 'CR' },
    { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮', iso: 'CI' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷', iso: 'HR' },
    { code: '+53', country: 'Cuba', flag: '🇨🇺', iso: 'CU' },
    { code: '+599', country: 'Curaçao', flag: '🇨🇼', iso: 'CW' },
    { code: '+357', country: 'Cyprus', flag: '🇨🇾', iso: 'CY' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿', iso: 'CZ' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰', iso: 'DK' },
    { code: '+253', country: 'Djibouti', flag: '🇩🇯', iso: 'DJ' },
    { code: '+1767', country: 'Dominica', flag: '🇩🇲', iso: 'DM' },
    { code: '+1849', country: 'Dominican Republic', flag: '🇩🇴', iso: 'DO' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨', iso: 'EC' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻', iso: 'SV' },
    { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶', iso: 'GQ' },
    { code: '+291', country: 'Eritrea', flag: '🇪🇷', iso: 'ER' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪', iso: 'EE' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹', iso: 'ET' },
    { code: '+500', country: 'Falkland Islands', flag: '🇫🇰', iso: 'FK' },
    { code: '+298', country: 'Faroe Islands', flag: '🇫🇴', iso: 'FO' },
    { code: '+679', country: 'Fiji', flag: '🇫🇯', iso: 'FJ' },
    { code: '+358', country: 'Finland', flag: '🇫🇮', iso: 'FI' },
    { code: '+33', country: 'France', flag: '🇫🇷', iso: 'FR' },
    { code: '+594', country: 'French Guiana', flag: '🇬🇫', iso: 'GF' },
    { code: '+689', country: 'French Polynesia', flag: '🇵🇫', iso: 'PF' },
    { code: '+241', country: 'Gabon', flag: '🇬🇦', iso: 'GA' },
    { code: '+220', country: 'Gambia', flag: '🇬🇲', iso: 'GM' },
    { code: '+995', country: 'Georgia', flag: '🇬🇪', iso: 'GE' },
    { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭', iso: 'GH' },
    { code: '+350', country: 'Gibraltar', flag: '🇬🇮', iso: 'GI' },
    { code: '+30', country: 'Greece', flag: '🇬🇷', iso: 'GR' },
    { code: '+299', country: 'Greenland', flag: '🇬🇱', iso: 'GL' },
    { code: '+1473', country: 'Grenada', flag: '🇬🇩', iso: 'GD' },
    { code: '+590', country: 'Guadeloupe', flag: '🇬🇵', iso: 'GP' },
    { code: '+1671', country: 'Guam', flag: '🇬🇺', iso: 'GU' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹', iso: 'GT' },
    { code: '+44', country: 'Guernsey', flag: '🇬🇬', iso: 'GG' },
    { code: '+224', country: 'Guinea', flag: '🇬🇳', iso: 'GN' },
    { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼', iso: 'GW' },
    { code: '+592', country: 'Guyana', flag: '🇬🇾', iso: 'GY' },
    { code: '+509', country: 'Haiti', flag: '🇭🇹', iso: 'HT' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳', iso: 'HN' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰', iso: 'HK' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺', iso: 'HU' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸', iso: 'IS' },
    { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
    { code: '+98', country: 'Iran', flag: '🇮🇷', iso: 'IR' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶', iso: 'IQ' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE' },
    { code: '+44', country: 'Isle of Man', flag: '🇮🇲', iso: 'IM' },
    { code: '+972', country: 'Israel', flag: '🇮🇱', iso: 'IL' },
    { code: '+39', country: 'Italy', flag: '🇮🇹', iso: 'IT' },
    { code: '+1876', country: 'Jamaica', flag: '🇯🇲', iso: 'JM' },
    { code: '+81', country: 'Japan', flag: '🇯🇵', iso: 'JP' },
    { code: '+44', country: 'Jersey', flag: '🇯🇪', iso: 'JE' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴', iso: 'JO' },
    { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', iso: 'KZ' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪', iso: 'KE' },
    { code: '+686', country: 'Kiribati', flag: '🇰🇮', iso: 'KI' },
    { code: '+383', country: 'Kosovo', flag: '🇽🇰', iso: 'XK' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW' },
    { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬', iso: 'KG' },
    { code: '+856', country: 'Laos', flag: '🇱🇦', iso: 'LA' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻', iso: 'LV' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧', iso: 'LB' },
    { code: '+266', country: 'Lesotho', flag: '🇱🇸', iso: 'LS' },
    { code: '+231', country: 'Liberia', flag: '🇱🇷', iso: 'LR' },
    { code: '+218', country: 'Libya', flag: '🇱🇾', iso: 'LY' },
    { code: '+423', country: 'Liechtenstein', flag: '🇱🇮', iso: 'LI' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹', iso: 'LT' },
    { code: '+352', country: 'Luxembourg', flag: '🇱🇺', iso: 'LU' },
    { code: '+853', country: 'Macau', flag: '🇲🇴', iso: 'MO' },
    { code: '+389', country: 'Macedonia', flag: '🇲🇰', iso: 'MK' },
    { code: '+261', country: 'Madagascar', flag: '🇲🇬', iso: 'MG' },
    { code: '+265', country: 'Malawi', flag: '🇲🇼', iso: 'MW' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
    { code: '+960', country: 'Maldives', flag: '🇲🇻', iso: 'MV' },
    { code: '+223', country: 'Mali', flag: '🇲🇱', iso: 'ML' },
    { code: '+356', country: 'Malta', flag: '🇲🇹', iso: 'MT' },
    { code: '+692', country: 'Marshall Islands', flag: '🇲🇭', iso: 'MH' },
    { code: '+596', country: 'Martinique', flag: '🇲🇶', iso: 'MQ' },
    { code: '+222', country: 'Mauritania', flag: '🇲🇷', iso: 'MR' },
    { code: '+230', country: 'Mauritius', flag: '🇲🇺', iso: 'MU' },
    { code: '+262', country: 'Mayotte', flag: '🇾🇹', iso: 'YT' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽', iso: 'MX' },
    { code: '+691', country: 'Micronesia', flag: '🇫🇲', iso: 'FM' },
    { code: '+373', country: 'Moldova', flag: '🇲🇩', iso: 'MD' },
    { code: '+377', country: 'Monaco', flag: '🇲🇨', iso: 'MC' },
    { code: '+976', country: 'Mongolia', flag: '🇲🇳', iso: 'MN' },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪', iso: 'ME' },
    { code: '+1664', country: 'Montserrat', flag: '🇲🇸', iso: 'MS' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦', iso: 'MA' },
    { code: '+258', country: 'Mozambique', flag: '🇲🇿', iso: 'MZ' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲', iso: 'MM' },
    { code: '+264', country: 'Namibia', flag: '🇳🇦', iso: 'NA' },
    { code: '+674', country: 'Nauru', flag: '🇳🇷', iso: 'NR' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵', iso: 'NP' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
    { code: '+687', country: 'New Caledonia', flag: '🇳🇨', iso: 'NC' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿', iso: 'NZ' },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮', iso: 'NI' },
    { code: '+227', country: 'Niger', flag: '🇳🇪', iso: 'NE' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
    { code: '+683', country: 'Niue', flag: '🇳🇺', iso: 'NU' },
    { code: '+672', country: 'Norfolk Island', flag: '🇳🇫', iso: 'NF' },
    { code: '+850', country: 'North Korea', flag: '🇰🇵', iso: 'KP' },
    { code: '+1670', country: 'Northern Mariana Islands', flag: '🇲🇵', iso: 'MP' },
    { code: '+47', country: 'Norway', flag: '🇳🇴', iso: 'NO' },
    { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK' },
    { code: '+680', country: 'Palau', flag: '🇵🇼', iso: 'PW' },
    { code: '+970', country: 'Palestine', flag: '🇵🇸', iso: 'PS' },
    { code: '+507', country: 'Panama', flag: '🇵🇦', iso: 'PA' },
    { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬', iso: 'PG' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾', iso: 'PY' },
    { code: '+51', country: 'Peru', flag: '🇵🇪', iso: 'PE' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭', iso: 'PH' },
    { code: '+48', country: 'Poland', flag: '🇵🇱', iso: 'PL' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹', iso: 'PT' },
    { code: '+1787', country: 'Puerto Rico', flag: '🇵🇷', iso: 'PR' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA' },
    { code: '+262', country: 'Réunion', flag: '🇷🇪', iso: 'RE' },
    { code: '+40', country: 'Romania', flag: '🇷🇴', iso: 'RO' },
    { code: '+7', country: 'Russia', flag: '🇷🇺', iso: 'RU' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼', iso: 'RW' },
    { code: '+590', country: 'Saint Barthélemy', flag: '🇧🇱', iso: 'BL' },
    { code: '+290', country: 'Saint Helena', flag: '🇸🇭', iso: 'SH' },
    { code: '+1869', country: 'Saint Kitts and Nevis', flag: '🇰🇳', iso: 'KN' },
    { code: '+1758', country: 'Saint Lucia', flag: '🇱🇨', iso: 'LC' },
    { code: '+590', country: 'Saint Martin', flag: '🇲🇫', iso: 'MF' },
    { code: '+508', country: 'Saint Pierre and Miquelon', flag: '🇵🇲', iso: 'PM' },
    { code: '+1784', country: 'Saint Vincent and the Grenadines', flag: '🇻🇨', iso: 'VC' },
    { code: '+685', country: 'Samoa', flag: '🇼🇸', iso: 'WS' },
    { code: '+378', country: 'San Marino', flag: '🇸🇲', iso: 'SM' },
    { code: '+239', country: 'São Tomé and Príncipe', flag: '🇸🇹', iso: 'ST' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
    { code: '+221', country: 'Senegal', flag: '🇸🇳', iso: 'SN' },
    { code: '+381', country: 'Serbia', flag: '🇷🇸', iso: 'RS' },
    { code: '+248', country: 'Seychelles', flag: '🇸🇨', iso: 'SC' },
    { code: '+232', country: 'Sierra Leone', flag: '🇸🇱', iso: 'SL' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', iso: 'SG' },
    { code: '+1721', country: 'Sint Maarten', flag: '🇸🇽', iso: 'SX' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰', iso: 'SK' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮', iso: 'SI' },
    { code: '+677', country: 'Solomon Islands', flag: '🇸🇧', iso: 'SB' },
    { code: '+252', country: 'Somalia', flag: '🇸🇴', iso: 'SO' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', iso: 'ZA' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', iso: 'KR' },
    { code: '+211', country: 'South Sudan', flag: '🇸🇸', iso: 'SS' },
    { code: '+34', country: 'Spain', flag: '🇪🇸', iso: 'ES' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
    { code: '+249', country: 'Sudan', flag: '🇸🇩', iso: 'SD' },
    { code: '+597', country: 'Suriname', flag: '🇸🇷', iso: 'SR' },
    { code: '+47', country: 'Svalbard and Jan Mayen', flag: '🇸🇯', iso: 'SJ' },
    { code: '+268', country: 'Swaziland', flag: '🇸🇿', iso: 'SZ' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪', iso: 'SE' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭', iso: 'CH' },
    { code: '+963', country: 'Syria', flag: '🇸🇾', iso: 'SY' },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼', iso: 'TW' },
    { code: '+992', country: 'Tajikistan', flag: '🇹🇯', iso: 'TJ' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿', iso: 'TZ' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', iso: 'TH' },
    { code: '+670', country: 'Timor-Leste', flag: '🇹🇱', iso: 'TL' },
    { code: '+228', country: 'Togo', flag: '🇹🇬', iso: 'TG' },
    { code: '+690', country: 'Tokelau', flag: '🇹🇰', iso: 'TK' },
    { code: '+676', country: 'Tonga', flag: '🇹🇴', iso: 'TO' },
    { code: '+1868', country: 'Trinidad and Tobago', flag: '🇹🇹', iso: 'TT' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳', iso: 'TN' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷', iso: 'TR' },
    { code: '+993', country: 'Turkmenistan', flag: '🇹🇲', iso: 'TM' },
    { code: '+1649', country: 'Turks and Caicos Islands', flag: '🇹🇨', iso: 'TC' },
    { code: '+688', country: 'Tuvalu', flag: '🇹🇻', iso: 'TV' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬', iso: 'UG' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦', iso: 'UA' },
    { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
    { code: '+1', country: 'United States', flag: '🇺🇸', iso: 'US' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾', iso: 'UY' },
    { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', iso: 'UZ' },
    { code: '+678', country: 'Vanuatu', flag: '🇻🇺', iso: 'VU' },
    { code: '+379', country: 'Vatican City', flag: '🇻🇦', iso: 'VA' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪', iso: 'VE' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', iso: 'VN' },
    { code: '+1284', country: 'British Virgin Islands', flag: '🇻🇬', iso: 'VG' },
    { code: '+1340', country: 'U.S. Virgin Islands', flag: '🇻🇮', iso: 'VI' },
    { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫', iso: 'WF' },
    { code: '+212', country: 'Western Sahara', flag: '🇪🇭', iso: 'EH' },
    { code: '+967', country: 'Yemen', flag: '🇾🇪', iso: 'YE' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲', iso: 'ZM' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', iso: 'ZW' }
  ];

  // ✅ Complete Countries and Nationalities list for all purposes
  const countries = [
    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Antiguans', 'Argentinean', 'Armenian', 'Australian',
    'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Barbudans', 'Batswana', 'Belarusian', 'Belgian',
    'Belizean', 'Beninese', 'Bhutanese', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Burkinabe',
    'Burmese', 'Burundian', 'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese',
    'Colombian', 'Comoran', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djibouti',
    'Dominican', 'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian', 'Emirian', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian',
    'Fijian', 'Filipino', 'Finnish', 'French', 'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek',
    'Grenadian', 'Guatemalan', 'Guinea-Bissauan', 'Guinean', 'Guyanese', 'Haitian', 'Herzegovinian', 'Honduran', 'Hungarian', 'I-Kiribati',
    'Icelandic', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian', 'Jamaican',
    'Japanese', 'Jordanian', 'Kazakhstani', 'Kenyan', 'Kittian and Nevisian', 'Kuwaiti', 'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese',
    'Liberian', 'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourger', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivan',
    'Malian', 'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan', 'Monacan', 'Mongolian',
    'Moroccan', 'Mosotho', 'Motswana', 'Mozambican', 'Namibian', 'Nauruan', 'Nepalese', 'New Zealander', 'Ni-Vanuatu', 'Nicaraguan',
    'Nigerian', 'Nigerien', 'North Korean', 'Northern Irish', 'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Palestinian', 'Panamanian',
    'Papua New Guinean', 'Paraguayan', 'Peruvian', 'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saint Lucian',
    'Salvadoran', 'Samoan', 'San Marinese', 'Sao Tomean', 'Saudi', 'Scottish', 'Senegalese', 'Serbian', 'Seychellois', 'Sierra Leonean',
    'Singaporean', 'Slovakian', 'Slovenian', 'Solomon Islander', 'Somali', 'South African', 'South Korean', 'Spanish', 'Sri Lankan', 'Sudanese',
    'Surinamer', 'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian', 'Thai', 'Togolese',
    'Tongan', 'Trinidadian or Tobagonian', 'Tunisian', 'Turkish', 'Tuvaluan', 'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Venezuelan',
    'Vietnamese', 'Welsh', 'Yemenite', 'Zambian', 'Zimbabwean'
  ];

  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ✅ Filtered lists for nationality fields
  const filteredNationalities = countries.filter(c => 
    c.toLowerCase().includes(nationalitySearch.toLowerCase())
  );

  const filteredDoubleNationalities = countries.filter(c => 
    c.toLowerCase().includes(doubleNationalitySearch.toLowerCase())
  );

  const addAdditionalInfo = (type: 'link' | 'file' | 'text') => {
    setAdditionalInfo([...additionalInfo, {type, content: ''}]);
  };

  const removeAdditionalInfo = (index: number) => {
    if (additionalInfo.length > 1) {
      setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
    }
  };

  const updateAdditionalInfo = (index: number, content: string, file?: File) => {
    const newInfo = [...additionalInfo];
    newInfo[index] = {...newInfo[index], content, file};
    setAdditionalInfo(newInfo);
  };

  const addWebsite = () => {
    setWebsites([...websites, '']);
  };

  const removeWebsite = (index: number) => {
    if (websites.length > 1) {
      setWebsites(websites.filter((_, i) => i !== index));
    }
  };

  const updateWebsite = (index: number, value: string) => {
    const newWebsites = [...websites];
    newWebsites[index] = value;
    setWebsites(newWebsites);
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        if (response.ok) {
          setJobs(data.jobs || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = jobs.filter(job => job.category === selectedCategory);
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs([]);
    }
    setJobTitle('');
    setSelectedJob(null);
  }, [selectedCategory, jobs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryList(false);
      }
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setShowNationalityList(false);
      }
      if (doubleNationalityRef.current && !doubleNationalityRef.current.contains(event.target as Node)) {
        setShowDoubleNationalityList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategorySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleJobSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedJobId = e.target.value;
    setJobTitle(selectedJobId);
    const job = filteredJobs.find(j => j.id === selectedJobId);
    setSelectedJob(job || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'cv') {
        setCvFile(files[0]);
      } else if (name === 'passport') {
        setPassportFile(files[0]);
      } else if (name === 'photo') { // ✅ New field
        setPhotoFile(files[0]);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // ✅ Updated validation - removed photoFile from required fields
    if (!firstName || !lastName || !email || !gender || !countryCode || !phoneNumber || !dateOfBirth || !city || !country || !nationality || !selectedCategory || !jobTitle || !cvFile || !passportFile) {
      setError("Please fill in all required fields and upload all required files (CV and Passport/ID).");
      return;
    }

    setIsLoading(true);

    try {
      const cvFileName = `cv_${Date.now()}_${cvFile.name}`;
      const passportFileName = `passport_${Date.now()}_${passportFile.name}`;
      
      const cvStorageRef = ref(storage, `candidate_files/${cvFileName}`);
      const passportStorageRef = ref(storage, `candidate_files/${passportFileName}`);

      const cvUploadTask = await uploadBytes(cvStorageRef, cvFile);
      const passportUploadTask = await uploadBytes(passportStorageRef, passportFile);

      const cvUrl = await getDownloadURL(cvUploadTask.ref);
      const passportUrl = await getDownloadURL(passportUploadTask.ref);
      
      // ✅ Handle optional photo upload
      let photoUrl = null;
      if (photoFile) {
        const photoFileName = `photo_${Date.now()}_${photoFile.name}`;
        const photoStorageRef = ref(storage, `candidate_files/${photoFileName}`);
        const photoUploadTask = await uploadBytes(photoStorageRef, photoFile);
        photoUrl = await getDownloadURL(photoUploadTask.ref);
      }

      const candidatesCollectionRef = collection(db, "candidates");
      await addDoc(candidatesCollectionRef, {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        gender,
        countryCode,
        phoneNumber: `${countryCode} ${phoneNumber}`,
        dateOfBirth,
        city,
        country,
        nationality,
        doubleNationality: doubleNationality || null,
        jobCategory: selectedCategory,
        jobTitle,
        jobTitleText: selectedJob?.title || '',
        websites: websites.filter(w => w.trim() !== ''),
        cvUrl,
        passportUrl,
        photoUrl, // ✅ This will be null if no photo was uploaded
        submittedAt: serverTimestamp(),
        status: 'submitted',
        score: null
      });

      // ✅ Reset all form fields including photo
      setFirstName('');
      setLastName('');
      setEmail('');
      setGender('');
      setCountryCode('+358');
      setPhoneNumber('');
      setDateOfBirth('');
      setCity('');
      setCountry('');
      setCountrySearch('');
      setNationality('');
      setNationalitySearch('');
      setDoubleNationality('');
      setDoubleNationalitySearch('');
      setSelectedCategory('');
      setJobTitle('');
      setSelectedJob(null);
      setWebsites(['']);
      setCvFile(null);
      setPassportFile(null);
      setPhotoFile(null);
      
      const cvInput = document.getElementById('cv') as HTMLInputElement;
      const passportInput = document.getElementById('passport') as HTMLInputElement;
      const photoInput = document.getElementById('photo') as HTMLInputElement;
      if (cvInput) cvInput.value = '';
      if (passportInput) passportInput.value = '';
      if (photoInput) photoInput.value = '';

      setSuccess("Application submitted successfully!");
      setShowSuccessToast(true);

    } catch (err) {
      console.error("Error submitting application:", err);
      if (err instanceof Error) {
          setError(`Submission failed: ${err.message || 'Unknown error'}`);
      } else {
          setError('Submission failed: An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header remains the same */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="bg-[#003A70] text-white text-xs py-1.5">
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex justify-center md:justify-between items-center">
                  <div className="flex items-center">
                      <span className="text-yellow-400 mr-2 text-base">⚠️</span>
                      <span>Découvrez les dernières opportunités!</span>
                  </div>
                  <div className="hidden md:flex items-center space-x-6">
                      <a href="tel:+358452644966" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          <span>+358 452644966</span>
                      </a>
                      <a href="mailto:wassim@internationalskills.fi" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span>wassim@internationalskills.fi</span>
                      </a>
                  </div>
              </div>
          </div>
          <nav className="max-w-screen-xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between py-4">
                  <Image
                      src="/logo-skills.png"
                      alt="International Skills Labor Company"
                      width={180}
                      height={45}
                      priority
                  />
              </div>
          </nav>
      </header>
      
      {/* Main Content */}
      <main id="form-start" className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-4xl p-6 sm:p-10 space-y-8 bg-white rounded-xl shadow-2xl shadow-slate-200">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003A70] mb-2">Candidate Application</h1>
            <p className="text-slate-500">Apply for your dream job opportunity</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-slate-50 p-5 sm:p-6 rounded-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-slate-600 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="Enter your first name"
                    disabled={isLoading}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-slate-600 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="Enter your last name"
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-600 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-slate-600 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    disabled={isLoading}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-600 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-3 border border-slate-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] bg-slate-100"
                      disabled={isLoading}
                    >
                      {countryCodes.map((item, index) => (
                        <option key={index} value={item.code}>
                          {item.country} ({item.code})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 w-full px-4 py-3 border-l-0 border border-slate-300 rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                      placeholder="123 456 789"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-600 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    disabled={isLoading}
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-slate-600 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="Enter your city"
                    disabled={isLoading}
                  />
                </div>

                {/* Country */}
                <div className="relative" ref={countryRef}>
                  <label htmlFor="country" className="block text-sm font-semibold text-slate-600 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="countrySearch"
                    id="countrySearch"
                    value={countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setCountry(""); // Clear selection when typing
                      setShowCountryList(true);
                    }}
                    onFocus={() => setShowCountryList(true)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="Search and select your country"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  {showCountryList && filteredCountries.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCountries.map((countryOption, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setCountry(countryOption);
                            setCountrySearch(countryOption);
                            setShowCountryList(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                        >
                          {countryOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ✅ Nationality (Required) */}
                <div className="relative" ref={nationalityRef}>
                  <label htmlFor="nationality" className="block text-sm font-semibold text-slate-600 mb-2">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nationalitySearch"
                    id="nationalitySearch"
                    required
                    value={nationalitySearch}
                    onChange={(e) => {
                      setNationalitySearch(e.target.value);
                      setNationality(""); // Clear selection when typing
                      setShowNationalityList(true);
                    }}
                    onFocus={() => setShowNationalityList(true)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="Search and select your nationality"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  {showNationalityList && filteredNationalities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredNationalities.map((nationalityOption, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setNationality(nationalityOption);
                            setNationalitySearch(nationalityOption);
                            setShowNationalityList(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                        >
                          {nationalityOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ✅ Double Nationality (Optional) */}
                <div className="relative" ref={doubleNationalityRef}>
                  <label htmlFor="doubleNationality" className="block text-sm font-semibold text-slate-600 mb-2">
                    Second Nationality <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="doubleNationalitySearch"
                    id="doubleNationalitySearch"
                    value={doubleNationalitySearch}
                    onChange={(e) => {
                      setDoubleNationalitySearch(e.target.value);
                      setDoubleNationality(""); // Clear selection when typing
                      setShowDoubleNationalityList(true);
                    }}
                    onFocus={() => setShowDoubleNationalityList(true)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="Search and select second nationality (if any)"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  {showDoubleNationalityList && filteredDoubleNationalities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredDoubleNationalities.map((doubleNationalityOption, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setDoubleNationality(doubleNationalityOption);
                            setDoubleNationalitySearch(doubleNationalityOption);
                            setShowDoubleNationalityList(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                        >
                          {doubleNationalityOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Job Category */}
                <div className="sm:col-span-2">
                  <label htmlFor="jobCategory" className="block text-sm font-semibold text-slate-600 mb-2">
                    Job Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobCategory"
                    id="jobCategory"
                    required
                    value={selectedCategory}
                    onChange={handleCategorySelection}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    disabled={isLoading}
                  >
                    <option value="">Select a category first</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Title */}
                <div className="sm:col-span-2">
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-slate-600 mb-2">
                    Job Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobTitle"
                    id="jobTitle"
                    required
                    value={jobTitle}
                    onChange={handleJobSelection}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    disabled={isLoading || !selectedCategory}
                  >
                    <option value="">
                      {selectedCategory ? 'Select a job position' : 'Please select a category first'}
                    </option>
                    {filteredJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                  {selectedJob && (
                    <div className="mt-3 p-3 bg-slate-100 border border-slate-200 rounded-lg">
                      <h4 className="font-semibold text-[#003A70] mb-1">Job Description:</h4>
                      <p className="text-sm text-slate-700">{selectedJob.description}</p>
                      <p className="text-xs text-slate-500 mt-1">Category: {selectedJob.category}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section - keep existing */}
            <div className="bg-slate-50 p-5 sm:p-6 rounded-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">Additional Information</h2>
              <div className="space-y-4">
                {additionalInfo.map((info, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={info.type}
                      onChange={(e) => {
                        const newInfo = [...additionalInfo];
                        newInfo[index] = {...newInfo[index], type: e.target.value as 'link' | 'file' | 'text', content: '', file: undefined};
                        setAdditionalInfo(newInfo);
                      }}
                      className="px-3 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] bg-white min-w-[100px]"
                      disabled={isLoading}
                    >
                      <option value="link">Link</option>
                      <option value="file">File</option>
                      <option value="text">Text</option>
                    </select>
                    
                    <div className="flex-1 w-full">
                      {info.type === 'link' && (
                        <input type="url" value={info.content} onChange={(e) => updateAdditionalInfo(index, e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                          placeholder="https://linkedin.com/in/yourprofile" disabled={isLoading} />
                      )}
                      {info.type === 'file' && (
                        <input type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) { updateAdditionalInfo(index, file.name, file); } }}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-[#003A70] hover:file:bg-slate-200"
                          disabled={isLoading} />
                      )}
                      {info.type === 'text' && (
                        <textarea value={info.content} onChange={(e) => updateAdditionalInfo(index, e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                          placeholder="Enter additional notes..." rows={2} disabled={isLoading} />
                      )}
                    </div>
                    
                    {additionalInfo.length > 1 && (
                      <button type="button" onClick={() => removeAdditionalInfo(index)}
                        className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 self-center sm:self-auto"
                        disabled={isLoading}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="button" onClick={() => addAdditionalInfo('link')} disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-sky-100 text-sky-800 rounded-lg hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span>Add Link</span>
                  </button>
                  <button type="button" onClick={() => addAdditionalInfo('file')} disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    <span>Add File</span>
                  </button>
                  <button type="button" onClick={() => addAdditionalInfo('text')} disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-violet-100 text-violet-800 rounded-lg hover:bg-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    <span>Add Text</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* ✅ Updated File Upload Section */}
            <div className="bg-slate-50 p-5 sm:p-6 rounded-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">Required Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="cv" className="block text-sm font-semibold text-slate-600 mb-2">
                    Upload CV <span className="text-red-500">*</span>
                  </label>
                  <input type="file" name="cv" id="cv" required accept=".pdf,.doc,.docx" onChange={handleFileChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-[#003A70] hover:file:bg-slate-200"
                    disabled={isLoading} />
                  <p className="mt-1 text-xs text-slate-500">PDF, DOC, DOCX only.</p>
                </div>
                <div>
                  <label htmlFor="passport" className="block text-sm font-semibold text-slate-600 mb-2">
                    Upload Passport/ID <span className="text-red-500">*</span>
                  </label>
                  <input type="file" name="passport" id="passport" required accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-[#003A70] hover:file:bg-slate-200"
                    disabled={isLoading} />
                  <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG only.</p>
                </div>
                {/* ✅ Updated Photo Upload Field - Now Optional */}
                <div>
                  <label htmlFor="photo" className="block text-sm font-semibold text-slate-600 mb-2">
                    Upload Photo <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input type="file" name="photo" id="photo" accept=".jpg,.jpeg,.png" onChange={handleFileChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-[#003A70] hover:file:bg-slate-200"
                    disabled={isLoading} />
                  <p className="mt-1 text-xs text-slate-500">JPG, PNG only. Professional photo preferred.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="text-center pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-4 bg-[#003A70] text-white font-bold tracking-wide rounded-lg shadow-lg hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003A70] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <SuccessToast
        message={success || ''}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Footer remains the same */}
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
    </div>
  );
}