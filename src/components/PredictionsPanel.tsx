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
import { format, addHours } from 'date-fns';
import { TrendingUp, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { DWLRStation, PredictionData } from '../types';
import { generateMockData, generatePredictions } from '../data/mockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PredictionsPanelProps {
  stations: DWLRStation[];
}

const PredictionsPanel: React.FC<PredictionsPanelProps> = ({ stations }) => {
  const [selectedStation, setSelectedStation] = useState<string>(stations[0]?.id || '');
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedStation) {
      setIsLoading(true);
      const station = stations.find(s => s.id === selectedStation);
      if (station) {
        const historical = generateMockData(selectedStation, 24);
        const predicted = generatePredictions(station.currentLevel);
        
        setHistoricalData(historical);
        setPredictions(predicted);
      }
      setIsLoading(false);
    }
  }, [selectedStation, stations]);

  const currentStation = stations.find(s => s.id === selectedStation);

  const chartData = {
    labels: [
      ...historicalData.slice(-12).map(d => format(d.timestamp, 'HH:mm')),
      ...predictions.slice(0, 12).map(p => format(p.timestamp, 'HH:mm'))
    ],
    datasets: [
      {
        label: 'Historical Data',
        data: [
          ...historicalData.slice(-12).map(d => d.level),
          ...Array(12).fill(null)
        ],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'AI Predictions',
        data: [
          ...Array(11).fill(null),
          historicalData[historicalData.length - 1]?.level,
          ...predictions.slice(0, 11).map(p => p.predictedLevel)
        ],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5],
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(168, 85, 247)',
      },
      {
        label: 'Confidence Band',
        data: [
          ...Array(11).fill(null),
          historicalData[historicalData.length - 1]?.level,
          ...predictions.slice(0, 11).map(p => p.predictedLevel + (1 - p.confidence) * 10)
        ],
        borderColor: 'rgba(168, 85, 247, 0.3)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 1,
        fill: '+1',
        tension: 0.4,
        pointRadius: 0,
      }
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `AI Water Level Predictions - ${currentStation?.name}`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          afterBody: function(context) {
            const datasetIndex = context[0].datasetIndex;
            const dataIndex = context[0].dataIndex;
            
            if (datasetIndex === 1 && dataIndex >= 12) {
              const predictionIndex = dataIndex - 12;
              const prediction = predictions[predictionIndex];
              if (prediction) {
                return [`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`];
              }
            }
            return [];
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
      },
      y: {
        title: {
          display: true,
          text: 'Water Level (meters MSL)',
        },
      },
    },
  };

  const riskAssessment = () => {
    if (predictions.length === 0) return null;

    const next24Hours = predictions.slice(0, 24);
    const maxPredicted = Math.max(...next24Hours.map(p => p.predictedLevel));
    const minPredicted = Math.min(...next24Hours.map(p => p.predictedLevel));
    const currentLevel = currentStation?.currentLevel || 0;
    
    const criticalThreshold = currentLevel + 20; // Example threshold
    const warningThreshold = currentLevel + 10;
    
    let riskLevel = 'low';
    let riskColor = 'green';
    let riskIcon = CheckCircle;
    
    if (maxPredicted > criticalThreshold) {
      riskLevel = 'critical';
      riskColor = 'red';
      riskIcon = AlertCircle;
    } else if (maxPredicted > warningThreshold) {
      riskLevel = 'high';
      riskColor = 'yellow';
      riskIcon = AlertCircle;
    }

    return { riskLevel, riskColor, riskIcon, maxPredicted, minPredicted };
  };

  const risk = riskAssessment();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">AI-Powered Predictions</h2>
        </div>
        
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        >
          {stations.map(station => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risk Assessment */}
            {risk && (
              <div className={`bg-${risk.riskColor}-50 border border-${risk.riskColor}-200 rounded-lg p-4`}>
                <div className="flex items-center space-x-2 mb-2">
                  <risk.riskIcon className={`h-5 w-5 text-${risk.riskColor}-600`} />
                  <h3 className={`font-semibold text-${risk.riskColor}-800`}>Risk Assessment</h3>
                </div>
                <p className={`text-sm text-${risk.riskColor}-600`}>
                  Risk Level: <span className="font-bold">{risk.riskLevel.toUpperCase()}</span>
                </p>
                <p className={`text-sm text-${risk.riskColor}-600`}>
                  Predicted Range: {risk.minPredicted.toFixed(1)}m - {risk.maxPredicted.toFixed(1)}m
                </p>
              </div>
            )}

            {/* Model Performance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Model Performance</h3>
              </div>
              <p className="text-sm text-blue-600">Accuracy: 94.2%</p>
              <p className="text-sm text-blue-600">Confidence: 89.5%</p>
              <p className="text-sm text-blue-600">Last Updated: Now</p>
            </div>

            {/* Next Alert Prediction */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">AI Insights</h3>
              </div>
              <p className="text-sm text-purple-600">
                Pattern: {historicalData.length > 0 ? 'Seasonal variation detected' : 'Analyzing...'}
              </p>
              <p className="text-sm text-purple-600">
                Trend: {predictions.length > 0 && predictions[11] && currentStation ? 
                  (predictions[11].predictedLevel > currentStation.currentLevel ? 'Rising' : 'Falling') : 'Stable'}
              </p>
              <p className="text-sm text-purple-600">Next Update: 1 min</p>
            </div>
          </div>

          {/* Detailed Predictions Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">24-Hour Forecast</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Predicted Level</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Confidence</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {predictions.slice(0, 24).map((prediction, index) => {
                    const status = prediction.predictedLevel > (currentStation?.currentLevel || 0) + 15 ? 'critical' :
                                  prediction.predictedLevel > (currentStation?.currentLevel || 0) + 8 ? 'warning' : 'normal';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-3">{format(prediction.timestamp, 'MMM dd, HH:mm')}</td>
                        <td className="px-6 py-3 font-medium">{prediction.predictedLevel.toFixed(1)}m</td>
                        <td className="px-6 py-3">{(prediction.confidence * 100).toFixed(1)}%</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            status === 'critical' ? 'bg-red-100 text-red-800' :
                            status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionsPanel;