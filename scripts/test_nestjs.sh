#!/bin/bash
set -e
set -x
docker exec -u 0 -it $(./get_container_id.sh nestjs) npm test
