const { ipcRenderer } = require('electron');

// Элементы DOM
const navItems = document.querySelectorAll('.nav-item');
const contentTabs = document.querySelectorAll('.content-tab');
const addGameBtn = document.getElementById('add-game-btn');
const addFirstGameBtn = document.getElementById('add-first-game-btn');
const addGameModal = document.getElementById('add-game-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelAddGameBtn = document.getElementById('cancel-add-game-btn');
const addGameForm = document.getElementById('add-game-form');
const searchGamesInput = document.getElementById('search-games');
const gamesContainer = document.getElementById('games-container');
const noGamesMessage = document.getElementById('no-games-message');
const browseExeBtn = document.getElementById('browse-exe-btn');
const browseIconBtn = document.getElementById('browse-icon-btn');
const gameExeInput = document.getElementById('game-exe');
const gameIconInput = document.getElementById('game-icon');
const gameNameInput = document.getElementById('game-name');
const gameDescInput = document.getElementById('game-desc');
const autostartToggle = document.getElementById('autostart-toggle');
const startMinimizedToggle = document.getElementById('start-minimized-toggle');
const checkUpdatesBtn = document.getElementById('check-updates-btn');
const animationsToggle = document.getElementById('animations-toggle');
const browseGamesPathBtn = document.getElementById('browse-games-path-btn');
const gamesPathInput = document.getElementById('games-path');

// Добавляем поддержку тем
const themeBtns = document.querySelectorAll('.theme-btn');
const html = document.documentElement;

// Функция для установки темы
function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Обновляем активную кнопку
  themeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// Инициализация темы
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

// Обработчики переключения темы
themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    setTheme(theme);
    
    // Показываем уведомление о смене темы
    showNotification(`Тема изменена на ${theme === 'dark' ? 'тёмную' : theme === 'light' ? 'светлую' : 'системную'}`, 'success');
  });
});

// Обработчики переключения вида (сетка/список)
const viewBtns = document.querySelectorAll('.view-btn');

viewBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    
    // Обновляем активную кнопку
    viewBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Добавляем класс для анимации исчезновения
    gamesContainer.style.opacity = '0';
    gamesContainer.style.transform = view === 'grid' ? 'scale(0.8)' : 'translateX(-20px)';
    
    // После небольшой задержки меняем вид и добавляем анимацию появления
    setTimeout(() => {
      // Обновляем вид
      gamesContainer.className = view === 'grid' ? 'games-grid' : 'games-list';
      
      // Устанавливаем порядок анимации для каждой карточки
      const cards = document.querySelectorAll('.game-card-container');
      cards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
      });
      
      // Запускаем анимацию появления
      gamesContainer.style.opacity = '1';
      gamesContainer.style.transform = 'none';
    }, 300);
    
    localStorage.setItem('view', view);
  });
});

// Инициализация вида
const savedView = localStorage.getItem('view') || 'grid';
const activeViewBtn = document.querySelector(`[data-view="${savedView}"]`);
if (activeViewBtn) {
  activeViewBtn.click();
}

// Улучшенный поиск с горячими клавишами
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    searchGamesInput.focus();
  }
});

// Обработчики элементов заголовка окна
document.getElementById('minimize-btn').addEventListener('click', () => {
  ipcRenderer.send('minimize-window');
});

document.getElementById('maximize-btn').addEventListener('click', () => {
  ipcRenderer.send('maximize-window');
});

document.getElementById('close-btn').addEventListener('click', () => {
  ipcRenderer.send('close-window');
});

// Функции управления вкладками
function switchTab(tabId) {
  // Удаляем активный класс у всех вкладок
  navItems.forEach(item => item.classList.remove('active'));
  contentTabs.forEach(tab => tab.classList.remove('active'));
  
  // Добавляем активный класс нужной вкладке
  document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Обработчики кликов по вкладкам
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const tabId = item.getAttribute('data-tab');
    switchTab(tabId);
  });
});

// Функции для управления модальными окнами
function openModal(modalElement) {
  modalElement.style.display = 'block';
  modalOverlay.style.display = 'block';
}

function closeModal(modalElement) {
  modalElement.style.display = 'none';
  modalOverlay.style.display = 'none';
  
  // Сбрасываем все состояния интерактивности
  document.querySelectorAll('.game-card-container').forEach(container => {
    container.classList.remove('interacting-with-edit', 'interacting-with-delete', 'interacting-with-play');
  });
}

