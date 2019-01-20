# using the node version 11 docker image
FROM node:11

# specify the work directory and tell docker
# where to run future commands
WORKDIR /user

# copy over package and package-lock files
COPY ./package*.json ./

# install dependencies
RUN npm i

# copy source
COPY . .

# kick off typescript transpilation
RUN npm run build

# expose the port on the docker container
EXPOSE 3000

# sets the default command for this image
CMD ["npm", "start"]
