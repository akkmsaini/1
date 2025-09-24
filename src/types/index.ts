export interface WaterLevelData {
  id: string;
  timestamp: Date;
  level: number;
  location: string;
  coordinates: [number, number];
  status: 'normal' | 'warning' | 'critical';
  temperature?: number;
  ph?: number;
}

export interface DWLRStation {
  id: string;
  name: string;
  coordinates: [number, number];
  status: 'online' | 'offline' | 'maintenance';
  lastReading: Date;
  currentLevel: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export interface PredictionData {
  timestamp: Date;
  predictedLevel: number;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface UploadedDataPoint {
  timestamp: string | Date;
  level: number;
  temperature?: number;
  ph?: number;
  location?: string;
  stationId?: string;
}

export interface DataUploadResult {
  success: boolean;
  message: string;
  dataPoints?: WaterLevelData[];
  errors?: string[];
}
export interface AquiferLayer {
  id: string;
  name: string;
  depth: number;
  thickness: number;
  permeability: number;
  porosity: number;
  waterLevel: number;
  color: string;
  type: 'confined' | 'unconfined' | 'perched';
}

export interface AquiferData {
  id: string;
  location: string;
  coordinates: [number, number];
  surfaceElevation: number;
  layers: AquiferLayer[];
  wells: WellData[];
}

export interface WellData {
  id: string;
  depth: number;
  diameter: number;
  waterLevel: number;
  pumpingRate?: number;
  status: 'active' | 'inactive' | 'monitoring';
}