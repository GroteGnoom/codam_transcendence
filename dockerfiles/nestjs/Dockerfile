from debian:buster

RUN echo bla
#procps is needed for npm start dev, else it crashes because ps is not found
RUN apt-get update && apt-get -y install curl procps
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update && apt-get -y install nodejs yarn git

WORKDIR /home/root/transcendence_backend
ENTRYPOINT ./start.sh
