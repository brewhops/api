-- Init script for database --

-- DB: Postgres --
-- Tables:
--    employees
--    actions
--    tanks
--    recipes
--    batches
--    versions
--    tasks

--
-- Table structure for table `employees`
--

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL NOT NULL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone CHAR(12),
  admin BOOLEAN NOT NULL
);

--
-- Table structure for table `actions`
--

CREATE TABLE IF NOT EXISTS actions (
  id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

--
-- Table structure for table `tanks`
--

CREATE TABLE IF NOT EXISTS tanks (
  id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  in_use BOOLEAN NOT NULL
);

--
-- Table structure for table `recipes`
--

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL NOT NULL PRIMARY KEY,
  airplane_code VARCHAR(50) NOT NULL,
  instructions JSONB NOT NULL
);

--
-- Table structure for table `batches`
--

CREATE TABLE IF NOT EXISTS batches (
  id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  volume FLOAT(2),
  bright FLOAT(2),
  generation FLOAT(2),
  started_on TIMESTAMPTZ NOT NULL,
  completed_on TIMESTAMPTZ,
  recipe_id SERIAL REFERENCES recipes(id) NOT NULL,
  tank_id SERIAL REFERENCES tanks(id) NOT NULL
);

--
-- Table structure for versions
--

CREATE TABLE IF NOT EXISTS versions (
  id SERIAL NOT NULL PRIMARY KEY,
  SG FLOAT(2) NOT NULL,
  PH FLOAT(2) NOT NULL,
  ABV FLOAT(2) NOT NULL,
  temperature FLOAT(2) NOT NULL,
  pressure FLOAT(2) NOT NULL,
  measured_on TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  batch_id SERIAL REFERENCES batches(id) NOT NULL
);

--
-- Table structure for table `tasks`
--

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL NOT NULL PRIMARY KEY,
  added_on TIMESTAMPTZ NOT NULL,
  completed_on TIMESTAMPTZ DEFAULT NULL,
  assigned BOOLEAN DEFAULT FALSE NOT NULL,
  batch_id SERIAL REFERENCES batches(id) NOT NULL,
  action_id SERIAL REFERENCES actions(id) NOT NULL,
  employee_id SERIAL REFERENCES employees(id)
);


--
-- Views for easy querying of the DB
--

-- the batch ID and action name of all open tasks
CREATE VIEW open_tasks AS
SELECT actions.name AS action_name,
tasks.batch_id
FROM actions, tasks
WHERE tasks.action_id=actions.id AND
tasks.completed_on IS NULL;
-- EXAMPLE:
--  action_name | batch_id
-- -------------+----------
--  COOL        |        1



-- shows all tanks that have a currently running batch in it
CREATE VIEW tank_open_batch AS
SELECT batches.name AS batch_name,
batches.id AS batch_id,
tanks.name AS tank_name,
tanks.id AS tank_id,
recipes.airplane_code AS beer_name
FROM batches, tanks, recipes
WHERE batches.tank_id=tanks.id AND
batches.completed_on IS NULL
AND recipes.id=batches.recipe_id;
-- EXAMPLE:
--  batch_name | batch_id | tank_name | tank_id | beer_name
-- ------------+----------+-----------+---------+-----------
--  6589-6593  |        1 | F1        |       1 | RAIN


-- Gets the most recent info for each batch
CREATE VIEW most_recent_batch_info AS
SELECT pressure, temperature, SG, PH, ABV, batch_id
FROM versions
INNER JOIN (
  SELECT Max(measured_on)
  FROM versions
  WHERE completed=false
  GROUP BY batch_id
) e
ON versions.measured_on = e.max;
-- EXAMPLE:
--  pressure | temperature |   sg   |  ph  | abv | batch_id
-- ----------+-------------+--------+------+-----+----------
--       190 |          50 | 1.1008 | 3.45 | 6.5 |        1
--       140 |          80 | 1.1025 | 3.89 | 6.1 |        2
