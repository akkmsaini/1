import { WaterLevelData, DWLRStation, PredictionData } from '../types';

export const mockStations: DWLRStation[] = [
  {
    id: 'DWLR-001',
    name: 'Yamuna River - Delhi',
    coordinates: [28.6139, 77.2090],
    status: 'online',
    lastReading: new Date(),
    currentLevel: 205.5,
    alerts: []
  },
  {
    id: 'DWLR-002',
    name: 'Ganga River - Haridwar',
    coordinates: [29.9457, 78.1642],
    status: 'online',
    lastReading: new Date(),
    currentLevel: 314.2,
    alerts: [{ id: '1', type: 'warning', message: 'Water level approaching warning threshold', timestamp: new Date() }]
  },
  {
    id: 'DWLR-003',
    name: 'Narmada River - Bhopal',
    coordinates: [23.2599, 77.4126],
    status: 'online',
    lastReading: new Date(),
    currentLevel: 189.8,
    alerts: []
  },
  {
    id: 'DWLR-004',
    name: 'Krishna River - Hyderabad',
    coordinates: [17.3850, 78.4867],
    status: 'maintenance',
    lastReading: new Date(Date.now() - 2 * 60 * 60 * 1000),
    currentLevel: 156.3,
    alerts: [{ id: '2', type: 'info', message: 'Station under maintenance', timestamp: new Date() }]
  },
  {
    id: 'DWLR-005',
    name: 'Godavari River - Nashik',
    coordinates: [19.9975, 73.7898],
    status: 'online',
    lastReading: new Date(),
    currentLevel: 442.1,
    alerts: [{ id: '3', type: 'critical', message: 'Critical water level reached', timestamp: new Date() }]
  }
];

export const generateMockData = (stationId: string, hours = 24): WaterLevelData[] => {
  const data: WaterLevelData[] = [];
  const station = mockStations.find(s => s.id === stationId);
  const baseLevel = station?.currentLevel || 200;
  
  for (let i = hours * 60; i >= 0; i -= 1) {
    const timestamp = new Date(Date.now() - i * 60 * 1000);
    
    // Create more realistic water level patterns
    const timeOfDay = timestamp.getHours() + timestamp.getMinutes() / 60;
    
    // Daily tidal/flow pattern (subtle for rivers)
    const dailyPattern = Math.sin((timeOfDay - 6) * Math.PI / 12) * 0.8;
    
    // Weekly pattern (slightly higher on weekends due to dam releases)
    const dayOfWeek = timestamp.getDay();
    const weeklyPattern = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.3 : 0;
    
    // Seasonal trend (gradual change over time)
    const seasonalTrend = Math.sin(i / (24 * 60 * 7)) * 1.2;
    
    // Random variations (much smaller for realistic data)
    const randomNoise = (Math.random() - 0.5) * 0.4;
    
    // Occasional rainfall events (sudden increases)
    const rainfallEvent = Math.random() < 0.002 ? Math.random() * 3 : 0;
    
    // Gradual recession after rainfall
    const recession = rainfallEvent > 0 ? 0 : Math.max(0, (Math.random() - 0.998) * -0.1);
    
    const totalVariation = dailyPattern + weeklyPattern + seasonalTrend + randomNoise + rainfallEvent + recession;
    const level = baseLevel + totalVariation;
    
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (level > baseLevel + 5) status = 'critical';
    else if (level > baseLevel + 2.5) status = 'warning';
    
    data.push({
      id: `${stationId}-${i}`,
      timestamp,
      level: Math.round(level * 10) / 10,
      location: station?.name || 'Unknown',
      coordinates: station?.coordinates || [0, 0],
      status,
      temperature: Math.round((22 + Math.sin(timeOfDay * Math.PI / 12) * 8 + Math.random() * 2) * 10) / 10,
      ph: Math.round((7.2 + Math.sin(i / 180) * 0.8 + (Math.random() - 0.5) * 0.4) * 10) / 10
    });
  }
  
  return data.reverse();
};

export const generatePredictions = (currentLevel: number): PredictionData[] => {
  const predictions: PredictionData[] = [];
  let previousLevel = currentLevel;
  
  for (let i = 1; i <= 24; i++) {
    const timestamp = new Date(Date.now() + i * 60 * 60 * 1000);
    const timeOfDay = timestamp.getHours() + timestamp.getMinutes() / 60;
    
    // More realistic prediction patterns
    const dailyPattern = Math.sin((timeOfDay - 6) * Math.PI / 12) * 0.6;
    const gradualTrend = (Math.random() - 0.5) * 0.1; // Very gradual changes
    const momentum = (previousLevel - currentLevel) * 0.3; // Continuation of current trend
    
    // Prediction uncertainty increases with time
    const uncertainty = Math.random() * (i / 24) * 0.3;
    
    const predictedLevel = previousLevel + dailyPattern + gradualTrend + momentum + uncertainty;
    previousLevel = predictedLevel;
    
    // Confidence decreases over time but more realistically
    const confidence = Math.max(0.65, 0.95 - (i / 30));
    
    predictions.push({
      timestamp,
      predictedLevel: Math.round(predictedLevel * 10) / 10,
      confidence: Math.round(confidence * 100) / 100
    });
  }
  
  return predictions;
};