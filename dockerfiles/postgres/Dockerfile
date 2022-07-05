from debian:buster

RUN apt-get update && apt-get -y install postgresql netcat

#RUN service postgresql start && sleep 5


USER postgres

COPY script.sql /tmp
COPY start.sh /tmp

COPY postgresql.conf /etc/postgresql/11/main/

ENTRYPOINT /tmp/start.sh
#ENTRYPOINT sleep infinity
#RUN while ! psql -f /tmp/script.sql; do sleep 1; done;


