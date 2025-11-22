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
          { id: 'ghatail', name: 'Ghatail' },
          { id: 'gopalpur', name: 'Gopalpur' },
          { id: 'kalihati', name: 'Kalihati' },
          { id: 'madhupur', name: 'Madhupur' },
          { id: 'mirzapur', name: 'Mirzapur' },
          { id: 'nagarpur', name: 'Nagarpur' },
          { id: 'sakhipur', name: 'Sakhipur' },
        ]
      },
      {
        id: 'faridpur',
        name: 'Faridpur',
        upazillas: [
          { id: 'faridpur_sadar', name: 'Faridpur Sadar' },
          { id: 'alfadanga', name: 'Alfadanga' },
          { id: 'bhanga', name: 'Bhanga' },
          { id: 'boalmari', name: 'Boalmari' },
          { id: 'charbhadrasan', name: 'Charbhadrasan' },
          { id: 'madhukhali', name: 'Madhukhali' },
          { id: 'nagarkanda', name: 'Nagarkanda' },
          { id: 'sadarpur', name: 'Sadarpur' },
        ]
      },
      {
        id: 'gopalganj',
        name: 'Gopalganj',
        upazillas: [
          { id: 'gopalganj_sadar', name: 'Gopalganj Sadar' },
          { id: 'kashiani', name: 'Kashiani' },
          { id: 'kotalipara', name: 'Kotalipara' },
          { id: 'muksudpur', name: 'Muksudpur' },
          { id: 'tungipara', name: 'Tungipara' },
        ]
      },
      {
        id: 'kishoreganj',
        name: 'Kishoreganj',
        upazillas: [
          { id: 'kishoreganj_sadar', name: 'Kishoreganj Sadar' },
          { id: 'austagram', name: 'Austagram' },
          { id: 'bajitpur', name: 'Bajitpur' },
          { id: 'bhairab', name: 'Bhairab' },
          { id: 'hossainpur', name: 'Hossainpur' },
          { id: 'itna', name: 'Itna' },
          { id: 'karimganj', name: 'Karimganj' },
          { id: 'katiadi', name: 'Katiadi' },
          { id: 'kuliarchar', name: 'Kuliarchar' },
          { id: 'mithamain', name: 'Mithamain' },
          { id: 'nikli', name: 'Nikli' },
          { id: 'pakundia', name: 'Pakundia' },
          { id: 'tarail', name: 'Tarail' },
        ]
      },
      {
        id: 'madaripur',
        name: 'Madaripur',
        upazillas: [
          { id: 'madaripur_sadar', name: 'Madaripur Sadar' },
          { id: 'kalkini', name: 'Kalkini' },
          { id: 'rajoir', name: 'Rajoir' },
          { id: 'shibchar', name: 'Shibchar' },
        ]
      },
      {
        id: 'rajbari',
        name: 'Rajbari',
        upazillas: [
          { id: 'rajbari_sadar', name: 'Rajbari Sadar' },
          { id: 'baliakandi', name: 'Baliakandi' },
          { id: 'goalanda', name: 'Goalanda' },
          { id: 'pangsha', name: 'Pangsha' },
        ]
      },
      {
        id: 'shariatpur',
        name: 'Shariatpur',
        upazillas: [
          { id: 'shariatpur_sadar', name: 'Shariatpur Sadar' },
          { id: 'bhedarganj', name: 'Bhedarganj' },
          { id: 'damudya', name: 'Damudya' },
          { id: 'gosairhat', name: 'Gosairhat' },
          { id: 'naria', name: 'Naria' },
          { id: 'zajira', name: 'Zajira' },
        ]
      },
    ]
  },
  {
    id: 'chittagong',
    name: 'Chittagong',
    districts: [
      {
        id: 'bandarban',
        name: 'Bandarban',
        upazillas: [
          { id: 'bandarban_sadar', name: 'Bandarban Sadar' },
          { id: 'alikadam', name: 'Alikadam' },
          { id: 'thanchi', name: 'Thanchi' },
          { id: 'lama', name: 'Lama' },
          { id: 'naikhongchhari', name: 'Naikhongchhari' },
          { id: 'rowangchhari', name: 'Rowangchhari' },
          { id: 'ruma', name: 'Ruma' },
        ]
      },
      {
        id: 'brahmanbaria',
        name: 'Brahmanbaria',
        upazillas: [
          { id: 'brahmanbaria_sadar', name: 'Brahmanbaria Sadar' },
          { id: 'akhaura', name: 'Akhaura' },
          { id: 'ashuganj', name: 'Ashuganj' },
          { id: 'banchharampur', name: 'Banchharampur' },
          { id: 'bijoynagar', name: 'Bijoynagar' },
          { id: 'kasba', name: 'Kasba' },
          { id: 'nabinagar', name: 'Nabinagar' },
          { id: 'nasirnagar', name: 'Nasirnagar' },
          { id: 'sarail', name: 'Sarail' },
        ]
      },
      {
        id: 'chandpur',
        name: 'Chandpur',
        upazillas: [
          { id: 'chandpur_sadar', name: 'Chandpur Sadar' },
          { id: 'faridganj', name: 'Faridganj' },
          { id: 'haimchar', name: 'Haimchar' },
          { id: 'hajiganj', name: 'Hajiganj' },
          { id: 'kachua', name: 'Kachua' },
          { id: 'matlab_dakshin', name: 'Matlab Dakshin' },
          { id: 'matlab_uttar', name: 'Matlab Uttar' },
          { id: 'shahrasti', name: 'Shahrasti' },
        ]
      },
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
        id: 'comilla',
        name: 'Comilla',
        upazillas: [
          { id: 'comilla_sadar', name: 'Comilla Sadar' },
          { id: 'barura', name: 'Barura' },
          { id: 'brahmanpara', name: 'Brahmanpara' },
          { id: 'burichong', name: 'Burichong' },
          { id: 'chandina', name: 'Chandina' },
          { id: 'chauddagram', name: 'Chauddagram' },
          { id: 'daudkandi', name: 'Daudkandi' },
          { id: 'debidwar', name: 'Debidwar' },
          { id: 'homna', name: 'Homna' },
          { id: 'laksam', name: 'Laksam' },
          { id: 'lalmai', name: 'Lalmai' },
          { id: 'meghna', name: 'Meghna' },
          { id: 'monoharganj', name: 'Monoharganj' },
          { id: 'muradnagar', name: 'Muradnagar' },
          { id: 'nangalkot', name: 'Nangalkot' },
          { id: 'titas', name: 'Titas' },
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
      {
        id: 'khagrachhari',
        name: 'Khagrachhari',
        upazillas: [
          { id: 'khagrachhari_sadar', name: 'Khagrachhari Sadar' },
          { id: 'dighinala', name: 'Dighinala' },
          { id: 'lakshmichhari', name: 'Lakshmichhari' },
          { id: 'mahalchhari', name: 'Mahalchhari' },
          { id: 'manikchhari', name: 'Manikchhari' },
          { id: 'matiranga', name: 'Matiranga' },
          { id: 'panchhari', name: 'Panchhari' },
          { id: 'ramgarh', name: 'Ramgarh' },
        ]
      },
      {
        id: 'lakshmipur',
        name: 'Lakshmipur',
        upazillas: [
          { id: 'lakshmipur_sadar', name: 'Lakshmipur Sadar' },
          { id: 'kamalnagar', name: 'Kamalnagar' },
          { id: 'raipur', name: 'Raipur' },
          { id: 'ramganj', name: 'Ramganj' },
          { id: 'ramgati', name: 'Ramgati' },
        ]
      },
      {
        id: 'noakhali',
        name: 'Noakhali',
        upazillas: [
          { id: 'noakhali_sadar', name: 'Noakhali Sadar' },
          { id: 'begumganj', name: 'Begumganj' },
          { id: 'chatkhil', name: 'Chatkhil' },
          { id: 'companiganj', name: 'Companiganj' },
          { id: 'hatiya', name: 'Hatiya' },
          { id: 'kabirhat', name: 'Kabirhat' },
          { id: 'senbagh', name: 'Senbagh' },
          { id: 'sonaimuri', name: 'Sonaimuri' },
          { id: 'subarnachar', name: 'Subarnachar' },
        ]
      },
      {
        id: 'rangamati',
        name: 'Rangamati',
        upazillas: [
          { id: 'rangamati_sadar', name: 'Rangamati Sadar' },
          { id: 'baghaichhari', name: 'Baghaichhari' },
          { id: 'barkal', name: 'Barkal' },
          { id: 'kawkhali', name: 'Kawkhali' },
          { id: 'belaichhari', name: 'Belaichhari' },
          { id: 'juraichhari', name: 'Juraichhari' },
          { id: 'kaptai', name: 'Kaptai' },
          { id: 'langadu', name: 'Langadu' },
          { id: 'naniarchar', name: 'Naniarchar' },
          { id: 'rajasthali', name: 'Rajasthali' },
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
      {
        id: 'joypurhat',
        name: 'Joypurhat',
        upazillas: [
          { id: 'joypurhat_sadar', name: 'Joypurhat Sadar' },
          { id: 'akkelpur', name: 'Akkelpur' },
          { id: 'kalai', name: 'Kalai' },
          { id: 'khetlal', name: 'Khetlal' },
          { id: 'panchbibi', name: 'Panchbibi' },
        ]
      },
      {
        id: 'naogaon',
        name: 'Naogaon',
        upazillas: [
          { id: 'naogaon_sadar', name: 'Naogaon Sadar' },
          { id: 'atrai', name: 'Atrai' },
          { id: 'badalgachhi', name: 'Badalgachhi' },
          { id: 'dhamoirhat', name: 'Dhamoirhat' },
          { id: 'manda', name: 'Manda' },
          { id: 'mahadevpur', name: 'Mahadevpur' },
          { id: 'niamatpur', name: 'Niamatpur' },
          { id: 'patnitala', name: 'Patnitala' },
          { id: 'porsha', name: 'Porsha' },
          { id: 'raninagar', name: 'Raninagar' },
          { id: 'sapahar', name: 'Sapahar' },
        ]
      },
      {
        id: 'natore',
        name: 'Natore',
        upazillas: [
          { id: 'natore_sadar', name: 'Natore Sadar' },
          { id: 'bagatipara', name: 'Bagatipara' },
          { id: 'baraigram', name: 'Baraigram' },
          { id: 'gurudaspur', name: 'Gurudaspur' },
          { id: 'lalpur', name: 'Lalpur' },
          { id: 'singra', name: 'Singra' },
        ]
      },
      {
        id: 'pabna',
        name: 'Pabna',
        upazillas: [
          { id: 'pabna_sadar', name: 'Pabna Sadar' },
          { id: 'atgharia', name: 'Atgharia' },
          { id: 'bera', name: 'Bera' },
          { id: 'bhangura', name: 'Bhangura' },
          { id: 'chatmohar', name: 'Chatmohar' },
          { id: 'faridpur', name: 'Faridpur' },
          { id: 'ishwardi', name: 'Ishwardi' },
          { id: 'santhia', name: 'Santhia' },
          { id: 'sujanagar', name: 'Sujanagar' },
        ]
      },
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
        id: 'sirajganj',
        name: 'Sirajganj',
        upazillas: [
          { id: 'sirajganj_sadar', name: 'Sirajganj Sadar' },
          { id: 'belkuchi', name: 'Belkuchi' },
          { id: 'chauhali', name: 'Chauhali' },
          { id: 'kamarkhanda', name: 'Kamarkhanda' },
          { id: 'kazipur', name: 'Kazipur' },
          { id: 'raiganj', name: 'Raiganj' },
          { id: 'shahjadpur', name: 'Shahjadpur' },
          { id: 'tarash', name: 'Tarash' },
          { id: 'ullahpara', name: 'Ullahpara' },
        ]
      },
    ]
  },
  {
    id: 'khulna',
    name: 'Khulna',
    districts: [
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
      {
        id: 'jashore',
        name: 'Jashore',
        upazillas: [
          { id: 'jashore_sadar', name: 'Jashore Sadar' },
          { id: 'abhaynagar', name: 'Abhaynagar' },
          { id: 'bagherpara', name: 'Bagherpara' },
          { id: 'chaugachha', name: 'Chaugachha' },
          { id: 'jhikargachha', name: 'Jhikargachha' },
          { id: 'keshabpur', name: 'Keshabpur' },
          { id: 'manirampur', name: 'Manirampur' },
          { id: 'sharsha', name: 'Sharsha' },
        ]
      },
      {
        id: 'jhenaidah',
        name: 'Jhenaidah',
        upazillas: [
          { id: 'jhenaidah_sadar', name: 'Jhenaidah Sadar' },
          { id: 'harinakunda', name: 'Harinakunda' },
          { id: 'kaliganj', name: 'Kaliganj' },
          { id: 'kotchandpur', name: 'Kotchandpur' },
          { id: 'maheshpur', name: 'Maheshpur' },
          { id: 'shailkupa', name: 'Shailkupa' },
        ]
      },
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
        id: 'kushtia',
        name: 'Kushtia',
        upazillas: [
          { id: 'kushtia_sadar', name: 'Kushtia Sadar' },
          { id: 'bheramara', name: 'Bheramara' },
          { id: 'daulatpur', name: 'Daulatpur' },
          { id: 'khoksa', name: 'Khoksa' },
          { id: 'kumarkhali', name: 'Kumarkhali' },
          { id: 'mirpur', name: 'Mirpur' },
        ]
      },
      {
        id: 'magura',
        name: 'Magura',
        upazillas: [
          { id: 'magura_sadar', name: 'Magura Sadar' },
          { id: 'mohammadpur', name: 'Mohammadpur' },
          { id: 'shalikha', name: 'Shalikha' },
          { id: 'sreepur', name: 'Sreepur' },
        ]
      },
      {
        id: 'meherpur',
        name: 'Meherpur',
        upazillas: [
          { id: 'meherpur_sadar', name: 'Meherpur Sadar' },
          { id: 'gangni', name: 'Gangni' },
          { id: 'mujibnagar', name: 'Mujibnagar' },
        ]
      },
      {
        id: 'narail',
        name: 'Narail',
        upazillas: [
          { id: 'narail_sadar', name: 'Narail Sadar' },
          { id: 'kalia', name: 'Kalia' },
          { id: 'lohagara', name: 'Lohagara' },
        ]
      },
      {
        id: 'satkhira',
        name: 'Satkhira',
        upazillas: [
          { id: 'satkhira_sadar', name: 'Satkhira Sadar' },
          { id: 'assasuni', name: 'Assasuni' },
          { id: 'debhata', name: 'Debhata' },
          { id: 'kalaroa', name: 'Kalaroa' },
          { id: 'kaliganj', name: 'Kaliganj' },
          { id: 'patkelghata', name: 'Patkelghata' },
          { id: 'tala', name: 'Tala' },
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
      {
        id: 'jhalokati',
        name: 'Jhalokati',
        upazillas: [
          { id: 'jhalokati_sadar', name: 'Jhalokati Sadar' },
          { id: 'kathalia', name: 'Kathalia' },
          { id: 'nalchity', name: 'Nalchity' },
          { id: 'rajapur', name: 'Rajapur' },
        ]
      },
      {
        id: 'patuakhali',
        name: 'Patuakhali',
        upazillas: [
          { id: 'patuakhali_sadar', name: 'Patuakhali Sadar' },
          { id: 'bauphal', name: 'Bauphal' },
          { id: 'dashmina', name: 'Dashmina' },
          { id: 'dumki', name: 'Dumki' },
          { id: 'galachipa', name: 'Galachipa' },
          { id: 'kalapara', name: 'Kalapara' },
          { id: 'mirzaganj', name: 'Mirzaganj' },
          { id: 'rangabali', name: 'Rangabali' },
        ]
      },
      {
        id: 'pirojpur',
        name: 'Pirojpur',
        upazillas: [
          { id: 'pirojpur_sadar', name: 'Pirojpur Sadar' },
          { id: 'bhandaria', name: 'Bhandaria' },
          { id: 'kawkhali', name: 'Kawkhali' },
          { id: 'mathbaria', name: 'Mathbaria' },
          { id: 'nazirpur', name: 'Nazirpur' },
          { id: 'nesarabad', name: 'Nesarabad' },
          { id: 'zianagar', name: 'Zianagar' },
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
      {
        id: 'kurigram',
        name: 'Kurigram',
        upazillas: [
          { id: 'kurigram_sadar', name: 'Kurigram Sadar' },
          { id: 'bhurungamari', name: 'Bhurungamari' },
          { id: 'char_rajibpur', name: 'Char Rajibpur' },
          { id: 'chilmari', name: 'Chilmari' },
          { id: 'phulbari', name: 'Phulbari' },
          { id: 'nageshwari', name: 'Nageshwari' },
          { id: 'rajarhat', name: 'Rajarhat' },
          { id: 'raomari', name: 'Raomari' },
          { id: 'ulipur', name: 'Ulipur' },
        ]
      },
      {
        id: 'lalmonirhat',
        name: 'Lalmonirhat',
        upazillas: [
          { id: 'lalmonirhat_sadar', name: 'Lalmonirhat Sadar' },
          { id: 'aditmari', name: 'Aditmari' },
          { id: 'hatibandha', name: 'Hatibandha' },
          { id: 'kaliganj', name: 'Kaliganj' },
          { id: 'patgram', name: 'Patgram' },
        ]
      },
      {
        id: 'nilphamari',
        name: 'Nilphamari',
        upazillas: [
          { id: 'nilphamari_sadar', name: 'Nilphamari Sadar' },
          { id: 'dimla', name: 'Dimla' },
          { id: 'domar', name: 'Domar' },
          { id: 'jaldhaka', name: 'Jaldhaka' },
          { id: 'kishoreganj', name: 'Kishoreganj' },
          { id: 'saidpur', name: 'Saidpur' },
        ]
      },
      {
        id: 'panchagarh',
        name: 'Panchagarh',
        upazillas: [
          { id: 'panchagarh_sadar', name: 'Panchagarh Sadar' },
          { id: 'atwari', name: 'Atwari' },
          { id: 'boda', name: 'Boda' },
          { id: 'debiganj', name: 'Debiganj' },
          { id: 'tetulia', name: 'Tetulia' },
        ]
      },
      {
        id: 'thakurgaon',
        name: 'Thakurgaon',
        upazillas: [
          { id: 'thakurgaon_sadar', name: 'Thakurgaon Sadar' },
          { id: 'baliadangi', name: 'Baliadangi' },
          { id: 'haripur', name: 'Haripur' },
          { id: 'pirganj', name: 'Pirganj' },
          { id: 'ranisankail', name: 'Ranisankail' },
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
      {
        id: 'sherpur',
        name: 'Sherpur',
        upazillas: [
          { id: 'sherpur_sadar', name: 'Sherpur Sadar' },
          { id: 'jhenaigati', name: 'Jhenaigati' },
          { id: 'nakla', name: 'Nakla' },
          { id: 'nalitabari', name: 'Nalitabari' },
          { id: 'sreebardi', name: 'Sreebardi' },
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