// Обработчики модального окна добавления игры
addGameBtn.addEventListener('click', () => openModal(addGameModal));
addFirstGameBtn.addEventListener('click', () => openModal(addGameModal));
closeModalBtn.addEventListener('click', () => closeModal(addGameModal));
cancelAddGameBtn.addEventListener('click', () => closeModal(addGameModal));
modalOverlay.addEventListener('click', () => closeModal(addGameModal));

// Обработчики выбора файлов
browseExeBtn.addEventListener('click', () => {
  lastTargetInput = 'exe';
  ipcRenderer.send('open-file-dialog', {
    title: 'Выберите исполняемый файл игры',
    properties: ['openFile'],
    filters: [{ name: 'Исполняемые файлы', extensions: ['exe'] }]
  });
});

browseIconBtn.addEventListener('click', () => {
  lastTargetInput = 'icon';
  ipcRenderer.send('open-file-dialog', {
    title: 'Выберите иконку игры',
    properties: ['openFile'],
    filters: [{ name: 'Изображения', extensions: ['png', 'jpg', 'jpeg', 'ico'] }]
  });
});

// Получаем результат выбора файла
let lastTargetInput = null;

ipcRenderer.on('selected-file', (event, filePath) => {
  if (lastTargetInput === 'exe') {
    gameExeInput.value = filePath;
    
    // Пробуем автоматически заполнить имя игры из пути к exe файлу
    if (!gameNameInput.value) {
      const pathParts = filePath.split('\\');
      const fileName = pathParts[pathParts.length - 1];
      const gameName = fileName.split('.')[0];
      gameNameInput.value = gameName;
    }
  } else if (lastTargetInput === 'icon') {
    gameIconInput.value = filePath;
  }
});

// Список исключений для системных .exe файлов
const SYSTEM_EXE_BLACKLIST = [
  'setup',
  'unins000',
  'nfsmwres',
  'safemode_inst',
  'shell_inst',
  'cgef',
  'UnityCrashHandler64',
  'installer',
  'uninstall',
  'config',
  'launcher',
  'updater',
  'helper',
  'crash',
  'debug',
  'service',
  'daemon',
  'runtime',
  'redist',
  'vcredist',
  'directx',
  'dxsetup',
  'dotnet',
  'framework'
];

// Функция проверки, является ли файл системным
function isSystemExe(filePath) {
  const fileName = filePath.toLowerCase().split('\\').pop().replace('.exe', '');
  return SYSTEM_EXE_BLACKLIST.some(blacklisted => 
    fileName.includes(blacklisted.toLowerCase()) ||
    fileName.startsWith(blacklisted.toLowerCase())
  );
}

// Обновляем обработчик добавления игры
addGameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const execPath = gameExeInput.value;
  
  // Проверяем, не является ли файл системным
  if (isSystemExe(execPath)) {
    showNotification('Этот файл похож на системный или установочный. Пожалуйста, выберите исполняемый файл игры.', 'error');
    return;
  }
  
  const gameData = {
    name: gameNameInput.value,
    execPath: execPath,
    iconPath: gameIconInput.value || null,
    description: gameDescInput.value || ''
  };
  
  ipcRenderer.send('add-game', gameData);
  
  // Очищаем форму
  addGameForm.reset();
  closeModal(addGameModal);
  
  // Показываем уведомление
  showNotification('Игра успешно добавлена', 'success');
});

