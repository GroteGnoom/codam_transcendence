from debian:buster

RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update && apt-get -y install nodejs yarn

WORKDIR /home/root

RUN npx create-react-app transcendence --template typescript

WORKDIR /home/root/transcendence
RUN npm install react-router-dom@6

ENTRYPOINT npm start


