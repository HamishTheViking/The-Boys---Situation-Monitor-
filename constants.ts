
import { AssetType, AssetStatus, StrategicAsset, Affiliation, Theater, TheaterPOI } from './types';

export const INITIAL_ASSETS: StrategicAsset[] = [
  // --- US NAVY (NATO) ---
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
    wikiUrl: 'https://en.wikipedia.org/wiki/USS_Gerald_R._Ford'
  },
  {
    id: 'USN-CVN-69',
    name: 'USS Dwight D. Eisenhower',
    type: AssetType.VESSEL,
    status: AssetStatus.ALERT,
    affiliation: Affiliation.NATO,
    country: 'USA',
    location: { lat: 14.2, lng: 41.5 },
    destination: { lat: 12.5, lng: 43.0 },
    speed: 25,
    altitude: 0,
    heading: 160,
    mission: 'Operation Prosperity Guardian',
    lastUpdated: new Date().toISOString(),
    wikiUrl: 'https://en.wikipedia.org/wiki/USS_Dwight_D._Eisenhower'
  },
  {
    id: 'USN-T-AH-20',
    name: 'USNS Comfort',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.NATO,
    country: 'USA',
    location: { lat: 18.2, lng: -70.0 },
    destination: { lat: 18.4, lng: -69.8 },
    speed: 12,
    altitude: 0,
    heading: 45,
    mission: 'Medical Assistance Mission - Caribbean Basin',
    lastUpdated: new Date().toISOString(),
    wikiUrl: 'https://en.wikipedia.org/wiki/USNS_Comfort_(T-AH-20)'
  },
  {
    id: 'USN-LCS-12',
    name: 'USS Omaha',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.NATO,
    country: 'USA',
    location: { lat: 12.5, lng: -75.0 },
    destination: { lat: 15.0, lng: -78.0 },
    speed: 35,
    altitude: 0,
    heading: 310,
    mission: 'Counter-Narcotics Patrol - SOUTHCOM',
    lastUpdated: new Date().toISOString()
  },

  // --- BRAZILIAN NAVY (ALLIED) ---
  {
    id: 'BRA-F-45',
    name: 'União',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.ALLIED,
    country: 'OTHER',
    location: { lat: -23.5, lng: -42.0 },
    destination: { lat: -25.0, lng: -45.0 },
    speed: 18,
    altitude: 0,
    heading: 225,
    mission: 'South Atlantic Sovereignty Patrol',
    lastUpdated: new Date().toISOString()
  },

  // --- RUSSIAN NAVY (OPFOR) ---
  {
    id: 'RFS-454',
    name: 'Admiral Gorshkov',
    type: AssetType.VESSEL,
    status: AssetStatus.ALERT,
    affiliation: Affiliation.OPFOR,
    country: 'RUSSIA',
    location: { lat: 23.1, lng: -82.3 },
    destination: { lat: 23.1, lng: -82.3 },
    speed: 0,
    altitude: 0,
    heading: 0,
    mission: 'Port Visit - Havana, Cuba',
    lastUpdated: new Date().toISOString(),
    wikiUrl: 'https://en.wikipedia.org/wiki/Russian_frigate_Admiral_Gorshkov'
  },
  {
    id: 'RFS-011',
    name: 'Varyag',
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
    lastUpdated: new Date().toISOString()
  },

  // --- CHINESE NAVY (OPFOR) ---
  {
    id: 'PLAN-17',
    name: 'Shandong',
    type: AssetType.VESSEL,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.OPFOR,
    country: 'CHINA',
    location: { lat: 18.5, lng: 112.5 },
    destination: { lat: 15.0, lng: 110.0 },
    speed: 22,
    altitude: 0,
    heading: 210,
    mission: 'South China Sea Drills',
    lastUpdated: new Date().toISOString()
  },

  // --- STRATEGIC AIRCRAFT ---
  {
    id: 'NATO-AF-1',
    name: 'E-3 Sentry (AWACS)',
    type: AssetType.AIRCRAFT,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.NATO,
    country: 'USA',
    location: { lat: 52.0, lng: 15.0 },
    destination: { lat: 50.0, lng: 25.0 },
    speed: 450,
    altitude: 35000,
    heading: 100,
    mission: 'Airborne Early Warning',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ISR-P8A-1',
    name: 'P-8A Poseidon',
    type: AssetType.AIRCRAFT,
    status: AssetStatus.ACTIVE,
    affiliation: Affiliation.NATO,
    country: 'USA',
    location: { lat: 9.0, lng: -79.5 },
    destination: { lat: 10.0, lng: -82.0 },
    speed: 410,
    altitude: 25000,
    heading: 280,
    mission: 'Maritime Surveillance - Panama Canal Approaches',
    lastUpdated: new Date().toISOString()
  }
];

export const STRATEGIC_POIS: TheaterPOI[] = [
  // CARIBBEAN & LATAM
  { name: 'Panama Canal', location: { lat: 9.08, lng: -79.68 }, type: 'STRAIT', theater: Theater.SOUTH_CENTRAL_AMERICA },
  { name: 'Guantanamo Bay', location: { lat: 19.9, lng: -75.1 }, type: 'BASE', theater: Theater.CARIBBEAN },
  { name: 'Havana Harbor', location: { lat: 23.1, lng: -82.3 }, type: 'BASE', theater: Theater.CARIBBEAN },
  { name: 'Falkland Islands', location: { lat: -51.7, lng: -58.5 }, type: 'PROVINCE', theater: Theater.SOUTH_CENTRAL_AMERICA },
  
  // UKRAINE
  { name: 'Sevastopol Naval Base', location: { lat: 44.61, lng: 33.52 }, type: 'BASE', theater: Theater.UKRAINE },
  { name: 'Black Sea', location: { lat: 43.4, lng: 34.5 }, type: 'SEA', theater: Theater.UKRAINE },
  
  // PACIFIC
  { name: 'Taiwan Strait', location: { lat: 24.4, lng: 119.5 }, type: 'STRAIT', theater: Theater.PACIFIC },
  { name: 'Yokosuka Naval Base', location: { lat: 35.29, lng: 139.67 }, type: 'BASE', theater: Theater.PACIFIC },
  
  // MIDDLE EAST
  { name: 'Strait of Hormuz', location: { lat: 26.5, lng: 56.2 }, type: 'STRAIT', theater: Theater.MIDDLE_EAST },
  { name: 'Bab-el-Mandeb', location: { lat: 12.6, lng: 43.3 }, type: 'STRAIT', theater: Theater.MIDDLE_EAST },
];

export const WORLD_GEOJSON_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export const THEATER_COORDS = {
  GLOBAL: { center: [0, 0] as [number, number], zoom: 1 },
  UKRAINE: { center: [31.1, 48.3] as [number, number], zoom: 6 },
  MIDDLE_EAST: { center: [43.0, 24.0] as [number, number], zoom: 4.5 },
  AFRICA: { center: [10.0, 15.0] as [number, number], zoom: 3.5 },
  PACIFIC: { center: [125.0, 22.0] as [number, number], zoom: 4.5 },
  CARIBBEAN: { center: [-75.0, 18.0] as [number, number], zoom: 4.0 },
  SOUTH_CENTRAL_AMERICA: { center: [-65.0, -15.0] as [number, number], zoom: 2.2 }
};
