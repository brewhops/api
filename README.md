# BrewhopsAPI ![CircleCI](https://circleci.com/gh/danvanhorn/brewhops-api.svg?style=svg&circle-token=0f17dce14c506204bc95e1e986c8f3f99cd725ec)

## Purpose of API:
The general purpose of the API is to keep track of how a batch of beer is being brewed over time. There are some peripheral information pieces such as employees that are working on the system, the tanks that the batches are being brewed in, actions associated with those tanks, and the recipes for a brew.


## Requirements
* [npm](https://www.npmjs.com/get-npm)
* [Docker](https://docs.docker.com/install/)
* [Docker Compose](https://docs.docker.com/compose/install/)

## Startup

Both development and production environments require the use of a *.env* file to get environment variables.
This *.env* file should never be committed, you can rename the *example.env* file in the project to *.env* and it will work.

It contains the following environment variables

* PGUSER     -- The PostGres username
* PGDATABASE -- The PostGres database name 
* PGPASSWORD -- The PostGres database password
* PORT       -- The Port that the database connects to

For more information on the PG environment variables, check out the [official postgres docker container docs](https://hub.docker.com/_/postgres/)

## Development
1. `cp example.env .env` will enable the [default configuration](example.env).
1. `npm i` will install all of the dependencies.
1. Run `npm run watch-ts` in a different terminal, this will trigger the typescript compiler to watch the source files for changes and re-transpile them.
1. `npm run build-images` will run `docker-compose`, build new images, and run the api.
1. `npm run dev` will run `docker-compose`, and run the api.

## Postman
The postman collection at the root of this repo contains documentation for all of the avaiable api endpoints.
* [postman](https://www.getpostman.com/)

## Test Data
Once the application has started the `init-live` endpoint needs to be hit to initialize the test data for the application.  Once hit (after success) this can take between 10 seconds to a minute to load all of the data.  The following curl command can be used to hit the endpoint:
```
curl -X POST http://localhost:3000/init-live
```
Or, postman could also be used to hit this endpoint instead of the curl command.

## Checking the database (manually)

__NOTE__: for the automatic psql instance check the `npm` commands section.

To connect to the docker container and interact directly with the database, follow these steps

1. Start up the postgreSQL docker container if it is not already running
1. Open up a terminal window
1. `docker ps` to get the name of the running DB docker container
1. `docker exec -it {name of DB container} bash -l`
1. `psql -U {PGUSER} -d {database name}`

You should now be logged into the psql program on the docker container

A few things to note:

* every line must either start with a `\` or end with a `;`
  * eg. `\dt` shows all database tables
  * eg. `SELECT * FROM actions;` selects everything from the actions table
* `\q` to quit the psql shell
* `exit` to exit the docker container

## `npm` commands
* __dev__: starts the development docker environment.  This mounts the project to the docker container and then runs nodemon.  For this to work, your local node version (the one used to run `npm install`) must be version 11 as well.
* __dev-clean__: clean's the docker compose environment up.  This allows your development environment to effectively be deleted so you can start from scratch.
* __dev-build__: rebuilds the dockerfiles that are defined in the docker compose file.  Run this is these are changed.
* __dev-psql__: this automatically connects you with a psql instance to the development database (only if running).
* __prod-*__: all of the above commands also have production counterparts.  Replace `dev` with `prod` and they will work.
* __test__: runs the current tests.

