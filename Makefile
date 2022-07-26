PROJECT = transcendence

all:
	docker-compose up --build -d

fg:
	docker-compose up --build

fgre:
	docker-compose kill
	docker-compose up --build

clean:
	docker-compose down

fclean:
	docker-compose down --rmi all --volumes
	rm -r postgres_data

superclean: fclean
	docker rmi $(docker images -a) || true
	docker volume rm $(docker volume ls) || true
	docker network rm transcendence_transcendence || true
	docker system prune -a
	rm -r react/node_modules
	rm -r nestjs/node_modules

re: clean all

.PHONY: all clean fclean re superclean
