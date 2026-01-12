
export enum AssetType {
  AIRCRAFT = 'AIRCRAFT',
  VESSEL = 'VESSEL',
  GROUND = 'GROUND'
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  STANDBY = 'STANDBY',
  ALERT = 'ALERT'
}

export enum Affiliation {
  NATO = 'NATO',
  ALLIED = 'ALLIED',
  NEUTRAL = 'NEUTRAL',
  OPFOR = 'OPFOR',
  UNKNOWN = 'UNKNOWN'
}

export enum Theater {
  GLOBAL = 'GLOBAL',
  UKRAINE = 'UKRAINE',
  MIDDLE_EAST = 'MIDDLE EAST',
  AFRICA = 'AFRICA',
  PACIFIC = 'PACIFIC',
  CARIBBEAN = 'CARIBBEAN',
  SOUTH_CENTRAL_AMERICA = 'SOUTH & CENTRAL AMERICA',
  IRAN = 'IRAN'
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface StrategicAsset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  affiliation: Affiliation;
  country: 'USA' | 'UK' | 'RUSSIA' | 'CHINA' | 'TAIWAN' | 'JAPAN' | 'UKRAINE' | 'OTHER' | 'UNKNOWN';
  location: GeoPoint;
  destination: GeoPoint;
  speed: number; // knots or km/h
  altitude: number; // feet (for aircraft)
  heading: number; // degrees
  mission: string;
  lastUpdated: string;
  trackingUrl?: string;
  wikiUrl?: string;
  pathHistory?: GeoPoint[];
}

export interface TheaterPOI {
  name: string;
  location: GeoPoint;
  type: 'BASE' | 'STRAIT' | 'SEA' | 'CITY' | 'PROVINCE';
  theater: Theater;
}

export interface NewsItem {
  theater: Theater | 'GLOBAL';
  title: string;
  summary: string;
  url: string;
  timestamp: string;
  sourceType: 'NEWS' | 'SOCIAL' | 'OFFICIAL';
}

export interface SituationalReport {
  timestamp: string;
  summary: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  pentagonActivity: {
    score: number; // 0-100
    label: string; // e.g. "ELEVATED"
    reasoning: string; // e.g. "Increased fast food traffic detected nearby"
  };
  hotspots: { name: string; region: string; description: string }[];
  news: NewsItem[];
}
