# Docker
## Mainly relevant for MacOS

### To check if docker is running:
docker run hello-world

### if you get:
> docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?.

1. go to managed software center, remove docker
2. run remove\_all\_docker.sh (in the scripts folder)
3. install docker with managed software center
4. make sure you have lots of disk space available (I seemed to need 2 GB)
5. run docker (for example using spotlight)
6. wait until Docker is started

### To use less home disk space:
change your disk image location to goinfre (maybe sgoinfre is better?)
https://www.kindacode.com/article/docker-desktop-change-images-containers-directory/

#### NB: this did not seem to work for me with the current setup: https://noahloomans.com/tutorials/docker-valgrind/
