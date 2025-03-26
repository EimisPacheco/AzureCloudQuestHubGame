import React from 'react';
import { handleIconError } from '../services/IconResolver';

const DraggableService = ({ service, onClick }) => {
  return (
    <div 
      className="draggable-service"
      onClick={onClick}
    >
      <div className="service-icon">
        <img 
          src={service.icon}
          alt={service.name}
          onError={(e) => handleIconError(e, service.name)}
          style={{
            width: '48px',
            height: '48px',
            display: 'block'
          }}
        />
      </div>
      <span className="service-name">{service.name}</span>
    </div>
  );
};

export default DraggableService; 