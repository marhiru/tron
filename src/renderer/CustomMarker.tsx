import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface CustomMarkerProps {
    position: [number, number];
    name: string;
    description: string;
    isCurrentPosition?: boolean;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ 
    position, 
    name, 
    description,
    isCurrentPosition = false 
}) => {
    // Criando um ícone personalizado
    const customIcon = L.divIcon({
        className: `custom-marker ${isCurrentPosition ? 'current-position' : ''}`,
        iconSize: [16, 16],
        iconAnchor: [8, 16],
        popupAnchor: [0, -16],
    });
    
    return (
        <Marker position={position} icon={customIcon}>
            <Popup>
                <div className="text-gray-800">
                    <h3 className="font-bold text-blue-600">{name}</h3>
                    <p>{description}</p>
                </div>
            </Popup>
        </Marker>
    );
};

export default CustomMarker;