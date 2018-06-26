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
  access_level SMALLINT NOT NULL
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
