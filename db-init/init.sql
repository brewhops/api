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
  id          SERIAL        NOT NULL    PRIMARY KEY,
  first_name  VARCHAR(255)  NOT NULL,
  last_name   VARCHAR(255)  NOT NULL,
  username    VARCHAR(255)  NOT NULL    UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  phone       CHAR(12)      NULL,
  admin       BOOLEAN       NOT NULL
);

--
-- Table structure for table `actions`
--

CREATE TABLE IF NOT EXISTS actions (
  id          SERIAL        NOT NULL    PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  description TEXT          NULL
);

--
-- Table structure for table `tanks`
--

CREATE TABLE IF NOT EXISTS tanks (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  status        VARCHAR(255)  NOT NULL,
  in_use        BOOLEAN       NOT NULL,
  update_user   INTEGER       NULL
);

CREATE TABLE IF NOT EXISTS tanks_audit (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  operation     VARCHAR(6)    NOT NULL,
  time_stamp    TIMESTAMPTZ   NOT NULL,
  
  tanks_id      INTEGER       NOT NULL,
  name          VARCHAR(255)  NOT NULL,
  status        VARCHAR(255)  NOT NULL,
  in_use        BOOLEAN       NOT NULL,
  update_user   INTEGER       NULL
);

--
-- Table structure for table `recipes`
--

CREATE TABLE IF NOT EXISTS recipes (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  name          VARCHAR(30)   NOT NULL,
  airplane_code VARCHAR(50)   NOT NULL,
  yeast         INT           NULL,
  instructions  JSONB         NOT NULL,
  update_user   INTEGER       NULL
);

CREATE TABLE IF NOT EXISTS recipes_audit (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  operation     VARCHAR(6)    NOT NULL,
  time_stamp    TIMESTAMPTZ   NOT NULL,

  recipes_id    INTEGER       NOT NULL,
  name          VARCHAR(30)   NOT NULL,
  airplane_code VARCHAR(50)   NOT NULL,
  yeast         INT           NULL,
  instructions  JSONB         NOT NULL,
  update_user   INTEGER       NULL
);

--
-- Table structure for table `batches`
--

CREATE TABLE IF NOT EXISTS batches (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  name          VARCHAR(50)   NOT NULL,
  volume        FLOAT(2)      NULL,
  bright        FLOAT(2)      NULL,
  generation    FLOAT(2)      NULL,
  started_on    TIMESTAMPTZ   NOT NULL,
  completed_on  TIMESTAMPTZ   NULL,
  recipe_id     INTEGER       NOT NULL    REFERENCES recipes(id) ,
  tank_id       INTEGER       NOT NULL    REFERENCES tanks(id),
  update_user   INTEGER       NULL
);

CREATE TABLE IF NOT EXISTS batches_audit (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  operation     VARCHAR(6)    NOT NULL,
  time_stamp    TIMESTAMPTZ   NOT NULL,

  batches_id    INTEGER       NOT NULL,
  name          VARCHAR(50)   NOT NULL,
  volume        FLOAT(2)      NULL,
  bright        FLOAT(2)      NULL,
  generation    FLOAT(2)      NULL,
  started_on    TIMESTAMPTZ   NOT NULL,
  completed_on  TIMESTAMPTZ   NULL,
  recipe_id     INTEGER       NOT NULL,
  tank_id       INTEGER       NOT NULL,
  update_user   INTEGER       NULL
);

--
-- Table structure for versions
--

CREATE TABLE IF NOT EXISTS versions (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  SG            FLOAT(2)      NOT NULL,
  PH            FLOAT(2)      NOT NULL,
  ABV           FLOAT(2)      NOT NULL,
  temperature   FLOAT(2)      NOT NULL,
  pressure      FLOAT(2)      NOT NULL,
  measured_on   TIMESTAMPTZ   NOT NULL,
  completed     BOOLEAN       NOT NULL    DEFAULT FALSE,
  batch_id      INTEGER       NOT NULL    REFERENCES batches(id),
  update_user   INTEGER       NULL
);

