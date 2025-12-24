
import { AirportInfo } from '../types';

// Major world airports database (ICAO code -> Airport info)
const AIRPORTS: Record<string, Omit<AirportInfo, 'icao'>> = {
    // United States
    'KJFK': { name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
    'KLAX': { name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
    'KORD': { name: "O'Hare International", city: 'Chicago', country: 'USA' },
    'KATL': { name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA' },
    'KDFW': { name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA' },
    'KDEN': { name: 'Denver International', city: 'Denver', country: 'USA' },
    'KSFO': { name: 'San Francisco International', city: 'San Francisco', country: 'USA' },
    'KLAS': { name: 'Harry Reid International', city: 'Las Vegas', country: 'USA' },
    'KMIA': { name: 'Miami International', city: 'Miami', country: 'USA' },
    'KSEA': { name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA' },
    'KBOS': { name: 'Boston Logan International', city: 'Boston', country: 'USA' },
    'KPHL': { name: 'Philadelphia International', city: 'Philadelphia', country: 'USA' },
    'KEWR': { name: 'Newark Liberty International', city: 'Newark', country: 'USA' },
    'KIAD': { name: 'Washington Dulles International', city: 'Washington D.C.', country: 'USA' },
    'KDCA': { name: 'Ronald Reagan Washington National', city: 'Washington D.C.', country: 'USA' },

    // Europe
    'EGLL': { name: 'Heathrow', city: 'London', country: 'UK' },
    'EGKK': { name: 'Gatwick', city: 'London', country: 'UK' },
    'EGLC': { name: 'London City', city: 'London', country: 'UK' },
    'EGSS': { name: 'Stansted', city: 'London', country: 'UK' },
    'LFPG': { name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
    'LFPO': { name: 'Orly', city: 'Paris', country: 'France' },
    'EDDF': { name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
    'EDDM': { name: 'Munich', city: 'Munich', country: 'Germany' },
    'EDDB': { name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany' },
    'EHAM': { name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    'LEMD': { name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
    'LEBL': { name: 'El Prat', city: 'Barcelona', country: 'Spain' },
    'LIRF': { name: 'Fiumicino', city: 'Rome', country: 'Italy' },
    'LIMC': { name: 'Malpensa', city: 'Milan', country: 'Italy' },
    'LSZH': { name: 'Zurich', city: 'Zurich', country: 'Switzerland' },
    'LSGG': { name: 'Geneva', city: 'Geneva', country: 'Switzerland' },
    'LOWW': { name: 'Vienna International', city: 'Vienna', country: 'Austria' },
    'EBBR': { name: 'Brussels', city: 'Brussels', country: 'Belgium' },
    'EIDW': { name: 'Dublin', city: 'Dublin', country: 'Ireland' },
    'EKCH': { name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark' },
    'ESSA': { name: 'Arlanda', city: 'Stockholm', country: 'Sweden' },
    'ENGM': { name: 'Gardermoen', city: 'Oslo', country: 'Norway' },
    'EFHK': { name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland' },
    'EPWA': { name: 'Chopin', city: 'Warsaw', country: 'Poland' },
    'LKPR': { name: 'Václav Havel', city: 'Prague', country: 'Czech Republic' },
    'LGAV': { name: 'Eleftherios Venizelos', city: 'Athens', country: 'Greece' },
    'LTFM': { name: 'Istanbul', city: 'Istanbul', country: 'Turkey' },
    'UUEE': { name: 'Sheremetyevo', city: 'Moscow', country: 'Russia' },
    'LPPT': { name: 'Humberto Delgado', city: 'Lisbon', country: 'Portugal' },

    // Middle East
    'OMDB': { name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    'OERK': { name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia' },
    'OTHH': { name: 'Hamad International', city: 'Doha', country: 'Qatar' },
    'OJAI': { name: 'Queen Alia International', city: 'Amman', country: 'Jordan' },
    'LLBG': { name: 'Ben Gurion', city: 'Tel Aviv', country: 'Israel' },

    // Asia
    'RJTT': { name: 'Haneda', city: 'Tokyo', country: 'Japan' },
    'RJAA': { name: 'Narita International', city: 'Tokyo', country: 'Japan' },
    'RKSI': { name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
    'VHHH': { name: 'Hong Kong International', city: 'Hong Kong', country: 'China' },
    'ZBAA': { name: 'Capital International', city: 'Beijing', country: 'China' },
    'ZSPD': { name: 'Pudong International', city: 'Shanghai', country: 'China' },
    'WSSS': { name: 'Changi', city: 'Singapore', country: 'Singapore' },
    'VTBS': { name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
    'VIDP': { name: 'Indira Gandhi International', city: 'New Delhi', country: 'India' },
    'VABB': { name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India' },
    'WMKK': { name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia' },
    'WIII': { name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia' },
    'RPLL': { name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines' },
    'VVNB': { name: 'Noi Bai International', city: 'Hanoi', country: 'Vietnam' },

    // Africa
    'FACT': { name: 'Cape Town International', city: 'Cape Town', country: 'South Africa' },
    'FAOR': { name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa' },
    'HECA': { name: 'Cairo International', city: 'Cairo', country: 'Egypt' },
    'GMMN': { name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco' },
    'GMME': { name: 'Rabat-Salé', city: 'Rabat', country: 'Morocco' },
    'GMFF': { name: 'Fès-Saïss', city: 'Fes', country: 'Morocco' },
    'GMMX': { name: 'Marrakech Menara', city: 'Marrakech', country: 'Morocco' },
    'GMTT': { name: 'Tangier Ibn Battouta', city: 'Tangier', country: 'Morocco' },
    'DNMM': { name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria' },
    'HKJK': { name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya' },

    // Oceania
    'YSSY': { name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
    'YMML': { name: 'Melbourne', city: 'Melbourne', country: 'Australia' },
    'NZAA': { name: 'Auckland', city: 'Auckland', country: 'New Zealand' },

    // Americas
    'CYYZ': { name: 'Pearson International', city: 'Toronto', country: 'Canada' },
    'CYVR': { name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
    'CYUL': { name: 'Trudeau International', city: 'Montreal', country: 'Canada' },
    'MMMX': { name: 'Benito Juárez International', city: 'Mexico City', country: 'Mexico' },
    'SBGR': { name: 'Guarulhos International', city: 'São Paulo', country: 'Brazil' },
    'SCEL': { name: 'Arturo Merino Benítez', city: 'Santiago', country: 'Chile' },
    'SAEZ': { name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina' },
    'SKBO': { name: 'El Dorado International', city: 'Bogotá', country: 'Colombia' },
    'SEQM': { name: 'Mariscal Sucre International', city: 'Quito', country: 'Ecuador' },
    'SPJC': { name: 'Jorge Chávez International', city: 'Lima', country: 'Peru' },
};

/**
 * Get airport information from ICAO code
 */
export const getAirportInfo = (icaoCode: string): AirportInfo | null => {
    const upperCode = icaoCode?.toUpperCase();
    const airport = AIRPORTS[upperCode];

    if (!airport) return null;

    return {
        icao: upperCode,
        ...airport
    };
};

/**
 * Format airport for display (e.g., "Paris CDG (France)")
 */
export const formatAirportDisplay = (airport: AirportInfo | null): string => {
    if (!airport) return 'Unknown';
    return `${airport.city} ${airport.icao.slice(-3)} (${airport.country})`;
};