// Функции для отображения игр
function renderGames(games) {
  // Если игры есть, скрываем сообщение об отсутствии игр
  if (games.length > 0) {
    noGamesMessage.style.display = 'none';
  } else {
    noGamesMessage.style.display = 'block';
    gamesContainer.innerHTML = '';
    return;
  }
  
  // Очищаем контейнер
  gamesContainer.innerHTML = '';
  
  // Определяем вид отображения (сетка или список)
  const isGridView = gamesContainer.classList.contains('games-grid');
  
  // Рендерим каждую игру
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card-container';
    gameCard.dataset.gameId = game.id;
    
    const defaultIcon = 'assets/default-game-icon.png';
    const iconSrc = game.iconPath || defaultIcon;
    
    gameCard.innerHTML = `
      <div class="game-card">
        <div class="game-image">
          <img src="${iconSrc}" alt="${game.name}" onerror="this.src='${defaultIcon}'">
        </div>
        <div class="game-info">
          <h3 class="game-title">${game.name}</h3>
          ${game.description ? `<p class="game-description">${game.description}</p>` : ''}
          <div class="game-actions">
            <button class="primary-btn launch-game-btn" data-game-id="${game.id}">
              <i class="fas fa-play"></i>
              <span>ИГРАТЬ</span>
            </button>
          </div>
        </div>
      </div>
      <div class="game-card-controls">
        <button class="delete-game-btn secondary-btn" data-game-id="${game.id}" title="Удалить игру">
          <i class="fas fa-trash"></i>
          <span>Удалить</span>
        </button>
        <button class="edit-game-btn secondary-btn" data-game-id="${game.id}" title="Редактировать игру">
          <i class="fas fa-edit"></i>
          <span>Редактировать</span>
        </button>
      </div>
    `;
    
    gamesContainer.appendChild(gameCard);
    
    // Применяем 3D эффект к карточке
    if (isGridView) {
      const actualCard = gameCard.querySelector('.game-card');
      if (actualCard) {
        applyCardEffects(actualCard);
      }
    }
  });
  
  // После рендеринга добавляем обработчики
  addGameButtonHandlers();
}

// Функция для добавления обработчиков кнопок к карточкам игр
function addGameButtonHandlers() {
  // Сначала удаляем все существующие обработчики
  removeGameButtonHandlers();
  
  // Кнопки запуска игр
  document.querySelectorAll('.launch-game-btn').forEach(btn => {
    btn.addEventListener('click', handleLaunchGame);
  });
  
  // Кнопки удаления игр
  document.querySelectorAll('.delete-game-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteGame);
  });

  // Обработчики кнопок редактирования
  document.querySelectorAll('.edit-game-btn').forEach(btn => {
    btn.addEventListener('click', handleEditGame);
  });
  
  // Клик по самой карточке игры
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', handleCardClick);
  });
}

// Функции-обработчики событий
function handleLaunchGame(e) {
  e.stopPropagation();
  const gameId = e.currentTarget.dataset.gameId;
  launchGame(gameId);
  
  const button = e.currentTarget;
  button.classList.add('clicked');
  setTimeout(() => button.classList.remove('clicked'), 300);
}

function handleDeleteGame(e) {
  e.stopPropagation();
  e.preventDefault();
  
  const gameId = e.currentTarget.dataset.gameId;
  const container = e.currentTarget.closest('.game-card-container');
  
  if (container) {
    container.classList.add('interacting-with-delete');
  }
  
  showConfirmationModal(
    'Удалить игру',
    'Вы уверены, что хотите удалить эту игру из библиотеки?',
    () => {
      removeGame(gameId);
    },
    () => {
      if (container) {
        container.classList.remove('interacting-with-delete');
      }
    }
  );
}

function handleEditGame(e) {
  e.stopPropagation();
  e.preventDefault();
  
  const gameId = e.currentTarget.dataset.gameId;
  const container = e.currentTarget.closest('.game-card-container');
  
  if (container) {
    container.classList.add('interacting-with-edit');
  }
  
  openEditGameModal(gameId);
}

function handleCardClick(e) {
  // Проверяем, что клик не был по кнопкам управления
  if (e.target.closest('.delete-game-btn') || 
      e.target.closest('.edit-game-btn') || 
      e.target.closest('.game-actions')) {
    return;
  }
  
  const container = e.currentTarget.closest('.game-card-container');
  if (container) {
    container.classList.add('interacting-with-play');
    const gameId = container.dataset.gameId;
    launchGame(gameId);
  }
}

// Функция для удаления всех обработчиков
function removeGameButtonHandlers() {
  document.querySelectorAll('.launch-game-btn').forEach(btn => {
    btn.removeEventListener('click', handleLaunchGame);
  });
  
  document.querySelectorAll('.delete-game-btn').forEach(btn => {
    btn.removeEventListener('click', handleDeleteGame);
  });
  
  document.querySelectorAll('.edit-game-btn').forEach(btn => {
    btn.removeEventListener('click', handleEditGame);
  });
  
  document.querySelectorAll('.game-card').forEach(card => {
    card.removeEventListener('click', handleCardClick);
  });
}

