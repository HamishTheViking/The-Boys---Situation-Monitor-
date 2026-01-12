
import { AssetType, AssetStatus, StrategicAsset, Affiliation, Theater, TheaterPOI } from './types';

export const INITIAL_ASSETS: StrategicAsset[] = [
  // --- NATO DEPLOYMENTS ---
  {
    id: 'USN-CVN-78',
    name: 'USS Gerald R. Ford',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.NATO,
    country: 'USA',
    location: { lat: 38.5, lng: -45.0 },
    destination: { lat: 45.0, lng: -15.0 },
    speed: 30,
    altitude: 0,
    heading: 65,
    mission: 'Atlantic Sentinel Patrol',
    lastUpdated: new Date().toISOString(),
    wikiUrl: 'https://en.wikipedia.org/wiki/USS_Gerald_R._Ford',
    pathHistory: []
  },
  {
    id: 'RN-R08',
    name: 'HMS Queen Elizabeth',
    type: AssetType.VESSEL,
    status: AssetStatus.STANDBY,
    affiliation: Affiliation.NATO,
    country: 'UK',
    location: { lat: 50.8, lng: -1.1 },
    destination: { lat: 50.8, lng: -1.1 },
    speed: 0,
    altitude: 0,
    heading: 0,
    mission: 'Maintenance - Portsmouth',
    lastUpdated: new Date().toISOString(),
    wikiUrl: 'https://en.wikipedia.org/wiki/HMS_Queen_Elizabeth_(R08)',
    pathHistory: []
  },
  {
    id: 'FRA-R91',
    name: 'Charles de Gaulle',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.NATO,
    country: 'OTHER',
    location: { lat: 43.1, lng: 5.9 },
    destination: { lat: 35.0, lng: 25.0 },
    speed: 25,
    altitude: 0,
    heading: 145,
    mission: 'Mission Akila - Mediterranean Presence',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  },
  {
    id: 'NATO-EFP-POL',
    name: 'Battle Group Poland (Abrams)',
    type: AssetType.GROUND,
    status: AssetStatus.ALERT,
    affiliation: Affiliation.NATO,
    country: 'USA',
    location: { lat: 53.8, lng: 21.9 },
    destination: { lat: 53.8, lng: 21.9 },
    speed: 0,
    altitude: 0,
    heading: 0,
    mission: 'Enhanced Forward Presence - Eastern Flank',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  },

  // --- BRICS DEPLOYMENTS ---
  {
    id: 'RFS-011',
    name: 'Varyag (Slava-class)',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.OPFOR,
    country: 'RUSSIA',
    location: { lat: 38.0, lng: 135.0 },
    destination: { lat: 40.0, lng: 132.0 },
    speed: 15,
    altitude: 0,
    heading: 340,
    mission: 'Pacific Command Patrol',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  },
  {
    id: 'PLAN-17',
    name: 'Shandong (Type 002)',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.OPFOR,
    country: 'CHINA',
    location: { lat: 18.5, lng: 112.5 },
    destination: { lat: 15.0, lng: 110.0 },
    speed: 22,
    altitude: 0,
    heading: 210,
    mission: 'South China Sea Sovereignty Mission',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  },
  {
    id: 'IN-R33',
    name: 'INS Vikramaditya',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.NEUTRAL,
    country: 'OTHER',
    location: { lat: 15.4, lng: 73.8 },
    destination: { lat: 10.0, lng: 65.0 },
    speed: 20,
    altitude: 0,
    heading: 240,
    mission: 'Arabian Sea Task Force',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  },
  {
    id: 'IRN-SAHAND',
    name: 'Sahand (Moudge-class)',
    type: AssetType.VESSEL,
    status: AssetStatus.ALERT,
    affiliation: Affiliation.OPFOR,
    country: 'OTHER',
    location: { lat: 27.1, lng: 56.2 },
    destination: { lat: 25.0, lng: 58.0 },
    speed: 18,
    altitude: 0,
    heading: 120,
    mission: 'Strait of Hormuz Surveillance',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  },

  // --- IRANIAN THEATER ASSETS (Revolutionary/Civil Action Monitoring) ---
  {
    id: 'IRA-W5114',
    name: 'Mahan Air W5114',
    type: AssetType.AIRCRAFT,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.OPFOR,
    country: 'OTHER',
    location: { lat: 35.7, lng: 51.4 },
    destination: { lat: 33.5, lng: 36.3 },
    speed: 480,
    altitude: 34000,
    heading: 245,
    mission: 'Tehran-Damascus Logistical Corridor',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  },
  {
    id: 'IRIAF-F14',
    name: 'IRIAF Tomcat (Patrol)',
    type: AssetType.AIRCRAFT,
    status: AssetStatus.ALERT,
    affiliation: Affiliation.OPFOR,
    country: 'OTHER',
    location: { lat: 32.6, lng: 51.7 },
    destination: { lat: 28.0, lng: 50.0 },
    speed: 550,
    altitude: 28000,
    heading: 210,
    mission: 'Air Supremacy - Central Province Monitoring',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  },
  {
    id: 'USAF-RQ-4',
    name: 'Global Hawk (Surveillance)',
    type: AssetType.AIRCRAFT,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.NATO,
    country: 'USA',
    location: { lat: 25.0, lng: 55.0 },
    destination: { lat: 27.0, lng: 53.0 },
    speed: 310,
    altitude: 60000,
    heading: 320,
    mission: 'High-Altitude Persian Gulf Monitoring',
    lastUpdated: new Date().toISOString(),
    pathHistory: []
  }
];

