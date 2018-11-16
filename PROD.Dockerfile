# using the node version 10 docker image
FROM node:11

# specify the work directory and tell docker
# where to run future commands
WORKDIR /user/app

# copy the package files into the work directory
# keep it minimal on startup
COPY package*.json ./

# run the shell command
RUN npm install

# copy everything in this directory into our
# docker container
COPY ./src ./src

# expose the port on the docker container
EXPOSE 1234

# sets the default command for this image
CMD ["npm", "start"]