// Функция для показа модального окна подтверждения
function showConfirmationModal(title, message, onConfirm, onCancel) {
  // Создаем модальное окно, если его еще нет
  let confirmModal = document.getElementById('confirm-modal');
  
  if (!confirmModal) {
    confirmModal = document.createElement('div');
    confirmModal.id = 'confirm-modal';
    confirmModal.className = 'modal';
    confirmModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="confirm-title"></h3>
          <button class="modal-close" id="close-confirm-modal-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p id="confirm-message"></p>
          <div class="form-actions">
            <button type="button" id="cancel-confirm-btn" class="secondary-btn">
              <i class="fas fa-times"></i>
              <span>Отмена</span>
            </button>
            <button type="button" id="confirm-btn" class="primary-btn">
              <i class="fas fa-check"></i>
              <span>Подтвердить</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(confirmModal);
  }
  
  // Обновляем содержимое
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  
  // Обновляем обработчик подтверждения
  const confirmBtn = document.getElementById('confirm-btn');
  const cancelBtn = document.getElementById('cancel-confirm-btn');
  const closeBtn = document.getElementById('close-confirm-modal-btn');
  
  // Удаляем старые обработчики
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
  
  // Функция для закрытия и вызова колбэка отмены
  const closeAndCancel = () => {
    closeModal(confirmModal);
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };
  
  // Добавляем новые обработчики
  newConfirmBtn.addEventListener('click', () => {
    onConfirm();
    closeModal(confirmModal);
  });
  
  newCancelBtn.addEventListener('click', closeAndCancel);
  newCloseBtn.addEventListener('click', closeAndCancel);
  
  // Обработчик нажатия Escape для отмены
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeAndCancel();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  
  // Показываем модальное окно
  openModal(confirmModal);
}

// Функции для запуска и удаления игр
function launchGame(gameId) {
  // Показываем индикатор загрузки
  const button = document.querySelector(`.launch-game-btn[data-game-id="${gameId}"]`);
  const container = document.querySelector(`.game-card-container[data-game-id="${gameId}"]`);
  
  if (button) {
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>Запуск...</span>';
    button.disabled = true;
    
    // Отправляем запрос на запуск игры
    ipcRenderer.send('launch-game', gameId);
    
    // Восстанавливаем кнопку через небольшую задержку
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.disabled = false;
      
      // Очищаем интерактивные состояния
      if (container) {
        container.classList.remove('interacting-with-play');
      }
    }, 2000);
  } else {
    ipcRenderer.send('launch-game', gameId);
    
    // Очищаем интерактивные состояния даже если кнопки не найдены
    if (container) {
      setTimeout(() => {
        container.classList.remove('interacting-with-play');
      }, 2000);
    }
  }
}

function removeGame(gameId) {
  // Анимированное удаление карточки игры
  const container = document.querySelector(`.game-card-container[data-game-id="${gameId}"]`);
  if (container) {
    // Добавляем класс для анимации удаления
    container.classList.add('removing');
    container.classList.remove('interacting-with-delete');
    
    // Анимируем исчезновение
    container.style.opacity = '0';
    container.style.transform = 'scale(0.8)';
    
    // Ждем окончания анимации перед удалением из DOM
    setTimeout(() => {
      // Плавно уменьшаем высоту контейнера
      container.style.maxHeight = container.offsetHeight + 'px';
      container.style.maxHeight = '0';
      container.style.margin = '0';
      container.style.padding = '0';
      
      // После анимации высоты отправляем запрос на удаление
      setTimeout(() => {
        // Отправляем запрос на удаление игры
        ipcRenderer.send('remove-game', gameId);
        
        // Удаляем элемент из DOM
        container.remove();
        
        // Проверяем, остались ли еще игры
        const remainingGames = document.querySelectorAll('.game-card-container');
        if (remainingGames.length === 0) {
          // Если игр не осталось, показываем сообщение
          const noGamesMessage = document.getElementById('no-games-message');
          if (noGamesMessage) {
            noGamesMessage.style.display = 'block';
          }
        }
      }, 300); // Время анимации высоты
    }, 300); // Время анимации исчезновения
  } else {
    // Если контейнер не найден, просто отправляем запрос на удаление
    ipcRenderer.send('remove-game', gameId);
  }
}

// Загрузка игр
function loadGames() {
  ipcRenderer.send('get-games');
}

// Поиск игр
searchGamesInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  // Запрашиваем все игры, а потом фильтруем на стороне renderer
  ipcRenderer.send('get-games');
  
  ipcRenderer.once('games-list', (event, games) => {
    const filteredGames = games.filter(game => 
      game.name.toLowerCase().includes(searchTerm)
    );
    renderGames(filteredGames);
  });
});

