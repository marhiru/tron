import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

// Mantém uma referência global para prevenir garbage collection
let mainWindow: BrowserWindow | null = null;

// Configurações de memória e performance
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('gpu-cache-dir', path.join(app.getPath('userData'), 'gpu-cache'));

// Monitor de uso de memória
function monitorMemoryUsage() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const memoryInfo = process.memoryUsage();
    const usedMemoryMB = Math.round(memoryInfo.heapUsed / 1024 / 1024);
    const totalMemoryMB = Math.round(memoryInfo.heapTotal / 1024 / 1024);
    
    console.log(`Memória Heap Usada: ${usedMemoryMB}MB`);
    console.log(`Memória Heap Total: ${totalMemoryMB}MB`);

    // Força garbage collection se o uso de memória estiver muito alto
    if (usedMemoryMB > 1024) { // 1GB
      if (global.gc) {
        global.gc();
        console.log('Garbage Collection forçada');
      }
    }

    // Envia informações de memória para o renderer
    mainWindow.webContents.send('memory-info', {
      used: usedMemoryMB,
      total: totalMemoryMB
    });
  }
}

const createWindow = () => {
  // Limpa a referência anterior se existir
  if (mainWindow) {
    mainWindow.destroy();
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
      // Otimizações de memória
      backgroundThrottling: true,
      enablePreferredSizeMode: true
    },
  });

  // Configurações adicionais para melhor gerenciamento de cache e memória
  mainWindow.webContents.session.clearCache();

  // Limpa o cache de código quando a janela é fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
    global.gc && global.gc();
  });

  // Otimiza o uso de memória quando a janela é minimizada
  mainWindow.on('minimize', () => {
    if (mainWindow) {
      mainWindow.webContents.send('window-minimized');
    }
  });

  // Restaura recursos quando a janela é restaurada
  mainWindow.on('restore', () => {
    if (mainWindow) {
      mainWindow.webContents.send('window-restored');
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/index.html`));
  }

  // Abrir DevTools apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Inicia o monitoramento de memória
  setInterval(monitorMemoryUsage, 30000); // A cada 30 segundos
};

// Limpa o cache e inicia com otimizações de memória
app.whenReady().then(async () => {
  // Configura o limite de memória do V8
  app.getAppMetrics(); // Força a inicialização das métricas

  await app.getPath('userData');
  createWindow();

  // Limpa caches não utilizados periodicamente
  setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.session.clearCache();
    }
  }, 1800000); // A cada 30 minutos
});

// Gerenciamento de ciclo de vida da aplicação
app.on('window-all-closed', () => {
  mainWindow = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Limpa recursos quando a aplicação é encerrada
app.on('before-quit', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners();
    mainWindow.webContents.session.clearCache();
  }
}); 