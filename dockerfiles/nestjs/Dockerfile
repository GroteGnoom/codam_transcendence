from debian:buster

RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update && apt-get -y install nodejs yarn git

WORKDIR /home/root

RUN git clone https://github.com/nestjs/typescript-starter.git transcendence_backend

WORKDIR /home/root/transcendence_backend

RUN npm install

ENTRYPOINT npm run start

