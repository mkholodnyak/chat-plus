# Shriming Chat
[![Build Status](https://travis-ci.org/shriming/chat.svg)](https://travis-ci.org/shriming/chat)

Учебный проект команды Shriming. Разрабатывается в рамках [ШРИ'15 в Москве](https://academy.yandex.ru/events/shri/).

## Установка

Устанавливается с помощью [npm](https://npmjs.org): `npm install`.

После этого необходимо выполнить команду `bower-npm-install` для установки npm-пакетов для каждой bower зависимости.

## Использование

 1) Установите базу данных [MongoDB](https://www.mongodb.org/).

 2) Переименуйте файл `./local.dist.js` в `./local.js`, перенесите его в `./config` и подставьте в него свои параметры.

Данные для авторизации в Slack можно получить на странице [Slack API](https://api.slack.com/applications) в разделе "OAuth Information".

```javascript
 options: {
             clientID: 'YOUR_CLIENT_ID',
             clientSecret: 'YOUR_CLIENT_SECRET',
             callbackURL: 'YOUR_CALLBACK_URL',
             team: 'YOUR_TEAM',
          }
```
Логин и пароль к `Яндекс Диску` можно получить на [странице регистрации аккаунта](https://disk.yandex.ru).

Путь к локальной БД нужно прописать вместо `YOUR_MONGODB_URL`.
Пример: ` mongodb://127.0.0.1:27017/chat`

 3) Наберите `gulp` (требуется установленный [Gulp](http://gulpjs.com/)).


## Contribution

[Соглашения по работе над проектом](https://github.com/shriming/chat/wiki).
