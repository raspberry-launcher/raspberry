const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const Store = require('electron-store');
const express = require('express');
const server = express();

// Инициализация хранилища
const store = new Store();

// Путь для хранения игр
const gamesPath = path.join(app.getPath('userData'), 'games');
fs.ensureDirSync(gamesPath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    frame: false
  });

  mainWindow.loadFile('index.html');

  // Открыть DevTools только в режиме разработки
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// IPC обработчики

// Получить список игр
ipcMain.on('get-games', (event) => {
  let games = store.get('games') || [];
  // Убедимся, что games всегда массив
  if (!Array.isArray(games)) {
    games = [];
    store.set('games', games);
  }
  event.reply('games-list', games);
});

// Добавить игру
ipcMain.on('add-game', async (event, gameData) => {
  try {
    // Убедимся, что games всегда массив
    let games = store.get('games') || [];
    if (!Array.isArray(games)) {
      games = [];
    }
    
    // Генерация уникального ID для игры
    gameData.id = Date.now().toString();
    
    // Сохранение иконки, если она есть
    if (gameData.iconPath) {
      const iconDestPath = path.join(gamesPath, `${gameData.id}_icon${path.extname(gameData.iconPath)}`);
      await fs.copy(gameData.iconPath, iconDestPath);
      gameData.iconPath = iconDestPath;
    }
    
    games.push(gameData);
    store.set('games', games);
    
    event.reply('game-added', gameData);
  } catch (error) {
    event.reply('error', `Ошибка при добавлении игры: ${error.message}`);
  }
});

// Запустить игру
ipcMain.on('launch-game', (event, gameId) => {
  try {
    let games = store.get('games') || [];
    // Убедимся, что games всегда массив
    if (!Array.isArray(games)) {
      games = [];
      store.set('games', games);
      return event.reply('error', 'Список игр повреждён и был восстановлен. Пожалуйста, добавьте игры заново.');
    }
    
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      return event.reply('error', 'Игра не найдена');
    }
    
    const { spawn } = require('child_process');
    const child = spawn(game.execPath, [], {
      detached: true,
      cwd: path.dirname(game.execPath)
    });
    
    child.unref();
    event.reply('game-launched', gameId);
  } catch (error) {
    event.reply('error', `Ошибка при запуске игры: ${error.message}`);
  }
});

// Удалить игру
ipcMain.on('remove-game', (event, gameId) => {
  try {
    let games = store.get('games') || [];
    // Убедимся, что games всегда массив
    if (!Array.isArray(games)) {
      games = [];
      store.set('games', games);
      return event.reply('error', 'Список игр повреждён и был восстановлен. Пожалуйста, добавьте игры заново.');
    }
    
    const gameToRemove = games.find(g => g.id === gameId);
    
    if (!gameToRemove) {
      return event.reply('error', 'Игра не найдена');
    }
    
    // Удаление иконки игры, если она существует
    if (gameToRemove.iconPath && fs.existsSync(gameToRemove.iconPath)) {
      fs.removeSync(gameToRemove.iconPath);
    }
    
    games = games.filter(g => g.id !== gameId);
    store.set('games', games);
    
    event.reply('game-removed', gameId);
  } catch (error) {
    event.reply('error', `Ошибка при удалении игры: ${error.message}`);
  }
});

// Открыть диалоговое окно выбора файла
ipcMain.on('open-file-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Исполняемые файлы', extensions: ['exe'] }
      ],
      ...options
    });
    
    if (!result.canceled) {
      event.reply('selected-file', result.filePaths[0]);
    }
  } catch (error) {
    event.reply('error', `Ошибка при выборе файла: ${error.message}`);
  }
});

// Открыть диалоговое окно выбора папки
ipcMain.on('open-folder-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      ...options
    });
    
    if (!result.canceled) {
      event.reply('selected-folder', result.filePaths[0]);
    }
  } catch (error) {
    event.reply('error', `Ошибка при выборе папки: ${error.message}`);
  }
});

// Сканировать папку на наличие игр
ipcMain.on('scan-games-folder', async (event, folderPath) => {
  try {
    // Проверяем существование папки
    if (!fs.existsSync(folderPath)) {
      return event.reply('error', 'Указанная папка не существует');
    }
    
    // Находим все .exe файлы рекурсивно
    const exeFiles = await findExecutableFiles(folderPath);
    
    if (exeFiles.length === 0) {
      return event.reply('error', 'Не найдено исполняемых файлов в указанной папке');
    }
    
    // Получаем текущий список игр
    let games = store.get('games') || [];
    if (!Array.isArray(games)) {
      games = [];
    }
    
    // Отфильтруем уже добавленные игры
    const existingPaths = new Set(games.map(game => game.execPath.toLowerCase()));
    const newExeFiles = exeFiles.filter(file => !existingPaths.has(file.toLowerCase()));
    
    if (newExeFiles.length === 0) {
      return event.reply('error', 'Все найденные игры уже добавлены в библиотеку');
    }
    
    // Добавляем найденные игры
    const addedGames = [];
    
    for (const exePath of newExeFiles) {
      const fileName = path.basename(exePath, '.exe');
      const gameData = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000),
        name: fileName,
        execPath: exePath,
        iconPath: null,
        description: `Автоматически добавлено при сканировании папки ${path.basename(folderPath)}`
      };
      
      games.push(gameData);
      addedGames.push(gameData);
    }
    
    // Сохраняем обновленный список игр
    store.set('games', games);
    
    // Отправляем сообщение с информацией о добавленных играх
    event.reply('games-list', games);
    event.reply('games-scanned', { addedCount: addedGames.length, totalCount: exeFiles.length });
  } catch (error) {
    event.reply('error', `Ошибка при сканировании папки: ${error.message}`);
  }
});

// Функция для поиска всех .exe файлов в папке и подпапках
async function findExecutableFiles(dir, results = []) {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      await findExecutableFiles(filePath, results);
    } else if (file.toLowerCase().endsWith('.exe')) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Получение статистики
ipcMain.on('get-stats', (event) => {
  try {
    const games = store.get('games') || [];
    const gamesCount = Array.isArray(games) ? games.length : 0;
    
    // В будущем здесь могут быть дополнительные данные, например, общее время в играх
    const stats = {
      gamesCount,
      totalPlaytime: 0 // Пока просто заглушка
    };
    
    event.reply('stats-update', stats);
  } catch (error) {
    event.reply('error', `Ошибка при получении статистики: ${error.message}`);
  }
});

// Обработчики окна
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
}); 