FROM postgres

# RUN apt-get update && apt-get -y install postgresql netcat

#RUN service postgresql start && sleep 5



COPY script.sql /
COPY start.sh /01-init.sh

# COPY postgresql.conf /etc/postgresql/11/main/
# COPY pg_hba.conf /etc/postgresql/11/main/

# RUN chown postgres:postgres /etc/postgresql/11/main/postgresql.conf
# RUN chown postgres:postgres /etc/postgresql/11/main/pg_hba.conf

# USER postgres
# ENTRYPOINT /tmp/start.sh
#ENTRYPOINT sleep infinity
#RUN while ! psql -f /tmp/script.sql; do sleep 1; done;


