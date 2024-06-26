# Онлайн-версия Монополии

Этот проект представляет собой онлайн-версию знаменитой настольной игры "Монополия", реализованную с использованием современных веб-технологий и фреймворка Django.
Вы можете поиграть здесь: http://game.ai-poly.online/

![Скриншот Монополии](https://github.com/sergeykrasilnikov1/monopoly/blob/master/source-images/screen.png)
## Особенности проекта

- **Полный функционал оригинальной игры:** Онлайн-версия Монополии включает все основные функции и правила классической настольной игры, позволяя игрокам наслаждаться игровым процессом в виртуальном пространстве.

- **Реальное время:** Проект обеспечивает взаимодействие игроков в реальном времени благодаря использованию технологий WebSockets и Django Channels, позволяя участникам игры чувствовать атмосферу соревнования и взаимодействия.

- **Модульная структура проекта:** Приложение построено на фреймворке Django, разделяя функционал на модели, представления и шаблоны, что обеспечивает четкую структуру проекта и облегчает его разработку и поддержку.

## Технологии, используемые в проекте

- **Django:** Для серверной части приложения.
- **HTML и JavaScript:** Для клиентской части интерфейса.
- **Django Channels:** Для обеспечения обмена данными в реальном времени между клиентами через WebSockets.
- **Django REST Framework (DRF):** Для создания RESTful API, обеспечивающего взаимодействие с клиентами.
- **Docker:** Для контейнеризации приложения и обеспечения его легкости в развертывании и масштабировании.
- **Git и GitHub:** Для контроля версий и совместной разработки.

## Тестирование и автоматизация

Проект включает в себя систему тестирования с использованием Django Test, обеспечивая проверку корректности работы функционала на всех этапах разработки. Также реализована автоматизация процесса тестирования и развертывания с помощью GitHub Actions, что обеспечивает надежность и стабильность приложения.

## Установка и запуск

1. Клонируйте репозиторий: `git clone https://github.com/sergeykrasilnikov1/monopoly.git`
2. Запустите приложение с помощью Docker Compose: `docker-compose up`

## Дополнительная информация

Для более подробной информации о структуре проекта, моделях, представлениях, API и других особенностях приложения, обратитесь к документации, предоставленной в репозитории проекта.

## Заключение

Этот проект предоставляет возможность играть в Монополию онлайн с полным функционалом классической настольной игры, обеспечивая удобное и захватывающее игровое пространство для взаимодействия игроков.
