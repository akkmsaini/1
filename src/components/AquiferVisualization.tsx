import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Layers, RotateCcw, ZoomIn, ZoomOut, Play, Pause, Settings } from 'lucide-react';
import { AquiferData, AquiferLayer } from '../types';
import { mockAquiferData, generateAquiferAnimation } from '../data/aquiferData';

interface AquiferVisualizationProps {
  selectedAquifer?: string;
}

const AquiferVisualization: React.FC<AquiferVisualizationProps> = ({ selectedAquifer }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  
  const [aquiferData, setAquiferData] = useState<AquiferData[]>(mockAquiferData);
  const [currentAquifer, setCurrentAquifer] = useState<AquiferData>(
    mockAquiferData.find(a => a.id === selectedAquifer) || mockAquiferData[0]
  );
  const [isAnimating, setIsAnimating] = useState(true);
  const [showWells, setShowWells] = useState(true);
  const [showWaterFlow, setShowWaterFlow] = useState(true);
  const [crossSection, setCrossSection] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 30, 50);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Controls
    let mouseX = 0, mouseY = 0;
    let isMouseDown = false;

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      camera.position.x = camera.position.x * Math.cos(deltaX * 0.01) - camera.position.z * Math.sin(deltaX * 0.01);
      camera.position.z = camera.position.x * Math.sin(deltaX * 0.01) + camera.position.z * Math.cos(deltaX * 0.01);
      camera.position.y += deltaY * 0.1;

      camera.lookAt(0, 0, 0);

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleWheel = (event: WheelEvent) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(scale);
      camera.lookAt(0, 0, 0);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Initial render
    createAquiferVisualization();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const newAquifer = mockAquiferData.find(a => a.id === selectedAquifer) || mockAquiferData[0];
    setCurrentAquifer(newAquifer);
    createAquiferVisualization();
  }, [selectedAquifer]);

  const createAquiferVisualization = () => {
    if (!sceneRef.current) return;

    // Clear existing objects
    while (sceneRef.current.children.length > 2) { // Keep lights
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    const scene = sceneRef.current;
    const aquifer = currentAquifer;

    // Create ground surface
    const surfaceGeometry = new THREE.PlaneGeometry(100, 100);
    const surfaceMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x228B22,
      transparent: true,
      opacity: 0.8
    });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0;
    surface.receiveShadow = true;
    scene.add(surface);

    // Create aquifer layers
    let currentDepth = 0;
    aquifer.layers.forEach((layer, index) => {
      const layerGeometry = new THREE.BoxGeometry(80, layer.thickness, 60);
      const layerMaterial = new THREE.MeshLambertMaterial({ 
        color: layer.color,
        transparent: true,
        opacity: 0.8
      });
      
      const layerMesh = new THREE.Mesh(layerGeometry, layerMaterial);
      layerMesh.position.set(0, -(currentDepth + layer.thickness / 2), 0);
      layerMesh.castShadow = true;
      layerMesh.receiveShadow = true;
      scene.add(layerMesh);

      // Add water level visualization for aquifer layers
      if (layer.waterLevel > 0 && showWaterFlow) {
        const waterGeometry = new THREE.PlaneGeometry(75, 55);
        const waterMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x0077BE,
          transparent: true,
          opacity: 0.6
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, -layer.waterLevel, 0);
        scene.add(water);

        // Add water flow particles
        if (showWaterFlow) {
          const particleCount = 200;
          const particles = new THREE.BufferGeometry();
          const positions = new Float32Array(particleCount * 3);
          
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 70;
            positions[i * 3 + 1] = -layer.waterLevel + (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
          }
          
          particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          const particleMaterial = new THREE.PointsMaterial({
            color: 0x0099FF,
            size: 0.5,
            transparent: true,
            opacity: 0.8
          });
          
          const particleSystem = new THREE.Points(particles, particleMaterial);
          scene.add(particleSystem);
        }
      }

      // Add layer labels
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 512;
      canvas.height = 128;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#000000';
      context.font = '24px Arial';
      context.textAlign = 'center';
      context.fillText(layer.name, canvas.width / 2, 40);
      context.fillText(`Depth: ${layer.depth}m - ${layer.depth + layer.thickness}m`, canvas.width / 2, 70);
      context.fillText(`Permeability: ${layer.permeability} m/day`, canvas.width / 2, 100);

      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.9
      });
      const labelGeometry = new THREE.PlaneGeometry(20, 5);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(45, -(currentDepth + layer.thickness / 2), 0);
      scene.add(label);

      currentDepth += layer.thickness;
    });

    // Add wells
    if (showWells) {
      aquifer.wells.forEach((well, index) => {
        // Well casing
        const wellGeometry = new THREE.CylinderGeometry(
          well.diameter / 2, 
          well.diameter / 2, 
          well.depth, 
          8
        );
        const wellMaterial = new THREE.MeshLambertMaterial({ 
          color: well.status === 'active' ? 0x4169E1 : 0x808080
        });
        const wellMesh = new THREE.Mesh(wellGeometry, wellMaterial);
        wellMesh.position.set(
          (index - aquifer.wells.length / 2) * 20, 
          -well.depth / 2, 
          -25
        );
        scene.add(wellMesh);

        // Water level in well
        const waterLevelGeometry = new THREE.CylinderGeometry(
          well.diameter / 2 - 0.02, 
          well.diameter / 2 - 0.02, 
          0.5, 
          8
        );
        const waterLevelMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x0077BE,
          transparent: true,
          opacity: 0.8
        });
        const waterLevel = new THREE.Mesh(waterLevelGeometry, waterLevelMaterial);
        waterLevel.position.set(
          (index - aquifer.wells.length / 2) * 20, 
          -well.waterLevel, 
          -25
        );
        scene.add(waterLevel);

        // Well head
        const wellHeadGeometry = new THREE.CylinderGeometry(
          well.diameter, 
          well.diameter, 
          2, 
          8
        );
        const wellHeadMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x654321
        });
        const wellHead = new THREE.Mesh(wellHeadGeometry, wellHeadMaterial);
        wellHead.position.set(
          (index - aquifer.wells.length / 2) * 20, 
          1, 
          -25
        );
        scene.add(wellHead);
      });
    }

    // Start animation loop
    animate();
  };

  const animate = () => {
    if (!isAnimating) return;

    animationRef.current = requestAnimationFrame(animate);

    if (sceneRef.current && rendererRef.current && cameraRef.current) {
      // Update water levels with animation
      const time = Date.now() * animationSpeed;
      const animatedLayers = generateAquiferAnimation(currentAquifer, time);
      
      // Update particle positions for water flow
      sceneRef.current.children.forEach(child => {
        if (child instanceof THREE.Points) {
          const positions = child.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.1; // X movement
            positions[i + 2] += (Math.random() - 0.5) * 0.1; // Z movement
            
            // Reset particles that go out of bounds
            if (Math.abs(positions[i]) > 35) positions[i] = (Math.random() - 0.5) * 70;
            if (Math.abs(positions[i + 2]) > 25) positions[i + 2] = (Math.random() - 0.5) * 50;
          }
          child.geometry.attributes.position.needsUpdate = true;
        }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(50, 30, 50);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
    if (!isAnimating) {
      animate();
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* 3D Visualization Container */}
      <div ref={mountRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-4 z-10">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indian Aquifer Systems
          </label>
          <select
            value={currentAquifer.id}
            onChange={(e) => {
              const aquifer = mockAquiferData.find(a => a.id === e.target.value);
              if (aquifer) {
                setCurrentAquifer(aquifer);
                createAquiferVisualization();
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            {mockAquiferData.map(aquifer => (
              <option key={aquifer.id} value={aquifer.id}>
                {aquifer.location}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <button
            onClick={toggleAnimation}
            className="flex items-center space-x-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isAnimating ? 'Pause' : 'Play'} Animation</span>
          </button>

          <button
            onClick={resetView}
            className="flex items-center space-x-2 w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset View</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showWells}
              onChange={(e) => {
                setShowWells(e.target.checked);
                createAquiferVisualization();
              }}
              className="rounded"
            />
            <span>Show Wells</span>
          </label>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showWaterFlow}
              onChange={(e) => {
                setShowWaterFlow(e.target.checked);
                createAquiferVisualization();
              }}
              className="rounded"
            />
            <span>Show Water Flow</span>
          </label>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={crossSection}
              onChange={(e) => setCrossSection(e.target.checked)}
              className="rounded"
            />
            <span>Cross Section View</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Animation Speed
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">{animationSpeed}x</div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs z-10">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Layers className="h-4 w-4 mr-2" />
          Indian Aquifer Data
        </h3>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Location:</span>
            <div className="text-gray-600">{currentAquifer.location}</div>
          </div>
          
          <div>
            <span className="font-medium">Surface Elevation:</span>
            <div className="text-gray-600">{currentAquifer.surfaceElevation}m MSL</div>
          </div>
          
          <div>
            <span className="font-medium">Total Depth:</span>
            <div className="text-gray-600">
              {currentAquifer.layers.reduce((sum, layer) => sum + layer.thickness, 0)}m
            </div>
          </div>
          
          <div>
            <span className="font-medium">Active Wells:</span>
            <div className="text-gray-600">
              {currentAquifer.wells.filter(w => w.status === 'active').length} of {currentAquifer.wells.length}
            </div>
          </div>
          
          <div>
            <span className="font-medium">Geological Formation:</span>
            <div className="text-gray-600 text-xs">
              {currentAquifer.location.includes('Indo-Gangetic') ? 'Alluvial Deposits' :
               currentAquifer.location.includes('Deccan') ? 'Basaltic Formation' :
               currentAquifer.location.includes('Karnataka') ? 'Hard Rock Aquifer' :
               currentAquifer.location.includes('Coastal') ? 'Sedimentary Basin' :
               currentAquifer.location.includes('Gondwana') ? 'Coal Basin Aquifer' :
               currentAquifer.location.includes('Thar') ? 'Arid Zone Aquifer' :
               currentAquifer.location.includes('Brahmaputra') ? 'Riverine Deposits' :
               'Mixed Formation'}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">Geological Layers</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {currentAquifer.layers.map((layer, index) => (
              <div key={layer.id} className="text-xs p-2 rounded" style={{ backgroundColor: layer.color + '20' }}>
                <div className="font-medium">{layer.name}</div>
                <div className="text-gray-600">
                  {layer.depth}m - {layer.depth + layer.thickness}m
                </div>
                <div className="text-gray-600">
                  Porosity: {(layer.porosity * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
        <h4 className="font-medium text-gray-800 mb-2">Navigation & Legend</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Mouse drag: Rotate view</div>
          <div>• Mouse wheel: Zoom in/out</div>
          <div>• Blue particles: Water flow</div>
          <div>• Cylinders: Monitoring wells</div>
          <div>• Colors: Geological formations</div>
          <div>• Transparency: Water tables</div>
        </div>
      </div>
    </div>
  );
};

export default AquiferVisualization;