# using the node version 10 docker image
FROM node:10

# specify the work directory and tell docker
# where to run future commands
WORKDIR /user/app

# expose the port on the docker container
EXPOSE 1234

ENV NODE_ENV development

# install nodemon globaly
RUN npm install -g nodemon

# sets the default command for this image
CMD ["nodemon", "api/src/index.js"]
