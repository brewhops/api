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
* PGPORT
* PGHOST
* PORT

Everything beginning with PG will be used to configure the postgreSQL docker container, and the Express connections to that container. For more information on the PG environment variables, check out the [official postgres docker container docs](https://hub.docker.com/_/postgres/)

The PORT is the port the express app will expose for the routes.

Everything except for the PGPORT and PGHOST can be set to whatever you want it to.

#### Development

Your env file requires

* PGPORT=32769
* PGHOST=localhost

Then

1. `docker-compose up` will start the development database.
1. `npm run dev` will start the API.

#### Production

Your env file requires

* PGPORT=5432
* PGHOST=database

Then

1. `docker-compose -f docker-compose-prod.yaml up` will start the production database and API.

### Checking the database

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
