from debian:buster

RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update && apt-get -y install nodejs yarn

WORKDIR /home/root

RUN npx create-react-app transcendence

WORKDIR /home/root/transcendence

RUN npm start


