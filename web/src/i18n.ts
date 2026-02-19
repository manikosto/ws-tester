export type Lang = 'en' | 'ru';

const translations = {
  // === Header ===
  'header.backendConnected': { en: 'Backend connected', ru: 'Бэкенд подключён' },
  'header.backendDisconnected': { en: 'Backend disconnected', ru: 'Бэкенд отключён' },
  'header.docs': { en: 'Docs', ru: 'Документация' },

  // === Connection Panel ===
  'connection.title': { en: 'Connection', ru: 'Подключение' },
  'connection.url': { en: 'WebSocket URL', ru: 'URL WebSocket' },
  'connection.placeholder': { en: 'ws://localhost:8085', ru: 'ws://localhost:8085' },
  'connection.connect': { en: 'Connect', ru: 'Подключить' },
  'connection.connecting': { en: 'Connecting...', ru: 'Подключение...' },
  'connection.disconnect': { en: 'Disconnect', ru: 'Отключить' },
  'connection.connected': { en: 'connected', ru: 'подключено' },
  'connection.disconnected': { en: 'disconnected', ru: 'отключено' },
  'connection.error': { en: 'error', ru: 'ошибка' },
  'connection.pingInterval': { en: 'Ping (s)', ru: 'Пинг (с)' },

  // === Send Panel ===
  'send.title': { en: 'Send Message', ru: 'Отправить сообщение' },
  'send.placeholder': { en: 'Type a message...', ru: 'Введите сообщение...' },
  'send.placeholderDisconnected': { en: 'Connect first', ru: 'Сначала подключитесь' },
  'send.button': { en: 'Send', ru: 'Отправить' },

  // === Message Log ===
  'log.title': { en: 'Messages', ru: 'Сообщения' },
  'log.clear': { en: 'Clear', ru: 'Очистить' },
  'log.empty': { en: 'No messages yet', ru: 'Сообщений пока нет' },
  'log.emptyHint': { en: 'Connect to a WebSocket server to get started', ru: 'Подключитесь к WebSocket серверу' },

  // === Record Panel ===
  'record.title': { en: 'Record / Replay', ru: 'Запись / Воспроизведение' },
  'record.start': { en: 'Record', ru: 'Запись' },
  'record.download': { en: 'Download', ru: 'Скачать' },
  'record.replay': { en: 'Replay File', ru: 'Воспроизвести' },
  'record.recorded': { en: 'messages recorded', ru: 'сообщений записано' },

  // === Load Test Panel ===
  'loadtest.title': { en: 'Load Test', ru: 'Нагрузочный тест' },
  'loadtest.targetUrl': { en: 'Target URL', ru: 'URL сервера' },
  'loadtest.connections': { en: 'Connections', ru: 'Подключения' },
  'loadtest.duration': { en: 'Duration (s)', ru: 'Длительность (с)' },
  'loadtest.message': { en: 'Message (optional)', ru: 'Сообщение (опц.)' },
  'loadtest.run': { en: 'Run Load Test', ru: 'Запустить тест' },
  'loadtest.running': { en: 'Running...', ru: 'Выполняется...' },
  'loadtest.result.connections': { en: 'Connections', ru: 'Подключения' },
  'loadtest.result.failed': { en: 'Failed', ru: 'Неудачные' },
  'loadtest.result.avgConnect': { en: 'Avg Connect Time', ru: 'Среднее время подключения' },
  'loadtest.result.sent': { en: 'Messages Sent', ru: 'Отправлено' },
  'loadtest.result.received': { en: 'Messages Received', ru: 'Получено' },
  'loadtest.result.mps': { en: 'Messages/sec', ru: 'Сообщений/сек' },
  'loadtest.result.avgLatency': { en: 'Avg Latency', ru: 'Средняя задержка' },
  'loadtest.result.minMaxLatency': { en: 'Min / Max Latency', ru: 'Мин / Макс задержка' },
  'loadtest.result.duration': { en: 'Duration', ru: 'Длительность' },
  'loadtest.result.errors': { en: 'Errors', ru: 'Ошибки' },

  // === Validate Panel ===
  'validate.title': { en: 'Validate', ru: 'Валидация' },
  'validate.schema': { en: 'JSON Schema', ru: 'JSON Схема' },
  'validate.data': { en: 'Data / Message', ru: 'Данные / Сообщение' },
  'validate.button': { en: 'Validate', ru: 'Проверить' },
  'validate.valid': { en: 'Valid - message matches schema', ru: 'Валидно — сообщение соответствует схеме' },
  'validate.invalid': { en: 'Invalid', ru: 'Невалидно' },
  'validate.errors': { en: 'error(s)', ru: 'ошибок' },

  // === Tabs ===
  'tab.loadtest': { en: 'Load Test', ru: 'Нагрузка' },
  'tab.validate': { en: 'Validate', ru: 'Валидация' },

  // === System messages ===
  'sys.connectedTo': { en: 'Connected to', ru: 'Подключено к' },
  'sys.disconnected': { en: 'Disconnected', ru: 'Отключено' },
  'sys.replayComplete': { en: 'Replay complete', ru: 'Воспроизведение завершено' },
  'sys.sent': { en: 'sent', ru: 'отправлено' },
  'sys.skipped': { en: 'skipped', ru: 'пропущено' },

  // === Docs Page ===
  'docs.title': { en: 'Documentation', ru: 'Документация' },
  'docs.back': { en: 'Back to Dashboard', ru: 'Назад к дашборду' },

  'docs.whatIsWs.title': { en: 'What is WebSocket?', ru: 'Что такое WebSocket?' },
  'docs.whatIsWs.p1': {
    en: 'WebSocket is a protocol for <strong>real-time, two-way communication</strong> between a client (browser, app) and a server. Unlike HTTP where the client sends a request and waits for a response, WebSocket keeps an open connection — both sides can send messages at any time.',
    ru: 'WebSocket — это протокол для <strong>двустороннего общения в реальном времени</strong> между клиентом (браузер, приложение) и сервером. В отличие от HTTP, где клиент отправляет запрос и ждёт ответ, WebSocket держит соединение открытым — обе стороны могут отправлять сообщения в любой момент.',
  },
  'docs.whatIsWs.callout': {
    en: 'Think of HTTP as sending letters (request → response). WebSocket is like a phone call — once connected, both sides can talk freely.',
    ru: 'Представьте HTTP как отправку писем (запрос → ответ). WebSocket — это как телефонный звонок: после соединения обе стороны могут свободно говорить.',
  },
  'docs.whatIsWs.useCases': { en: 'Common use cases:', ru: 'Где используется:' },
  'docs.whatIsWs.case1': { en: 'Chat applications (Slack, Discord)', ru: 'Чаты (Slack, Discord)' },
  'docs.whatIsWs.case2': { en: 'Live dashboards and notifications', ru: 'Живые дашборды и уведомления' },
  'docs.whatIsWs.case3': { en: 'Real-time trading data', ru: 'Биржевые данные в реальном времени' },
  'docs.whatIsWs.case4': { en: 'Multiplayer games', ru: 'Мультиплеерные игры' },
  'docs.whatIsWs.case5': { en: 'Collaborative editing (Google Docs)', ru: 'Совместное редактирование (Google Docs)' },

  'docs.whyTest.title': { en: 'Why test WebSocket connections?', ru: 'Зачем тестировать WebSocket?' },
  'docs.whyTest.p1': {
    en: 'WebSocket testing is different from REST API testing. Here\'s what can go wrong:',
    ru: 'Тестирование WebSocket отличается от тестирования REST API. Вот что может пойти не так:',
  },
  'docs.whyTest.drops': { en: 'Connection drops', ru: 'Обрыв соединения' },
  'docs.whyTest.dropsDesc': { en: 'Server closes unexpectedly, network issues', ru: 'Сервер неожиданно закрывается, проблемы сети' },
  'docs.whyTest.format': { en: 'Message format', ru: 'Формат сообщений' },
  'docs.whyTest.formatDesc': { en: 'Server sends unexpected JSON structure', ru: 'Сервер присылает неожиданную структуру JSON' },
  'docs.whyTest.latency': { en: 'Latency', ru: 'Задержка' },
  'docs.whyTest.latencyDesc': { en: 'Messages take too long to arrive', ru: 'Сообщения приходят слишком долго' },
  'docs.whyTest.scale': { en: 'Scalability', ru: 'Масштабируемость' },
  'docs.whyTest.scaleDesc': { en: 'Server can\'t handle many connections', ru: 'Сервер не выдерживает много подключений' },
  'docs.whyTest.order': { en: 'Message order', ru: 'Порядок сообщений' },
  'docs.whyTest.orderDesc': { en: 'Messages arrive out of order', ru: 'Сообщения приходят не по порядку' },
  'docs.whyTest.reconnect': { en: 'Reconnection', ru: 'Переподключение' },
  'docs.whyTest.reconnectDesc': { en: 'Client doesn\'t recover from disconnects', ru: 'Клиент не восстанавливается после обрыва' },

  'docs.start.title': { en: 'Getting Started', ru: 'Начало работы' },

  'docs.step1.title': { en: 'Connect to a WebSocket server', ru: 'Подключитесь к WebSocket серверу' },
  'docs.step1.p1': {
    en: 'Enter the WebSocket URL in the <strong>Connection</strong> panel and click <strong>Connect</strong>. WebSocket URLs start with <code>ws://</code> (unencrypted) or <code>wss://</code> (encrypted, like HTTPS).',
    ru: 'Введите URL WebSocket в панели <strong>Подключение</strong> и нажмите <strong>Подключить</strong>. URL WebSocket начинается с <code>ws://</code> (без шифрования) или <code>wss://</code> (с шифрованием, как HTTPS).',
  },
  'docs.step1.p2': {
    en: 'When connected, you\'ll see a <strong>connected</strong> badge and a session ID.',
    ru: 'После подключения вы увидите значок <strong>подключено</strong> и ID сессии.',
  },

  'docs.step2.title': { en: 'Send and receive messages', ru: 'Отправляйте и получайте сообщения' },
  'docs.step2.p1': {
    en: 'Type a message in the <strong>Send Message</strong> panel and press Enter or click Send. The message appears in the <strong>Message Log</strong> with a <strong>blue arrow</strong>. Server responses appear with a <strong>purple arrow</strong>.',
    ru: 'Введите сообщение в панели <strong>Отправить сообщение</strong> и нажмите Enter или Отправить. Сообщение появится в <strong>логе</strong> с <strong>синей стрелкой</strong>. Ответы сервера — с <strong>фиолетовой стрелкой</strong>.',
  },
  'docs.step2.callout': {
    en: 'Most WebSocket APIs use JSON messages. Example:',
    ru: 'Большинство WebSocket API используют JSON-сообщения. Пример:',
  },

  'docs.step3.title': { en: 'Test message format (Schema Validation)', ru: 'Проверьте формат сообщений (валидация схемы)' },
  'docs.step3.p1': {
    en: 'Switch to the <strong>Validate</strong> tab in the bottom-right panel. Paste a <strong>JSON Schema</strong> (the expected format) and a <strong>message</strong> (what you want to validate). Click <strong>Validate</strong> to check if the message matches the schema.',
    ru: 'Перейдите на вкладку <strong>Валидация</strong> в правой нижней панели. Вставьте <strong>JSON Schema</strong> (ожидаемый формат) и <strong>сообщение</strong> (которое хотите проверить). Нажмите <strong>Проверить</strong>.',
  },

  'docs.step4.title': { en: 'Record and replay sessions', ru: 'Записывайте и воспроизводите сессии' },
  'docs.step4.p1': {
    en: 'Click <strong>Record</strong> to start capturing all messages. Interact with the server normally. Click <strong>Stop</strong> when done. You can then <strong>Download</strong> the recording as a JSON file.',
    ru: 'Нажмите <strong>Запись</strong> чтобы начать захват всех сообщений. Работайте с сервером как обычно. Нажмите <strong>Стоп</strong> когда закончите. Затем можете <strong>Скачать</strong> запись в формате JSON.',
  },
  'docs.step4.p2': {
    en: 'To replay, click <strong>Replay File</strong> and select a previously recorded JSON. The tool will send the exact same messages with the same timing.',
    ru: 'Для воспроизведения нажмите <strong>Воспроизвести</strong> и выберите ранее записанный JSON-файл. Инструмент отправит те же сообщения с теми же задержками.',
  },
  'docs.step4.callout': {
    en: 'This is perfect for <strong>regression testing</strong> — record a session once, replay it after each deployment to verify the server still behaves the same way.',
    ru: 'Идеально для <strong>регрессионного тестирования</strong> — запишите сессию один раз, воспроизводите после каждого деплоя, чтобы убедиться что сервер работает так же.',
  },

  'docs.step5.title': { en: 'Load testing', ru: 'Нагрузочное тестирование' },
  'docs.step5.p1': {
    en: 'Switch to the <strong>Load Test</strong> tab. Configure:',
    ru: 'Перейдите на вкладку <strong>Нагрузка</strong>. Настройте:',
  },
  'docs.step5.connections': {
    en: '<strong>Connections</strong> — how many simultaneous WebSocket clients (e.g. 100)',
    ru: '<strong>Подключения</strong> — сколько одновременных WebSocket клиентов (напр. 100)',
  },
  'docs.step5.duration': {
    en: '<strong>Duration</strong> — how long to run the test in seconds (e.g. 30)',
    ru: '<strong>Длительность</strong> — сколько секунд выполнять тест (напр. 30)',
  },
  'docs.step5.message': {
    en: '<strong>Message</strong> — what each connection sends periodically',
    ru: '<strong>Сообщение</strong> — что каждое подключение отправляет периодически',
  },
  'docs.step5.p2': {
    en: 'Click <strong>Run Load Test</strong>. The tool will open all connections, send messages, and measure performance.',
    ru: 'Нажмите <strong>Запустить тест</strong>. Инструмент откроет все подключения, отправит сообщения и измерит производительность.',
  },

  'docs.checklist.title': { en: 'Testing Checklist for QA', ru: 'Чеклист тестирования для QA' },
  'docs.checklist.1': { en: 'Connect to the WebSocket endpoint — does the connection succeed?', ru: 'Подключитесь к WebSocket эндпоинту — подключение успешно?' },
  'docs.checklist.2': { en: 'Send a valid message — does the server respond correctly?', ru: 'Отправьте валидное сообщение — сервер отвечает корректно?' },
  'docs.checklist.3': { en: 'Send an invalid message — does the server return an error or disconnect?', ru: 'Отправьте невалидное сообщение — сервер возвращает ошибку или отключается?' },
  'docs.checklist.4': { en: 'Send an empty message — how does the server handle it?', ru: 'Отправьте пустое сообщение — как сервер это обрабатывает?' },
  'docs.checklist.5': { en: 'Disconnect and reconnect — does the server handle it gracefully?', ru: 'Отключитесь и переподключитесь — сервер обрабатывает корректно?' },
  'docs.checklist.6': { en: 'Leave the connection idle for 5 minutes — does it stay alive?', ru: 'Оставьте соединение без активности на 5 минут — оно сохраняется?' },
  'docs.checklist.7': { en: 'Send 100 messages rapidly — do all responses arrive?', ru: 'Отправьте 100 сообщений быстро — все ответы приходят?' },
  'docs.checklist.8': { en: 'Run a load test with 50 connections — does the server hold up?', ru: 'Запустите нагрузочный тест с 50 подключениями — сервер выдерживает?' },
  'docs.checklist.9': { en: 'Validate server responses against the expected JSON Schema', ru: 'Валидируйте ответы сервера против ожидаемой JSON Schema' },
  'docs.checklist.10': { en: 'Record a happy-path session and replay it after the next deploy', ru: 'Запишите happy-path сессию и воспроизведите после следующего деплоя' },

  'docs.glossary.title': { en: 'Glossary', ru: 'Глоссарий' },
  'docs.glossary.ws': { en: 'Protocol for real-time bidirectional communication', ru: 'Протокол двустороннего общения в реальном времени' },
  'docs.glossary.wsUrl': { en: 'WebSocket URL (unencrypted)', ru: 'URL WebSocket (без шифрования)' },
  'docs.glossary.wssUrl': { en: 'WebSocket Secure URL (encrypted, like HTTPS)', ru: 'Защищённый URL WebSocket (с шифрованием, как HTTPS)' },
  'docs.glossary.connection': { en: 'An open WebSocket link between client and server', ru: 'Открытое WebSocket соединение между клиентом и сервером' },
  'docs.glossary.frame': { en: 'A single WebSocket message packet', ru: 'Один пакет WebSocket сообщения' },
  'docs.glossary.handshake': { en: 'Initial HTTP request that upgrades to WebSocket', ru: 'Начальный HTTP запрос, который переключается на WebSocket' },
  'docs.glossary.closeCode': { en: 'A number (e.g. 1000=normal, 1001=going away) indicating why the connection closed', ru: 'Число (напр. 1000=нормально, 1001=уходит), указывающее причину закрытия' },
  'docs.glossary.jsonSchema': { en: 'A standard for describing the expected structure of JSON data', ru: 'Стандарт описания ожидаемой структуры JSON данных' },
  'docs.glossary.latency': { en: 'Time between sending a message and receiving the response', ru: 'Время между отправкой сообщения и получением ответа' },
  'docs.glossary.throughput': { en: 'Number of messages processed per second', ru: 'Количество сообщений, обработанных за секунду' },

  'docs.cli.title': { en: 'CLI Usage', ru: 'Использование CLI' },
  'docs.cli.p1': { en: 'You can also use ws-tester from the terminal:', ru: 'Можно также использовать ws-tester из терминала:' },

  // === Landing Page ===

  // Hero
  'landing.hero.title.pre': { en: 'Test WebSocket\nconnections with', ru: 'Тестируйте WebSocket\nсоединения с' },
  'landing.hero.title.gradient': { en: 'confidence', ru: 'уверенностью' },
  'landing.hero.subtitle': { en: 'Connect, send, record, replay, load test, and validate — all from one tool. CLI and Web Dashboard included.', ru: 'Подключайте, отправляйте, записывайте, воспроизводите, нагружайте и валидируйте — всё в одном инструменте. CLI и веб-дашборд в комплекте.' },
  'landing.hero.openDashboard': { en: 'Open Dashboard', ru: 'Открыть дашборд' },
  'landing.hero.viewGithub': { en: 'View on GitHub', ru: 'GitHub' },

  // Features
  'landing.features.title': { en: 'Everything you need to test WebSockets', ru: 'Всё для тестирования WebSocket' },
  'landing.features.subtitle': { en: 'Six essential tools in one lightweight package', ru: 'Шесть инструментов в одном легковесном пакете' },

  'landing.feature.realtime.title': { en: 'Real-time Connection', ru: 'Подключение в реальном времени' },
  'landing.feature.realtime.desc': { en: 'Connect to any ws:// or wss:// endpoint. See connection status, latency, and session details instantly.', ru: 'Подключайтесь к любому ws:// или wss:// эндпоинту. Статус, задержка и детали сессии — мгновенно.' },

  'landing.feature.sendreceive.title': { en: 'Send & Receive', ru: 'Отправка и получение' },
  'landing.feature.sendreceive.desc': { en: 'Send messages and watch responses in a beautiful real-time log with color-coded arrows.', ru: 'Отправляйте сообщения и отслеживайте ответы в красивом логе с цветными стрелками.' },

  'landing.feature.record.title': { en: 'Record & Replay', ru: 'Запись и воспроизведение' },
  'landing.feature.record.desc': { en: 'Capture entire sessions with timestamps. Replay them for regression testing after every deploy.', ru: 'Записывайте сессии с таймстемпами. Воспроизводите для регрессионного тестирования после каждого деплоя.' },

  'landing.feature.loadtest.title': { en: 'Load Testing', ru: 'Нагрузочное тестирование' },
  'landing.feature.loadtest.desc': { en: 'Spawn 100+ concurrent connections. Measure latency, throughput, and failure rates.', ru: 'Создавайте 100+ одновременных подключений. Измеряйте задержку, пропускную способность и процент ошибок.' },

  'landing.feature.validate.title': { en: 'Schema Validation', ru: 'Валидация схемы' },
  'landing.feature.validate.desc': { en: 'Validate messages against JSON Schema. Catch format issues before they reach production.', ru: 'Валидируйте сообщения по JSON Schema. Ловите ошибки формата до продакшена.' },

  'landing.feature.cli.title': { en: 'CLI + Web Dashboard', ru: 'CLI + Веб-дашборд' },
  'landing.feature.cli.desc': { en: 'Use from the terminal or the browser. Same powerful engine, two interfaces for every workflow.', ru: 'Используйте из терминала или браузера. Один мощный движок, два интерфейса для любого workflow.' },

  // Demo Preview
  'landing.demo.title': { en: 'See it in action', ru: 'Посмотрите в деле' },
  'landing.demo.subtitle': { en: 'A real-time dashboard for inspecting WebSocket traffic', ru: 'Дашборд для инспекции WebSocket-трафика в реальном времени' },

  // How It Works
  'landing.howItWorks.title': { en: 'Get started in 3 steps', ru: 'Начните за 3 шага' },
  'landing.step1.title': { en: 'Install', ru: 'Установка' },
  'landing.step1.desc': { en: 'One command to install globally via npm.', ru: 'Одна команда для глобальной установки через npm.' },
  'landing.step2.title': { en: 'Connect', ru: 'Подключение' },
  'landing.step2.desc': { en: 'Point to any WebSocket server — local or remote.', ru: 'Укажите любой WebSocket сервер — локальный или удалённый.' },
  'landing.step3.title': { en: 'Test', ru: 'Тестирование' },
  'landing.step3.desc': { en: 'Send messages, record sessions, run load tests.', ru: 'Отправляйте сообщения, записывайте сессии, запускайте нагрузочные тесты.' },

  // Terminal
  'landing.terminal.title': { en: 'Powerful CLI out of the box', ru: 'Мощный CLI из коробки' },

  // Self-Hosted
  'landing.selfHosted.title': { en: 'Self-hosted. Your data stays yours.', ru: 'Self-hosted. Ваши данные остаются вашими.' },
  'landing.selfHosted.desc': { en: 'Run ws-tester on your own infrastructure. No cloud dependencies, no data leaves your network.', ru: 'Запускайте ws-tester на своей инфраструктуре. Без облачных зависимостей, данные не покидают вашу сеть.' },
  'landing.selfHosted.docker': { en: 'Run with Docker:', ru: 'Запуск через Docker:' },
  'landing.selfHosted.npm': { en: 'Or via npm:', ru: 'Или через npm:' },

  // Comparison
  'landing.compare.title': { en: 'Why ws-tester?', ru: 'Почему ws-tester?' },
  'landing.compare.subtitle': { en: 'The only tool that combines everything in one package', ru: 'Единственный инструмент, объединяющий всё в одном пакете' },
  'landing.compare.feature': { en: 'Feature', ru: 'Возможность' },
  'landing.compare.connect': { en: 'Connect & Send', ru: 'Подключение и отправка' },
  'landing.compare.webui': { en: 'Web Dashboard', ru: 'Веб-дашборд' },
  'landing.compare.record': { en: 'Record & Replay', ru: 'Запись и воспроизведение' },
  'landing.compare.loadtest': { en: 'Load Testing', ru: 'Нагрузочное тестирование' },
  'landing.compare.schema': { en: 'Schema Validation', ru: 'Валидация схемы' },
  'landing.compare.cli': { en: 'CLI Interface', ru: 'CLI интерфейс' },
  'landing.compare.i18n': { en: 'Multilingual UI', ru: 'Мультиязычный UI' },
  'landing.compare.selfhosted': { en: 'Self-hosted', ru: 'Self-hosted' },
  'landing.compare.free': { en: 'Free & Open Source', ru: 'Бесплатный и Open Source' },
  'landing.compare.noConfig': { en: 'Zero Config', ru: 'Без конфигурации' },

  // Footer
  'landing.footer.builtWith': { en: 'Built with TypeScript', ru: 'Написан на TypeScript' },

  // === Demo Welcome Modal ===
  'demo.title': { en: 'Welcome to ws-tester Demo', ru: 'Добро пожаловать в демо ws-tester' },
  'demo.description': {
    en: 'This is a <strong>live demo</strong> — feel free to explore all features: connect, send messages, record sessions, run load tests, and validate schemas.',
    ru: 'Это <strong>живое демо</strong> — попробуйте все функции: подключение, отправку сообщений, запись сессий, нагрузочные тесты и валидацию схем.',
  },
  'demo.selfHostHint': {
    en: 'To use ws-tester with <strong>your own projects</strong>, deploy it on your infrastructure — it takes one command:',
    ru: 'Чтобы использовать ws-tester с <strong>вашими проектами</strong>, разверните его на своей инфраструктуре — одной командой:',
  },
  'demo.docsLink': { en: 'Read Documentation', ru: 'Документация' },
  'demo.gotIt': { en: 'Got it, open Dashboard', ru: 'Понятно, открыть дашборд' },
  'demo.dontShow': { en: "Don't show again", ru: 'Больше не показывать' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}
