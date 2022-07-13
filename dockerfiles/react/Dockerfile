from debian:buster

RUN echo bla
RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update && apt-get -y install nodejs yarn

WORKDIR /home/root/transcendence
#ENTRYPOINT sleep infinity
ENTRYPOINT ./start


