// Bangladesh administrative divisions, districts, upazillas, and Dhaka areas

export interface Division {
  id: string;
  name: string;
  nameBn?: string;
  districts: District[];
}

export interface District {
  id: string;
  name: string;
  nameBn?: string;
  upazillas: Upazilla[];
}

export interface Upazilla {
  id: string;
  name: string;
  nameBn?: string;
}

export interface DhakaArea {
  id: string;
  name: string;
  nameBn?: string;
}

// Dhaka Metropolitan Areas/Thanas
export const dhakaAreas: DhakaArea[] = [
  { id: 'dhanmondi', name: 'Dhanmondi' },
  { id: 'gulshan', name: 'Gulshan' },
  { id: 'banani', name: 'Banani' },
  { id: 'uttara', name: 'Uttara' },
  { id: 'mohakhali', name: 'Mohakhali' },
  { id: 'rampura', name: 'Rampura' },
  { id: 'banasree', name: 'Banasree' },
  { id: 'malibagh', name: 'Malibagh' },
  { id: 'moghbazar', name: 'Moghbazar' },
  { id: 'shantinagar', name: 'Shantinagar' },
  { id: 'tejgaon', name: 'Tejgaon' },
  { id: 'farmgate', name: 'Farmgate' },
  { id: 'kallyanpur', name: 'Kallyanpur' },
  { id: 'mohammadpur', name: 'Mohammadpur' },
  { id: 'adabor', name: 'Adabor' },
  { id: 'shyamoli', name: 'Shyamoli' },
  { id: 'mirpur', name: 'Mirpur' },
  { id: 'pallabi', name: 'Pallabi' },
  { id: 'uttarkhan', name: 'Uttar Khan' },
  { id: 'khilkhet', name: 'Khilkhet' },
  { id: 'baridhara', name: 'Baridhara' },
  { id: 'bashundhara', name: 'Bashundhara' },
  { id: 'niketon', name: 'Niketon' },
  { id: 'rampura', name: 'Rampura' },
  { id: 'jatrabari', name: 'Jatrabari' },
  { id: 'demra', name: 'Demra' },
  { id: 'sutrapur', name: 'Sutrapur' },
  { id: 'chawkbazar', name: 'Chawkbazar' },
  { id: 'lalbagh', name: 'Lalbagh' },
  { id: 'shahbagh', name: 'Shahbagh' },
  { id: 'newmarket', name: 'New Market' },
  { id: 'wari', name: 'Wari' },
  { id: 'motijheel', name: 'Motijheel' },
  { id: 'tejgaon_industrial', name: 'Tejgaon Industrial Area' },
  { id: 'kakrail', name: 'Kakrail' },
  { id: 'siddeshwari', name: 'Siddeshwari' },
  { id: 'bashabo', name: 'Bashabo' },
  { id: 'khilgaon', name: 'Khilgaon' },
  { id: 'cantonment', name: 'Cantonment' },
];

