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

#### Development
1. `docker-compose up` will start the development database.
1. `nodemon server.js` will start the API.
1. After launching the database, visit `http://localhost:8080` to interact with the database through a web interface.

#### Production
1. `docker-compose -f docker-compose-prod.yaml up` will start the production databse and API.
