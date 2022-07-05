#!/bin/bash
docker exec -it $(./get_container_id.sh $1) bash
