from debian:buster

RUN echo bla
RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update && apt-get -y install nodejs yarn git

WORKDIR /home/root/transcendence_backend
ENTRYPOINT ./start.sh