export const STRATEGIC_POIS: TheaterPOI[] = [
  // --- CAPITALS: NORTH AMERICA ---
  { name: 'Washington D.C.', location: { lat: 38.8951, lng: -77.0364 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Ottawa', location: { lat: 45.4215, lng: -75.6972 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Mexico City', location: { lat: 19.4326, lng: -99.1332 }, type: 'CITY', theater: Theater.GLOBAL },

  // --- CAPITALS: EUROPE ---
  { name: 'London', location: { lat: 51.5074, lng: -0.1278 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Paris', location: { lat: 48.8566, lng: 2.3522 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Berlin', location: { lat: 52.5200, lng: 13.4050 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Brussels', location: { lat: 50.8503, lng: 4.3517 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Rome', location: { lat: 41.9028, lng: 12.4964 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Madrid', location: { lat: 40.4168, lng: -3.7038 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Warsaw', location: { lat: 52.2297, lng: 21.0122 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Kyiv', location: { lat: 50.4501, lng: 30.5234 }, type: 'CITY', theater: Theater.UKRAINE },
  { name: 'Moscow', location: { lat: 55.7558, lng: 37.6173 }, type: 'CITY', theater: Theater.UKRAINE },
  { name: 'Oslo', location: { lat: 59.9139, lng: 10.7522 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Helsinki', location: { lat: 60.1699, lng: 24.9384 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Stockholm', location: { lat: 59.3293, lng: 18.0686 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Copenhagen', location: { lat: 55.6761, lng: 12.5683 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Athens', location: { lat: 37.9838, lng: 23.7275 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Lisbon', location: { lat: 38.7223, lng: -9.1393 }, type: 'CITY', theater: Theater.GLOBAL },

  // --- CAPITALS: MIDDLE EAST & IRAN ---
  { name: 'Tehran', location: { lat: 35.6892, lng: 51.3890 }, type: 'CITY', theater: Theater.IRAN },
  { name: 'Isfahan', location: { lat: 32.6539, lng: 51.6660 }, type: 'CITY', theater: Theater.IRAN },
  { name: 'Shiraz', location: { lat: 29.5918, lng: 52.5837 }, type: 'CITY', theater: Theater.IRAN },
  { name: 'Jerusalem', location: { lat: 31.7683, lng: 35.2137 }, type: 'CITY', theater: Theater.MIDDLE_EAST },
  { name: 'Riyadh', location: { lat: 24.7136, lng: 46.6753 }, type: 'CITY', theater: Theater.MIDDLE_EAST },
  { name: 'Cairo', location: { lat: 30.0444, lng: 31.2357 }, type: 'CITY', theater: Theater.MIDDLE_EAST },
  { name: 'Baghdad', location: { lat: 33.3128, lng: 44.3615 }, type: 'CITY', theater: Theater.MIDDLE_EAST },
  { name: 'Ankara', location: { lat: 39.9334, lng: 32.8597 }, type: 'CITY', theater: Theater.MIDDLE_EAST },
  { name: 'Doha', location: { lat: 25.2854, lng: 51.5310 }, type: 'CITY', theater: Theater.MIDDLE_EAST },
  { name: 'Abu Dhabi', location: { lat: 24.4539, lng: 54.3773 }, type: 'CITY', theater: Theater.MIDDLE_EAST },

  // --- CAPITALS: ASIA PACIFIC ---
  { name: 'Beijing', location: { lat: 39.9042, lng: 116.4074 }, type: 'CITY', theater: Theater.PACIFIC },
  { name: 'Tokyo', location: { lat: 35.6762, lng: 139.6503 }, type: 'CITY', theater: Theater.PACIFIC },
  { name: 'Seoul', location: { lat: 37.5665, lng: 126.9780 }, type: 'CITY', theater: Theater.PACIFIC },
  { name: 'Taipei', location: { lat: 25.0330, lng: 121.5654 }, type: 'CITY', theater: Theater.PACIFIC },
  { name: 'New Delhi', location: { lat: 28.6139, lng: 77.2090 }, type: 'CITY', theater: Theater.PACIFIC },
  { name: 'Canberra', location: { lat: -35.2809, lng: 149.1300 }, type: 'CITY', theater: Theater.GLOBAL },
  { name: 'Jakarta', location: { lat: -6.2088, lng: 106.8456 }, type: 'CITY', theater: Theater.PACIFIC },
  { name: 'Hanoi', location: { lat: 21.0285, lng: 105.8542 }, type: 'CITY', theater: Theater.PACIFIC },
  { name: 'Singapore', location: { lat: 1.3521, lng: 103.8198 }, type: 'CITY', theater: Theater.PACIFIC },

  // --- CAPITALS: AFRICA ---
  { name: 'Nairobi', location: { lat: -1.2921, lng: 36.8219 }, type: 'CITY', theater: Theater.AFRICA },
  { name: 'Pretoria', location: { lat: -25.7479, lng: 28.2293 }, type: 'CITY', theater: Theater.AFRICA },
  { name: 'Addis Ababa', location: { lat: 9.0306, lng: 38.7469 }, type: 'CITY', theater: Theater.AFRICA },
  { name: 'Algiers', location: { lat: 36.7538, lng: 3.0588 }, type: 'CITY', theater: Theater.AFRICA },
  { name: 'Abuja', location: { lat: 9.0765, lng: 7.3986 }, type: 'CITY', theater: Theater.AFRICA },

  // --- CAPITALS: SOUTH AMERICA ---
  { name: 'Brasilia', location: { lat: -15.7975, lng: -47.8919 }, type: 'CITY', theater: Theater.SOUTH_CENTRAL_AMERICA },
  { name: 'Buenos Aires', location: { lat: -34.6037, lng: -58.3816 }, type: 'CITY', theater: Theater.SOUTH_CENTRAL_AMERICA },
  { name: 'Bogota', location: { lat: 4.7110, lng: -74.0721 }, type: 'CITY', theater: Theater.SOUTH_CENTRAL_AMERICA },
  { name: 'Santiago', location: { lat: -33.4489, lng: -70.6693 }, type: 'CITY', theater: Theater.SOUTH_CENTRAL_AMERICA },
  { name: 'Lima', location: { lat: -12.0464, lng: -77.0428 }, type: 'CITY', theater: Theater.SOUTH_CENTRAL_AMERICA },

  // --- MARITIME & TACTICAL ---
  { name: 'Strait of Hormuz', location: { lat: 26.5, lng: 56.2 }, type: 'STRAIT', theater: Theater.IRAN },
  { name: 'Bab-el-Mandeb', location: { lat: 12.6, lng: 43.3 }, type: 'STRAIT', theater: Theater.MIDDLE_EAST },
  { name: 'Bushehr Nuclear Plant', location: { lat: 28.8, lng: 50.8 }, type: 'BASE', theater: Theater.IRAN },
  { name: 'Kharg Island', location: { lat: 29.2, lng: 50.3 }, type: 'BASE', theater: Theater.IRAN },
  { name: 'Bandar Abbas Base', location: { lat: 27.2, lng: 56.3 }, type: 'BASE', theater: Theater.IRAN },
];

export const WORLD_GEOJSON_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export const THEATER_COORDS = {
  GLOBAL: { center: [0, 0] as [number, number], zoom: 1 },
  UKRAINE: { center: [31.1, 48.3] as [number, number], zoom: 6 },
  MIDDLE_EAST: { center: [43.0, 24.0] as [number, number], zoom: 4.5 },
  AFRICA: { center: [10.0, 15.0] as [number, number], zoom: 3.5 },
  PACIFIC: { center: [125.0, 22.0] as [number, number], zoom: 4.5 },
  CARIBBEAN: { center: [-75.0, 18.0] as [number, number], zoom: 4.0 },
  SOUTH_CENTRAL_AMERICA: { center: [-65.0, -15.0] as [number, number], zoom: 2.2 },
  IRAN: { center: [53.0, 32.0] as [number, number], zoom: 5.0 }
};
