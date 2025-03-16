import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';

interface MapCenterUpdaterProps {
  center: LatLng;
}

// Este componente não renderiza nada, apenas atualiza o centro do mapa
const MapCenterUpdater: React.FC<MapCenterUpdaterProps> = ({ center }) => {
  const map = useMap();
  const prevCenterRef = useRef<LatLng | null>(null);
  const currentZoomRef = useRef<number>(map.getZoom());
  const animationInProgressRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Se não é a primeira renderização e o centro realmente mudou
    if (prevCenterRef.current && 
        (prevCenterRef.current.lat !== center.lat || 
         prevCenterRef.current.lng !== center.lng) &&
        !animationInProgressRef.current) {
      
      // Marcar que a animação está em progresso
      animationInProgressRef.current = true;
      
      // Salvar o zoom atual
      currentZoomRef.current = map.getZoom();
      
      // Calcular a distância entre os pontos para determinar quanto zoom-out fazer
      const distance = prevCenterRef.current.distanceTo(center);
      const zoomOutLevel = calculateZoomOutLevel(distance);
      
      // Adicionar classe para o efeito de rotação
      const mapContainer = map.getContainer();
      mapContainer.classList.add('map-rotating');
      
      // Primeiro zoom out
      map.flyTo([prevCenterRef.current.lat, prevCenterRef.current.lng], zoomOutLevel, {
        duration: 1.5, // duração em segundos
        easeLinearity: 0.5
      });
      
      // Depois de um pequeno atraso, mover para a nova posição mantendo o zoom baixo
      setTimeout(() => {
        map.flyTo([center.lat, center.lng], zoomOutLevel, {
          duration: 2, // duração em segundos
          easeLinearity: 0.5
        });
        
        // Finalmente, zoom in para o nível original
        setTimeout(() => {
          map.flyTo([center.lat, center.lng], currentZoomRef.current, {
            duration: 1.5, // duração em segundos
            easeLinearity: 0.5
          });
          
          // Remover classe de rotação
          setTimeout(() => {
            mapContainer.classList.remove('map-rotating');
            // Marcar que a animação terminou
            animationInProgressRef.current = false;
          }, 1500);
        }, 2000);
      }, 1500);
    } else if (!prevCenterRef.current) {
      // Na primeira renderização, apenas centralizar sem animação
      map.setView([center.lat, center.lng], map.getZoom());
    }
    
    // Atualizar a referência do centro anterior
    prevCenterRef.current = center;
  }, [center, map]);
  
  // Função para calcular o nível de zoom baseado na distância
  const calculateZoomOutLevel = (distance: number): number => {
    // Distância em metros
    if (distance > 10000000) { // > 10000km (intercontinental)
      return 2; // Zoom global
    } else if (distance > 5000000) { // > 5000km
      return 3;
    } else if (distance > 1000000) { // > 1000km
      return 4;
    } else if (distance > 500000) { // > 500km
      return 5;
    } else if (distance > 100000) { // > 100km
      return 6;
    } else {
      return Math.max(currentZoomRef.current - 3, 7); // No mínimo zoom 7
    }
  };
  
  return null;
};

export default MapCenterUpdater; 