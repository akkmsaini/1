import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import { parseCSVData, parseJSONData } from '../utils/dataParser';
import { WaterLevelData, DataUploadResult } from '../types';

interface DataUploadProps {
  onDataUploaded: (data: WaterLevelData[], stationId: string) => void;
  onClose: () => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataUploaded, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DataUploadResult | null>(null);
  const [stationInfo, setStationInfo] = useState({
    id: '',
    name: '',
    latitude: '',
    longitude: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!stationInfo.id || !stationInfo.name || !stationInfo.latitude || !stationInfo.longitude) {
      setUploadResult({
        success: false,
        message: 'Please fill in all station information fields before uploading data'
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const content = await file.text();
      const coordinates: [number, number] = [parseFloat(stationInfo.latitude), parseFloat(stationInfo.longitude)];
      
      let result: DataUploadResult;
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        result = parseCSVData(content, stationInfo.id, stationInfo.name, coordinates);
      } else if (file.name.toLowerCase().endsWith('.json')) {
        result = parseJSONData(content, stationInfo.id, stationInfo.name, coordinates);
      } else {
        result = {
          success: false,
          message: 'Unsupported file format. Please upload CSV or JSON files only.'
        };
      }

      setUploadResult(result);

      if (result.success && result.dataPoints) {
        onDataUploaded(result.dataPoints, stationInfo.id);
      }

    } catch (error) {
      setUploadResult({
        success: false,
        message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `timestamp,level,temperature,ph
2024-01-15 08:00:00,205.5,22.3,7.2
2024-01-15 08:01:00,205.7,22.4,7.1
2024-01-15 08:02:00,205.6,22.5,7.3
2024-01-15 08:03:00,205.8,22.3,7.2`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_water_level_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSampleJSON = () => {
    const sampleData = [
      {
        timestamp: "2024-01-15T08:00:00Z",
        level: 205.5,
        temperature: 22.3,
        ph: 7.2,
        status: "normal"
      },
      {
        timestamp: "2024-01-15T08:01:00Z",
        level: 205.7,
        temperature: 22.4,
        ph: 7.1,
        status: "normal"
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_water_level_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Upload Water Level Data</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Station Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Station Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station ID *
                </label>
                <input
                  type="text"
                  value={stationInfo.id}
                  onChange={(e) => setStationInfo(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="e.g., DWLR-006"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station Name *
                </label>
                <input
                  type="text"
                  value={stationInfo.name}
                  onChange={(e) => setStationInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ganges River - Varanasi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={stationInfo.latitude}
                  onChange={(e) => setStationInfo(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="e.g., 25.3176"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={stationInfo.longitude}
                  onChange={(e) => setStationInfo(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="e.g., 82.9739"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Upload Data File</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your data file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports CSV and JSON files (max 10MB)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Processing...' : 'Choose File'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>

          {/* Sample Files */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Sample Data Formats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={downloadSampleCSV}
                className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-5 w-5 text-blue-600" />
                <span>Download Sample CSV</span>
              </button>
              <button
                onClick={downloadSampleJSON}
                className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-5 w-5 text-blue-600" />
                <span>Download Sample JSON</span>
              </button>
            </div>
          </div>

          {/* Data Format Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Data Format Requirements</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Required fields:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Timestamp (timestamp, date, datetime, or time)</li>
                <li>Water Level (level, water_level, height, or depth)</li>
              </ul>
              <p className="mt-2"><strong>Optional fields:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Temperature (temperature, temp, water_temp)</li>
                <li>pH Level (ph, ph_level, acidity)</li>
                <li>Status (normal, warning, critical)</li>
              </ul>
            </div>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className={`border rounded-lg p-4 ${
              uploadResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-start space-x-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    uploadResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {uploadResult.message}
                  </p>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-700">Errors encountered:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside mt-1 max-h-32 overflow-y-auto">
                        {uploadResult.errors.slice(0, 10).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadResult.errors.length > 10 && (
                          <li>... and {uploadResult.errors.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {uploadResult.success && uploadResult.dataPoints && (
                    <div className="mt-2 text-sm text-green-700">
                      <p>Data points: {uploadResult.dataPoints.length}</p>
                      <p>Date range: {uploadResult.dataPoints[0]?.timestamp.toLocaleDateString()} - {uploadResult.dataPoints[uploadResult.dataPoints.length - 1]?.timestamp.toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {uploadResult?.success && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;