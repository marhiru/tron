import React, { useEffect, useState } from 'react';

interface TransitionOverlayProps {
  isLoading: boolean;
}

const TransitionOverlay: React.FC<TransitionOverlayProps> = ({ isLoading }) => {
  const [opacity, setOpacity] = useState(0);
  
  useEffect(() => {
    if (isLoading) {
      // Quando começa a carregar, aumenta a opacidade gradualmente
      setOpacity(0);
      const timer = setTimeout(() => {
        setOpacity(0.3);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Quando termina de carregar, diminui a opacidade gradualmente
      setOpacity(0);
    }
  }, [isLoading]);
  
  if (!isLoading && opacity === 0) return null;
  
  return (
    <div 
      className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
      style={{ 
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        transition: 'background-color 0.5s ease-in-out'
      }}
    >
      <div className="text-white text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-xl font-semibold">Explorando o mundo...</div>
        <div className="text-sm text-blue-300 mt-2">Preparando sua viagem virtual</div>
      </div>
    </div>
  );
};

export default TransitionOverlay; 