CREATE TABLE IF NOT EXISTS versions_audit (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  operation     VARCHAR(6)    NOT NULL,
  time_stamp    TIMESTAMPTZ   NOT NULL,

  versions_id   INTEGER       NOT NULL,
  SG            FLOAT(2)      NOT NULL,
  PH            FLOAT(2)      NOT NULL,
  ABV           FLOAT(2)      NOT NULL,
  temperature   FLOAT(2)      NOT NULL,
  pressure      FLOAT(2)      NOT NULL,
  measured_on   TIMESTAMPTZ   NOT NULL,
  completed     BOOLEAN       NOT NULL,
  batch_id      INTEGER       NOT NULL,
  update_user   INTEGER       NULL
);

--
-- Table structure for table `tasks`
--

CREATE TABLE IF NOT EXISTS tasks (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  added_on      TIMESTAMPTZ   NOT NULL,
  completed_on  TIMESTAMPTZ   NULL,
  assigned      BOOLEAN       NOT NULL    DEFAULT FALSE,
  batch_id      INTEGER       NOT NULL    REFERENCES batches(id),
  action_id     INTEGER       NOT NULL    REFERENCES actions(id),
  employee_id   INTEGER       NULL        REFERENCES employees(id),
  update_user   INTEGER       NULL
);


CREATE TABLE IF NOT EXISTS tasks_audit (
  id            SERIAL        NOT NULL    PRIMARY KEY,
  operation     VARCHAR(6)    NOT NULL,
  time_stamp    TIMESTAMPTZ   NOT NULL,

  tasks_id      INTEGER       NOT NULL,
  added_on      TIMESTAMPTZ   NOT NULL,
  completed_on  TIMESTAMPTZ   NULL,
  assigned      BOOLEAN       NOT NULL,
  batch_id      INTEGER       NOT NULL,
  action_id     INTEGER       NOT NULL,
  employee_id   INTEGER       NULL,
  update_user   INTEGER       NULL
);

--
-- Views for easy querying of the DB
--

-- the batch ID and action name of all open tasks
CREATE VIEW open_tasks AS
SELECT  actions.name AS action_name,
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
SELECT  batches.name AS batch_name,
        batches.id AS batch_id,
        tanks.name AS tank_name,
        tanks.id AS tank_id,
        recipes.airplane_code AS beer_name
FROM batches, tanks, recipes
WHERE batches.tank_id=tanks.id AND
      batches.completed_on IS NULL AND
      recipes.id=batches.recipe_id;
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


--
-- Triggers for audit tables
--

CREATE OR REPLACE FUNCTION tanks_audit_function() RETURNS TRIGGER AS $tanks_audit_trigger$
  BEGIN
      --
      -- Create a row in tanks_audit to reflect the operation performed on tanks.
      --
      IF (TG_OP = 'DELETE') THEN
          INSERT INTO tanks_audit VALUES (DEFAULT, 'DELETE', now(), OLD.*);
          RETURN OLD;
      ELSIF (TG_OP = 'UPDATE') THEN
          INSERT INTO tanks_audit VALUES (DEFAULT, 'UPDATE', now(), NEW.*);
          RETURN NEW;
      ELSIF (TG_OP = 'INSERT') THEN
          INSERT INTO tanks_audit VALUES (DEFAULT, 'INSERT', now(), NEW.*);
          RETURN NEW;
      END IF;
      RETURN NULL; -- result is ignored since this is an AFTER trigger
  END;
$tanks_audit_trigger$ LANGUAGE plpgsql;

CREATE TRIGGER tanks_audit_t AFTER INSERT OR UPDATE OR DELETE ON tanks 
    FOR EACH ROW EXECUTE PROCEDURE tanks_audit_function();


CREATE OR REPLACE FUNCTION recipes_audit_function() RETURNS TRIGGER AS $recipes_audit_trigger$
  BEGIN
      --
      -- Create a row in recipes_audit to reflect the operation performed on recipes.
      --
      IF (TG_OP = 'DELETE') THEN
          INSERT INTO recipes_audit VALUES (DEFAULT, 'DELETE', now(), OLD.*);
          RETURN OLD;
      ELSIF (TG_OP = 'UPDATE') THEN
          INSERT INTO recipes_audit VALUES (DEFAULT, 'UPDATE', now(), NEW.*);
          RETURN NEW;
      ELSIF (TG_OP = 'INSERT') THEN
          INSERT INTO recipes_audit VALUES (DEFAULT, 'INSERT', now(), NEW.*);
          RETURN NEW;
      END IF;
      RETURN NULL; -- result is ignored since this is an AFTER trigger
  END;
$recipes_audit_trigger$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_audit_t AFTER INSERT OR UPDATE OR DELETE ON recipes 
    FOR EACH ROW EXECUTE PROCEDURE recipes_audit_function();


