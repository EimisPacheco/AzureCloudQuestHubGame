import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { getCachedServiceIcon } from '../services/IconResolver';
import { Link } from 'react-router-dom';
import { translateText } from '../services/TranslationService';

// Default translations
const defaultTranslations = {
  backToHome: 'Back to Home',
  selectServicePrompt: 'Select the best service to add to the architecture...'
};

const AzureServiceNode = ({ data }) => (
  <motion.div
    className={`azure-service-node ${data.isMissing ? 'missing' : ''}`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    whileHover={{ scale: 1.1 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Handle 
      type="target" 
      position="top" 
      id={`${data.id}-target`}
      className="handle"
    />
    <div className="node-content">
      <img src={data.icon} alt={data.label} className="service-icon" />
      <span className="service-label">{data.label}</span>
    </div>
    <Handle 
      type="source" 
      position="bottom" 
      id={`${data.id}-source`}
      className="handle"
    />
  </motion.div>
);

const nodeTypes = {
  azureService: AzureServiceNode
};

const createNodeId = (service) => {
  const serviceName = typeof service === 'string' ? service : service?.name;
  if (!serviceName) {
    console.warn('⚠️ Invalid service detected:', service);
    return 'invalid-service';
  }
  return serviceName.toLowerCase().replace(/\s+/g, '-');
};

const AzureArchitectureDisplay = ({ architecture, currentLanguage = 'en' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const hasLoggedWarning = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const sounds = useRef({});
  const soundFiles = {
    hover: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/hover.mp3`
  };
  
  // Add translations state
  const [translations, setTranslations] = useState(defaultTranslations);

  // Handle language changes
  useEffect(() => {
    const updateTranslations = async () => {
      if (currentLanguage === 'en') {
        setTranslations(defaultTranslations);
        return;
      }
      
      try {
        const translationPromises = Object.entries(defaultTranslations).map(async ([key, value]) => {
          const translatedValue = await translateText(value, currentLanguage);
          return [key, translatedValue];
        });
        
        const translatedEntries = await Promise.all(translationPromises);
        const newTranslations = Object.fromEntries(translatedEntries);
        
        setTranslations(newTranslations);
      } catch (error) {
        console.error('Translation error:', error);
        // Keep original values on error
      }
    };
    
    updateTranslations();
  }, [currentLanguage]);

  const playSound = useCallback((soundName) => {
    if (!sounds.current[soundName] && soundFiles[soundName]) {
      sounds.current[soundName] = new Audio(soundFiles[soundName]);
    }

    const sound = sounds.current[soundName];
    if (sound && !isMuted) {
      try {
        sound.currentTime = 0;
        sound.volume = 0.3;
        sound.play().catch(err => {
          console.warn(`Error playing sound ${soundName}:`, err);
        });
      } catch (err) {
        console.warn(`Error with sound ${soundName}:`, err);
      }
    }
  }, [isMuted]);

  useEffect(() => {
    if (!architecture?.services && !hasLoggedWarning.current) {
      hasLoggedWarning.current = true;
      console.log('⚠️ Waiting for architecture data...');
      return;
    }

    if (architecture?.services) {
      console.log('📊 Rendering architecture:', {
        servicesCount: architecture.services.length,
        connectionsCount: architecture.connections?.length
      });

      const newNodes = [];
      const newEdges = [];
      const nodePositions = {}; 
      const parentChildrenMap = {};
      let missingServiceCounter = 1;
      const baseY = 200;
      const horizontalSpacing = 250; // Increased horizontal spacing
      const parallelSpacing = 300;   // Spacing for parallel nodes

      // Build Parent-Child Relationship Map
      architecture.connections.forEach(({ from, to }) => {
        const fromId = createNodeId(from);
        const toId = createNodeId(to);

        if (!parentChildrenMap[fromId]) {
          parentChildrenMap[fromId] = [];
        }
        parentChildrenMap[fromId].push(toId);
      });

      architecture.services.forEach((service, index) => {
        let serviceName = typeof service === 'string' ? service : service?.name;
        if (!serviceName) {
          console.warn(`⚠️ Skipping invalid service:`, service);
          return;
        }

        const serviceId = createNodeId(serviceName);
        let isMissing = serviceName.startsWith('missing_');

        let serviceIcon = getCachedServiceIcon(serviceName);
        if (isMissing) {
          serviceIcon = serviceIcon || '/azure-icons/missing.svg';
          serviceName = `Missing Service ${missingServiceCounter++}`;
        }

        const parent = Object.keys(parentChildrenMap).find(parentId =>
          parentChildrenMap[parentId].includes(serviceId)
        );

        let posX = index * horizontalSpacing; // Use increased horizontal spacing
        let posY = baseY;

        if (parent) {
          const siblings = parentChildrenMap[parent];
          const siblingIndex = siblings.indexOf(serviceId);
          const totalSiblings = siblings.length;
          
          // Adjust Y position for parallel nodes
          if (totalSiblings > 1) {
            // Calculate offset based on sibling position
            const offset = (siblingIndex - (totalSiblings - 1) / 2) * parallelSpacing;
            posY = baseY + offset;
          }
        }

        nodePositions[serviceId] = { x: posX, y: posY };

        newNodes.push({
          id: serviceId,
          type: 'azureService',
          position: { x: posX, y: posY },
          data: {
            label: serviceName,
            icon: serviceIcon,
            isMissing,
          },
        });
      });

      // Add edges with new positioning
      architecture.connections.forEach(({ from, to }) => {
        const fromId = createNodeId(from);
        const toId = createNodeId(to);

        if (!newNodes.find((node) => node.id === fromId)) {
          console.warn(`⚠️ Missing node for ${from}, skipping edge.`);
          return;
        }

        if (!newNodes.find((node) => node.id === toId)) {
          console.warn(`⚠️ Missing node for ${to}, skipping edge.`);
          return;
        }

        newEdges.push({
          id: `${fromId}-${toId}`,
          source: fromId,
          target: toId,
          sourceHandle: `${fromId}-source`,
          targetHandle: `${toId}-target`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#0078D4', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }

    return () => {
      hasLoggedWarning.current = false;
    };
  }, [architecture, setNodes, setEdges]);

  if (!architecture?.services) {
    return (
      <div className="architecture-visualizer-loading" style={{ position: 'relative' }}>
        {/* Back to Home button */}
        <Link 
          to="/" 
          className="back-to-home-button"
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            border: '2px solid #00ffff',
            borderRadius: '5px',
            color: '#00ffff',
            textDecoration: 'none',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            zIndex: 9999
          }}
          onMouseEnter={() => playSound('hover')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            style={{
              width: '20px',
              height: '20px',
              marginRight: '8px'
            }}
          >
            <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"/>
          </svg>
          {translations.backToHome}
        </Link>
        <span>{translations.selectServicePrompt}</span>
      </div>
    );
  }

  return (
    <div className="architecture-display-container" style={{ position: 'relative' }}>
      {/* Back to Home button */}
      <Link 
        to="/" 
        className="back-to-home-button"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          border: '2px solid #00ffff',
          borderRadius: '5px',
          color: '#00ffff',
          textDecoration: 'none',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          zIndex: 9999
        }}
        onMouseEnter={() => playSound('hover')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          style={{
            width: '20px',
            height: '20px',
            marginRight: '8px'
          }}
        >
          <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"/>
        </svg>
        {translations.backToHome}
      </Link>

      <div style={{ height: '600px' }} className="architecture-visualizer">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#0078D4" gap={16} size={1} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => node.data.isMissing ? '#FF5656' : '#0078D4'}
            maskColor="rgba(13, 25, 35, 0.7)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default AzureArchitectureDisplay;
