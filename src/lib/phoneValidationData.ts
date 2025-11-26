

export const phonePatterns: Record<string, RegExp> = {
  // North America
  '+1': /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US/Canada
  '+1242': /^\+1242[3-9]\d{6}$/, // Bahamas
  '+1246': /^\+1246[2-4]\d{6}$/, // Barbados
  '+1264': /^\+1264[4-5]\d{6}$/, // Anguilla
  '+1268': /^\+1268[4-7]\d{6}$/, // Antigua and Barbuda
  '+1284': /^\+1284[3-4]\d{6}$/, // British Virgin Islands
  '+1340': /^\+1340[3-7]\d{6}$/, // U.S. Virgin Islands
  '+1345': /^\+1345[3-9]\d{6}$/, // Cayman Islands
  '+1441': /^\+1441[2-9]\d{6}$/, // Bermuda
  '+1473': /^\+1473[4-4]\d{6}$/, // Grenada
  '+1649': /^\+1649[2-4]\d{6}$/, // Turks and Caicos
  '+1664': /^\+1664[4-4]\d{6}$/, // Montserrat
  '+1670': /^\+1670[2-9]\d{6}$/, // Northern Mariana Islands
  '+1671': /^\+1671[4-6]\d{6}$/, // Guam
  '+1684': /^\+1684[2-7]\d{6}$/, // American Samoa
  '+1721': /^\+1721[5-5]\d{6}$/, // Sint Maarten
  '+1758': /^\+1758[4-4]\d{6}$/, // Saint Lucia
  '+1767': /^\+1767[2-6]\d{6}$/, // Dominica
  '+1784': /^\+1784[4-4]\d{6}$/, // Saint Vincent and the Grenadines
  '+1787': /^\+1787[2-9]\d{6}$/, // Puerto Rico
  '+1809': /^\+1809[2-9]\d{6}$/, // Dominican Republic
  '+1829': /^\+1829[2-9]\d{6}$/, // Dominican Republic
  '+1849': /^\+1849[2-9]\d{6}$/, // Dominican Republic
  '+1868': /^\+1868[2-9]\d{6}$/, // Trinidad and Tobago
  '+1869': /^\+1869[4-7]\d{6}$/, // Saint Kitts and Nevis
  '+1876': /^\+1876[2-9]\d{6}$/, // Jamaica

  // Europe
  '+33': /^\+33[1-9]\d{8}$/, // France
  '+44': /^\+44[1-9]\d{8,9}$/, // United Kingdom
  '+49': /^\+49[1-9]\d{6,11}$/, // Germany
  '+39': /^\+39[3]\d{8,9}$/, // Italy
  '+34': /^\+34[6-9]\d{8}$/, // Spain
  '+31': /^\+31[6]\d{8}$/, // Netherlands
  '+32': /^\+32[4-9]\d{7,8}$/, // Belgium
  '+41': /^\+41[7]\d{8}$/, // Switzerland
  '+43': /^\+43[6-9]\d{7,10}$/, // Austria
  '+45': /^\+45[2-9]\d{7}$/, // Denmark
  '+46': /^\+46[7]\d{8}$/, // Sweden
  '+47': /^\+47[4-9]\d{7}$/, // Norway
  '+358': /^\+358[1-9]\d{6,8}$/, // Finland
  '+351': /^\+351[9]\d{8}$/, // Portugal
  '+30': /^\+30[6]\d{9}$/, // Greece
  '+48': /^\+48[5-9]\d{8}$/, // Poland
  '+420': /^\+420[6-7]\d{8}$/, // Czech Republic
  '+421': /^\+421[9]\d{8}$/, // Slovakia
  '+36': /^\+36[2-7]\d{7,8}$/, // Hungary
  '+40': /^\+40[7]\d{8}$/, // Romania
  '+359': /^\+359[8-9]\d{7,8}$/, // Bulgaria
  '+385': /^\+385[9]\d{7,8}$/, // Croatia
  '+386': /^\+386[5-6]\d{7}$/, // Slovenia
  '+381': /^\+381[6]\d{7,8}$/, // Serbia
  '+382': /^\+382[6]\d{7}$/, // Montenegro
  '+387': /^\+387[6]\d{7}$/, // Bosnia and Herzegovina
  '+389': /^\+389[7]\d{7}$/, // North Macedonia
  '+380': /^\+380[6-9]\d{8}$/, // Ukraine
  '+375': /^\+375[2-4]\d{8}$/, // Belarus
  '+370': /^\+370[6]\d{7}$/, // Lithuania
  '+371': /^\+371[2]\d{7}$/, // Latvia
  '+372': /^\+372[5]\d{7}$/, // Estonia
  '+7': /^\+7[9]\d{9}$/, // Russia/Kazakhstan
  '+373': /^\+373[6-7]\d{7}$/, // Moldova
  '+374': /^\+374[9]\d{7}$/, // Armenia
  '+995': /^\+995[5]\d{8}$/, // Georgia
  '+994': /^\+994[5]\d{8}$/, // Azerbaijan
  '+354': /^\+354[6-8]\d{7}$/, // Iceland
  '+353': /^\+353[8]\d{8}$/, // Ireland
  '+356': /^\+356[2-9]\d{7}$/, // Malta
  '+357': /^\+357[9]\d{7}$/, // Cyprus
  '+377': /^\+377[6]\d{7}$/, // Monaco
  '+378': /^\+378[6]\d{9}$/, // San Marino
  '+379': /^\+379[6]\d{7}$/, // Vatican City
  '+350': /^\+350[5-6]\d{7}$/, // Gibraltar
  '+423': /^\+423[6-7]\d{7}$/, // Liechtenstein
  '+352': /^\+352[6]\d{8}$/, // Luxembourg
  '+376': /^\+376[3-6]\d{5}$/, // Andorra
  '+298': /^\+298[2-9]\d{5}$/, // Faroe Islands
  '+299': /^\+299[2-5]\d{5}$/, // Greenland

  // Asia
  '+86': /^\+86[1]\d{10}$/, // China
  '+91': /^\+91[6-9]\d{9}$/, // India
  '+81': /^\+81[1-9]\d{8,9}$/, // Japan
  '+82': /^\+82[1-9]\d{7,8}$/, // South Korea
  '+62': /^\+62[8]\d{8,11}$/, // Indonesia
  '+66': /^\+66[6-9]\d{8}$/, // Thailand
  '+84': /^\+84[3-9]\d{8}$/, // Vietnam
  '+63': /^\+63[9]\d{9}$/, // Philippines
  '+60': /^\+60[1-9]\d{7,9}$/, // Malaysia
  '+65': /^\+65[6-9]\d{7}$/, // Singapore
  '+95': /^\+95[9]\d{7,8}$/, // Myanmar
  '+855': /^\+855[1-9]\d{7,8}$/, // Cambodia
  '+856': /^\+856[2]\d{8}$/, // Laos
  '+880': /^\+880[1]\d{8,9}$/, // Bangladesh
  '+94': /^\+94[7]\d{8}$/, // Sri Lanka
  '+960': /^\+960[7-9]\d{6}$/, // Maldives
  '+977': /^\+977[9]\d{8}$/, // Nepal
  '+975': /^\+975[1-8]\d{7}$/, // Bhutan
  '+98': /^\+98[9]\d{9}$/, // Iran
  '+92': /^\+92[3]\d{9}$/, // Pakistan
  '+93': /^\+93[7]\d{8}$/, // Afghanistan
  '+998': /^\+998[9]\d{8}$/, // Uzbekistan
  '+996': /^\+996[5-7]\d{8}$/, // Kyrgyzstan
  '+992': /^\+992[9]\d{8}$/, // Tajikistan
  '+993': /^\+993[6]\d{7}$/, // Turkmenistan
  '+976': /^\+976[5-9]\d{7}$/, // Mongolia
  '+850': /^\+850[1-9]\d{7,8}$/, // North Korea
  '+852': /^\+852[5-9]\d{7}$/, // Hong Kong
  '+853': /^\+853[6]\d{7}$/, // Macau
  '+886': /^\+886[9]\d{8}$/, // Taiwan
  '+673': /^\+673[7-8]\d{6}$/, // Brunei

  // Middle East
  '+90': /^\+90[5]\d{9}$/, // Turkey
  '+964': /^\+964[7]\d{9}$/, // Iraq
  '+962': /^\+962[7]\d{8}$/, // Jordan
  '+961': /^\+961[3-9]\d{7}$/, // Lebanon
  '+963': /^\+963[9]\d{8}$/, // Syria
  '+972': /^\+972[5]\d{8}$/, // Israel
  '+970': /^\+970[5]\d{8}$/, // Palestine
  '+971': /^\+971[5]\d{8}$/, // UAE
  '+966': /^\+966[5]\d{8}$/, // Saudi Arabia
  '+974': /^\+974[3-7]\d{7}$/, // Qatar
  '+973': /^\+973[3-9]\d{7}$/, // Bahrain
  '+965': /^\+965[5-9]\d{7}$/, // Kuwait
  '+968': /^\+968[9]\d{7}$/, // Oman
  '+967': /^\+967[7]\d{8}$/, // Yemen

  // Africa
  '+20': /^\+20[1]\d{8,9}$/, // Egypt
  '+27': /^\+27[6-8]\d{8}$/, // South Africa
  '+234': /^\+234[7-9]\d{7,10}$/, // Nigeria
  '+233': /^\+233[2-5]\d{7,8}$/, // Ghana
  '+254': /^\+254[7]\d{8}$/, // Kenya
  '+255': /^\+255[6-7]\d{8}$/, // Tanzania
  '+256': /^\+256[7]\d{8}$/, // Uganda
  '+250': /^\+250[7]\d{8}$/, // Rwanda
  '+257': /^\+257[6-7]\d{7}$/, // Burundi
  '+251': /^\+251[9]\d{8}$/, // Ethiopia
  '+252': /^\+252[6]\d{8}$/, // Somalia
  '+253': /^\+253[7]\d{7}$/, // Djibouti
  '+291': /^\+291[7]\d{6}$/, // Eritrea
  '+249': /^\+249[9]\d{8}$/, // Sudan
  '+211': /^\+211[9]\d{8}$/, // South Sudan
  '+235': /^\+235[6]\d{7}$/, // Chad
  '+236': /^\+236[7]\d{7}$/, // Central African Republic
  '+237': /^\+237[6]\d{8}$/, // Cameroon
  '+240': /^\+240[2-5]\d{8}$/, // Equatorial Guinea
  '+241': /^\+241[0-7]\d{7}$/, // Gabon
  '+242': /^\+242[0-6]\d{7}$/, // Congo
  '+243': /^\+243[8-9]\d{8}$/, // Congo (DRC)
  '+244': /^\+244[9]\d{8}$/, // Angola
  '+258': /^\+258[8]\d{8}$/, // Mozambique
  '+260': /^\+260[9]\d{8}$/, // Zambia
  '+263': /^\+263[7]\d{8}$/, // Zimbabwe
  '+265': /^\+265[1-9]\d{7}$/, // Malawi
  '+267': /^\+267[7]\d{7}$/, // Botswana
  '+268': /^\+268[7]\d{7}$/, // Eswatini
  '+266': /^\+266[5-6]\d{7}$/, // Lesotho
  '+264': /^\+264[8]\d{8}$/, // Namibia
  '+261': /^\+261[3]\d{8}$/, // Madagascar
  '+230': /^\+230[5]\d{7}$/, // Mauritius
  '+248': /^\+248[2]\d{6}$/, // Seychelles
  '+269': /^\+269[3]\d{6}$/, // Comoros
  '+212': /^\+212[6-7]\d{8}$/, // Morocco
  '+213': /^\+213[5-7]\d{8}$/, // Algeria
  '+216': /^\+216[2-9]\d{7}$/, // Tunisia
  '+218': /^\+218[9]\d{8}$/, // Libya
  '+220': /^\+220[3-9]\d{6}$/, // Gambia
  '+221': /^\+221[7]\d{8}$/, // Senegal
  '+222': /^\+222[2-4]\d{7}$/, // Mauritania
  '+223': /^\+223[6-9]\d{7}$/, // Mali
  '+224': /^\+224[6]\d{8}$/, // Guinea
  '+225': /^\+225[0-5]\d{7}$/, // Côte d'Ivoire
  '+226': /^\+226[6-7]\d{7}$/, // Burkina Faso
  '+227': /^\+227[9]\d{7}$/, // Niger
  '+228': /^\+228[9]\d{7}$/, // Togo
  '+229': /^\+229[6-9]\d{7}$/, // Benin
  '+231': /^\+231[4-8]\d{7}$/, // Liberia
  '+232': /^\+232[2-5]\d{7}$/, // Sierra Leone
  '+238': /^\+238[5-9]\d{6}$/, // Cape Verde
  '+239': /^\+239[9]\d{6}$/, // São Tomé and Príncipe
  '+245': /^\+245[5-7]\d{6}$/, // Guinea-Bissau

  // South America
  '+55': /^\+55[1-9]\d{8,10}$/, // Brazil
  '+54': /^\+54[9]\d{8,10}$/, // Argentina
  '+56': /^\+56[9]\d{8}$/, // Chile
  '+57': /^\+57[3]\d{9}$/, // Colombia
  '+51': /^\+51[9]\d{8}$/, // Peru
  '+58': /^\+58[4]\d{9}$/, // Venezuela
  '+593': /^\+593[9]\d{8}$/, // Ecuador
  '+595': /^\+595[9]\d{8}$/, // Paraguay
  '+598': /^\+598[9]\d{7}$/, // Uruguay
  '+591': /^\+591[6-7]\d{7}$/, // Bolivia
  '+594': /^\+594[6]\d{8}$/, // French Guiana
  '+597': /^\+597[6-8]\d{6}$/, // Suriname
  '+592': /^\+592[6]\d{6}$/, // Guyana

  // Central America & Caribbean
  '+52': /^\+52[1-9]\d{8,9}$/, // Mexico
  '+502': /^\+502[4-5]\d{7}$/, // Guatemala
  '+503': /^\+503[6-7]\d{7}$/, // El Salvador
  '+504': /^\+504[3-9]\d{7}$/, // Honduras
  '+505': /^\+505[8]\d{7}$/, // Nicaragua
  '+506': /^\+506[6-8]\d{7}$/, // Costa Rica
  '+507': /^\+507[6]\d{7}$/, // Panama
  '+508': /^\+508[5]\d{5}$/, // Saint Pierre and Miquelon
  '+509': /^\+509[3-4]\d{7}$/, // Haiti
  '+53': /^\+53[5]\d{7}$/, // Cuba
  // 🔥 FIXED: Combined pattern for French Caribbean territories
  '+590': /^\+590[6]\d{8}$/, // Guadeloupe/Saint Barthélemy/Saint Martin
  '+596': /^\+596[6]\d{8}$/, // Martinique
  '+599': /^\+599[5-9]\d{6}$/, // Curaçao

  // Oceania
  '+61': /^\+61[2-9]\d{8}$/, // Australia
  '+64': /^\+64[2-9]\d{7,8}$/, // New Zealand
  '+679': /^\+679[7-9]\d{6}$/, // Fiji
  '+685': /^\+685[7]\d{6}$/, // Samoa
  '+686': /^\+686[2-5]\d{4}$/, // Kiribati
  '+687': /^\+687[7-8]\d{5}$/, // New Caledonia
  '+688': /^\+688[2]\d{4}$/, // Tuvalu
  '+689': /^\+689[8-9]\d{7}$/, // French Polynesia
  '+690': /^\+690[9]\d{3}$/, // Tokelau
  '+691': /^\+691[3]\d{6}$/, // Micronesia
  '+692': /^\+692[4-6]\d{6}$/, // Marshall Islands
  '+674': /^\+674[5]\d{6}$/, // Nauru
  '+675': /^\+675[7]\d{7}$/, // Papua New Guinea
  '+676': /^\+676[2]\d{4}$/, // Tonga
  '+677': /^\+677[7-9]\d{4}$/, // Solomon Islands
  '+678': /^\+678[5-7]\d{6}$/, // Vanuatu
  '+680': /^\+680[4-7]\d{6}$/, // Palau
  '+681': /^\+681[7-8]\d{5}$/, // Wallis and Futuna
  '+682': /^\+682[2-7]\d{4}$/, // Cook Islands
  '+683': /^\+683[4]\d{3}$/, // Niue

  // Special regions and territories
  '+290': /^\+290[2-8]\d{3}$/, // Saint Helena
  '+297': /^\+297[5-9]\d{6}$/, // Aruba
  '+500': /^\+500[5]\d{4}$/, // Falkland Islands
  '+262': /^\+262[6]\d{8}$/, // Réunion/Mayotte
  '+246': /^\+246[3]\d{6}$/, // British Indian Ocean Territory
  '+672': /^\+672[3]\d{5}$/, // Antarctica/Norfolk Island
  '+670': /^\+670[7]\d{7}$/, // Timor-Leste
  '+383': /^\+383[4]\d{7}$/, // Kosovo
};