CREATE OR REPLACE FUNCTION batches_audit_function() RETURNS TRIGGER AS $batches_audit_trigger$
  BEGIN
      --
      -- Create a row in batches_audit to reflect the operation performed on batches.
      --
      IF (TG_OP = 'DELETE') THEN
          INSERT INTO batches_audit VALUES (DEFAULT, 'DELETE', now(), OLD.*);
          RETURN OLD;
      ELSIF (TG_OP = 'UPDATE') THEN
          INSERT INTO batches_audit VALUES (DEFAULT, 'UPDATE', now(), NEW.*);
          RETURN NEW;
      ELSIF (TG_OP = 'INSERT') THEN
          INSERT INTO batches_audit VALUES (DEFAULT, 'INSERT', now(), NEW.*);
          RETURN NEW;
      END IF;
      RETURN NULL; -- result is ignored since this is an AFTER trigger
  END;
$batches_audit_trigger$ LANGUAGE plpgsql;

CREATE TRIGGER batches_audit_t AFTER INSERT OR UPDATE OR DELETE ON batches 
    FOR EACH ROW EXECUTE PROCEDURE batches_audit_function();


CREATE OR REPLACE FUNCTION versions_audit_function() RETURNS TRIGGER AS $versions_audit_trigger$
  BEGIN
      --
      -- Create a row in versions_audit to reflect the operation performed on versions.
      --
      IF (TG_OP = 'DELETE') THEN
          INSERT INTO versions_audit VALUES (DEFAULT, 'DELETE', now(), OLD.*);
          RETURN OLD;
      ELSIF (TG_OP = 'UPDATE') THEN
          INSERT INTO versions_audit VALUES (DEFAULT, 'UPDATE', now(), NEW.*);
          RETURN NEW;
      ELSIF (TG_OP = 'INSERT') THEN
          INSERT INTO versions_audit VALUES (DEFAULT, 'INSERT', now(), NEW.*);
          RETURN NEW;
      END IF;
      RETURN NULL; -- result is ignored since this is an AFTER trigger
  END;
$versions_audit_trigger$ LANGUAGE plpgsql;

CREATE TRIGGER versions_audit_t AFTER INSERT OR UPDATE OR DELETE ON versions 
    FOR EACH ROW EXECUTE PROCEDURE versions_audit_function();


CREATE OR REPLACE FUNCTION tasks_audit_function() RETURNS TRIGGER AS $tasks_audit_trigger$
  BEGIN
      --
      -- Create a row in tasks_audit to reflect the operation performed on tasks.
      --
      IF (TG_OP = 'DELETE') THEN
          INSERT INTO tasks_audit VALUES (DEFAULT, 'DELETE', now(), OLD.*);
          RETURN OLD;
      ELSIF (TG_OP = 'UPDATE') THEN
          INSERT INTO tasks_audit VALUES (DEFAULT, 'UPDATE', now(), NEW.*);
          RETURN NEW;
      ELSIF (TG_OP = 'INSERT') THEN
          INSERT INTO tasks_audit VALUES (DEFAULT, 'INSERT', now(), NEW.*);
          RETURN NEW;
      END IF;
      RETURN NULL; -- result is ignored since this is an AFTER trigger
  END;
$tasks_audit_trigger$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_audit_t AFTER INSERT OR UPDATE OR DELETE ON tasks 
    FOR EACH ROW EXECUTE PROCEDURE tasks_audit_function();


INSERT INTO actions (name, description) VALUES 
    ('Set Lager temp to 57 deg', 'Set Lager temp to 57 deg'),
    ('Cap non Dry Hop', 'Cap non Dry Hop'),
    ('Cap and Dry Hop', 'Cap and Dry Hop'),
    ('Set Tri temp to 73 deg', 'Set Tri temp to 73 deg'),
    ('Dry Hop Day', 'Dry Hop Day'),
    ('Waiting for Diatecyl', 'Waiting for Diatecyl'),
    ('Crash Day', 'Crash Day'),
    ('Exception', 'Exception'),
    ('Yeast Pull', 'Yeast Pull'),
    ('Cap and Exception', 'Cap and Exception'),
    ('Set H&S and Hazy temp to 74 deg', 'Set H&S and Hazy temp to 74 deg'),
    ('New Batch No Action', 'New Batch No Action');





