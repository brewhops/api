# Brewhops API ![CircleCI](https://circleci.com/gh/danvanhorn/brewhops-api.svg?style=svg&circle-token=0f17dce14c506204bc95e1e986c8f3f99cd725ec) [![codecov](https://codecov.io/gh/brewhops/api/branch/master/graph/badge.svg)](https://codecov.io/gh/brewhops/api)

## Purpose of the API:
The general purpose of the API is to keep track of how a batch of beer is being brewed over time. There are some peripheral information pieces such as employees that are working on the system, the tanks that the batches are being brewed in, actions associated with those tanks, and the recipes for a brew.


## Requirements
* [npm](https://www.npmjs.com/get-npm)
* [Docker](https://docs.docker.com/install/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [Postman](https://www.getpostman.com/)

## Startup

Both development and production environments require the use of a *.env* file to get environment variables.
This *.env* file should never be committed, you can rename the *example.env* file in the project to *.env* and it will work.

It contains the following environment variables that are all required for local development with Docker.

* PGUSER     -- The PostGres username
* PGDATABASE -- The PostGres database name 
* PGPASSWORD -- The PostGres database password
* PORT       -- The Port that the database connects to
* IS_NOW     -- Required to expose all routes
* AUTH_KEY   -- Secret key for authorization

For more information on the PG environment variables, check out the [official postgres docker container docs](https://hub.docker.com/_/postgres/)

## Development
1. `cp example.env .env` will enable the [default configuration](example.env).
1. `npm ci` will install all of the dependencies.
1. Run `npm run watch-ts` in a different terminal, this will trigger the typescript compiler to watch the source files for changes and re-transpile them.
1. `npm run build-images` will run `docker-compose`, build new images, and run the api.
1. `npm run dev` will run `docker-compose`, and run the api.

## Postman
The postman collections at the root of this repo contains documentation for all of the avaiable api endpoints. It contains *.collection.json and *.environment.json that will need to be imported into postman so that authentication is automated for all requests.
* [Postman](https://www.getpostman.com/)


## Test Data
Once the application has started the `init`(small data set) or `init-live`(large data set) endpoint needs to be hit to initialize the test data for the application.  Once hit (after success) this can take between 10 seconds to a minute to load all of the data. 

Our Postman collections contain these routes, aptly named `init` and `init-live`.

If you prefer, the following curl commands can be used to hit both endpoints:
```
curl -X POST http://localhost:3000/init
curl -X POST http://localhost:3000/init-live
```

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
* __start__: Starts the server using vanilla NodeJs.
* __build__: Runs the typescript compiler on the source code.
* __now-dev__: used by the `now` cli when running `now dev`. There is no need to run this manually.
* __now-build__: used by the `now` cli when running `now dev`. There is no need to run this manually.
* __test__: Runs unit tests with Jest.
* __dev__: Starts the development docker environment with the most recently built images. NodeJs version must be version 11.
* __debug__: Used by docker to start the server for local development with a debugging port enabled.
* __psql__: Opens a terminal and starts psql on the currently running postgres instance on docker.
* __lint__: Runs the linter on the project to enforce code styling based on our `tslint.json` configuration.
* __watch-ts__: Starts the typescript compiler in watch mode to automatically update the currently running docker api instance with new changes.




