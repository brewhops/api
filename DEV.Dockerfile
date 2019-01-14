# using the node version 11 docker image
FROM node:11

# specify the work directory and tell docker
# where to run future commands
WORKDIR /user

COPY ./package*.json ./

RUN npm i

COPY . .

RUN npm run build

# expose the port on the docker container
EXPOSE 1234

# sets the default command for this image
CMD ["npm", "start"]
