import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  color: white;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: #a0a0a0;
  margin-bottom: 2rem;
`;

const InfoSection = styled(motion.div)`
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
`;

const MemoryInfo = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-family: monospace;
  
  .memory-bar {
    width: 200px;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    margin: 0.5rem 0;
    overflow: hidden;
    
    .used {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #FFC107);
      transition: width 0.3s ease;
    }
  }
`;

const App: React.FC = () => {
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

  useEffect(() => {
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

  const memoryPercentage = (memoryUsage.used / memoryUsage.total) * 100;

  return (
    <Container>
      <Title
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Hello from React + Electron! 👋
      </Title>
      <Subtitle
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        Let's build something amazing together
      </Subtitle>
      <InfoSection
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p>Node version: {versions.node}</p>
        <p>Chrome version: {versions.chrome}</p>
        <p>Electron version: {versions.electron}</p>
      </InfoSection>
      <MemoryInfo
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <p>Memory Usage</p>
        <div className="memory-bar">
          <div
            className="used"
            style={{ width: `${Math.min(memoryPercentage, 100)}%` }}
          />
        </div>
        <p>
          {memoryUsage.used.toFixed(1)}MB / {memoryUsage.total.toFixed(1)}MB
          ({memoryPercentage.toFixed(1)}%)
        </p>
        {isMinimized && <p>Window is minimized (reduced memory usage)</p>}
      </MemoryInfo>
    </Container>
  );
};

export default App; 