// Применяем 3D эффект к карточке
function applyCardEffects(card) {
  // 3D эффект при движении мыши
  card.addEventListener('mousemove', e => {
    if (document.body.classList.contains('no-animations')) return;
    
    // Если курсор находится над кнопкой удаления, не применяем 3D эффект
    if (e.target.closest('.delete-game-btn')) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Уменьшаем интенсивность эффекта над областью .game-actions
    const isOverActions = e.target.closest('.game-actions') !== null;
    const intensityFactor = isOverActions ? 0.3 : 1;
    
    const rotateX = ((y - centerY) / centerY) * 10 * intensityFactor;
    const rotateY = ((centerX - x) / centerX) * 10 * intensityFactor;
    
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    
    // Обновляем положение подсветки
    const mouseX = (x / rect.width) * 100;
    const mouseY = (y / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${mouseX}%`);
    card.style.setProperty('--mouse-y', `${mouseY}%`);
    
    // Также передаем эффект на контейнер для консистентности
    const container = card.closest('.game-card-container');
    if (container) {
      container.style.setProperty('--mouse-x', `${mouseX}%`);
      container.style.setProperty('--mouse-y', `${mouseY}%`);
    }
  });
  
  // Сбрасываем при уходе мыши
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    
    // Также сбрасываем для контейнера
    const container = card.closest('.game-card-container');
    if (container) {
      container.style.setProperty('--rotate-x', '0deg');
      container.style.setProperty('--rotate-y', '0deg');
    }
  });
  
  // Добавляем явную индикацию кликабельности при наведении
  card.addEventListener('mouseenter', () => {
    // Добавляем класс для визуальной индикации
    card.classList.add('card-hover');
    
    // Также добавляем для контейнера
    const container = card.closest('.game-card-container');
    if (container) {
      container.classList.add('card-hover');
    }
  });
  
  card.addEventListener('mouseleave', () => {
    // Удаляем класс при уходе мыши
    card.classList.remove('card-hover');
    
    // Также удаляем для контейнера
    const container = card.closest('.game-card-container');
    if (container) {
      container.classList.remove('card-hover');
    }
  });
}

// IPC обработчики
ipcRenderer.on('games-list', (event, games) => {
  renderGames(games);
});

ipcRenderer.on('game-added', (event, gameData) => {
  loadGames(); // Перезагрузить список игр
  showNotification('Игра успешно добавлена', 'success');
});

ipcRenderer.on('game-removed', (event, gameId) => {
  showNotification('Игра удалена из библиотеки', 'success');
  
  // Не нужно перезагружать весь список, т.к. карточка уже анимированно удалена
  updateStats(); // Обновляем статистику
});

ipcRenderer.on('game-launched', (event, gameId) => {
  // Создаем элемент для анимации запуска игры
  const launchAnimation = document.createElement('div');
  launchAnimation.className = 'launch-animation';
  document.body.appendChild(launchAnimation);
  
  // Удаляем анимацию после завершения
  setTimeout(() => {
    launchAnimation.remove();
  }, 500);
  
  showNotification('Игра запущена', 'success');
});

ipcRenderer.on('error', (event, errorMessage) => {
  showNotification(errorMessage, 'error');
});

// Улучшенный эффект пульсации для кнопок
function createRipple(element, e) {
  const rect = element.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const circle = document.createElement('div');
  circle.className = 'ripple';
  
  const diameter = Math.max(rect.width, rect.height);
  circle.style.width = circle.style.height = `${diameter}px`;
  
  circle.style.left = `${x - diameter / 2}px`;
  circle.style.top = `${y - diameter / 2}px`;
  
  const ripple = element.querySelector('.ripple');
  if (ripple) {
    ripple.remove();
  }
  
  element.appendChild(circle);
}

// Применяем эффект пульсации ко всем кнопкам
document.querySelectorAll('.primary-btn, .secondary-btn').forEach(button => {
  button.addEventListener('mousedown', e => createRipple(button, e));
  button.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    createRipple(button, touch);
  });
});

// Улучшенная анимация для навигации
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(navItem => {
      navItem.style.transform = 'translateX(0) scale(1)';
      navItem.classList.remove('active');
    });
    
    this.classList.add('active');
    this.style.transform = 'translateX(8px) scale(1.05)';
  });
  
  // Добавляем эффект свечения при наведении
  item.addEventListener('mousemove', e => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    item.style.setProperty('--glow-x', `${x}px`);
    item.style.setProperty('--glow-y', `${y}px`);
  });
});

// Улучшенный параллакс эффект
document.addEventListener('mousemove', e => {
  requestAnimationFrame(() => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    document.documentElement.style.setProperty('--mouse-x', `${x * 100}%`);
    document.documentElement.style.setProperty('--mouse-y', `${y * 100}%`);
    
    // Добавляем эффект параллакса для карточек
    document.querySelectorAll('.game-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (e.clientX - centerX) * 0.01;
      const moveY = (e.clientY - centerY) * 0.01;
      
      card.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
});

// Улучшенные уведомления
function showNotification(message, type = 'success', duration = 5000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icon = document.createElement('i');
  icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}`;
  
  const text = document.createElement('span');
  text.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'notification-close';
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  
  notification.appendChild(icon);
  notification.appendChild(text);
  notification.appendChild(closeBtn);
  
  const container = document.getElementById('notification-container');
  container.appendChild(notification);
  
  // Анимация появления
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  });
  
  // Автоматическое закрытие
  const timeout = setTimeout(() => {
    closeNotification(notification);
  }, duration);
  
  // Обработчик закрытия
  closeBtn.addEventListener('click', () => {
    clearTimeout(timeout);
    closeNotification(notification);
  });
}

function closeNotification(notification) {
  notification.classList.add('removing');
  notification.style.transform = 'translateX(100%)';
  notification.style.opacity = '0';
  
  setTimeout(() => {
    notification.remove();
  }, 500);
}

// Настройки
autostartToggle.addEventListener('change', (e) => {
  const enabled = e.target.checked;
  // Здесь будет логика включения/выключения автозапуска (в будущем)
  showNotification(enabled ? 'Автозапуск включен' : 'Автозапуск выключен', 'success');
});

startMinimizedToggle.addEventListener('change', (e) => {
  const enabled = e.target.checked;
  // Здесь будет логика запуска в свернутом виде (в будущем)
  showNotification(enabled ? 'Запуск в свернутом виде включен' : 'Запуск в свернутом виде выключен', 'success');
});

// Проверка обновлений
checkUpdatesBtn.addEventListener('click', () => {
  // Здесь будет логика проверки обновлений (в будущем)
  showNotification('У вас установлена последняя версия', 'success');
});

// Загружаем игры при запуске
window.addEventListener('DOMContentLoaded', () => {
  loadGames();
  updateStats();
  initializeCardAnimations();
});

// Плавная анимация для кнопок
document.querySelectorAll('.primary-btn, .secondary-btn').forEach(button => {
  button.addEventListener('mousedown', e => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 1000);
  });
});

