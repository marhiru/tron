// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expõe APIs seguras para o processo de renderização
contextBridge.exposeInMainWorld('electronAPI', {
  // APIs básicas
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },
  // APIs de monitoramento de memória
  memory: {
    subscribe: (callback: (data: { used: number; total: number }) => void) => {
      const subscription = (_: any, data: { used: number; total: number }) => callback(data);
      ipcRenderer.on('memory-info', subscription);
      return () => {
        ipcRenderer.removeListener('memory-info', subscription);
      };
    }
  },
  // APIs de ciclo de vida da janela
  window: {
    onMinimize: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on('window-minimized', subscription);
      return () => {
        ipcRenderer.removeListener('window-minimized', subscription);
      };
    },
    onRestore: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on('window-restored', subscription);
      return () => {
        ipcRenderer.removeListener('window-restored', subscription);
      };
    }
  }
});
