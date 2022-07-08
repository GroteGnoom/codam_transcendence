service postgresql start

while ! psql -f /tmp/script.sql; do sleep 1; done;

echo done!
sleep infinity