// Анимация для навигационных элементов
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(navItem => {
      navItem.style.transform = 'translateX(0)';
      navItem.classList.remove('active');
    });
    
    this.classList.add('active');
    this.style.transform = 'translateX(8px)';
  });
});

// Анимация загрузки
function showLoading(element) {
  element.classList.add('loading');
  element.dataset.originalContent = element.innerHTML;
  element.innerHTML = '';
}

function hideLoading(element) {
  element.classList.remove('loading');
  element.innerHTML = element.dataset.originalContent;
}

// Плавная прокрутка
document.querySelector('.content-area').addEventListener('scroll', () => {
  requestAnimationFrame(() => {
    const scrolled = document.querySelector('.content-area').scrollTop;
    document.documentElement.style.setProperty('--scroll-y', `${scrolled}px`);
  });
});

// Параллакс эффект для фона
document.querySelector('.content-area').addEventListener('mousemove', e => {
  const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
  const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
  
  document.querySelector('.content-area').style.backgroundPosition = `${moveX}px ${moveY}px`;
});

// Анимации для карточек
function initializeCardAnimations() {
  const cards = document.querySelectorAll('.game-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * 10;
      const rotateY = ((centerX - x) / centerX) * 10;
      
      card.style.setProperty('--rotate-x', `${rotateX}deg`);
      card.style.setProperty('--rotate-y', `${rotateY}deg`);
      
      // Обновляем положение подсветки
      const mouseX = (x / rect.width) * 100;
      const mouseY = (y / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${mouseX}%`);
      card.style.setProperty('--mouse-y', `${mouseY}%`);
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rotate-x', '0deg');
      card.style.setProperty('--rotate-y', '0deg');
    });
  });
}

// Обновляем анимации при добавлении новых карточек
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      initializeCardAnimations();
    }
  });
});

observer.observe(gamesContainer, { childList: true });

// Обновление статистики
function updateStats() {
  const gamesCount = document.getElementById('games-count');
  const totalPlaytime = document.getElementById('total-playtime');
  
  ipcRenderer.send('get-stats');
}

ipcRenderer.on('stats-update', (event, stats) => {
  const gamesCount = document.getElementById('games-count');
  const totalPlaytime = document.getElementById('total-playtime');
  
  if (gamesCount) {
    gamesCount.textContent = stats.gamesCount;
  }
  
  if (totalPlaytime) {
    totalPlaytime.textContent = formatPlaytime(stats.totalPlaytime);
  }
});

function formatPlaytime(minutes) {
  if (minutes < 60) {
    return `${minutes}м`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}ч`;
  }
  
  return `${hours}ч ${remainingMinutes}м`;
}

// Обработчик анимаций
animationsToggle.addEventListener('change', (e) => {
  const enabled = e.target.checked;
  document.body.classList.toggle('no-animations', !enabled);
  localStorage.setItem('animations', enabled.toString());
  showNotification(enabled ? 'Анимации включены' : 'Анимации отключены', 'success');
});

// Инициализация настройки анимаций
const animationsEnabled = localStorage.getItem('animations') !== 'false';
animationsToggle.checked = animationsEnabled;
document.body.classList.toggle('no-animations', !animationsEnabled);

// Обработчик пути к играм
browseGamesPathBtn.addEventListener('click', () => {
  ipcRenderer.send('open-folder-dialog', {
    title: 'Выберите папку с играми',
    defaultPath: localStorage.getItem('games-path') || ''
  });
});

ipcRenderer.on('selected-folder', (event, folderPath) => {
  if (folderPath) {
    gamesPathInput.value = folderPath;
    localStorage.setItem('games-path', folderPath);
    showNotification('Путь к играм обновлен', 'success');
    
    // Сканируем папку на наличие игр
    ipcRenderer.send('scan-games-folder', folderPath);
  }
});

// Инициализация пути к играм
const savedGamesPath = localStorage.getItem('games-path') || '';
if (savedGamesPath) {
  gamesPathInput.value = savedGamesPath;
}

// Обработка результатов сканирования игр
ipcRenderer.on('games-scanned', (event, data) => {
  const { addedCount, totalCount } = data;
  showNotification(`Добавлено ${addedCount} из ${totalCount} найденных игр`, 'success');
  loadGames(); // Обновляем список игр
  updateStats(); // Обновляем статистику
});

// Обработка нажатия Ctrl+R для обновления страницы
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    location.reload();
  }
});

