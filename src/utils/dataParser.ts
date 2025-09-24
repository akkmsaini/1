import { WaterLevelData, UploadedDataPoint, DataUploadResult } from '../types';

export const parseCSVData = (csvContent: string, stationId: string, stationName: string, coordinates: [number, number]): DataUploadResult => {
  try {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      return {
        success: false,
        message: 'CSV file must contain at least a header row and one data row'
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dataPoints: WaterLevelData[] = [];
    const errors: string[] = [];

    // Expected headers (flexible matching)
    const timestampHeaders = ['timestamp', 'date', 'datetime', 'time'];
    const levelHeaders = ['level', 'water_level', 'waterlevel', 'height', 'depth'];
    const temperatureHeaders = ['temperature', 'temp', 'water_temp'];
    const phHeaders = ['ph', 'ph_level', 'acidity'];

    const timestampIndex = headers.findIndex(h => timestampHeaders.some(th => h.includes(th)));
    const levelIndex = headers.findIndex(h => levelHeaders.some(lh => h.includes(lh)));
    const temperatureIndex = headers.findIndex(h => temperatureHeaders.some(th => h.includes(th)));
    const phIndex = headers.findIndex(h => phHeaders.some(ph => h.includes(ph)));

    if (timestampIndex === -1) {
      return {
        success: false,
        message: 'CSV must contain a timestamp column (timestamp, date, datetime, or time)'
      };
    }

    if (levelIndex === -1) {
      return {
        success: false,
        message: 'CSV must contain a water level column (level, water_level, height, or depth)'
      };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      try {
        const timestampStr = values[timestampIndex];
        const levelStr = values[levelIndex];

        // Parse timestamp
        let timestamp: Date;
        if (timestampStr.includes('/') || timestampStr.includes('-')) {
          timestamp = new Date(timestampStr);
        } else {
          // Try parsing as Excel serial date
          const excelDate = parseFloat(timestampStr);
          if (!isNaN(excelDate)) {
            timestamp = new Date((excelDate - 25569) * 86400 * 1000);
          } else {
            timestamp = new Date(timestampStr);
          }
        }

        if (isNaN(timestamp.getTime())) {
          errors.push(`Row ${i + 1}: Invalid timestamp format`);
          continue;
        }

        // Parse water level
        const level = parseFloat(levelStr);
        if (isNaN(level)) {
          errors.push(`Row ${i + 1}: Invalid water level value`);
          continue;
        }

        // Parse optional fields
        const temperature = temperatureIndex !== -1 ? parseFloat(values[temperatureIndex]) : undefined;
        const ph = phIndex !== -1 ? parseFloat(values[phIndex]) : undefined;

        // Determine status based on level (you can adjust these thresholds)
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        const avgLevel = dataPoints.length > 0 ? 
          dataPoints.reduce((sum, dp) => sum + dp.level, 0) / dataPoints.length : level;
        
        if (level > avgLevel + 5) status = 'critical';
        else if (level > avgLevel + 2) status = 'warning';

        dataPoints.push({
          id: `${stationId}-uploaded-${i}`,
          timestamp,
          level,
          location: stationName,
          coordinates,
          status,
          temperature: !isNaN(temperature!) ? temperature : undefined,
          ph: !isNaN(ph!) ? ph : undefined
        });

      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (dataPoints.length === 0) {
      return {
        success: false,
        message: 'No valid data points could be parsed from the file',
        errors
      };
    }

    // Sort by timestamp
    dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      success: true,
      message: `Successfully parsed ${dataPoints.length} data points`,
      dataPoints,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    return {
      success: false,
      message: `Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const parseJSONData = (jsonContent: string, stationId: string, stationName: string, coordinates: [number, number]): DataUploadResult => {
  try {
    const data = JSON.parse(jsonContent);
    const dataPoints: WaterLevelData[] = [];
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      return {
        success: false,
        message: 'JSON data must be an array of objects'
      };
    }

    data.forEach((item, index) => {
      try {
        if (typeof item !== 'object' || item === null) {
          errors.push(`Item ${index + 1}: Must be an object`);
          return;
        }

        // Flexible field matching
        const timestamp = new Date(
          item.timestamp || item.date || item.datetime || item.time
        );
        
        const level = parseFloat(
          item.level || item.water_level || item.waterlevel || item.height || item.depth
        );

        if (isNaN(timestamp.getTime())) {
          errors.push(`Item ${index + 1}: Invalid timestamp`);
          return;
        }

        if (isNaN(level)) {
          errors.push(`Item ${index + 1}: Invalid water level`);
          return;
        }

        const temperature = item.temperature || item.temp || item.water_temp;
        const ph = item.ph || item.ph_level || item.acidity;

        let status: 'normal' | 'warning' | 'critical' = 'normal';
        if (item.status) {
          status = item.status.toLowerCase();
        } else {
          // Auto-determine status
          const avgLevel = dataPoints.length > 0 ? 
            dataPoints.reduce((sum, dp) => sum + dp.level, 0) / dataPoints.length : level;
          
          if (level > avgLevel + 5) status = 'critical';
          else if (level > avgLevel + 2) status = 'warning';
        }

        dataPoints.push({
          id: `${stationId}-uploaded-${index}`,
          timestamp,
          level,
          location: item.location || stationName,
          coordinates: item.coordinates || coordinates,
          status,
          temperature: temperature ? parseFloat(temperature) : undefined,
          ph: ph ? parseFloat(ph) : undefined
        });

      } catch (error) {
        errors.push(`Item ${index + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    });

    if (dataPoints.length === 0) {
      return {
        success: false,
        message: 'No valid data points could be parsed from the JSON',
        errors
      };
    }

    // Sort by timestamp
    dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      success: true,
      message: `Successfully parsed ${dataPoints.length} data points`,
      dataPoints,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    return {
      success: false,
      message: `Error parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};