#!/bin/bash
docker exec -u 0 -it $(./get_container_id.sh $1) bash
