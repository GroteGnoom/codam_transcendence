# Docker
## Mainly relevant for MacOS

### To check if docker is running:
docker run hello-world

### if you get:
> docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?.

1. go to managed software center, remove docker (sometimes can be skipped)
2. run these, also put them in your .zshrc or something similar
> rm -rf ~/Library/Containers/com.docker.docker
> mkdir -p ~/goinfre/docker
> ln -s ~/goinfre/docker ~/Library/Containers/com.docker.docker
3. install docker with managed software center
5. run docker (for example using spotlight)
6. wait until Docker is started
