import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { Upload } from 'lucide-react';
import { generateMockData } from '../data/mockData';
import { DWLRStation, WaterLevelData } from '../types';
import DataUpload from './DataUpload';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WaterLevelChartProps {
  stations: DWLRStation[];
  uploadedData?: { [stationId: string]: WaterLevelData[] };
  onDataUploaded?: (data: WaterLevelData[], stationId: string) => void;
}

const WaterLevelChart: React.FC<WaterLevelChartProps> = ({ 
  stations, 
  uploadedData = {}, 
  onDataUploaded 
}) => {
  const [selectedStation, setSelectedStation] = useState<string>(stations[0]?.id || '');
  const [timeRange, setTimeRange] = useState<number>(24);
  const [chartData, setChartData] = useState<WaterLevelData[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (selectedStation) {
      // Use uploaded data if available, otherwise use mock data
      const data = uploadedData[selectedStation] || generateMockData(selectedStation, timeRange);
      setChartData(data);
    }
  }, [selectedStation, timeRange, uploadedData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedStation) {
        // Only update with mock data if no uploaded data exists
        if (!uploadedData[selectedStation]) {
          const data = generateMockData(selectedStation, timeRange);
          setChartData(data);
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedStation, timeRange, uploadedData]);

  const handleDataUploaded = (data: WaterLevelData[], stationId: string) => {
    if (onDataUploaded) {
      onDataUploaded(data, stationId);
    }
    setShowUpload(false);
  };
  const chartConfig = {
    labels: chartData.map(d => format(d.timestamp, 'HH:mm')),
    datasets: [
      {
        label: 'Water Level (m)',
        data: chartData.map(d => d.level),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartData.map(d => 
          d.status === 'critical' ? '#ef4444' : 
          d.status === 'warning' ? '#f59e0b' : '#10b981'
        ),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Water Level Monitoring - ${stations.find(s => s.id === selectedStation)?.name}${uploadedData[selectedStation] ? ' (Uploaded Data)' : ''}`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex;
            const data = chartData[dataIndex];
            return [
              `Status: ${data.status.toUpperCase()}`,
              `Temperature: ${data.temperature?.toFixed(1)}°C`,
              `pH: ${data.ph?.toFixed(1)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
        ticks: {
          maxTicksLimit: 12,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Water Level (meters MSL)',
        },
        beginAtZero: false,
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const currentStation = stations.find(s => s.id === selectedStation);
  const latestData = chartData[chartData.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>

          {!uploadedData[selectedStation] && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value={1}>Last Hour</option>
              <option value={6}>Last 6 Hours</option>
              <option value={12}>Last 12 Hours</option>
              <option value={24}>Last 24 Hours</option>
              <option value={48}>Last 48 Hours</option>
            </select>
          )}

          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Data</span>
          </button>
        </div>

        {latestData && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                latestData.status === 'critical' ? 'bg-red-500' : 
                latestData.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span>Current: {latestData.level}m</span>
            </div>
            <div>Status: {latestData.status.toUpperCase()}</div>
            {uploadedData[selectedStation] && (
              <div className="text-blue-600 font-medium">📁 Custom Data</div>
            )}
          </div>
        )}
      </div>

      <div className="h-96">
        <Line data={chartConfig} options={options} />
      </div>

      {currentStation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Station Info</h3>
            <p className="text-sm text-blue-600">Status: {currentStation.status.toUpperCase()}</p>
            <p className="text-sm text-blue-600">
              Last Reading: {format(currentStation.lastReading, 'MMM dd, HH:mm')}
            </p>
            <p className="text-sm text-blue-600">
              Coordinates: {currentStation.coordinates[0].toFixed(4)}, {currentStation.coordinates[1].toFixed(4)}
            </p>
            {uploadedData[selectedStation] && (
              <p className="text-sm text-blue-600 font-medium">
                Data Points: {uploadedData[selectedStation].length}
              </p>
            )}
          </div>

          {latestData && (
            <>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Environmental Data</h3>
                <p className="text-sm text-green-600">Temperature: {latestData.temperature?.toFixed(1)}°C</p>
                <p className="text-sm text-green-600">pH Level: {latestData.ph?.toFixed(1)}</p>
                <p className="text-sm text-green-600">
                  Quality: {(latestData.ph && latestData.ph >= 6.5 && latestData.ph <= 8.5) ? 'Good' : 'Monitor'}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Trend Analysis</h3>
                <p className="text-sm text-purple-600">
                  24h Change: {chartData.length >= 2 ? 
                    `${(chartData[chartData.length - 1].level - chartData[0].level).toFixed(2)}m` : 'N/A'}
                </p>
                <p className="text-sm text-purple-600">
                  Trend: {chartData.length >= 10 ? 
                    (chartData.slice(-5).every((d, i, arr) => i === 0 || d.level >= arr[i-1].level) ? 'Rising' :
                     chartData.slice(-5).every((d, i, arr) => i === 0 || d.level <= arr[i-1].level) ? 'Falling' : 'Stable') 
                    : 'Calculating...'}
                </p>
                <p className="text-sm text-purple-600">
                  {uploadedData[selectedStation] ? 'Static Data' : 'Next Update: 1 min'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {showUpload && (
        <DataUpload
          onDataUploaded={handleDataUploaded}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default WaterLevelChart;