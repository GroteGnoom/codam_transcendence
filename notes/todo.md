https://medium.com/jspoint/typescript-promises-and-async-await-b842b55ee3fd
flow:
user authentication -> set username page -> create user
when clicked on my account -> user already exists -> set account properties

TODOS
[V] randomness random name generator: fetch if user already exists? and max length check
[ ] better validation checks; only all the user input; check type and not empty! (depending on the type of request probably?) (2fa code, image, username)
[V] severity error 2fa wrong to error!
curl -X POST http://f1r1s16.codam.nl:5000/users/create -H "Content-Type: application/json" -d '{"username": "bla", "intraname": "ta"}'
[ ] signup doesn't work? either or signup.tsx or signup: true
curl -X POST http://f1r1s16.codam.nl:5000/users/avatar -H "Content-Type: application/json" -d '{"username": "bla"}'
curl -X PUT http://f1r1s16.codam.nl:5000/users/block/bla
whenever accepting a parameter as number, check this 
[ ] userinfo: alles in frontend aanpassen (catch nu helemaal geen errors in userinfo, of if statements)
curl -X PUT http://f1r1s16.codam.nl:5000/users/updateuser -H "Content-Type: application/json" -d '{"isTfaEnabled": true, "username": "1234"}'

[ ] add useguard to all endpoints
[ ] password error channels
[ ] open leaderboard: Uncaught TypeError: Cannot read properties of null (reading 'id') in leaderboard.tsx:64

maybe(if all the important things are done):
not allow a player to be in multiple games at once?
you should not be able to block yourself in chat

at the end, just before evals:
- use production server, not develop
- everything should work with
  docker-compose up --build
  not via a makefile
- remove the backend homepage
- do TODO's including the fake login. Very important.

important forever:
every Post and Put should not cause a 500, even with random input. All `save` and `find`, which query the database need to have a catch and throw bad request


all checks user validation:
[ ] for every put/post
[ ] since user can only put trash in db with update/save, always catch error when update/save + throw
[ ] this throw must be catched every time the function is called
[ ] besides, check when functions are called which have update/save method