export function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    // North America
    '+1': 'United States/Canada',
    '+1242': 'Bahamas',
    '+1246': 'Barbados',
    '+1264': 'Anguilla',
    '+1268': 'Antigua and Barbuda',
    '+1284': 'British Virgin Islands',
    '+1340': 'U.S. Virgin Islands',
    '+1345': 'Cayman Islands',
    '+1441': 'Bermuda',
    '+1473': 'Grenada',
    '+1649': 'Turks and Caicos Islands',
    '+1664': 'Montserrat',
    '+1670': 'Northern Mariana Islands',
    '+1671': 'Guam',
    '+1684': 'American Samoa',
    '+1721': 'Sint Maarten',
    '+1758': 'Saint Lucia',
    '+1767': 'Dominica',
    '+1784': 'Saint Vincent and the Grenadines',
    '+1787': 'Puerto Rico',
    '+1809': 'Dominican Republic',
    '+1829': 'Dominican Republic',
    '+1849': 'Dominican Republic',
    '+1868': 'Trinidad and Tobago',
    '+1869': 'Saint Kitts and Nevis',
    '+1876': 'Jamaica',

    // Europe
    '+33': 'France',
    '+44': 'United Kingdom',
    '+49': 'Germany',
    '+39': 'Italy',
    '+34': 'Spain',
    '+31': 'Netherlands',
    '+32': 'Belgium',
    '+41': 'Switzerland',
    '+43': 'Austria',
    '+45': 'Denmark',
    '+46': 'Sweden',
    '+47': 'Norway',
    '+358': 'Finland',
    '+351': 'Portugal',
    '+30': 'Greece',
    '+48': 'Poland',
    '+420': 'Czech Republic',
    '+421': 'Slovakia',
    '+36': 'Hungary',
    '+40': 'Romania',
    '+359': 'Bulgaria',
    '+385': 'Croatia',
    '+386': 'Slovenia',
    '+381': 'Serbia',
    '+382': 'Montenegro',
    '+387': 'Bosnia and Herzegovina',
    '+389': 'North Macedonia',
    '+380': 'Ukraine',
    '+375': 'Belarus',
    '+370': 'Lithuania',
    '+371': 'Latvia',
    '+372': 'Estonia',
    '+7': 'Russia/Kazakhstan',
    '+373': 'Moldova',
    '+374': 'Armenia',
    '+995': 'Georgia',
    '+994': 'Azerbaijan',
    '+354': 'Iceland',
    '+353': 'Ireland',
    '+356': 'Malta',
    '+357': 'Cyprus',
    '+377': 'Monaco',
    '+378': 'San Marino',
    '+379': 'Vatican City',
    '+350': 'Gibraltar',
    '+423': 'Liechtenstein',
    '+352': 'Luxembourg',
    '+376': 'Andorra',
    '+298': 'Faroe Islands',
    '+299': 'Greenland',

    // Asia
    '+86': 'China',
    '+91': 'India',
    '+81': 'Japan',
    '+82': 'South Korea',
    '+62': 'Indonesia',
    '+66': 'Thailand',
    '+84': 'Vietnam',
    '+63': 'Philippines',
    '+60': 'Malaysia',
    '+65': 'Singapore',
    '+95': 'Myanmar',
    '+855': 'Cambodia',
    '+856': 'Laos',
    '+880': 'Bangladesh',
    '+94': 'Sri Lanka',
    '+960': 'Maldives',
    '+977': 'Nepal',
    '+975': 'Bhutan',
    '+98': 'Iran',
    '+92': 'Pakistan',
    '+93': 'Afghanistan',
    '+998': 'Uzbekistan',
    '+996': 'Kyrgyzstan',
    '+992': 'Tajikistan',
    '+993': 'Turkmenistan',
    '+976': 'Mongolia',
    '+850': 'North Korea',
    '+852': 'Hong Kong',
    '+853': 'Macau',
    '+886': 'Taiwan',
    '+673': 'Brunei',

    // Middle East
    '+90': 'Turkey',
    '+964': 'Iraq',
    '+962': 'Jordan',
    '+961': 'Lebanon',
    '+963': 'Syria',
    '+972': 'Israel',
    '+970': 'Palestine',
    '+971': 'United Arab Emirates',
    '+966': 'Saudi Arabia',
    '+974': 'Qatar',
    '+973': 'Bahrain',
    '+965': 'Kuwait',
    '+968': 'Oman',
    '+967': 'Yemen',

    // Africa
    '+20': 'Egypt',
    '+27': 'South Africa',
    '+234': 'Nigeria',
    '+233': 'Ghana',
    '+254': 'Kenya',
    '+255': 'Tanzania',
    '+256': 'Uganda',
    '+250': 'Rwanda',
    '+257': 'Burundi',
    '+251': 'Ethiopia',
    '+252': 'Somalia',
    '+253': 'Djibouti',
    '+291': 'Eritrea',
    '+249': 'Sudan',
    '+211': 'South Sudan',
    '+235': 'Chad',
    '+236': 'Central African Republic',
    '+237': 'Cameroon',
    '+240': 'Equatorial Guinea',
    '+241': 'Gabon',
    '+242': 'Congo',
    '+243': 'Congo (DRC)',
    '+244': 'Angola',
    '+258': 'Mozambique',
    '+260': 'Zambia',
    '+263': 'Zimbabwe',
    '+265': 'Malawi',
    '+267': 'Botswana',
    '+268': 'Eswatini',
    '+266': 'Lesotho',
    '+264': 'Namibia',
    '+261': 'Madagascar',
    '+230': 'Mauritius',
    '+248': 'Seychelles',
    '+269': 'Comoros',
    '+212': 'Morocco',
    '+213': 'Algeria',
    '+216': 'Tunisia',
    '+218': 'Libya',
    '+220': 'Gambia',
    '+221': 'Senegal',
    '+222': 'Mauritania',
    '+223': 'Mali',
    '+224': 'Guinea',
    '+225': "Côte d'Ivoire",
    '+226': 'Burkina Faso',
    '+227': 'Niger',
    '+228': 'Togo',
    '+229': 'Benin',
    '+231': 'Liberia',
    '+232': 'Sierra Leone',
    '+238': 'Cape Verde',
    '+239': 'São Tomé and Príncipe',
    '+245': 'Guinea-Bissau',

    // South America
    '+55': 'Brazil',
    '+54': 'Argentina',
    '+56': 'Chile',
    '+57': 'Colombia',
    '+51': 'Peru',
    '+58': 'Venezuela',
    '+593': 'Ecuador',
    '+595': 'Paraguay',
    '+598': 'Uruguay',
    '+591': 'Bolivia',
    '+594': 'French Guiana',
    '+597': 'Suriname',
    '+592': 'Guyana',

    // Central America & Caribbean
    '+52': 'Mexico',
    '+502': 'Guatemala',
    '+503': 'El Salvador',
    '+504': 'Honduras',
    '+505': 'Nicaragua',
    '+506': 'Costa Rica',
    '+507': 'Panama',
    '+508': 'Saint Pierre and Miquelon',
    '+509': 'Haiti',
    '+53': 'Cuba',
    '+590': 'Guadeloupe/Saint Barthélemy/Saint Martin',
    '+596': 'Martinique',
    '+599': 'Curaçao',

    // Oceania
    '+61': 'Australia',
    '+64': 'New Zealand',
    '+679': 'Fiji',
    '+685': 'Samoa',
    '+686': 'Kiribati',
    '+687': 'New Caledonia',
    '+688': 'Tuvalu',
    '+689': 'French Polynesia',
    '+690': 'Tokelau',
    '+691': 'Micronesia',
    '+692': 'Marshall Islands',
    '+674': 'Nauru',
    '+675': 'Papua New Guinea',
    '+676': 'Tonga',
    '+677': 'Solomon Islands',
    '+678': 'Vanuatu',
    '+680': 'Palau',
    '+681': 'Wallis and Futuna',
    '+682': 'Cook Islands',
    '+683': 'Niue',

    // Special regions
    '+290': 'Saint Helena',
    '+297': 'Aruba',
    '+500': 'Falkland Islands',
    '+262': 'Réunion/Mayotte',
    '+246': 'British Indian Ocean Territory',
    '+672': 'Antarctica/Norfolk Island',
    '+670': 'Timor-Leste',
    '+383': 'Kosovo',
  };

  return countryMap[countryCode] || 'Unknown Country';
}
