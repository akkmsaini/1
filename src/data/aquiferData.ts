import { AquiferData } from '../types';

export const mockAquiferData: AquiferData[] = [
  // North India - Indo-Gangetic Plains
  {
    id: 'AQ-IND-001',
    location: 'Indo-Gangetic Plains - Delhi NCR',
    coordinates: [28.6139, 77.2090],
    surfaceElevation: 218,
    layers: [
      {
        id: 'layer-1',
        name: 'Recent Alluvium (Topsoil)',
        depth: 0,
        thickness: 12,
        permeability: 2.5,
        porosity: 0.38,
        waterLevel: 0,
        color: '#D2691E',
        type: 'unconfined'
      },
      {
        id: 'layer-2',
        name: 'Newer Alluvium (Fine Sand)',
        depth: 12,
        thickness: 28,
        permeability: 8.2,
        porosity: 0.32,
        waterLevel: 15,
        color: '#F5DEB3',
        type: 'unconfined'
      },
      {
        id: 'layer-3',
        name: 'Intermediate Clay Layer',
        depth: 40,
        thickness: 8,
        permeability: 0.005,
        porosity: 0.42,
        waterLevel: 0,
        color: '#708090',
        type: 'confined'
      },
      {
        id: 'layer-4',
        name: 'Older Alluvium (Coarse Sand & Gravel)',
        depth: 48,
        thickness: 42,
        permeability: 18.5,
        porosity: 0.28,
        waterLevel: 52,
        color: '#D2B48C',
        type: 'confined'
      },
      {
        id: 'layer-5',
        name: 'Delhi Quartzite Bedrock',
        depth: 90,
        thickness: 20,
        permeability: 0.05,
        porosity: 0.03,
        waterLevel: 0,
        color: '#2F4F4F',
        type: 'confined'
      }
    ],
    wells: [
      {
        id: 'well-1',
        depth: 85,
        diameter: 0.3,
        waterLevel: 15,
        pumpingRate: 45,
        status: 'active'
      },
      {
        id: 'well-2',
        depth: 35,
        diameter: 0.25,
        waterLevel: 18,
        status: 'monitoring'
      },
      {
        id: 'well-3',
        depth: 88,
        diameter: 0.35,
        waterLevel: 52,
        pumpingRate: 65,
        status: 'active'
      }
    ]
  },
  {
    id: 'AQ-IND-002',
    location: 'Upper Ganga Basin - Haridwar',
    coordinates: [29.9457, 78.1642],
    surfaceElevation: 314,
    layers: [
      {
        id: 'layer-1',
        name: 'Recent Alluvium (River Deposits)',
        depth: 0,
        thickness: 18,
        permeability: 12.5,
        porosity: 0.35,
        waterLevel: 6,
        color: '#DEB887',
        type: 'unconfined'
      },
      {
        id: 'layer-2',
        name: 'Bhabar Zone (Coarse Gravel)',
        depth: 18,
        thickness: 35,
        permeability: 25.8,
        porosity: 0.25,
        waterLevel: 8,
        color: '#C0C0C0',
        type: 'unconfined'
      },
      {
        id: 'layer-3',
        name: 'Terai Clay Formation',
        depth: 53,
        thickness: 12,
        permeability: 0.01,
        porosity: 0.45,
        waterLevel: 0,
        color: '#696969',
        type: 'confined'
      },
      {
        id: 'layer-4',
        name: 'Siwalik Sandstone Aquifer',
        depth: 65,
        thickness: 55,
        permeability: 15.2,
        porosity: 0.22,
        waterLevel: 70,
        color: '#F4A460',
        type: 'confined'
      }
    ],
    wells: [
      {
        id: 'well-1',
        depth: 115,
        diameter: 0.4,
        waterLevel: 8,
        pumpingRate: 85,
        status: 'active'
      },
      {
        id: 'well-2',
        depth: 48,
        diameter: 0.2,
        waterLevel: 10,
        status: 'monitoring'
      }
    ]
  },
  // West India - Deccan Trap
  {
    id: 'AQ-IND-003',
    location: 'Deccan Trap - Maharashtra Plateau',
    coordinates: [19.0760, 72.8777],
    surfaceElevation: 450,
    layers: [
      {
        id: 'layer-1',
        name: 'Weathered Basalt (Regolith)',
        depth: 0,
        thickness: 15,
        permeability: 3.2,
        porosity: 0.28,
        waterLevel: 8,
        color: '#8B4513',
        type: 'unconfined'
      },
      {
        id: 'layer-2',
        name: 'Vesicular Basalt (Upper Trap)',
        depth: 15,
        thickness: 25,
        permeability: 8.5,
        porosity: 0.18,
        waterLevel: 12,
        color: '#A0522D',
        type: 'unconfined'
      },
      {
        id: 'layer-3',
        name: 'Massive Basalt (Low Permeability)',
        depth: 40,
        thickness: 20,
        permeability: 0.2,
        porosity: 0.08,
        waterLevel: 0,
        color: '#654321',
        type: 'confined'
      },
      {
        id: 'layer-4',
        name: 'Fractured Basalt Aquifer',
        depth: 60,
        thickness: 40,
        permeability: 12.8,
        porosity: 0.15,
        waterLevel: 65,
        color: '#8B7355',
        type: 'confined'
      },
      {
        id: 'layer-5',
        name: 'Archean Granite Basement',
        depth: 100,
        thickness: 25,
        permeability: 0.1,
        porosity: 0.05,
        waterLevel: 0,
        color: '#2F4F4F',
        type: 'confined'
      }
    ],
    wells: [
      {
        id: 'well-1',
        depth: 95,
        diameter: 0.3,
        waterLevel: 12,
        pumpingRate: 35,
        status: 'active'
      },
      {
        id: 'well-2',
        depth: 45,
        diameter: 0.25,
        waterLevel: 15,
        status: 'monitoring'
      },
      {
        id: 'well-3',
        depth: 98,
        diameter: 0.35,
        waterLevel: 65,
        pumpingRate: 28,
        status: 'active'
      }
    ]
  },
  // South India - Hard Rock Aquifer
  {
    id: 'AQ-IND-004',
    location: 'Peninsular India - Karnataka Granite',
    coordinates: [12.9716, 77.5946],
    surfaceElevation: 920,
    layers: [
      {
        id: 'layer-1',
        name: 'Red Lateritic Soil',
        depth: 0,
        thickness: 8,
        permeability: 1.8,
        porosity: 0.35,
        waterLevel: 0,
        color: '#CD5C5C',
        type: 'unconfined'
      },
      {
        id: 'layer-2',
        name: 'Weathered Granite (Saprolite)',
        depth: 8,
        thickness: 22,
        permeability: 5.2,
        porosity: 0.25,
        waterLevel: 12,
        color: '#F5DEB3',
        type: 'unconfined'
      },
      {
        id: 'layer-3',
        name: 'Fractured Granite Zone',
        depth: 30,
        thickness: 35,
        permeability: 8.5,
        porosity: 0.12,
        waterLevel: 35,
        color: '#D3D3D3',
        type: 'confined'
      },
      {
        id: 'layer-4',
        name: 'Massive Granite Bedrock',
        depth: 65,
        thickness: 40,
        permeability: 0.05,
        porosity: 0.02,
        waterLevel: 0,
        color: '#696969',
        type: 'confined'
      }
    ],
    wells: [
      {
        id: 'well-1',
        depth: 60,
        diameter: 0.2,
        waterLevel: 12,
        pumpingRate: 15,
        status: 'active'
      },
      {
        id: 'well-2',
        depth: 35,
        diameter: 0.15,
        waterLevel: 18,
        status: 'monitoring'
      }
    ]
  },
  // East India - Coastal Aquifer
  {
    id: 'AQ-IND-005',
    location: 'Eastern Coastal Plains - Odisha',
    coordinates: [20.2961, 85.8245],
    surfaceElevation: 45,
    layers: [
      {
        id: 'layer-1',
        name: 'Coastal Alluvium (Recent)',
        depth: 0,
        thickness: 25,
        permeability: 15.5,
        porosity: 0.38,
        waterLevel: 3,
        color: '#F5E6A3',
        type: 'unconfined'
      },
      {
        id: 'layer-2',
        name: 'Marine Clay (Aquitard)',
        depth: 25,
        thickness: 15,
        permeability: 0.01,
        porosity: 0.48,
        waterLevel: 0,
        color: '#4682B4',
        type: 'confined'
      },
      {
        id: 'layer-3',
        name: 'Tertiary Sandstone Aquifer',
        depth: 40,
        thickness: 45,
        permeability: 22.8,
        porosity: 0.28,
        waterLevel: 42,
        color: '#DEB887',
        type: 'confined'
      },
      {
        id: 'layer-4',
        name: 'Khondalite Basement',
        depth: 85,
        thickness: 20,
        permeability: 0.08,
        porosity: 0.04,
        waterLevel: 0,
        color: '#2F4F4F',
        type: 'confined'
      }
    ],
    wells: [
      {
        id: 'well-1',
        depth: 80,
        diameter: 0.3,
        waterLevel: 3,
        pumpingRate: 55,
        status: 'active'
      },
      {
        id: 'well-2',
        depth: 30,
        diameter: 0.2,
        waterLevel: 5,
        status: 'monitoring'
      },
      {
        id: 'well-3',
        depth: 82,
        diameter: 0.35,
        waterLevel: 42,
        pumpingRate: 48,
        status: 'active'
      }
    ]
  },
  // Central India - Gondwana Aquifer
  {
    id: 'AQ-IND-006',
    location: 'Central India - Gondwana Basin (Chhattisgarh)',
    coordinates: [21.2787, 81.8661],
    surfaceElevation: 298,
    layers: [
      {
        id: 'layer-1',
        name: 'Lateritic Soil Cover',
        depth: 0,
        thickness: 12,
        permeability: 2.8,
        porosity: 0.32,
        waterLevel: 0,
        color: '#CD853F',
        type: 'unconfined'
      },
      {
        id: 'layer-2',
        name: 'Gondwana Sandstone (Upper)',
        depth: 12,
        thickness: 38,
        permeability: 12.5,
        porosity: 0.22,
        waterLevel: 18,
        color: '#F4A460',
        type: 'unconfined'
      },
      {
        id: 'layer-3',
        name: 'Coal Bearing Shale',
        depth: 50,
        thickness: 20,
        permeability: 0.05,
        porosity: 0.15,
        waterLevel: 0,
        color: '#2F2F2F',
        type: 'confined'
      },
      {
        id: 'layer-4',
        name: 'Gondwana Sandstone (Lower)',
        depth: 70,
        thickness: 50,
        permeability: 18.2,
        porosity: 0.25,
        waterLevel: 75,
        color: '#DEB887',
        type: 'confined'
      },
      {
        id: 'layer-5',
        name: 'Precambrian Basement',
        depth: 120,
        thickness: 30,
        permeability: 0.02,
        porosity: 0.03,
        waterLevel: 0,
        color: '#2F4F4F',
        type: 'confined'
      }
    ],
    wells: [
      {
        id: 'well-1',
        depth: 115,
        diameter: 0.3,
        waterLevel: 18,
        pumpingRate: 42,
        status: 'active'
      },
      {
        id: 'well-2',
        depth: 45,
        diameter: 0.25,
        waterLevel: 22,
        status: 'monitoring'
      },
      {
        id: 'well-3',
        depth: 118,
        diameter: 0.35,
        waterLevel: 75,
        pumpingRate: 38,
        status: 'active'
      }
    ]
  },
  // Northwest India - Thar Desert
  {
    id: 'AQ-IND-007',
    location: 'Thar Desert - Rajasthan Arid Zone',
    coordinates: [27.0238, 74.2179],
    surfaceElevation: 325,
    layers: [
      {
        id: 'layer-1',
        name: 'Desert Sand (Aeolian)',
        depth: 0,
        thickness: 20,
        permeability: 25.5,
        porosity: 0.35,
        waterLevel: 0,
        color: '#F4A460',
        type: 'unconfined'
      },
      {
        id: 'layer-2',
        name: 'Calcrete Layer (Kankar)',
        depth: 20,
        thickness: 8,
        permeability: 0.5,
        porosity: 0.15,
        waterLevel: 0,
        color: '#D3D3D3',
        type: 'confined'
      },
      {
        id: 'layer-3',
        name: 'Alluvial Sand & Gravel',
        depth: 28,
        thickness: 42,
        permeability: 18.8,
        porosity: 0.28,
        waterLevel: 45,
        color: '#DEB887',
        type: 'confined'
      },
      {
        id: 'layer-4',
        name: 'Aravalli Quartzite',
        depth: 70,
        thickness: 35,
        permeability: 0.8,
        porosity: 0.08,
        waterLevel: 0,
        color: '#708090',
        type: 'confined'
      }
    ],
    wells: [
      {
        id: 'well-1',
        depth: 95,
        diameter: 0.4,
        waterLevel: 45,
        pumpingRate: 25,
        status: 'active'
      },
      {
        id: 'well-2',
        depth: 65,
        diameter: 0.3,
        waterLevel: 48,
        status: 'monitoring'
      }
    ]
  },
  // Northeast India - Brahmaputra Valley
  {
    id: 'AQ-IND-008',
    location: 'Brahmaputra Valley - Assam Plains',
    coordinates: [26.2006, 92.9376],
    surfaceElevation: 55,
    layers: [
      {
        id: 'layer-1',
        name: 'Recent Alluvium (Flood Plains)',
        depth: 0,
        thickness: 35,
        permeability: 22.5,
        porosity: 0.42,
        waterLevel: 2,
        color: '#DEB887',
        type: 'unconfined'
      },
      {
        id: 'layer-2',
        name: 'Older Alluvium (Pleistocene)',
        depth: 35,
        thickness: 55,
        permeability: 15.8,
        porosity: 0.32,
        waterLevel: 8,
        color: '#D2B48C',
        type: 'unconfined'
      },
      {
        id: 'layer-3',
        name: 'Tertiary Clay Formation',
        depth: 90,
        thickness: 25,
        permeability: 0.02,
        porosity: 0.45,
        waterLevel: 0,
        color: '#708090',
        type: 'confined'
      },
      {
        id: 'layer-4',
        name: 'Shillong Group Basement',
        depth: 115,
        thickness: 20,
        permeability: 0.05,
        porosity: 0.04,
        waterLevel: 0,
        color: '#2F4F4F',
        type: 'confined'
      }
    ],
    wells: [
      {
        id: 'well-1',
        depth: 85,
        diameter: 0.3,
        waterLevel: 2,
        pumpingRate: 65,
        status: 'active'
      },
      {
        id: 'well-2',
        depth: 40,
        diameter: 0.25,
        waterLevel: 4,
        status: 'monitoring'
      },
      {
        id: 'well-3',
        depth: 88,
        diameter: 0.35,
        waterLevel: 8,
        pumpingRate: 58,
        status: 'active'
      }
    ]
  }
];

export const generateAquiferAnimation = (aquifer: AquiferData, time: number) => {
  // Simulate seasonal water level changes
  const seasonalVariation = Math.sin(time * 0.001) * 3;
  const dailyVariation = Math.sin(time * 0.01) * 0.5;
  
  return aquifer.layers.map(layer => ({
    ...layer,
    waterLevel: layer.waterLevel > 0 ? 
      Math.max(0, layer.waterLevel + seasonalVariation + dailyVariation) : 0
  }));
};