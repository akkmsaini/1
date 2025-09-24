import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, AlertTriangle, MapPin, MessageSquare, TrendingUp, Layers } from 'lucide-react';
import WaterLevelChart from './WaterLevelChart';
import MapView from './MapView';
import Chatbot from './Chatbot';
import PredictionsPanel from './PredictionsPanel';
import AquiferVisualization from './AquiferVisualization';
import { mockStations } from '../data/mockData';
import { DWLRStation, WaterLevelData } from '../types';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'predictions' | 'aquifer' | 'chat'>('overview');
  const [stations] = useState<DWLRStation[]>(mockStations);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadedData, setUploadedData] = useState<{ [stationId: string]: WaterLevelData[] }>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleDataUploaded = (data: WaterLevelData[], stationId: string) => {
    setUploadedData(prev => ({
      ...prev,
      [stationId]: data
    }));
  };
  const onlineStations = stations.filter(s => s.status === 'online').length;
  const criticalAlerts = stations.reduce((acc, station) => 
    acc + station.alerts.filter(alert => alert.type === 'critical').length, 0
  );
  const warningAlerts = stations.reduce((acc, station) => 
    acc + station.alerts.filter(alert => alert.type === 'warning').length, 0
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'map', name: 'Map View', icon: MapPin },
    { id: 'predictions', name: 'AI Predictions', icon: TrendingUp },
    { id: 'aquifer', name: '3D Aquifer', icon: Layers },
    { id: 'chat', name: 'AI Assistant', icon: MessageSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                WaterWatch Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Last Updated: {currentTime.toLocaleTimeString()}
              </div>
              {Object.keys(uploadedData).length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{Object.keys(uploadedData).length} Custom Dataset{Object.keys(uploadedData).length > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Stations</p>
                <p className="text-3xl font-bold text-blue-600">{onlineStations}</p>
                <p className="text-xs text-gray-500">of {stations.length} total</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600">{criticalAlerts}</p>
                <p className="text-xs text-gray-500">requires attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-3xl font-bold text-yellow-600">{warningAlerts}</p>
                <p className="text-xs text-gray-500">monitor closely</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Level</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(stations.reduce((acc, s) => acc + s.currentLevel, 0) / stations.length)}
                </p>
                <p className="text-xs text-gray-500">meters MSL</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg mb-6 border border-blue-100">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100">
          {activeTab === 'overview' && (
            <div className="p-6">
              <WaterLevelChart 
                stations={stations} 
                uploadedData={uploadedData}
                onDataUploaded={handleDataUploaded}
              />
            </div>
          )}
          {activeTab === 'map' && (
            <div className="h-[600px]">
              <MapView stations={stations} />
            </div>
          )}
          {activeTab === 'predictions' && (
            <div className="p-6">
              <PredictionsPanel stations={stations} />
            </div>
          )}
        {activeTab === 'aquifer' && (
          <div className="h-[600px]">
            <AquiferVisualization />
          </div>
        )}
          {activeTab === 'chat' && (
            <div className="h-[600px]">
              <Chatbot stations={stations} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;