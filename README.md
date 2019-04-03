# NinkasiServer

## Purpose of API:
The general purpose of the API is to keep track of how a batch of beer is being brewed over time. There are some peripheral information pieces such as employees that are working on the system, the tanks that the batches are being brewed in, actions associated with those tanks, and the recipes for a brew.

## Security Mechanisms:
The API uses JWT (Json Web Tokens) based authorization to ensure that only valid users are permitted to preform actions on table when requests are made. When a user is created, or signs in, they will provide a password for authentication, after their password and username are verified they will be given a time based JWT for all their requests.

The API will also escape/validate submitted data to prevent injection attacks and to prevent illogical values from being stored in the database. Most of this kind of validation will be handled by third-party validators, like npm’s [validator](https://github.com/chriso/validator.js), as well as custom validators that validate types of data that are unique to the API. Injection attacks will also be prevented by using prepared statements when querying the database.

The API protects both the user’s privacy and any of the API’s architectural secrets. To protect the former, the API takes precautions like avoiding exposing any of the user’s sensitive data in route specifications. To protect the latter, it performs responsible error handling such that the user only ever sees custom error messages instead of default debugging information that could potentially reveal sensitive information about the API.

## Resources

This project uses
* Docker
* PostgreSQL
* Express

Express uses the [pg](https://node-postgres.com/) package to interact with the postgreSQL database.


## Startup

Both development and production environments require the use of a *.env* file to get environment variables.
This *.env* file should never be committed.

The minimum requirements are as follows

* PGUSER
* PGDATABASE
* PGPASSWORD
* PORT

Everything beginning with PG will be used to configure the postgreSQL docker container, and the Express connections to that container. For more information on the PG environment variables, check out the [official postgres docker container docs](https://hub.docker.com/_/postgres/)

The PORT is the port the express app will expose for the routes.

Everything except for the PGPORT and PGHOST can be set to whatever you want it to.

#### Development

Your env file requires

* __PGUSER__: the name of database user the api will use to access the database.
* __PGPASSWORD__: the password of the database user.
* __PGDATABASE__: the name of the database which the api will run off of.

Then

1. Make sure to use node version 10 as it needs to match the development docker container (which uses node 10).
1. `npm install` will install all of the dependencies.
1. `npm run watch-ts` will have the typescript compiler watch the source files for changes and re-transpile them 
1. `npm run dev-build` will build a new Docker image for the api
1. `npm run dev` will start the development database and web server in Docker.



If you are going to do testing, you need the following in the *.env* file

* TEST_PG_USER
* TEST_PG_PASSWORD
* TEST_PG_HOST

It is easiest to have theses match your development credientials and database name.

#### Production

Your env file requires all of the environment variables from the development section (exculding the TEST variables) plus:

* PGPORT=5432 ??? __TODO__
* PGHOST=database ??? __TODO__

Then

1. `npm run prod` will start the production database and API.

### Checking the database (manually)

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
* __test-intg__: runs the current tests (which are integration tests) without any hassle.  It launches the test database, waits for it to initialize, runs the tests, then closes the database.

