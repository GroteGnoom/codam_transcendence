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

re: clean all

.PHONY: all clean fclean re
