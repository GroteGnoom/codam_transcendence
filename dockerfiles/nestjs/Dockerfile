from debian:buster

RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update && apt-get -y install nodejs yarn git

WORKDIR /home/root

RUN npm i -g @nestjs/cli@"^8.0.0"

RUN nest new transcendence_backend -p npmi

WORKDIR /home/root/transcendence_backend

RUN npm i @nestjs/config @nestjs/typeorm typeorm pg class-validator class-transformer mysql2
RUN npm i -D @types/node

RUN nest generate module users
RUN nest g controller users/controllers/users
RUN nest g service users/services/users

RUN nest g module auth
RUN nest g service auth

RUN npm install class-validator

RUN npm i @nestjs/passport passport passport-oauth2
RUN npm i -D @types/passport-oauth2


COPY env /home/root/transcendence_backend/.env
ENTRYPOINT sleep infinity
#ENTRYPOINT npm run start


#RUN git clone https://github.com/nestjs/typescript-starter.git transcendence_backend


#RUN npm install


