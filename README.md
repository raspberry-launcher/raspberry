# Raspberry Launcher

Raspberry Launcher - это современный и удобный лаунчер для ваших игр, вдохновленный Hydra Launcher.

## Особенности

- 🎮 Единая библиотека для всех ваших игр
- 🎯 Быстрый доступ к любимым играм
- 🔍 Удобный поиск игр
- 🌙 Темная тема по умолчанию
- 💻 Легкий и быстрый интерфейс

## Установка

### Требования

- Windows 7/8/10/11
- 100 МБ свободного места на диске

### Способы установки

#### Готовый установщик

1. Скачайте последний релиз по ссылке в разделе Releases
2. Запустите скачанный файл установщика
3. Следуйте инструкциям установщика

#### Сборка из исходного кода

1. Убедитесь, что у вас установлен [Node.js](https://nodejs.org/) (рекомендуется версия 14 или выше)
2. Клонируйте репозиторий: `git clone https://github.com/raspberry-launcher/raspberry.git`
3. Перейдите в директорию проекта: `cd raspberry`
4. Установите зависимости: `npm install`
5. Запустите приложение: `npm start`

## Использование

### Добавление игр

1. Нажмите на кнопку "Добавить игру" в разделе "Библиотека"
2. Введите название игры
3. Выберите исполняемый файл игры (.exe)
4. Опционально: добавьте иконку и описание игры
5. Нажмите "Добавить"

### Запуск игр

1. Перейдите в раздел "Библиотека"
2. Найдите нужную игру
3. Нажмите на кнопку "Играть"

### Удаление игр из библиотеки

1. Найдите игру в библиотеке
2. Нажмите на иконку корзины рядом с кнопкой "Играть"
3. Подтвердите удаление

## Разработка

### Структура проекта

```
raspberry-launcher/
├── assets/             # Изображения и иконки
├── main.js             # Основной процесс Electron
├── index.html          # Основной HTML-файл
├── renderer.js         # Скрипт для рендеринга
├── styles.css          # Стили приложения
└── package.json        # Описание проекта и зависимости
```

### Сборка дистрибутива

Для создания установщика выполните:

```
npm run build
```

После завершения сборки готовые файлы будут доступны в директории `dist`.

## Планы на будущее

- [ ] Интеграция с магазинами игр (Steam, Epic Games, GOG)
- [ ] Автоматическое обновление
- [ ] Синхронизация с облаком
- [ ] Статистика игрового времени
- [ ] Создание скриншотов

## Лицензия

[MIT License](LICENSE) 