// Bangladesh Divisions with Districts and Upazillas
export const bangladeshDivisions: Division[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    districts: [
      {
        id: 'dhaka_district',
        name: 'Dhaka',
        upazillas: [
          { id: 'dohar', name: 'Dohar' },
          { id: 'dhamrai', name: 'Dhamrai' },
          { id: 'keraniganj', name: 'Keraniganj' },
          { id: 'nawabganj', name: 'Nawabganj' },
          { id: 'savar', name: 'Savar' },
        ]
      },
      {
        id: 'gazipur',
        name: 'Gazipur',
        upazillas: [
          { id: 'gazipur_sadar', name: 'Gazipur Sadar' },
          { id: 'kaliakair', name: 'Kaliakair' },
          { id: 'kapasia', name: 'Kapasia' },
          { id: 'sreepur', name: 'Sreepur' },
        ]
      },
      {
        id: 'manikganj',
        name: 'Manikganj',
        upazillas: [
          { id: 'manikganj_sadar', name: 'Manikganj Sadar' },
          { id: 'singair', name: 'Singair' },
          { id: 'saturia', name: 'Saturia' },
        ]
      },
      {
        id: 'munshiganj',
        name: 'Munshiganj',
        upazillas: [
          { id: 'munshiganj_sadar', name: 'Munshiganj Sadar' },
          { id: 'sirajdikhan', name: 'Sirajdikhan' },
          { id: 'tongibari', name: 'Tongibari' },
        ]
      },
      {
        id: 'narayanganj',
        name: 'Narayanganj',
        upazillas: [
          { id: 'narayanganj_sadar', name: 'Narayanganj Sadar' },
          { id: 'bandar', name: 'Bandar' },
          { id: 'ruparganj', name: 'Rupganj' },
          { id: 'sonargaon', name: 'Sonargaon' },
        ]
      },
      {
        id: 'narsingdi',
        name: 'Narsingdi',
        upazillas: [
          { id: 'narsingdi_sadar', name: 'Narsingdi Sadar' },
          { id: 'belabo', name: 'Belabo' },
          { id: 'monohardi', name: 'Monohardi' },
        ]
      },
      {
        id: 'tangail',
        name: 'Tangail',
        upazillas: [
          { id: 'tangail_sadar', name: 'Tangail Sadar' },
          { id: 'basail', name: 'Basail' },
          { id: 'bhuapur', name: 'Bhuapur' },
          { id: 'delduar', name: 'Delduar' },
        ]
      },
      {
        id: 'faridpur',
        name: 'Faridpur',
        upazillas: [
          { id: 'faridpur_sadar', name: 'Faridpur Sadar' },
          { id: 'alfadanga', name: 'Alfadanga' },
          { id: 'bhanga', name: 'Bhanga' },
        ]
      },
      {
        id: 'gopalganj',
        name: 'Gopalganj',
        upazillas: [
          { id: 'gopalganj_sadar', name: 'Gopalganj Sadar' },
          { id: 'kashiani', name: 'Kashiani' },
          { id: 'tungipara', name: 'Tungipara' },
        ]
      },
      {
        id: 'madaripur',
        name: 'Madaripur',
        upazillas: [
          { id: 'madaripur_sadar', name: 'Madaripur Sadar' },
          { id: 'kalkini', name: 'Kalkini' },
          { id: 'rajoir', name: 'Rajoir' },
        ]
      },
      {
        id: 'rajbari',
        name: 'Rajbari',
        upazillas: [
          { id: 'rajbari_sadar', name: 'Rajbari Sadar' },
          { id: 'baliakandi', name: 'Baliakandi' },
          { id: 'goalanda', name: 'Goalanda' },
        ]
      },
      {
        id: 'shariatpur',
        name: 'Shariatpur',
        upazillas: [
          { id: 'shariatpur_sadar', name: 'Shariatpur Sadar' },
          { id: 'damudya', name: 'Damudya' },
          { id: 'naria', name: 'Naria' },
        ]
      },
    ]
  },
  {
    id: 'chittagong',
    name: 'Chittagong',
    districts: [
      {
        id: 'chittagong_district',
        name: 'Chittagong',
        upazillas: [
          { id: 'chittagong_sadar', name: 'Chittagong Sadar' },
          { id: 'anwara', name: 'Anwara' },
          { id: 'banshkhali', name: 'Banshkhali' },
          { id: 'boalkhali', name: 'Boalkhali' },
          { id: 'chandanaish', name: 'Chandanaish' },
          { id: 'fatikchhari', name: 'Fatikchhari' },
          { id: 'hathazari', name: 'Hathazari' },
          { id: 'lohagara', name: 'Lohagara' },
          { id: 'mirsharai', name: 'Mirsharai' },
          { id: 'patiya', name: 'Patiya' },
          { id: 'rangunia', name: 'Rangunia' },
          { id: 'raozan', name: 'Raozan' },
          { id: 'sandwip', name: 'Sandwip' },
          { id: 'satkania', name: 'Satkania' },
          { id: 'sitakunda', name: 'Sitakunda' },
        ]
      },
      {
        id: 'cox_bazar',
        name: "Cox's Bazar",
        upazillas: [
          { id: 'cox_bazar_sadar', name: "Cox's Bazar Sadar" },
          { id: 'chakaria', name: 'Chakaria' },
          { id: 'kutubdia', name: 'Kutubdia' },
          { id: 'maheshkhali', name: 'Maheshkhali' },
          { id: 'ramu', name: 'Ramu' },
          { id: 'teknaf', name: 'Teknaf' },
          { id: 'ukhia', name: 'Ukhia' },
        ]
      },
      {
        id: 'feni',
        name: 'Feni',
        upazillas: [
          { id: 'feni_sadar', name: 'Feni Sadar' },
          { id: 'chhagalnaiya', name: 'Chhagalnaiya' },
          { id: 'daganbhuiyan', name: 'Daganbhuiyan' },
          { id: 'parshuram', name: 'Parshuram' },
          { id: 'sonagazi', name: 'Sonagazi' },
        ]
      },
    ]
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    districts: [
      {
        id: 'sylhet_district',
        name: 'Sylhet',
        upazillas: [
          { id: 'sylhet_sadar', name: 'Sylhet Sadar' },
          { id: 'balaganj', name: 'Balaganj' },
          { id: 'beanibazar', name: 'Beanibazar' },
          { id: 'bishwanath', name: 'Bishwanath' },
          { id: 'companigonj', name: 'Companigonj' },
          { id: 'fenchuganj', name: 'Fenchuganj' },
          { id: 'golapganj', name: 'Golapganj' },
          { id: 'gowainghat', name: 'Gowainghat' },
          { id: 'jaintiapur', name: 'Jaintiapur' },
          { id: 'kanaighat', name: 'Kanaighat' },
          { id: 'osmani_nagar', name: 'Osmani Nagar' },
          { id: 'zakiganj', name: 'Zakiganj' },
        ]
      },
      {
        id: 'moulvibazar',
        name: 'Moulvibazar',
        upazillas: [
          { id: 'moulvibazar_sadar', name: 'Moulvibazar Sadar' },
          { id: 'barlekha', name: 'Barlekha' },
          { id: 'juri', name: 'Juri' },
          { id: 'kamalganj', name: 'Kamalganj' },
          { id: 'kulaura', name: 'Kulaura' },
          { id: 'rajnagar', name: 'Rajnagar' },
          { id: 'sreemangal', name: 'Sreemangal' },
        ]
      },
      {
        id: 'sunamganj',
        name: 'Sunamganj',
        upazillas: [
          { id: 'sunamganj_sadar', name: 'Sunamganj Sadar' },
          { id: 'bishwambarpur', name: 'Bishwambarpur' },
          { id: 'chhatak', name: 'Chhatak' },
          { id: 'derai', name: 'Derai' },
          { id: 'dharampasha', name: 'Dharampasha' },
          { id: 'dowarabazar', name: 'Dowarabazar' },
          { id: 'jagannathpur', name: 'Jagannathpur' },
          { id: 'jamalganj', name: 'Jamalganj' },
          { id: 'sullah', name: 'Sullah' },
          { id: 'tahirpur', name: 'Tahirpur' },
        ]
      },
      {
        id: 'habiganj',
        name: 'Habiganj',
        upazillas: [
          { id: 'habiganj_sadar', name: 'Habiganj Sadar' },
          { id: 'ajmiriganj', name: 'Ajmiriganj' },
          { id: 'bahubal', name: 'Bahubal' },
          { id: 'baniyachong', name: 'Baniyachong' },
          { id: 'chunarughat', name: 'Chunarughat' },
          { id: 'kalauk', name: 'Kalauk' },
          { id: 'madhabpur', name: 'Madhabpur' },
          { id: 'nabiganj', name: 'Nabiganj' },
        ]
      },
    ]
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    districts: [
      {
        id: 'rajshahi_district',
        name: 'Rajshahi',
        upazillas: [
          { id: 'rajshahi_sadar', name: 'Rajshahi Sadar' },
          { id: 'bagha', name: 'Bagha' },
          { id: 'bagmara', name: 'Bagmara' },
          { id: 'charghat', name: 'Charghat' },
          { id: 'durgapur', name: 'Durgapur' },
          { id: 'godagari', name: 'Godagari' },
          { id: 'mohanpur', name: 'Mohanpur' },
          { id: 'paba', name: 'Paba' },
          { id: 'puthia', name: 'Puthia' },
          { id: 'tanore', name: 'Tanore' },
        ]
      },
      {
        id: 'bogra',
        name: 'Bogra',
        upazillas: [
          { id: 'bogra_sadar', name: 'Bogra Sadar' },
          { id: 'adamdighi', name: 'Adamdighi' },
          { id: 'dhunat', name: 'Dhunat' },
          { id: 'dupchanchia', name: 'Dupchanchia' },
          { id: 'gabtali', name: 'Gabtali' },
          { id: 'kahaloo', name: 'Kahaloo' },
          { id: 'nandigram', name: 'Nandigram' },
          { id: 'sariakandi', name: 'Sariakandi' },
          { id: 'shajahanpur', name: 'Shajahanpur' },
          { id: 'sherpur', name: 'Sherpur' },
          { id: 'shibganj', name: 'Shibganj' },
          { id: 'sonatala', name: 'Sonatala' },
        ]
      },
      {
        id: 'chapainawabganj',
        name: 'Chapainawabganj',
        upazillas: [
          { id: 'chapainawabganj_sadar', name: 'Chapainawabganj Sadar' },
          { id: 'bholahat', name: 'Bholahat' },
          { id: 'gomastapur', name: 'Gomastapur' },
          { id: 'nachole', name: 'Nachole' },
          { id: 'shibganj', name: 'Shibganj' },
        ]
      },
    ]
  },
  {
    id: 'khulna',
    name: 'Khulna',
    districts: [
      {
        id: 'khulna_district',
        name: 'Khulna',
        upazillas: [
          { id: 'khulna_sadar', name: 'Khulna Sadar' },
          { id: 'batiaghata', name: 'Batiaghata' },
          { id: 'dacope', name: 'Dacope' },
          { id: 'dumuria', name: 'Dumuria' },
          { id: 'dighalia', name: 'Dighalia' },
          { id: 'fakirhat', name: 'Fakirhat' },
          { id: 'koira', name: 'Koira' },
          { id: 'paikgachha', name: 'Paikgachha' },
          { id: 'phultala', name: 'Phultala' },
          { id: 'rupsa', name: 'Rupsa' },
          { id: 'terokhada', name: 'Terokhada' },
        ]
      },
      {
        id: 'bagerhat',
        name: 'Bagerhat',
        upazillas: [
          { id: 'bagerhat_sadar', name: 'Bagerhat Sadar' },
          { id: 'chitalmari', name: 'Chitalmari' },
          { id: 'fakirhat', name: 'Fakirhat' },
          { id: 'kachua', name: 'Kachua' },
          { id: 'mollahat', name: 'Mollahat' },
          { id: 'mongla', name: 'Mongla' },
          { id: 'morrelganj', name: 'Morrelganj' },
          { id: 'sarankhola', name: 'Sarankhola' },
        ]
      },
      {
        id: 'chuadanga',
        name: 'Chuadanga',
        upazillas: [
          { id: 'chuadanga_sadar', name: 'Chuadanga Sadar' },
          { id: 'alamdanga', name: 'Alamdanga' },
          { id: 'damurhuda', name: 'Damurhuda' },
          { id: 'jibannagar', name: 'Jibannagar' },
        ]
      },
    ]
  },
  {
    id: 'barisal',
    name: 'Barisal',
    districts: [
      {
        id: 'barisal_district',
        name: 'Barisal',
        upazillas: [
          { id: 'barisal_sadar', name: 'Barisal Sadar' },
          { id: 'agailjhara', name: 'Agailjhara' },
          { id: 'babuganj', name: 'Babuganj' },
          { id: 'bakerganj', name: 'Bakerganj' },
          { id: 'banaripara', name: 'Banaripara' },
          { id: 'gaurnadi', name: 'Gaurnadi' },
          { id: 'hizla', name: 'Hizla' },
          { id: 'mehendiganj', name: 'Mehendiganj' },
          { id: 'muladi', name: 'Muladi' },
          { id: 'wazirpur', name: 'Wazirpur' },
        ]
      },
      {
        id: 'barguna',
        name: 'Barguna',
        upazillas: [
          { id: 'barguna_sadar', name: 'Barguna Sadar' },
          { id: 'amtali', name: 'Amtali' },
          { id: 'bamna', name: 'Bamna' },
          { id: 'betagi', name: 'Betagi' },
          { id: 'patharghata', name: 'Patharghata' },
        ]
      },
      {
        id: 'bhola',
        name: 'Bhola',
        upazillas: [
          { id: 'bhola_sadar', name: 'Bhola Sadar' },
          { id: 'borhanuddin', name: 'Borhanuddin' },
          { id: 'charfasson', name: 'Charfasson' },
          { id: 'daulatkhan', name: 'Daulatkhan' },
          { id: 'lalmohan', name: 'Lalmohan' },
          { id: 'manpura', name: 'Manpura' },
          { id: 'tazumuddin', name: 'Tazumuddin' },
        ]
      },
    ]
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    districts: [
      {
        id: 'rangpur_district',
        name: 'Rangpur',
        upazillas: [
          { id: 'rangpur_sadar', name: 'Rangpur Sadar' },
          { id: 'badarganj', name: 'Badarganj' },
          { id: 'gangachara', name: 'Gangachara' },
          { id: 'kaunia', name: 'Kaunia' },
          { id: 'mithapukur', name: 'Mithapukur' },
          { id: 'pirgacha', name: 'Pirgacha' },
          { id: 'pirganj', name: 'Pirganj' },
          { id: 'taraganj', name: 'Taraganj' },
        ]
      },
      {
        id: 'dinajpur',
        name: 'Dinajpur',
        upazillas: [
          { id: 'dinajpur_sadar', name: 'Dinajpur Sadar' },
          { id: 'birganj', name: 'Birganj' },
          { id: 'biral', name: 'Biral' },
          { id: 'bochaganj', name: 'Bochaganj' },
          { id: 'chirirbandar', name: 'Chirirbandar' },
          { id: 'fulbari', name: 'Fulbari' },
          { id: 'ghoraghat', name: 'Ghoraghat' },
          { id: 'hakimpur', name: 'Hakimpur' },
          { id: 'kaharole', name: 'Kaharole' },
          { id: 'khansama', name: 'Khansama' },
          { id: 'nawabganj', name: 'Nawabganj' },
          { id: 'parbatipur', name: 'Parbatipur' },
        ]
      },
      {
        id: 'gaibandha',
        name: 'Gaibandha',
        upazillas: [
          { id: 'gaibandha_sadar', name: 'Gaibandha Sadar' },
          { id: 'fulchhari', name: 'Fulchhari' },
          { id: 'gobindaganj', name: 'Gobindaganj' },
          { id: 'palashbari', name: 'Palashbari' },
          { id: 'sadullapur', name: 'Sadullapur' },
          { id: 'saghata', name: 'Saghata' },
          { id: 'sundarganj', name: 'Sundarganj' },
        ]
      },
    ]
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    districts: [
      {
        id: 'mymensingh_district',
        name: 'Mymensingh',
        upazillas: [
          { id: 'mymensingh_sadar', name: 'Mymensingh Sadar' },
          { id: 'dhobaura', name: 'Dhobaura' },
          { id: 'fulbaria', name: 'Fulbaria' },
          { id: 'gaffargaon', name: 'Gaffargaon' },
          { id: 'gouripur', name: 'Gouripur' },
          { id: 'haluaghat', name: 'Haluaghat' },
          { id: 'ishwarganj', name: 'Ishwarganj' },
          { id: 'muktagachha', name: 'Muktagachha' },
          { id: 'nandail', name: 'Nandail' },
          { id: 'phalgazi', name: 'Phalgazi' },
          { id: 'tarakanda', name: 'Tarakanda' },
        ]
      },
      {
        id: 'jamalpur',
        name: 'Jamalpur',
        upazillas: [
          { id: 'jamalpur_sadar', name: 'Jamalpur Sadar' },
          { id: 'bakshiganj', name: 'Bakshiganj' },
          { id: 'dewangonj', name: 'Dewangonj' },
          { id: 'islamganj', name: 'Islampur' },
          { id: 'madarganj', name: 'Madarganj' },
          { id: 'melandaha', name: 'Melandaha' },
          { id: 'sarishabari', name: 'Sarishabari' },
        ]
      },
      {
        id: 'netrokona',
        name: 'Netrokona',
        upazillas: [
          { id: 'netrokona_sadar', name: 'Netrokona Sadar' },
          { id: 'atalganj', name: 'Atpara' },
          { id: 'barhatta', name: 'Barhatta' },
          { id: 'durgapur', name: 'Durgapur' },
          { id: 'khaliajuri', name: 'Khaliajuri' },
          { id: 'kendua', name: 'Kendua' },
          { id: 'madan', name: 'Madan' },
          { id: 'mohanganj', name: 'Mohanganj' },
        ]
      },
    ]
  },
];

// Helper functions
export function getDivisionById(id: string): Division | undefined {
  return bangladeshDivisions.find(div => div.id === id);
}

export function getDistrictById(divisionId: string, districtId: string): District | undefined {
  const division = getDivisionById(divisionId);
  return division?.districts.find(dist => dist.id === districtId);
}

export function getUpazillaById(divisionId: string, districtId: string, upazillaId: string): Upazilla | undefined {
  const district = getDistrictById(divisionId, districtId);
  return district?.upazillas.find(upaz => upaz.id === upazillaId);
}

export function getDhakaAreaById(id: string): DhakaArea | undefined {
  return dhakaAreas.find(area => area.id === id);
}

