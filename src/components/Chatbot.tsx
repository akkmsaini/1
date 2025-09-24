import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MapPin, BarChart3, AlertTriangle } from 'lucide-react';
import { DWLRStation, ChatMessage } from '../types';

interface ChatbotProps {
  stations: DWLRStation[];
}

const Chatbot: React.FC<ChatbotProps> = ({ stations }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! I\'m your AI water monitoring assistant. I can help you with station reports, water level analysis, and predictions. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Station-specific queries
    for (const station of stations) {
      const stationName = station.name.toLowerCase();
      if (message.includes(stationName) || message.includes(station.id.toLowerCase())) {
        const alerts = station.alerts.length > 0 ? 
          `\n\nCurrent alerts: ${station.alerts.map(a => a.message).join(', ')}` : 
          '\n\nNo active alerts.';
        
        return `Here's the current status for ${station.name}:
        
📍 Location: ${stationName}
💧 Current Level: ${station.currentLevel}m MSL
🔧 Status: ${station.status.toUpperCase()}
⏰ Last Reading: ${station.lastReading.toLocaleTimeString()}${alerts}

Would you like more detailed analysis or predictions for this station?`;
      }
    }
    
    // General queries
    if (message.includes('status') || message.includes('overview')) {
      const onlineCount = stations.filter(s => s.status === 'online').length;
      const alertCount = stations.reduce((acc, s) => acc + s.alerts.length, 0);
      const criticalAlerts = stations.reduce((acc, s) => 
        acc + s.alerts.filter(a => a.type === 'critical').length, 0);
      
      return `📊 System Overview:
      
✅ Active Stations: ${onlineCount}/${stations.length}
⚠️ Total Alerts: ${alertCount}
🚨 Critical Alerts: ${criticalAlerts}
📈 Average Level: ${(stations.reduce((acc, s) => acc + s.currentLevel, 0) / stations.length).toFixed(1)}m MSL

All systems are monitoring normally. Would you like details on any specific station?`;
    }
    
    if (message.includes('alert') || message.includes('warning') || message.includes('critical')) {
      const alertedStations = stations.filter(s => s.alerts.length > 0);
      if (alertedStations.length === 0) {
        return '✅ Great news! No active alerts across all monitoring stations.';
      }
      
      return `🚨 Active Alerts Summary:
      
${alertedStations.map(station => 
  `${station.name}:\n${station.alerts.map(alert => 
    `  • ${alert.type.toUpperCase()}: ${alert.message}`
  ).join('\n')}`
).join('\n\n')}

Would you like detailed analysis for any of these stations?`;
    }
    
    if (message.includes('prediction') || message.includes('forecast')) {
      return `🔮 AI Predictions Available:
      
I can provide 24-hour forecasts for any station including:
• Water level trends
• Risk assessments  
• Confidence intervals
• Environmental factors

Which station would you like predictions for? You can ask like:
"Show predictions for Delhi" or "Forecast for DWLR-001"`;
    }
    
    if (message.includes('help') || message.includes('what can you do')) {
      return `🤖 I can help you with:
      
📊 **Station Reports**: Get current status, levels, and alerts
📈 **Data Analysis**: Historical trends and comparisons  
🔮 **AI Predictions**: 24-hour forecasts and risk assessment
🗺️ **Location Info**: Geographic and environmental data
⚠️ **Alert Management**: Critical notifications and warnings
📋 **Custom Reports**: Tailored analysis for specific areas

Try asking:
• "Status of Yamuna River station"
• "Show me critical alerts"  
• "Predict water levels for Delhi"
• "Compare stations in Maharashtra"`;
    }
    
    if (message.includes('compare') || message.includes('comparison')) {
      return `📊 Station Comparison:
      
${stations.slice(0, 3).map(station => 
  `${station.name}: ${station.currentLevel}m (${station.status})`
).join('\n')}

Which specific stations would you like me to compare? I can analyze:
• Current levels and trends
• Alert histories
• Environmental conditions
• Prediction accuracy`;
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". I can help with water level monitoring data, station reports, predictions, and alerts. 

Try being more specific, like:
• "Show status for [station name]"  
• "Current alerts"
• "Water level predictions"
• "Compare stations"

What would you like to know?`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: generateBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: 'System Status', query: 'Show me system status' },
    { label: 'Critical Alerts', query: 'Show critical alerts' },
    { label: 'Predictions', query: 'Show AI predictions' },
    { label: 'Station List', query: 'List all stations' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <Bot className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">AI Water Monitoring Assistant</h3>
            <p className="text-sm text-blue-100">Online • Ready to help with water level analysis</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50 border-b">
        <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInput(action.query)}
              className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'bot' && (
                  <Bot className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                )}
                {message.sender === 'user' && (
                  <User className="h-4 w-4 text-blue-200 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-line">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-purple-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about water levels, predictions, or station reports..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;