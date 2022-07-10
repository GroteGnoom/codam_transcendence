PROJECT = transcendence

all:
	docker-compose up --build -d

clean:
	docker-compose down

fclean:
	docker-compose down --rmi all --volumes
	# rm database volume

re: clean all

.PHONY: all clean fclean re