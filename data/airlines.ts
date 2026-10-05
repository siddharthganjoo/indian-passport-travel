/**
 * Airline reference used to (a) label offers and (b) estimate baggage when a
 * price source doesn't say what's included. Bag fees are typical prepaid
 * online prices for one ~20–23kg bag, by flight length — approximate.
 */
export interface AirlineInfo {
  code: string;
  name: string;
  lowCost: boolean;
  cabinKg: number;
  /** Checked pieces included in the cheapest economy fare. */
  checkedPieces: number;
  /** Prepaid fee (INR) to add one checked bag: [short <3000km, medium <6000km, long]. */
  bagFeeInr: [number, number, number];
  hubs: string[];
}

const FULL_SERVICE_FEE: [number, number, number] = [3000, 5500, 8000];

export const AIRLINES: AirlineInfo[] = [
  // India
  { code: '6E', name: 'IndiGo', lowCost: true, cabinKg: 7, checkedPieces: 1, bagFeeInr: [2500, 4500, 6000], hubs: ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU'] },
  { code: 'AI', name: 'Air India', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['DEL', 'BOM'] },
  { code: 'IX', name: 'Air India Express', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [2200, 4000, 6000], hubs: ['COK', 'BLR', 'DEL'] },
  { code: 'SG', name: 'SpiceJet', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [2200, 4000, 6000], hubs: ['DEL', 'BOM'] },
  // Middle East
  { code: 'EK', name: 'Emirates', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['DXB'] },
  { code: 'FZ', name: 'flydubai', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [3000, 5000, 7000], hubs: ['DXB'] },
  { code: 'EY', name: 'Etihad Airways', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['AUH'] },
  { code: 'G9', name: 'Air Arabia', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [2800, 4500, 6500], hubs: ['SHJ', 'AUH'] },
  { code: 'QR', name: 'Qatar Airways', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['DOH'] },
  { code: 'WY', name: 'Oman Air', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['MCT'] },
  { code: 'OV', name: 'SalamAir', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [2500, 4500, 6500], hubs: ['MCT'] },
  { code: 'GF', name: 'Gulf Air', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['BAH'] },
  { code: 'SV', name: 'Saudia', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['JED', 'RUH'] },
  // Europe / Africa
  { code: 'TK', name: 'Turkish Airlines', lowCost: false, cabinKg: 8, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['IST'] },
  { code: 'PC', name: 'Pegasus Airlines', lowCost: true, cabinKg: 2, checkedPieces: 0, bagFeeInr: [3000, 5000, 7000], hubs: ['SAW'] },
  { code: 'ET', name: 'Ethiopian Airlines', lowCost: false, cabinKg: 7, checkedPieces: 2, bagFeeInr: FULL_SERVICE_FEE, hubs: ['ADD'] },
  { code: 'KQ', name: 'Kenya Airways', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['NBO'] },
  { code: 'LH', name: 'Lufthansa', lowCost: false, cabinKg: 8, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['FRA', 'MUC'] },
  { code: 'BA', name: 'British Airways', lowCost: false, cabinKg: 23, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['LHR'] },
  { code: 'AF', name: 'Air France', lowCost: false, cabinKg: 12, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['CDG'] },
  { code: 'KL', name: 'KLM', lowCost: false, cabinKg: 12, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['AMS'] },
  { code: 'W6', name: 'Wizz Air', lowCost: true, cabinKg: 0, checkedPieces: 0, bagFeeInr: [3500, 5500, 7000], hubs: ['AUH'] },
  // Asia-Pacific
  { code: 'SQ', name: 'Singapore Airlines', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['SIN'] },
  { code: 'TR', name: 'Scoot', lowCost: true, cabinKg: 10, checkedPieces: 0, bagFeeInr: [3000, 5000, 7000], hubs: ['SIN'] },
  { code: 'MH', name: 'Malaysia Airlines', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['KUL'] },
  { code: 'AK', name: 'AirAsia', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [2500, 4000, 6000], hubs: ['KUL'] },
  { code: 'D7', name: 'AirAsia X', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [3000, 5000, 7000], hubs: ['KUL'] },
  { code: 'TG', name: 'Thai Airways', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['BKK'] },
  { code: 'FD', name: 'Thai AirAsia', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [2500, 4000, 6000], hubs: ['DMK'] },
  { code: 'VJ', name: 'VietJet Air', lowCost: true, cabinKg: 7, checkedPieces: 0, bagFeeInr: [2500, 4500, 6500], hubs: ['SGN', 'HAN'] },
  { code: 'VN', name: 'Vietnam Airlines', lowCost: false, cabinKg: 10, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['SGN', 'HAN'] },
  { code: 'UL', name: 'SriLankan Airlines', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['CMB'] },
  { code: 'CX', name: 'Cathay Pacific', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['HKG'] },
  { code: 'QF', name: 'Qantas', lowCost: false, cabinKg: 7, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['SYD', 'MEL'] },
  // Americas
  { code: 'LA', name: 'LATAM', lowCost: false, cabinKg: 10, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['GRU', 'LIM', 'SCL'] },
  { code: 'UA', name: 'United Airlines', lowCost: false, cabinKg: 10, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['EWR', 'SFO'] },
  { code: 'AC', name: 'Air Canada', lowCost: false, cabinKg: 10, checkedPieces: 1, bagFeeInr: FULL_SERVICE_FEE, hubs: ['YYZ', 'YVR'] },
];

const BY_CODE = new Map(AIRLINES.map((a) => [a.code, a]));

export function getAirline(code: string): AirlineInfo | undefined {
  return BY_CODE.get(code.toUpperCase());
}

/** Unknown carriers are treated as full-service: 1 bag included. */
export function bagFeeForLeg(carrierCode: string, distanceKm: number): number {
  const fees = getAirline(carrierCode)?.bagFeeInr ?? FULL_SERVICE_FEE;
  return distanceKm < 3000 ? fees[0] : distanceKm < 6000 ? fees[1] : fees[2];
}
