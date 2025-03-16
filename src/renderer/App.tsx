import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-dark-blue.css';
import L, { LatLng } from 'leaflet';
import CustomMarker from './CustomMarker';
import MapCenterUpdater from './MapCenterUpdater';
import TransitionOverlay from './TransitionOverlay';

// Declaração de tipos para a API do Electron
declare global {
  interface Window {
    electronAPI: {
      versions: {
        node: () => string;
        chrome: () => string;
        electron: () => string;
      };
      memory: {
        subscribe: (callback: (data: { used: number; total: number }) => void) => () => void;
      };
      window: {
        onMinimize: (callback: () => void) => () => void;
        onRestore: (callback: () => void) => () => void;
      };
    };
  }
}

const App: React.FC = () => {
  const [randomPosition, setRandomPosition] = useState<LatLng>(new LatLng(-23.5505, -46.6333));
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState({
    node: '',
    chrome: '',
    electron: '',
  });

  const [memoryUsage, setMemoryUsage] = useState({
    used: 0,
    total: 1,
  });

  const [isMinimized, setIsMinimized] = useState(false);

  // Posição inicial do mapa (São Paulo, Brasil)
  const position: [number, number] = [-23.5505, -46.6333];

  // Pontos de interesse
  const points = [
    { id: 1, position: [-23.5505, -46.6333], name: "São Paulo", description: "Capital do estado de São Paulo" },
    { id: 2, position: [-23.5950, -46.6400], name: "Parque Ibirapuera", description: "Um dos maiores parques urbanos da cidade" },
    { id: 3, position: [-23.5613, -46.6562], name: "Avenida Paulista", description: "Centro financeiro e cultural da cidade" },
    { id: 4, position: [-23.5448, -46.6425], name: "Praça da Sé", description: "Marco zero da cidade de São Paulo" },
  ];

  useEffect(() => {
    // Solução para o problema dos ícones do Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Obtém as versões
    setVersions({
      node: window.electronAPI.versions.node(),
      chrome: window.electronAPI.versions.chrome(),
      electron: window.electronAPI.versions.electron(),
    });

    // Inscreve-se para atualizações de memória
    const unsubscribeMemory = window.electronAPI.memory.subscribe((data) => {
      setMemoryUsage(data);
    });

    // Monitora estado da janela
    const unsubscribeMinimize = window.electronAPI.window.onMinimize(() => {
      setIsMinimized(true);
    });

    const unsubscribeRestore = window.electronAPI.window.onRestore(() => {
      setIsMinimized(false);
    });


    return () => {
      unsubscribeMemory();
      unsubscribeMinimize();
      unsubscribeRestore();
    };
  }, []);

  const randomizePosition = () => {
    // Mostrar efeito de carregamento
    setIsLoading(true);
    
    // Gerar coordenadas aleatórias dentro de um intervalo mais interessante
    // Limitando para áreas terrestres mais prováveis
    const regions = [
      // América do Sul
      { minLat: -55, maxLat: 15, minLng: -80, maxLng: -35 },
      // América do Norte
      { minLat: 15, maxLat: 70, minLng: -170, maxLng: -50 },
      // Europa
      { minLat: 35, maxLat: 70, minLng: -10, maxLng: 40 },
      // Ásia
      { minLat: 0, maxLat: 70, minLng: 40, maxLng: 150 },
      // África
      { minLat: -35, maxLat: 35, minLng: -20, maxLng: 50 },
      // Oceania
      { minLat: -50, maxLat: 0, minLng: 110, maxLng: 180 },
    ];
    
    // Escolher uma região aleatória
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    
    // Gerar coordenadas dentro da região escolhida
    const randomLat = Math.random() * (randomRegion.maxLat - randomRegion.minLat) + randomRegion.minLat;
    const randomLng = Math.random() * (randomRegion.maxLng - randomRegion.minLng) + randomRegion.minLng;
    
    // Simular um pequeno atraso para mostrar o efeito de carregamento
    setTimeout(() => {
      // Atualizar o estado com a nova posição aleatória
      setRandomPosition(new LatLng(randomLat, randomLng));
      
      // Manter o estado de carregamento por mais tempo para coincidir com a animação
      setTimeout(() => {
        setIsLoading(false);
      }, 5000); // 5 segundos para cobrir toda a animação de zoom-out-in e rotação
    }, 200);
  };
  
  const resetToSaoPaulo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRandomPosition(new LatLng(position[0], position[1]));
      
      // Manter o estado de carregamento por mais tempo para coincidir com a animação
      setTimeout(() => {
        setIsLoading(false);
      }, 5000); // 5 segundos para cobrir toda a animação de zoom-out-in e rotação
    }, 200);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <div className="flex flex-1 overflow-hidden">
        {/* Barra lateral */}
        <div className="w-64 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-blue-300">Informações</h2>
          
          <div className="mb-4">
            <h3 className="font-medium text-blue-200">Versões:</h3>
            <ul className="mt-2 text-sm text-gray-300">
              <li>Node: {versions.node}</li>
              <li>Chrome: {versions.chrome}</li>
              <li>Electron: {versions.electron}</li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-blue-200">Uso de Memória:</h3>
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${(memoryUsage.used / memoryUsage.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-gray-300">
                {Math.round(memoryUsage.used / 1024 / 1024)} MB / {Math.round(memoryUsage.total / 1024 / 1024)} MB
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-blue-200">Estado da Janela:</h3>
            <p className="text-sm mt-1 text-gray-300">
              {isMinimized ? 'Minimizada' : 'Normal'}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-blue-200 mb-2">Posição Atual:</h3>
            <div className="bg-gray-700 p-3 rounded-md">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-blue-300">Latitude:</span> {randomPosition.lat.toFixed(4)}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-medium text-blue-300">Longitude:</span> {randomPosition.lng.toFixed(4)}
              </p>
            </div>
            <button 
              onClick={randomizePosition}
              disabled={isLoading}
              className={`w-full mt-3 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin duration-500 -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Posição Aleatória
                </>
              )}
            </button>
            <button 
              onClick={resetToSaoPaulo}
              disabled={isLoading}
              className={`w-full mt-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'} text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Voltar para São Paulo
            </button>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-blue-200 mb-2">Pontos de Interesse:</h3>
            <div className="space-y-2">
              {points.map(point => (
                <div key={point.id} className="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
                  <h4 className="font-medium text-blue-300">{point.name}</h4>
                  <p className="text-xs text-gray-400">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mapa */}
        <div className="flex-1 relative">
          <MapContainer
            center={randomPosition}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false} // Removendo controle de zoom padrão
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Adicionando marcadores para cada ponto de interesse */}
            {points.map(point => (
              <CustomMarker
                key={point.id}
                position={point.position as [number, number]}
                name={point.name}
                description={point.description}
              />
            ))}

            {/* Adicionando marcador para a posição aleatória */}
            <CustomMarker
              key="random"
              position={[randomPosition.lat, randomPosition.lng]}
              name="Posição Aleatória"
              description={`Latitude: ${randomPosition.lat.toFixed(4)}, Longitude: ${randomPosition.lng.toFixed(4)}`}
              isCurrentPosition={true}
            />

            {/* Adicionando controle de zoom em posição personalizada */}
            <ZoomControl position="topright" />
            
            {/* Componente para atualizar o centro do mapa quando a posição aleatória mudar */}
            <MapCenterUpdater center={randomPosition} />
          </MapContainer>
          
          {/* Overlay de transição */}
          <TransitionOverlay isLoading={isLoading} />
        </div>
      </div>

      {/* Rodapé */}
      <footer className="bg-gray-800 p-2 text-center text-sm text-gray-400 border-t border-gray-700">
        Aplicativo Electron com React, Tailwind CSS e Leaflet - Tema Dark Azulado
      </footer>
    </div>
  );
};

export default App; 