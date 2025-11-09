import { useEffect, useRef, useState } from 'react';
import { loadThreeJS } from '../../../lib/three-singleton';

interface CortexVisualizationProps {
  hosMetric: number;
  playbackSpeed: number;
  totalNeurons: number;
  onStatsUpdate: (stats: { connected: number; rate: number; branches: number }) => void;
}

export function CortexVisualization({
  hosMetric,
  playbackSpeed,
  totalNeurons,
  onStatsUpdate
}: CortexVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const neuronsRef = useRef<any>(null);
  const connectionsRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [connectedCount, setConnectedCount] = useState(0);
  const [branches, setBranches] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastUpdateTime = useRef(Date.now());
  const connectionHistory = useRef<number[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene with singleton pattern
    const initScene = async () => {
      const { THREE, OrbitControls } = await loadThreeJS();

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0f);
      scene.fog = new THREE.Fog(0x0a0a0f, 50, 200);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current!.clientWidth / containerRef.current!.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 50);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      const containerWidth = containerRef.current!.clientWidth;
      const containerHeight = containerRef.current!.clientHeight;
      
      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Style the canvas to fit container perfectly
      Object.assign(renderer.domElement.style, {
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'absolute',
        top: '0',
        left: '0'
      });
      
      containerRef.current!.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 20;
      controls.maxDistance = 150;
      controlsRef.current = controls;

      // Create neurons (GPU instanced points)
      await createNeurons(scene, totalNeurons);

      // Create connections container
      const connectionsGeometry = new THREE.BufferGeometry();
      const connectionsMaterial = new THREE.LineBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const connections = new THREE.LineSegments(connectionsGeometry, connectionsMaterial);
      scene.add(connections);
      connectionsRef.current = connections;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0x8b5cf6, 1, 100);
      pointLight.position.set(0, 0, 30);
      scene.add(pointLight);

      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);

        if (controlsRef.current) {
          controlsRef.current.update();
        }

        // Update neuron flicker
        if (neuronsRef.current) {
          const material = neuronsRef.current.material as THREE.ShaderMaterial;
          material.uniforms.time.value += 0.01;
        }

        // Simulate progressive connections (always running)
        if (connectedCount < totalNeurons) {
          const now = Date.now();
          const deltaTime = (now - lastUpdateTime.current) / 1000;
          
          // Connection rate based on HOS metric and playback speed
          const baseRate = 0.5; // connections per second at HOS=50
          const rate = (baseRate * (hosMetric / 50)) * playbackSpeed;
          
          if (deltaTime >= 1 / rate) {
            void addConnection(scene);
            setConnectedCount(prev => {
              const newCount = Math.min(prev + 1, totalNeurons);
              
              // Track connection rate
              connectionHistory.current.push(newCount);
              if (connectionHistory.current.length > 10) {
                connectionHistory.current.shift();
              }
              
              // Calculate current rate
              const currentRate = connectionHistory.current.length > 1
                ? (connectionHistory.current[connectionHistory.current.length - 1] - connectionHistory.current[0]) / 10
                : 0;
              
              // Trigger branching
              if (hosMetric > 70 && Math.random() < 0.1) {
                setBranches(prev => prev + 1);
              }
              
              onStatsUpdate({
                connected: newCount,
                rate: currentRate,
                branches: branches
              });
              
              return newCount;
            });
            
            lastUpdateTime.current = now;
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current || !camera || !renderer) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      setIsLoading(false);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        if (controlsRef.current) {
          controlsRef.current.dispose();
        }
        
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        
        if (containerRef.current && rendererRef.current) {
          try {
            containerRef.current.removeChild(rendererRef.current.domElement);
          } catch (e) {
            // Element may already be removed
          }
        }
      };
    };

    initScene();
  }, []);

  // Update total neurons when prop changes
  useEffect(() => {
    if (sceneRef.current) {
      if (neuronsRef.current) {
        sceneRef.current.remove(neuronsRef.current);
      }
      void createNeurons(sceneRef.current, totalNeurons);
      setConnectedCount(0);
      setBranches(0);
    }
  }, [totalNeurons]);

  const createNeurons = async (scene: any, count: number) => {
    const { THREE } = await loadThreeJS();
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randomSeeds = new Float32Array(count);

    // Generate brain-shaped point cloud
    for (let i = 0; i < count; i++) {
      // Create ellipsoid shape (brain-like)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const radius = 20 + Math.random() * 10;
      const x = radius * Math.sin(phi) * Math.cos(theta) * 1.2; // wider
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) * 0.8; // flatter
      
      // Add noise for organic feel
      const noise = (Math.random() - 0.5) * 3;
      
      positions[i * 3] = x + noise;
      positions[i * 3 + 1] = y + noise;
      positions[i * 3 + 2] = z + noise;

      // Color (blue to purple gradient)
      const colorMix = Math.random();
      colors[i * 3] = 0.5 + colorMix * 0.5; // R
      colors[i * 3 + 1] = 0.3 + colorMix * 0.3; // G
      colors[i * 3 + 2] = 0.9 + colorMix * 0.1; // B

      // Size variation
      sizes[i] = 0.5 + Math.random() * 1.5;

      // Random seed for flicker
      randomSeeds[i] = Math.random() * 100;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('randomSeed', new THREE.BufferAttribute(randomSeeds, 1));

    // Shader material for flicker effect
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute float randomSeed;
        varying vec3 vColor;
        varying float vFlicker;
        uniform float time;

        void main() {
          vColor = color;
          
          // Flicker calculation
          float flicker = sin(time * 2.0 + randomSeed * 10.0) * 0.3 + 0.7;
          vFlicker = flicker;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * vFlicker;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vFlicker;

        void main() {
          // Circular point
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;

          // Glow effect
          float alpha = 1.0 - (dist * 2.0);
          alpha = pow(alpha, 2.0) * vFlicker;

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    neuronsRef.current = points;
  };

  const addConnection = async (scene: any) => {
    if (!neuronsRef.current || !connectionsRef.current) return;
    const { THREE } = await loadThreeJS();

    const positions = neuronsRef.current.geometry.attributes.position;
    const count = positions.count;

    // Select two random unconnected points
    const idx1 = Math.floor(Math.random() * Math.min(count, connectedCount + 100));
    const idx2 = Math.floor(Math.random() * Math.min(count, connectedCount + 100));

    if (idx1 === idx2) return;

    const p1 = new THREE.Vector3(
      positions.getX(idx1),
      positions.getY(idx1),
      positions.getZ(idx1)
    );

    const p2 = new THREE.Vector3(
      positions.getX(idx2),
      positions.getY(idx2),
      positions.getZ(idx2)
    );

    // Add connection to geometry
    const currentPositions = connectionsRef.current.geometry.attributes.position;
    const newPositions = new Float32Array((currentPositions ? currentPositions.count : 0) * 3 + 6);
    
    if (currentPositions) {
      newPositions.set(currentPositions.array);
    }
    
    const offset = currentPositions ? currentPositions.count * 3 : 0;
    newPositions[offset] = p1.x;
    newPositions[offset + 1] = p1.y;
    newPositions[offset + 2] = p1.z;
    newPositions[offset + 3] = p2.x;
    newPositions[offset + 4] = p2.y;
    newPositions[offset + 5] = p2.z;

    connectionsRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(newPositions, 3)
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg bg-[#0a0a0f] border border-border"
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        contain: 'layout size style'
      }}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm">Initializing Neural Cortex...</p>
          </div>
        </div>
      )}
      
      {/* Instructions Overlay */}
      {!isLoading && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs">
          <p>🖱️ Drag to rotate • Scroll to zoom • Right-click drag to pan</p>
        </div>
      )}

      {/* Connection Progress */}
      {!isLoading && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs">
          <p className="mb-1">Progress: {((connectedCount / totalNeurons) * 100).toFixed(1)}%</p>
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${(connectedCount / totalNeurons) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
