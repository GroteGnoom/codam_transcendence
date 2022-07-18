PROJECT = transcendence

all:
	docker-compose up --build -d

fg:
	docker-compose up --build

clean:
	docker-compose down

fclean:
	docker-compose down --rmi all --volumes
	# rm database volume

superclean: fclean
	docker rmi $(docker images -a)
	docker volume rm $(docker volume ls)
	docker network rm transcendence_transcendence
	docker system prune -a -y
	rm -r react/node_modules
	rm -r nestjs/node_modules

re: clean all

.PHONY: all clean fclean re superclean
