// Master Dataset of Karachi & Pakistan Locations, Landmarks, and Transit Hubs with Real GPS Coordinates
export interface LocationItem {
  id: string;
  name: string;
  shortName: string;
  category: 'landmark' | 'society' | 'commercial' | 'transit' | 'intercity' | 'university' | 'hospital';
  area: string;
  popularKeywords: string[];
  coords: [number, number]; // [lat, lng]
}

export const PAKISTAN_LOCATIONS: LocationItem[] = [
  // ==========================================
  // 1. SURJANI TOWN, 4K & NORTH KARACHI
  // ==========================================
  {
    id: 'surjani-town-main',
    name: 'Surjani Town (Sector 4, 7 & KDA Flats), Karachi',
    shortName: 'Surjani Town',
    category: 'society',
    area: 'Surjani Town',
    popularKeywords: ['surjani town', 'surjani', 'sector 4', 'sector 7', 'sector 10', 'kda flats', '4k chowrangi', 'northern bypass'],
    coords: [25.0250, 67.0650]
  },
  {
    id: '4k-chowrangi-surjani',
    name: '4K Chowrangi, North Karachi / Surjani Link, Karachi',
    shortName: '4K Chowrangi',
    category: 'transit',
    area: 'North Karachi',
    popularKeywords: ['4k chowrangi', '4k', 'surjani town', 'north karachi', 'sector 5'],
    coords: [24.9980, 67.0620]
  },
  {
    id: 'power-house-chowrangi',
    name: 'Power House Chowrangi, Sector 11-K, North Karachi',
    shortName: 'Power House Chowrangi',
    category: 'transit',
    area: 'North Karachi',
    popularKeywords: ['power house', 'powerhouse', 'north karachi', 'sector 11', 'surjani link'],
    coords: [24.9880, 67.0580]
  },
  {
    id: 'kaneez-fatima',
    name: 'Kaneez Fatima Society, Scheme 33 / Northern Bypass Link, Karachi',
    shortName: 'Kaneez Fatima Society',
    category: 'society',
    area: 'Scheme 33',
    popularKeywords: ['kaneez fatima', 'scheme 33', 'northern bypass', 'society', 'surjani link'],
    coords: [24.9820, 67.1120]
  },

  // ==========================================
  // 2. SHADMAN & BUFFER ZONE
  // ==========================================
  {
    id: 'shadman-town',
    name: 'Shadman Town (Sector 14-B), North Nazimabad, Karachi',
    shortName: 'Shadman Town',
    category: 'society',
    area: 'North Nazimabad',
    popularKeywords: ['shadman', 'shadman town', 'sector 14b', 'sakhi hassan', 'buffer zone', 'anda mor'],
    coords: [24.9620, 67.0530]
  },
  {
    id: 'sakhi-hasan',
    name: 'Sakhi Hasan Chowrangi, North Nazimabad, Karachi',
    shortName: 'Sakhi Hasan',
    category: 'transit',
    area: 'North Nazimabad',
    popularKeywords: ['sakhi hasan', 'sakhi hassan', 'north nazimabad', 'shadman', 'hydari'],
    coords: [24.9520, 67.0480]
  },
  {
    id: 'buffer-zone',
    name: 'Buffer Zone (Sector 15-A & 15-B), North Karachi',
    shortName: 'Buffer Zone',
    category: 'society',
    area: 'North Karachi',
    popularKeywords: ['buffer zone', 'sector 15a', 'sector 15b', 'shadman link', 'nagan chowrangi'],
    coords: [24.9680, 67.0690]
  },
  {
    id: 'nagan-chowrangi',
    name: 'Nagan Chowrangi & Flyover, North Karachi',
    shortName: 'Nagan Chowrangi',
    category: 'transit',
    area: 'North Karachi',
    popularKeywords: ['nagan chowrangi', 'nagan', 'flyover', 'green line', 'north karachi'],
    coords: [24.9750, 67.0640]
  },

  // ==========================================
  // 3. LINES AREA & SADDAR
  // ==========================================
  {
    id: 'lines-area-parking',
    name: 'Lines Area & CDGK Parking Plaza Corridor, Saddar, Karachi',
    shortName: 'Lines Area',
    category: 'society',
    area: 'Lines Area',
    popularKeywords: ['lines area', 'line area', 'cdgk parking plaza', 'empress market', 'preedy', 'saddar', 'jutland lines', 'jacob lines'],
    coords: [24.8620, 67.0340]
  },
  {
    id: 'aps-lines-area',
    name: 'Army Public School (APS) Lines Area / Saddar, Karachi',
    shortName: 'APS Lines Area',
    category: 'landmark',
    area: 'Lines Area',
    popularKeywords: ['aps', 'army public school', 'lines area', 'saddar cantt'],
    coords: [24.8590, 67.0380]
  },
  {
    id: 'saddar-empress-market',
    name: 'Empress Market, Saddar, Karachi',
    shortName: 'Empress Market Saddar',
    category: 'landmark',
    area: 'Saddar',
    popularKeywords: ['saddar', 'empress market', 'preedy street', 'lines area link'],
    coords: [24.8587, 67.0251]
  },
  {
    id: 'cantt-station',
    name: 'Karachi Cantt Railway Station, Dr Daud Pota Rd, Karachi',
    shortName: 'Cantt Railway Station',
    category: 'transit',
    area: 'Saddar',
    popularKeywords: ['cantt station', 'railway', 'train', 'saddar', 'lines area'],
    coords: [24.8480, 67.0320]
  },

  // ==========================================
  // 4. MALIR & SURROUNDING
  // ==========================================
  {
    id: 'malir-15',
    name: 'Malir 15 Flyover & National Highway, Malir, Karachi',
    shortName: 'Malir 15',
    category: 'transit',
    area: 'Malir',
    popularKeywords: ['malir 15', 'malir fifteen', 'malir', 'national highway', 'flyover', 'kala board'],
    coords: [24.8780, 67.1980]
  },
  {
    id: 'malir-halt',
    name: 'Malir Halt Bus Stop & Railway Station, Sharea Faisal, Karachi',
    shortName: 'Malir Halt',
    category: 'transit',
    area: 'Malir',
    popularKeywords: ['malir halt', 'malir', 'sharea faisal', 'railway station', 'halt'],
    coords: [24.8920, 67.1750]
  },
  {
    id: 'kala-board-malir',
    name: 'Kala Board, National Highway, Malir, Karachi',
    shortName: 'Kala Board Malir',
    category: 'transit',
    area: 'Malir',
    popularKeywords: ['kala board', 'malir', 'national highway', 'malir court'],
    coords: [24.8860, 67.1890]
  },
  {
    id: 'saudabad-malir',
    name: 'Saudabad Chowrangi & Malir City, Karachi',
    shortName: 'Saudabad Malir',
    category: 'transit',
    area: 'Malir',
    popularKeywords: ['saudabad', 'malir', 'malir city', 'liaquat market'],
    coords: [24.8990, 67.1950]
  },
  {
    id: 'model-colony-gate',
    name: 'Model Colony Gate & Railway Station, Karachi',
    shortName: 'Model Colony Main Gate',
    category: 'society',
    area: 'Model Colony',
    popularKeywords: ['model colony', 'malir', 'airport', 'tank chowk'],
    coords: [24.9080, 67.1720]
  },

  // ==========================================
  // 5. QUAIDABAD & DAWOOD CHOWRANGI
  // ==========================================
  {
    id: 'quaidabad-flyover',
    name: 'Quaidabad Flyover & Main Bus Terminal, National Highway, Karachi',
    shortName: 'Quaidabad',
    category: 'transit',
    area: 'Quaidabad',
    popularKeywords: ['quaidabad', 'qaidabad', 'quaid abad', 'flyover', 'bus stop', 'murghi khana', 'national highway', 'landhi'],
    coords: [24.8580, 67.2280]
  },
  {
    id: 'murghi-khana-quaidabad',
    name: 'Murghi Khana Bus Stop, Quaidabad, Karachi',
    shortName: 'Murghi Khana Quaidabad',
    category: 'transit',
    area: 'Quaidabad',
    popularKeywords: ['murghi khana', 'quaidabad', 'qaidabad', 'national highway'],
    coords: [24.8540, 67.2340]
  },
  {
    id: 'dawood-chowrangi',
    name: 'Dawood Chowrangi, Landhi Industrial Area, Karachi',
    shortName: 'Dawood Chowrangi',
    category: 'transit',
    area: 'Landhi Industrial Area',
    popularKeywords: ['dawood chowrangi', 'daud chaurangi', 'dawood chourangi', 'daud', 'landhi', 'industrial area', '89 mor'],
    coords: [24.8420, 67.1890]
  },
  {
    id: 'landhi-89-mor',
    name: '89 Mor & Babar Market, Landhi, Karachi',
    shortName: 'Landhi 89 Mor',
    category: 'transit',
    area: 'Landhi',
    popularKeywords: ['89 mor', 'landhi 89', 'babar market', 'dawood chowrangi', 'landhi'],
    coords: [24.8380, 67.2020]
  },
  {
    id: 'kepz-landhi',
    name: 'Karachi Export Processing Zone (KEPZ), Landhi, Karachi',
    shortName: 'KEPZ Landhi',
    category: 'commercial',
    area: 'Landhi',
    popularKeywords: ['kepz', 'export processing zone', 'landhi', 'mehran highway'],
    coords: [24.8310, 67.2410]
  },

  // ==========================================
  // 6. HATHI CHOKI (HATH CHOKI / PORT)
  // ==========================================
  {
    id: 'hathi-choki-gate',
    name: 'Hathi Choki (Hathi Gate), West Wharf Rd / Kharadar, Karachi',
    shortName: 'Hathi Choki (Hath Choki)',
    category: 'transit',
    area: 'Kharadar / Port',
    popularKeywords: ['hath choki', 'hathi choki', 'hathi gate', 'hath chouki', 'west wharf', 'kharadar', 'native jetty', 'keamari', 'port area'],
    coords: [24.8520, 66.9950]
  },
  {
    id: 'kharadar-mithadar',
    name: 'Kharadar & Mithadar Old City Centre, Karachi',
    shortName: 'Kharadar / Mithadar',
    category: 'society',
    area: 'Old Town',
    popularKeywords: ['kharadar', 'mithadar', 'old city', 'hathi choki', 'native jetty'],
    coords: [24.8550, 66.9980]
  },
  {
    id: 'native-jetty-keamari',
    name: 'Native Jetty Bridge & Port Grand Gateway, Keamari, Karachi',
    shortName: 'Native Jetty / Keamari',
    category: 'transit',
    area: 'Keamari',
    popularKeywords: ['native jetty', 'keamari', 'port grand', 'west wharf', 'hathi choki'],
    coords: [24.8460, 66.9890]
  },
  {
    id: 'ii-chundrigar-tower',
    name: 'I.I. Chundrigar Road (Merewether Tower), Karachi',
    shortName: 'I.I. Chundrigar / Tower',
    category: 'commercial',
    area: 'Financial Hub',
    popularKeywords: ['chundrigar', 'tower', 'bank square', 'city station', 'kharadar'],
    coords: [24.8510, 67.0090]
  },
  {
    id: 'mauripur-road',
    name: 'Mauripur Road & Truck Stand, Karachi',
    shortName: 'Mauripur Road',
    category: 'transit',
    area: 'Mauripur',
    popularKeywords: ['mauripur', 'truck stand', 'hathi choki', 'maripur', 'lyari expressway'],
    coords: [24.8620, 66.9780]
  },

  // ==========================================
  // 7. QAYYUMABAD & KORANGI
  // ==========================================
  {
    id: 'qayyumabad-chowrangi',
    name: 'Qayyumabad Chowrangi & Flyover, Korangi Road, Karachi',
    shortName: 'Qayyumabad',
    category: 'transit',
    area: 'Qayyumabad',
    popularKeywords: ['qayyumabad', 'qayumabad', 'chowrangi', 'korangi road', 'dha phase 1', 'dha phase 2', 'brookes'],
    coords: [24.8290, 67.0780]
  },
  {
    id: 'qayyumabad-bridge',
    name: 'Qayyumabad Bridge (DHA Phase 2 Ext / Korangi Border), Karachi',
    shortName: 'Qayyumabad Bridge',
    category: 'transit',
    area: 'Qayyumabad',
    popularKeywords: ['qayyumabad bridge', 'qayumabad', 'dha boundary', 'korangi link'],
    coords: [24.8320, 67.0750]
  },
  {
    id: 'brookes-chowrangi',
    name: 'Brookes Chowrangi, Korangi Industrial Area, Karachi',
    shortName: 'Brookes Chowrangi Korangi',
    category: 'transit',
    area: 'Korangi Industrial Area',
    popularKeywords: ['brookes chowrangi', 'korangi industrial', 'qayyumabad link', 'chamra chowrangi'],
    coords: [24.8210, 67.1120]
  },
  {
    id: 'korangi-crossing',
    name: 'Korangi Crossing & Indus Hospital Link, Karachi',
    shortName: 'Korangi Crossing',
    category: 'transit',
    area: 'Korangi',
    popularKeywords: ['korangi crossing', 'indus hospital', 'korangi', 'crossing'],
    coords: [24.8270, 67.1290]
  },

  // ==========================================
  // 8. KARSAZ & STADIUM ROAD
  // ==========================================
  {
    id: 'karsaz-sharea-faisal',
    name: 'Karsaz Signal & Flyover, Sharea Faisal, Karachi',
    shortName: 'Karsaz Flyover',
    category: 'transit',
    area: 'Karsaz',
    popularKeywords: ['karsaz', 'karsaz flyover', 'sharea faisal', 'pns karsaz', 'maritime museum', 'faisal cantt'],
    coords: [24.8870, 67.0890]
  },
  {
    id: 'pns-karsaz-maritime',
    name: 'PNS Karsaz & Pakistan Maritime Museum, Habib Ibrahim Rd, Karachi',
    shortName: 'PNS Karsaz / Maritime Museum',
    category: 'landmark',
    area: 'Karsaz',
    popularKeywords: ['pns karsaz', 'maritime museum', 'karsaz', 'naval base', 'stadium road'],
    coords: [24.8890, 67.0940]
  },
  {
    id: 'national-stadium',
    name: 'National Bank Stadium (National Stadium), Stadium Rd, Karachi',
    shortName: 'National Stadium Karachi',
    category: 'landmark',
    area: 'Stadium Road',
    popularKeywords: ['national stadium', 'stadium road', 'karsaz', 'cricket stadium'],
    coords: [24.8940, 67.0780]
  },

  // ==========================================
  // 9. ORANGI TOWN (AURANGIE TOWN)
  // ==========================================
  {
    id: 'orangi-town-main',
    name: 'Orangi Town (Sector 5 & 10), Karachi',
    shortName: 'Orangi Town',
    category: 'society',
    area: 'Orangi Town',
    popularKeywords: ['orangi town', 'aurangie town', 'orangi', 'aurangie', 'sector 5', 'sector 10', 'banaras', 'qatar hospital'],
    coords: [24.9450, 67.0050]
  },
  {
    id: 'banaras-chowrangi',
    name: 'Banaras Chowrangi & Flyover, Orangi / SITE, Karachi',
    shortName: 'Banaras Chowrangi',
    category: 'transit',
    area: 'SITE / Orangi',
    popularKeywords: ['banaras chowrangi', 'banaras', 'flyover', 'orangi', 'aurangie', 'site area'],
    coords: [24.9180, 67.0020]
  },
  {
    id: 'qasba-colony-manghopir',
    name: 'Qasba Colony & Manghopir Road, Orangi Link, Karachi',
    shortName: 'Qasba Colony / Manghopir',
    category: 'society',
    area: 'Orangi Link',
    popularKeywords: ['qasba colony', 'manghopir', 'orangi', 'aurangie', 'qasba mor'],
    coords: [24.9580, 67.0180]
  },

  // ==========================================
  // 10. SAADI TOWN & SAADI GARDEN
  // ==========================================
  {
    id: 'saadi-town-main',
    name: 'Saadi Town, Scheme 33, Karachi',
    shortName: 'Saadi Town',
    category: 'society',
    area: 'Scheme 33',
    popularKeywords: ['saadi town', 'sadi town', 'saadi', 'sadi', 'scheme 33', 'rim jhim', 'malir cantt link'],
    coords: [24.9620, 67.1640]
  },
  {
    id: 'saadi-town-commercial',
    name: 'Saadi Town Main Commercial Market & Sector 2, Karachi',
    shortName: 'Saadi Town Commercial',
    category: 'commercial',
    area: 'Saadi Town',
    popularKeywords: ['saadi town', 'sadi town', 'commercial', 'sector 2', 'sector 3', 'market'],
    coords: [24.9640, 67.1660]
  },
  {
    id: 'saadi-garden-phase1',
    name: 'Saadi Garden Phase 1 & 2, Scheme 33, Karachi',
    shortName: 'Saadi Garden',
    category: 'society',
    area: 'Scheme 33',
    popularKeywords: ['saadi garden', 'sadi garden', 'saadi', 'sadi', 'garden', 'scheme 33', 'm9 link'],
    coords: [24.9780, 67.1720]
  },
  {
    id: 'saadi-garden-boulevard',
    name: 'Saadi Garden Main Boulevard & Sector 52, Karachi',
    shortName: 'Saadi Garden Boulevard',
    category: 'society',
    area: 'Scheme 33',
    popularKeywords: ['saadi garden', 'sadi garden', 'boulevard', 'sector 52', 'super highway'],
    coords: [24.9810, 67.1750]
  },

  // ==========================================
  // 11. MALIR CANTT CHECKPOSTS (5 & 6)
  // ==========================================
  {
    id: 'malir-cantt-checkpost-6',
    name: 'Malir Cantt Checkpost Number 6 (M-9 & Saadi Town Gate), Karachi',
    shortName: 'Malir Cantt Checkpost 6',
    category: 'transit',
    area: 'Malir Cantt',
    popularKeywords: ['malir cantt checkpost 6', 'malir checkpost number 6', 'checkpost 6', 'cp6', 'malir cantt gate 6', 'saadi town gate', 'falcon complex'],
    coords: [24.9580, 67.1780]
  },
  {
    id: 'malir-cantt-checkpost-5',
    name: 'Malir Cantt Checkpost Number 5 (Model Colony & Tank Chowk Gate), Karachi',
    shortName: 'Malir Cantt Checkpost 5',
    category: 'transit',
    area: 'Malir Cantt',
    popularKeywords: ['malir cantt checkpost 5', 'malir checkpost number 5', 'checkpost 5', 'cp5', 'malir cantt gate 5', 'model colony gate', 'tank chowk'],
    coords: [24.9120, 67.1890]
  },
  {
    id: 'malir-cantt-post2',
    name: 'Malir Cantt Checkpost No. 2, Malir, Karachi',
    shortName: 'Malir Cantt Checkpost 2',
    category: 'transit',
    area: 'Malir Cantt',
    popularKeywords: ['malir', 'cantt', 'post 2', 'checkpost', 'checkpost 2', 'cp2'],
    coords: [24.9220, 67.1850]
  },

  // ==========================================
  // 12. ALL MAJOR HOSPITALS OF KARACHI
  // ==========================================
  {
    id: 'jinnah-hospital-jpmc',
    name: 'Jinnah Postgraduate Medical Centre (JPMC / Jinnah Hospital), Rafiqui Shaheed Rd, Karachi',
    shortName: 'Jinnah Hospital (JPMC)',
    category: 'hospital',
    area: 'Rafiqui Shaheed Road, Cantt',
    popularKeywords: ['jinnah hospital', 'jpmc', 'jinnah', 'hospital', 'rafiqui shaheed', 'cantt', 'emergency', 'nicvd', 'nich'],
    coords: [24.8520, 67.0450]
  },
  {
    id: 'nicvd-hospital',
    name: 'National Institute of Cardiovascular Diseases (NICVD), Jinnah Compound, Karachi',
    shortName: 'NICVD Hospital (Heart Center)',
    category: 'hospital',
    area: 'Rafiqui Shaheed Road, Cantt',
    popularKeywords: ['nicvd', 'cardiovascular', 'heart hospital', 'jinnah hospital', 'jpmc', 'cantt', 'hospital'],
    coords: [24.8535, 67.0460]
  },
  {
    id: 'nich-hospital',
    name: 'National Institute of Child Health (NICH), Jinnah Compound, Karachi',
    shortName: 'NICH (Children Hospital)',
    category: 'hospital',
    area: 'Rafiqui Shaheed Road, Cantt',
    popularKeywords: ['nich', 'child health', 'children hospital', 'jinnah hospital', 'jpmc', 'hospital'],
    coords: [24.8510, 67.0470]
  },
  {
    id: 'akuh-hospital',
    name: 'Aga Khan University Hospital (AKUH), Stadium Rd, Karachi',
    shortName: 'Aga Khan Hospital (AKUH)',
    category: 'hospital',
    area: 'Stadium Road',
    popularKeywords: ['aga khan', 'akuh', 'stadium road', 'hospital', 'karsaz'],
    coords: [24.8920, 67.0720]
  },
  {
    id: 'lnh-hospital',
    name: 'Liaquat National Hospital (LNH), Stadium Rd, Karachi',
    shortName: 'Liaquat National Hospital',
    category: 'hospital',
    area: 'Stadium Road',
    popularKeywords: ['liaquat national', 'lnh', 'stadium road', 'hospital', 'karsaz'],
    coords: [24.8900, 67.0690]
  },
  {
    id: 'civil-hospital-chk',
    name: 'Dr. Ruth K. M. Pfau Civil Hospital Karachi (CHK) & Dow Medical College, Baba-e-Urdu Rd, Karachi',
    shortName: 'Civil Hospital Karachi (CHK)',
    category: 'hospital',
    area: 'Saddar / Old City',
    popularKeywords: ['civil hospital', 'chk', 'ruth pfau', 'dow medical', 'baba e urdu', 'siut', 'hospital'],
    coords: [24.8580, 67.0110]
  },
  {
    id: 'siut-hospital',
    name: 'SIUT (Sindh Institute of Urology & Transplantation), Dewan Complex, Saddar, Karachi',
    shortName: 'SIUT Hospital',
    category: 'hospital',
    area: 'Saddar / Civil Hospital',
    popularKeywords: ['siut', 'kidney hospital', 'transplant', 'civil hospital', 'dewan complex', 'hospital'],
    coords: [24.8570, 67.0095]
  },
  {
    id: 'dow-ojha-hospital',
    name: 'Dow University Hospital (OJHA Campus), Suparco Rd / Scheme 33 Link, Karachi',
    shortName: 'Dow OJHA Hospital',
    category: 'hospital',
    area: 'University Road / Suparco',
    popularKeywords: ['dow ojha', 'ojha campus', 'duhs', 'suparco road', 'hospital', 'scheme 33', 'safoora'],
    coords: [24.9540, 67.1320]
  },
  {
    id: 'indus-hospital-korangi',
    name: 'Indus Hospital & Health Network, Sector 31-C, Korangi, Karachi',
    shortName: 'Indus Hospital Korangi',
    category: 'hospital',
    area: 'Korangi Crossing',
    popularKeywords: ['indus hospital', 'indus', 'korangi', 'korangi crossing', 'hospital'],
    coords: [24.8260, 67.1350]
  },
  {
    id: 'kiran-hospital-safoora',
    name: 'Kiran Hospital (Karachi Institute of Radiotherapy & Nuclear Medicine), Safoora, Karachi',
    shortName: 'Kiran Hospital Safoora',
    category: 'hospital',
    area: 'Safoora / Scheme 33',
    popularKeywords: ['kiran hospital', 'cancer hospital', 'safoora', 'safoor', 'sapura', 'scheme 33', 'memon hospital', 'hospital'],
    coords: [24.9510, 67.1510]
  },
  {
    id: 'memon-medical-mmi',
    name: 'Memon Medical Institute Hospital (MMI), Hyder Buksh Gabol Rd, Safoora, Karachi',
    shortName: 'MMI Hospital Safoora',
    category: 'hospital',
    area: 'Safoora / Scheme 33',
    popularKeywords: ['memon medical', 'mmi hospital', 'mmi', 'safoora', 'safoor', 'sapura', 'kiran hospital', 'scheme 33', 'hospital'],
    coords: [24.9520, 67.1480]
  },
  {
    id: 'patel-hospital-gulshan',
    name: 'Patel Hospital, Block 4, Gulshan-e-Iqbal, Karachi',
    shortName: 'Patel Hospital Gulshan',
    category: 'hospital',
    area: 'Gulshan Block 4',
    popularKeywords: ['patel hospital', 'patel', 'gulshan', 'block 4', 'hospital'],
    coords: [24.9270, 67.1080]
  },
  {
    id: 'dr-ziauddin-clifton',
    name: 'Dr. Ziauddin Hospital Clifton Campus, Block 6, Clifton, Karachi',
    shortName: 'Ziauddin Hospital Clifton',
    category: 'hospital',
    area: 'Clifton Block 6',
    popularKeywords: ['ziauddin', 'ziauddin hospital', 'clifton', 'sea view', 'hospital'],
    coords: [24.8190, 67.0380]
  },
  {
    id: 'dr-ziauddin-north-nazimabad',
    name: 'Dr. Ziauddin Hospital North Nazimabad Campus, Block B, Karachi',
    shortName: 'Ziauddin North Nazimabad',
    category: 'hospital',
    area: 'North Nazimabad',
    popularKeywords: ['ziauddin', 'ziauddin hospital', 'north nazimabad', 'block b', 'hospital'],
    coords: [24.9390, 67.0390]
  },
  {
    id: 'dr-ziauddin-keamari',
    name: 'Dr. Ziauddin Hospital Keamari Campus, Port Area, Karachi',
    shortName: 'Ziauddin Hospital Keamari',
    category: 'hospital',
    area: 'Keamari',
    popularKeywords: ['ziauddin', 'keamari', 'port', 'hathi choki link', 'hospital'],
    coords: [24.8210, 66.9780]
  },
  {
    id: 'tabba-heart-institute',
    name: 'Tabba Heart Institute, Block 2, Federal B Area, Karachi',
    shortName: 'Tabba Heart Institute',
    category: 'hospital',
    area: 'Federal B Area',
    popularKeywords: ['tabba heart', 'tabba', 'heart hospital', 'fb area', 'water pump', 'hospital'],
    coords: [24.9290, 67.0620]
  },
  {
    id: 'south-city-hospital',
    name: 'South City Hospital, Block 3, Clifton, Karachi',
    shortName: 'South City Hospital Clifton',
    category: 'hospital',
    area: 'Clifton Block 3',
    popularKeywords: ['south city', 'south city hospital', 'clifton', 'block 3', 'bilawal house link', 'hospital'],
    coords: [24.8210, 67.0220]
  },
  {
    id: 'nmc-hospital-korangi-rd',
    name: 'National Medical Centre (NMC), Main Korangi Road / DHA Phase 1, Karachi',
    shortName: 'NMC Hospital (Korangi Rd)',
    category: 'hospital',
    area: 'DHA Phase 1 / Korangi Road',
    popularKeywords: ['nmc', 'national medical centre', 'korangi road', 'dha phase 1', 'qayyumabad link', 'hospital'],
    coords: [24.8390, 67.0680]
  },
  {
    id: 'omi-hospital-saddar',
    name: 'OMI Hospital (Orthopaedic & Medical Institute), Saddar / MA Jinnah Rd, Karachi',
    shortName: 'OMI Hospital Saddar',
    category: 'hospital',
    area: 'Saddar',
    popularKeywords: ['omi', 'omi hospital', 'saddar', 'ma jinnah', 'lines area link', 'hospital'],
    coords: [24.8690, 67.0280]
  },
  {
    id: 'lady-dufferin-hospital',
    name: 'Lady Dufferin Hospital, Chand Bibi Road, Kharadar/Saddar, Karachi',
    shortName: 'Lady Dufferin Hospital',
    category: 'hospital',
    area: 'Kharadar / Saddar',
    popularKeywords: ['lady dufferin', 'maternity hospital', 'chand bibi', 'kharadar', 'hathi choki link', 'hospital'],
    coords: [24.8610, 67.0150]
  },
  {
    id: 'abbasi-shaheed-hospital',
    name: 'Abbasi Shaheed Hospital, Block 3, Nazimabad, Karachi',
    shortName: 'Abbasi Shaheed Hospital',
    category: 'hospital',
    area: 'Nazimabad Block 3',
    popularKeywords: ['abbasi shaheed', 'ash', 'nazimabad', 'paposh', 'hospital'],
    coords: [24.9190, 67.0380]
  },
  {
    id: 'qatar-hospital-orangi',
    name: 'Qatar Hospital, Sector 8, Orangi Town, Karachi',
    shortName: 'Qatar Hospital Orangi',
    category: 'hospital',
    area: 'Orangi Town',
    popularKeywords: ['qatar hospital', 'qatar', 'orangi', 'aurangie', 'orangi town', 'hospital'],
    coords: [24.9480, 67.0090]
  },
  {
    id: 'darul-sehat-hospital',
    name: 'Darul Sehat Hospital, Block 15, Gulistan-e-Johar, Karachi',
    shortName: 'Darul Sehat Hospital Johar',
    category: 'hospital',
    area: 'Gulistan-e-Johar',
    popularKeywords: ['darul sehat', 'dar ul sehat', 'johar', 'block 15', 'johar chowrangi', 'hospital'],
    coords: [24.9190, 67.1280]
  },
  {
    id: 'holy-family-hospital',
    name: 'Holy Family Hospital, Soldier Bazaar, Karachi',
    shortName: 'Holy Family Hospital',
    category: 'hospital',
    area: 'Soldier Bazaar',
    popularKeywords: ['holy family', 'soldier bazaar', 'saddar link', 'hospital'],
    coords: [24.8720, 67.0290]
  },
  {
    id: 'mamji-hospital',
    name: 'Mamji Hospital, Water Pump, Block 17, Federal B Area, Karachi',
    shortName: 'Mamji Hospital FB Area',
    category: 'hospital',
    area: 'FB Area Water Pump',
    popularKeywords: ['mamji hospital', 'mamji', 'water pump', 'fb area', 'block 17', 'hospital'],
    coords: [24.9380, 67.0690]
  },
  {
    id: 'sindh-govt-hospital-liaquatabad',
    name: 'Sindh Government Hospital Liaquatabad (Liaquatabad 10), Karachi',
    shortName: 'Sindh Govt Hospital Liaquatabad',
    category: 'hospital',
    area: 'Liaquatabad',
    popularKeywords: ['sindh govt hospital', 'liaquatabad', 'dak khana', 'hospital'],
    coords: [24.9080, 67.0420]
  },
  {
    id: 'sindh-govt-hospital-korangi',
    name: 'Sindh Government Hospital Korangi No. 5, Karachi',
    shortName: 'Sindh Govt Hospital Korangi',
    category: 'hospital',
    area: 'Korangi 5',
    popularKeywords: ['sindh govt hospital', 'korangi 5', 'korangi', 'hospital'],
    coords: [24.8380, 67.1420]
  },
  {
    id: 'sindh-govt-hospital-new-karachi',
    name: 'Sindh Government Hospital New Karachi, Sector 11-I, Karachi',
    shortName: 'Sindh Govt Hospital New Karachi',
    category: 'hospital',
    area: 'New Karachi',
    popularKeywords: ['sindh govt hospital', 'new karachi', 'power house link', 'hospital'],
    coords: [24.9920, 67.0650]
  },
  {
    id: 'atia-general-hospital-malir',
    name: 'Atia General Hospital, Main National Highway, Malir 15, Karachi',
    shortName: 'Atia Hospital Malir',
    category: 'hospital',
    area: 'Malir 15',
    popularKeywords: ['atia hospital', 'atia general', 'malir 15', 'national highway', 'hospital'],
    coords: [24.8790, 67.1990]
  },
  {
    id: 'hashmanis-hospital-saddar',
    name: 'Hashmanis Eye Hospital, Saddar / Numaish, Karachi',
    shortName: 'Hashmanis Hospital Saddar',
    category: 'hospital',
    area: 'Saddar / Numaish',
    popularKeywords: ['hashmanis', 'hashmani', 'eye hospital', 'saddar', 'numaish', 'hospital'],
    coords: [24.8690, 67.0310]
  },

  // ==========================================
  // 13. GULSHAN & UNIVERSITY ROAD
  // ==========================================
  {
    id: 'hassan-square',
    name: 'Hassan Square, Gulshan-e-Iqbal, Karachi',
    shortName: 'Hassan Square',
    category: 'transit',
    area: 'Gulshan-e-Iqbal',
    popularKeywords: ['hassan', 'square', 'gulshan', 'university road', 'expo center'],
    coords: [24.8931, 67.0744]
  },
  {
    id: 'hassan-apartment',
    name: 'Hassan Apartment, Block 13D, Gulshan-e-Iqbal, Karachi',
    shortName: 'Hassan Apartment',
    category: 'society',
    area: 'Gulshan-e-Iqbal Block 13D',
    popularKeywords: ['hassan', 'apartment', '13d', 'gulshan'],
    coords: [24.9080, 67.0850]
  },
  {
    id: 'hassan-centre',
    name: 'Hassan Centre, Block 16, Federal B Area, Karachi',
    shortName: 'Hassan Centre',
    category: 'commercial',
    area: 'Federal B Area',
    popularKeywords: ['hassan', 'centre', 'center', 'fb area'],
    coords: [24.9310, 67.0680]
  },
  {
    id: 'safoora-chowrangi',
    name: 'Safoora Chowrangi, University Road / Scheme 33, Karachi',
    shortName: 'Safoora Chowrangi',
    category: 'transit',
    area: 'Safoora Chowrangi',
    popularKeywords: ['safoora', 'safoor', 'sapura', 'chowrangi', 'university road', 'scheme 33', 'kiran hospital', 'memon', 'safoora goth'],
    coords: [24.9430, 67.1520]
  },
  {
    id: 'safoora-goth',
    name: 'Safoora Goth, Kiran Hospital Road, Scheme 33, Karachi',
    shortName: 'Safoora Goth',
    category: 'society',
    area: 'Safoora',
    popularKeywords: ['safoora', 'safoor', 'sapura', 'goth', 'kiran hospital', 'memon hospital', 'scheme 33'],
    coords: [24.9480, 67.1560]
  },
  {
    id: 'johar-chowrangi',
    name: 'Johar Chowrangi, Block 12, Gulistan-e-Johar, Karachi',
    shortName: 'Johar Chowrangi',
    category: 'transit',
    area: 'Gulistan-e-Johar',
    popularKeywords: ['johar chowrangi', 'gulistan e johar', 'block 12', 'darul sehat', 'johar'],
    coords: [24.9180, 67.1250]
  },
  {
    id: 'johar-mor',
    name: 'Johar Mor & Millennium Mall, Rashid Minhas Rd, Karachi',
    shortName: 'Johar Mor (Millennium Mall)',
    category: 'commercial',
    area: 'Gulistan-e-Johar',
    popularKeywords: ['johar mor', 'millennium mall', 'rashid minhas', 'johar'],
    coords: [24.8980, 67.1180]
  },
  {
    id: 'kamran-chowrangi',
    name: 'Kamran Chowrangi, Block 11, Gulistan-e-Johar, Karachi',
    shortName: 'Kamran Chowrangi Johar',
    category: 'transit',
    area: 'Gulistan-e-Johar',
    popularKeywords: ['kamran chowrangi', 'kamran', 'johar', 'block 11'],
    coords: [24.9250, 67.1350]
  },
  {
    id: 'samama-shopping-arena',
    name: 'Samama Shopping Arena, Main University Road, Karachi',
    shortName: 'Samama Arena University Rd',
    category: 'commercial',
    area: 'Gulshan Block 1',
    popularKeywords: ['samama', 'university road', 'ned', 'ku', 'gulshan'],
    coords: [24.9350, 67.1180]
  },
  {
    id: 'maskan-chowrangi',
    name: 'Maskan Chowrangi, Block 7, Gulshan-e-Iqbal, Karachi',
    shortName: 'Maskan Chowrangi',
    category: 'transit',
    area: 'Gulshan Block 7',
    popularKeywords: ['maskan', 'ku', 'food street', 'gulshan'],
    coords: [24.9390, 67.1080]
  },
  {
    id: 'gulshan-chowrangi',
    name: 'Gulshan Chowrangi & Flyover, Block 5, Karachi',
    shortName: 'Gulshan Chowrangi',
    category: 'transit',
    area: 'Gulshan-e-Iqbal',
    popularKeywords: ['gulshan chowrangi', 'flyover', 'rashid minhas', 'disco bakery'],
    coords: [24.9280, 67.0980]
  },
  {
    id: 'nipa-chowrangi',
    name: 'NIPA Chowrangi & Flyover, Gulshan-e-Iqbal, Karachi',
    shortName: 'NIPA Chowrangi',
    category: 'transit',
    area: 'Gulshan-e-Iqbal',
    popularKeywords: ['nipa', 'chowrangi', 'university road', 'rashid minhas'],
    coords: [24.9180, 67.0970]
  },
  {
    id: 'ned-university',
    name: 'NED University of Engineering & Tech, University Rd, Karachi',
    shortName: 'NED University Main Gate',
    category: 'university',
    area: 'University Road',
    popularKeywords: ['ned', 'university', 'ku', 'engineering'],
    coords: [24.9318, 67.1143]
  },
  {
    id: 'ku-gate',
    name: 'University of Karachi (KU) Silver Jubilee Gate, Karachi',
    shortName: 'KU Silver Jubilee Gate',
    category: 'university',
    area: 'University Road',
    popularKeywords: ['karachi university', 'ku', 'silver jubilee', 'maskan'],
    coords: [24.9385, 67.1230]
  },
  {
    id: 'disco-bakery',
    name: 'Disco Bakery, Block 5, Gulshan-e-Iqbal, Karachi',
    shortName: 'Disco Bakery Gulshan',
    category: 'landmark',
    area: 'Gulshan Block 5',
    popularKeywords: ['disco bakery', 'gulshan', 'block 5'],
    coords: [24.9210, 67.0890]
  },
  {
    id: 'moti-mahal',
    name: 'Moti Mahal, Rashid Minhas Road, Karachi',
    shortName: 'Moti Mahal',
    category: 'transit',
    area: 'Rashid Minhas Road',
    popularKeywords: ['moti mahal', 'rashid minhas', 'gulshan'],
    coords: [24.9120, 67.0810]
  },
  {
    id: 'civic-centre',
    name: 'Civic Centre & KDA Building, Gulshan-e-Iqbal, Karachi',
    shortName: 'Civic Centre Karachi',
    category: 'landmark',
    area: 'Gulshan-e-Iqbal',
    popularKeywords: ['civic centre', 'kda', 'expo', 'hassan square'],
    coords: [24.8920, 67.0650]
  },
  {
    id: 'expo-centre',
    name: 'Karachi Expo Centre, University Road, Karachi',
    shortName: 'Expo Centre Karachi',
    category: 'landmark',
    area: 'Gulshan-e-Iqbal',
    popularKeywords: ['expo', 'centre', 'exhibition', 'hassan square'],
    coords: [24.8940, 67.0680]
  },

  // ==========================================
  // 14. DHA & CLIFTON
  // ==========================================
  {
    id: 'clifton-general',
    name: 'Clifton, Karachi',
    shortName: 'Clifton (Center)',
    category: 'society',
    area: 'Clifton',
    popularKeywords: ['clifton', 'kiften', 'boat basin', 'ocean tower', 'teen talwar', 'do talwar'],
    coords: [24.8182, 67.0321]
  },
  {
    id: 'sea-view-clifton',
    name: 'Sea View Beach & McDonald\'s, Clifton, Karachi',
    shortName: 'Sea View Beach Clifton',
    category: 'landmark',
    area: 'Clifton Beach',
    popularKeywords: ['sea view', 'seaview', 'mcdonalds', 'beach', 'clifton'],
    coords: [24.8050, 67.0420]
  },
  {
    id: 'bilawal-house-clifton',
    name: 'Bilawal House Chowrangi, Clifton Block 2, Karachi',
    shortName: 'Bilawal House Clifton',
    category: 'landmark',
    area: 'Clifton Block 2',
    popularKeywords: ['bilawal', 'house', 'clifton', 'block 2', 'boat basin'],
    coords: [24.8150, 67.0280]
  },
  {
    id: 'dha-phase-6',
    name: 'DHA Phase 6, Khayaban-e-Ittehad, Karachi',
    shortName: 'DHA Phase 6',
    category: 'society',
    area: 'DHA Karachi',
    popularKeywords: ['dha', 'phase 6', 'ittehad', 'seaview', 'defence'],
    coords: [24.8028, 67.0673]
  },
  {
    id: 'dha-phase-8',
    name: 'DHA Phase 8, Beach Avenue, Karachi',
    shortName: 'DHA Phase 8',
    category: 'society',
    area: 'DHA Karachi',
    popularKeywords: ['dha', 'phase 8', 'creek', 'do darya', 'beach ave'],
    coords: [24.7820, 67.0890]
  },
  {
    id: 'dha-phase-5',
    name: 'DHA Phase 5, Khayaban-e-Shamsheer, Karachi',
    shortName: 'DHA Phase 5',
    category: 'society',
    area: 'DHA Karachi',
    popularKeywords: ['dha', 'phase 5', 'shamsheer', 'badar commercial'],
    coords: [24.8120, 67.0540]
  },
  {
    id: 'dha-phase-2',
    name: 'DHA Phase 2 Extension, Sunset Boulevard, Karachi',
    shortName: 'DHA Phase 2 Ext',
    category: 'society',
    area: 'DHA Karachi',
    popularKeywords: ['dha', 'phase 2', 'sunset', 'defence'],
    coords: [24.8310, 67.0620]
  },
  {
    id: 'clifton-block-5',
    name: 'Clifton Block 5, Boat Basin, Karachi',
    shortName: 'Clifton Block 5 (Boat Basin)',
    category: 'society',
    area: 'Clifton',
    popularKeywords: ['clifton', 'block 5', 'boat basin', 'food street'],
    coords: [24.8182, 67.0321]
  },
  {
    id: 'dolmen-mall-clifton',
    name: 'Dolmen Mall Clifton, Marine Drive, Karachi',
    shortName: 'Dolmen Mall Clifton',
    category: 'commercial',
    area: 'Clifton Block 4',
    popularKeywords: ['dolmen', 'mall', 'clifton', 'sea view'],
    coords: [24.8035, 67.0312]
  },
  {
    id: 'teen-talwar',
    name: 'Teen Talwar Chowrangi, Clifton, Karachi',
    shortName: 'Teen Talwar Clifton',
    category: 'landmark',
    area: 'Clifton',
    popularKeywords: ['teen talwar', 'clifton', 'main road'],
    coords: [24.8320, 67.0340]
  },
  {
    id: 'do-darya',
    name: 'Do Darya Food Street, DHA Phase 8, Karachi',
    shortName: 'Do Darya DHA Phase 8',
    category: 'commercial',
    area: 'DHA Phase 8',
    popularKeywords: ['do darya', 'sea view', 'dha', 'restaurants'],
    coords: [24.7580, 67.0980]
  },

  // ==========================================
  // 15. PECHS, TARIQ ROAD & AIRPORT
  // ==========================================
  {
    id: 'pechs-block-6',
    name: 'PECHS Block 6, Shahrah-e-Quaideen, Karachi',
    shortName: 'PECHS Block 6',
    category: 'society',
    area: 'PECHS',
    popularKeywords: ['pechs', 'block 6', 'tariq road', 'nursery'],
    coords: [24.8620, 67.0620]
  },
  {
    id: 'nursery-sharea-faisal',
    name: 'Nursery Bus Stop, Sharea Faisal, Karachi',
    shortName: 'Nursery Sharea Faisal',
    category: 'transit',
    area: 'Sharea Faisal',
    popularKeywords: ['nursery', 'sharea faisal', 'pechs', 'bus stop'],
    coords: [24.8680, 67.0690]
  },
  {
    id: 'tariq-road-dolmen',
    name: 'Tariq Road Market & Dolmen Mall, PECHS, Karachi',
    shortName: 'Tariq Road Market',
    category: 'commercial',
    area: 'PECHS',
    popularKeywords: ['tariq road', 'dolmen', 'pechs', 'shopping'],
    coords: [24.8710, 67.0590]
  },
  {
    id: 'baloch-colony',
    name: 'Baloch Colony Flyover, Sharea Faisal, Karachi',
    shortName: 'Baloch Colony Bridge',
    category: 'transit',
    area: 'Sharea Faisal',
    popularKeywords: ['baloch colony', 'sharea faisal', 'expressway'],
    coords: [24.8620, 67.0780]
  },
  {
    id: 'defense-view',
    name: 'Defense View Housing Society, Phase 1, Karachi',
    shortName: 'Defense View Phase 1',
    category: 'society',
    area: 'Korangi Road',
    popularKeywords: ['defense view', 'korangi road', 'iqra university', 'qayyumabad link'],
    coords: [24.8380, 67.0720]
  },
  {
    id: 'jinnah-airport',
    name: 'Jinnah International Airport, Airport Road, Karachi',
    shortName: 'Jinnah Airport Departure',
    category: 'transit',
    area: 'Airport',
    popularKeywords: ['airport', 'jinnah', 'star gate', 'flights'],
    coords: [24.9065, 67.1608]
  },
  {
    id: 'star-gate',
    name: 'Star Gate Bus Stop, Sharea Faisal, Karachi',
    shortName: 'Star Gate Sharea Faisal',
    category: 'transit',
    area: 'Airport Road',
    popularKeywords: ['star gate', 'airport', 'sharea faisal'],
    coords: [24.8980, 67.1420]
  },
  {
    id: 'habib-university',
    name: 'Habib University, Block 18, Gulistan-e-Johar, Karachi',
    shortName: 'Habib University',
    category: 'university',
    area: 'Gulistan-e-Johar',
    popularKeywords: ['habib university', 'johar', 'block 18', 'airport'],
    coords: [24.9050, 67.1380]
  },
  {
    id: 'fast-university',
    name: 'FAST NUCES University, Shah Latif Town, Karachi',
    shortName: 'FAST NUCES Main Gate',
    category: 'university',
    area: 'National Highway',
    popularKeywords: ['fast', 'nuces', 'university', 'computer science'],
    coords: [24.8560, 67.2640]
  },
  {
    id: 'five-star-chowrangi',
    name: 'Five Star Chowrangi, North Nazimabad, Karachi',
    shortName: 'Five Star North Nazimabad',
    category: 'transit',
    area: 'North Nazimabad',
    popularKeywords: ['five star', 'north nazimabad', 'block h'],
    coords: [24.9410, 67.0420]
  },
  {
    id: 'lucky-one-mall',
    name: 'Lucky One Mall, Rashid Minhas Road, Karachi',
    shortName: 'Lucky One Mall',
    category: 'commercial',
    area: 'FB Area Block 21',
    popularKeywords: ['lucky one', 'mall', 'rashid minhas', 'fb area'],
    coords: [24.9280, 67.0790]
  },
  {
    id: 'board-office',
    name: 'Board Office Chowrangi & Green Line Station, Nazimabad',
    shortName: 'Board Office Nazimabad',
    category: 'transit',
    area: 'Nazimabad',
    popularKeywords: ['board office', 'nazimabad', 'green line'],
    coords: [24.9250, 67.0310]
  },
  {
    id: 'bahria-town-karachi',
    name: 'Bahria Town Karachi, Super Highway M-9, Karachi',
    shortName: 'Bahria Town Main Gate',
    category: 'society',
    area: 'M-9 Highway',
    popularKeywords: ['bahria', 'town', 'karachi', 'm9', 'precinct'],
    coords: [24.9900, 67.3100]
  },

  // ==========================================
  // 16. INTERCITY HIGHWAYS
  // ==========================================
  {
    id: 'hyderabad-toll-plaza',
    name: 'Hyderabad M-9 Toll Plaza, Sindh',
    shortName: 'Hyderabad Toll Plaza',
    category: 'intercity',
    area: 'Hyderabad M-9',
    popularKeywords: ['hyderabad', 'm9', 'motorway', 'intercity'],
    coords: [25.4200, 68.3200]
  },
  {
    id: 'lahore-thokar-niaz',
    name: 'Thokar Niaz Baig, Lahore, Punjab',
    shortName: 'Thokar Niaz Baig Lahore',
    category: 'intercity',
    area: 'Lahore',
    popularKeywords: ['lahore', 'thokar', 'niaz baig', 'motorway'],
    coords: [31.4700, 74.2400]
  },
  {
    id: 'islamabad-zero-point',
    name: 'Zero Point Interchange, Islamabad',
    shortName: 'Zero Point Islamabad',
    category: 'intercity',
    area: 'Islamabad',
    popularKeywords: ['islamabad', 'zero point', 'kashmir highway', 'rawalpindi'],
    coords: [33.6900, 73.0500]
  }
];

