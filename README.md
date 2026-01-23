## Uruchomienie projektu

1. Sklonuj repozytorium.
2. Zainstaluj zależności: npm install
2. Uruchom serwer: npm start
3. Aplikacja dostępna pod adresem: http://localhost:3000/start

Po wykonaniu powyższych kroków nie będzie możliwe utworzenie nowego
użytkownika ani zalogowanie się, jeśli kontener Docker z bazą danych MySQL
nie jest uruchomiony.

## Baza danych

Aplikacja korzysta z lokalnej bazy danych MySQL uruchomionej w kontenerze Docker.


## Autor: Paweł Wódczyński


## Opis projektu
Aplikacja webowa umożliwiająca dodawanie, edytowanie, usuwanie, przeglądanie oraz komentowanie postów.

## Struktura serwera

Ten katalog zawiera backend aplikacji oparty o Node.js, z wyraźnym podziałem odpowiedzialności zgodnie z podejściem Controller → Service → Repository.
server/
│
├── constants/
├── controller/
├── errors/
├── middlewares/
├── repository/
├── service/
├── utils/
├── validators/
│
├── db.js
├── server.js
├── .env
├── package-lock.json
└── .gitignore


Warstwa kontrolerów – obsługuje żądania HTTP.
Warstwa logiki biznesowej aplikacji.
Warstwa dostępu do danych.


API obsługuje:

- autoryzację użytkowników

- posty i reakcje

- komentarze

- profile użytkowników

- upload plików (avatar, background)


Autoryzacja

POST /api/register
Rejestracja nowego użytkownika

POST /api/login
Logowanie użytkownika

POST /api/logout
Wylogowanie użytkownika (usunięcie sesji)


Profil użytkownika

GET /api/profile/:username
Pobranie danych profilu użytkownika

POST /api/profile/upload/avatar
Upload avatara użytkownika
(multipart/form-data, pole image)

POST /api/profile/upload/background
Upload tła profilu
(multipart/form-data, pole image)


POST /api/createPost
Utworzenie nowego posta

GET /api/getPosts
Pobranie listy postów

PATCH /api/posts/:postId
Edycja posta

DELETE /api/posts/:postId
Usunięcie posta


Reakcje do postów

POST /api/reaction
Dodanie lub zmiana reakcji do posta

Komentarze

GET /api/getComments
Pobranie komentarzy do posta

POST /api/postComment
Dodanie komentarza

PUT /api/comments/:commentId/like
Dodanie serduszka do komentarza

DELETE /api/comments/:commentId/like
Usunięcie serduszka z komentarza


Struktura bazy danych:

Users:
-id
-username
-password
-email
-first_name
-last_name
-created_at
-avatar_img_url
-background_img_url

Posts:
-id
-user_id
-text
-created_at
-like_count
-dislike_count
-heart_count
-reply_count

CommentHearts:
-id
-user_id
comment_id
-created_at

Comments:
-id
-post_id
-user_id
-parent_id
-heart_count
-created_at
-content
-reply_count

PostsReactions:
-post_id
-user_id
-created_at
-id
-eaction