// Дополнительные обработчики ошибок
window.addEventListener('error', (e) => {
  console.error('Ошибка JavaScript:', e.error);
  showNotification(`Произошла ошибка: ${e.error.message}`, 'error');
});

// Функция открытия модального окна редактирования
function openEditGameModal(gameId) {
  // Получаем данные игры
  const gameCard = document.querySelector(`.game-card-container[data-game-id="${gameId}"]`);
  if (!gameCard) return;

  const gameTitle = gameCard.querySelector('.game-title').textContent;
  const gameDesc = gameCard.querySelector('.game-description')?.textContent || '';
  const gameImage = gameCard.querySelector('.game-image img');
  const iconPath = gameImage.src === 'assets/default-game-icon.png' ? '' : gameImage.src;

  // Заполняем форму редактирования данными игры
  const editGameNameInput = document.getElementById('edit-game-name');
  const editGameIconInput = document.getElementById('edit-game-icon');
  const editGameDescInput = document.getElementById('edit-game-desc');
  
  editGameNameInput.value = gameTitle;
  editGameIconInput.value = iconPath;
  editGameDescInput.value = gameDesc;
  
  // Получаем путь к exe файлу через IPC
  ipcRenderer.send('get-game-exe-path', gameId);
  
  // Сохраняем ID редактируемой игры
  document.getElementById('edit-game-form').dataset.gameId = gameId;
  
  // Открываем модальное окно редактирования
  openModal(document.getElementById('edit-game-modal'));
}