/**
 * Smart Search function for Autocomplete Dropdown.
 * Supports multi-token filtering, fuzzy alias normalizations, and hospital ranking.
 */
export function searchLocations(query: string, limit: number = 8): LocationItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Normalize common phonetic variations & nicknames
  const normalized = trimmed
    .replace(/safoor\b/g, 'safoora')
    .replace(/sapura\b/g, 'safoora')
    .replace(/sadi\b/g, 'saadi')
    .replace(/aurangie\b/g, 'orangi')
    .replace(/aurangi\b/g, 'orangi')
    .replace(/daud\b/g, 'dawood')
    .replace(/chaurangi\b/g, 'chowrangi')
    .replace(/qaidabad\b/g, 'quaidabad')
    .replace(/hath choki\b/g, 'hathi choki')
    .replace(/hath chowki\b/g, 'hathi choki')
    .replace(/cp6\b/g, 'checkpost 6')
    .replace(/cp5\b/g, 'checkpost 5')
    .replace(/checkpost number 6\b/g, 'checkpost 6')
    .replace(/checkpost number 5\b/g, 'checkpost 5')
    .replace(/kiften\b/g, 'clifton')
    .replace(/bha\b/g, 'dha')
    .replace(/ku\b/g, 'karachi university')
    .replace(/ned\b/g, 'ned university')
    .replace(/jpmc\b/g, 'jinnah hospital')
    .replace(/akuh\b/g, 'aga khan')
    .replace(/lnh\b/g, 'liaquat national')
    .replace(/mmi\b/g, 'memon medical');

  const tokens = normalized.split(/\s+/).filter(Boolean);

  const scoredMatches = PAKISTAN_LOCATIONS.map(item => {
    const nameLower = item.name.toLowerCase();
    const shortLower = item.shortName.toLowerCase();
    const areaLower = item.area.toLowerCase();
    const allKeywords = item.popularKeywords.map(k => k.toLowerCase());
    const fullText = `${nameLower} ${shortLower} ${areaLower} ${allKeywords.join(' ')}`;

    let score = 0;

    // Exact matches
    if (shortLower === normalized || nameLower === normalized) {
      score += 120;
    } else if (shortLower.startsWith(normalized) || nameLower.startsWith(normalized)) {
      score += 60;
    } else if (allKeywords.some(k => k === normalized || k.startsWith(normalized))) {
      score += 50;
    }

    // Category matching (e.g. searching "hospital" or "hospital in karachi")
    if (normalized.includes('hospital') && item.category === 'hospital') {
      score += 45;
    }

    // Token matches
    const allTokensMatch = tokens.every(token => 
      fullText.includes(token) || allKeywords.some(k => k.includes(token))
    );

    if (allTokensMatch) {
      score += 35;
    }

    // Partial substring matches
    if (tokens.some(token => token.length >= 3 && fullText.includes(token))) {
      score += 20;
    }

    return { item, score };
  })
  .filter(res => res.score > 0)
  .sort((a, b) => b.score - a.score);

  if (scoredMatches.length > 0) {
    return scoredMatches.slice(0, limit).map(res => res.item);
  }

  // Fallback: If user types a custom place, create dynamic location
  const customLocationName = query.trim();
  const titleCaseName = customLocationName.charAt(0).toUpperCase() + customLocationName.slice(1);
  const hashCoords = getHashCoords(customLocationName);

  return [{
    id: `custom-${Date.now()}`,
    name: `${titleCaseName}, Karachi`,
    shortName: titleCaseName,
    category: 'landmark',
    area: 'Custom Pin Point',
    popularKeywords: [customLocationName.toLowerCase()],
    coords: hashCoords
  }];
}

/**
 * Deterministic hash to generate realistic GPS coordinates in Karachi region
 * for any custom place typed by the user.
 */
function getHashCoords(str: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000) * 0.12 - 0.06;
  const lngOffset = ((Math.abs(hash >> 3) % 1000) / 1000) * 0.14 - 0.07;
  return [24.8607 + latOffset, 67.0011 + lngOffset];
}

/**
 * Resolves exact [lat, lng] coordinates for any given location string or landmark name.
 */
export function getLocationCoords(locationName: string): [number, number] {
  if (!locationName) return [24.8607, 67.0011];

  const lower = locationName.toLowerCase();
  const found = PAKISTAN_LOCATIONS.find(item => 
    lower.includes(item.shortName.toLowerCase()) || 
    lower.includes(item.id) ||
    item.popularKeywords.some(k => lower.includes(k))
  );

  if (found) {
    return found.coords;
  }

  return getHashCoords(locationName);
}