// Получаем путь к exe файлу
ipcRenderer.on('game-exe-path', (event, data) => {
  if (data.success) {
    document.getElementById('edit-game-exe').value = data.execPath;
  }
});

// Обработчик формы редактирования
document.getElementById('edit-game-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const gameId = e.target.dataset.gameId;
  const editGameNameInput = document.getElementById('edit-game-name');
  const editGameExeInput = document.getElementById('edit-game-exe');
  const editGameIconInput = document.getElementById('edit-game-icon');
  const editGameDescInput = document.getElementById('edit-game-desc');
  
  const updatedGameData = {
    id: gameId,
    name: editGameNameInput.value,
    execPath: editGameExeInput.value,
    iconPath: editGameIconInput.value || null,
    description: editGameDescInput.value || ''
  };
  
  // Проверяем, не является ли файл системным
  if (isSystemExe(updatedGameData.execPath)) {
    showNotification('Этот файл похож на системный или установочный. Пожалуйста, выберите исполняемый файл игры.', 'error');
    return;
  }
  
  // Отправляем обновленные данные
  ipcRenderer.send('update-game', updatedGameData);
  
  // Закрываем модальное окно
  closeModal(document.getElementById('edit-game-modal'));
  
  // Показываем уведомление
  showNotification('Игра успешно обновлена', 'success');
});

// Обработчик успешного обновления игры
ipcRenderer.on('game-updated', (event, updatedGame) => {
  // Обновляем отображение игры в списке
  const container = document.querySelector(`.game-card-container[data-game-id="${updatedGame.id}"]`);
  if (container) {
    const defaultIcon = 'assets/default-game-icon.png';
    const iconSrc = updatedGame.iconPath || defaultIcon;
    
    // Обновляем данные в карточке
    container.querySelector('.game-title').textContent = updatedGame.name;
    container.querySelector('.game-image img').src = iconSrc;
    
    const descElement = container.querySelector('.game-description');
    if (updatedGame.description) {
      if (descElement) {
        descElement.textContent = updatedGame.description;
      } else {
        const titleElement = container.querySelector('.game-title');
        const descDiv = document.createElement('p');
        descDiv.className = 'game-description';
        descDiv.textContent = updatedGame.description;
        titleElement.insertAdjacentElement('afterend', descDiv);
      }
    } else if (descElement) {
      descElement.remove();
    }
    
    // Добавляем эффект обновления
    container.classList.add('updated');
    setTimeout(() => container.classList.remove('updated'), 1000);
  }
});

// Обработчики модального окна редактирования
document.getElementById('close-edit-modal-btn').addEventListener('click', () => {
  closeModal(document.getElementById('edit-game-modal'));
});

document.getElementById('cancel-edit-game-btn').addEventListener('click', () => {
  closeModal(document.getElementById('edit-game-modal'));
});

// Обработчики кнопок выбора файлов в форме редактирования
document.getElementById('edit-browse-exe-btn').addEventListener('click', () => {
  lastTargetInput = 'edit-exe';
  ipcRenderer.send('open-file-dialog', {
    title: 'Выберите исполняемый файл игры',
    properties: ['openFile'],
    filters: [{ name: 'Исполняемые файлы', extensions: ['exe'] }]
  });
});

document.getElementById('edit-browse-icon-btn').addEventListener('click', () => {
  lastTargetInput = 'edit-icon';
  ipcRenderer.send('open-file-dialog', {
    title: 'Выберите иконку игры',
    properties: ['openFile'],
    filters: [{ name: 'Изображения', extensions: ['png', 'jpg', 'jpeg', 'ico'] }]
  });
});

// Обновляем обработчик выбора файла
ipcRenderer.on('selected-file', (event, filePath) => {
  switch (lastTargetInput) {
    case 'exe':
      gameExeInput.value = filePath;
      if (!gameNameInput.value) {
        const pathParts = filePath.split('\\');
        const fileName = pathParts[pathParts.length - 1];
        const gameName = fileName.split('.')[0];
        gameNameInput.value = gameName;
      }
      break;
    case 'icon':
      gameIconInput.value = filePath;
      break;
    case 'edit-exe':
      document.getElementById('edit-game-exe').value = filePath;
      break;
    case 'edit-icon':
      document.getElementById('edit-game-icon').value = filePath;
      break;
  }
}); 