let postgres = require('./../../postgres/pg')
let self = null

const databaseName = process.env.PGDATABASE
const tableName = 'batches'
module.exports = class batchesLogic extends postgres {
  constructor () {
    super(databaseName, tableName)
    self = this
  }

  // GET
  async getBatches (req, res) {
    const { rows } = await self.read()
    res.json(rows)
  }

  async getBatch (req, res, next) {
    const results = await self.readById(req.params.id)
    if (results.rowCount > 0) {
      res.json(results.rows[0])
    } else {
      next()
    }
  }

  async getBatchHistory (req, res, next) {
    const results = await self.readById(req.params.id)
    if (results.rowCount > 0) {
      const versions = await self.client.query(
        `SELECT * FROM versions
        WHERE batch_id = $1`,
        [req.params.id]
      )
      let response = results.rows[0]
      response.history = versions.rows
      res.json(response)
    } else {
      next()
    }
  }

  // POST
  async createBatch (req, res) {
    // make a shorthand for out body so organizing is easier
    const input = req.body

    // check to see if the item already exists
    let results = await self.read('id', 'name=$1', [req.body.name])

    // ************************* //
    // ***** CREATE BATCH ****** //
    // ************************* //

    // pull the info from the input about the batch
    let batch = {
      name: input.name,
      volume: input.volume,
      bright: input.bright,
      generation: input.generation,
      started_on: new Date().toUTCString(),
      recipe_id: input.recipe_id,
      tank_id: input.tank_id
    }
    let { keys, values, escapes } = self.splitObjectKeyVals(batch)

    // if the item does not exist
    if (results.rowCount === 0) {
      try {
        results = await self.create(keys, escapes, values)
      } catch (e) {
        res.status(400).json(e)
        return
      }
      // add the batch
    } else {
      // get the id of the current batch
      const batchID = results.rows[0].id
      // set an update
      const { query, idx } = await self.buildUpdateString(keys, values)
      values.push(batchID)
      // update the batch
      try {
        results = await self.update(query, `id = \$${idx}`, values) // eslint-disable-line
      } catch (e) {
        res.status(400).json(e)
        return
      }
    }

    const batchID = results.rows[0].id
    let split

    // ************************* //
    // ****** CREATE TASK ****** //
    // ************************* //

    // if there is an action
    if (input.action) {
      // build up our info to insert
      let tasksInfo = {
        assigned: input.action.assigned,
        batch_id: batchID,
        action_id: input.action.id,
        employee_id: input.action.employee.id
      }

      // if our batch action is done
      if (input.action.completed) {
        tasksInfo.completed_on = new Date().toUTCString()
      } else {
        tasksInfo.added_on = new Date().toUTCString()
      }

      // check if task already exists
      let taskExists
      try {
        taskExists = await self.client.query(
          `SELECT * FROM tasks
          WHERE completed_on IS NULL
          AND batch_id = $1`,
          [ batchID ]
        )
      } catch (e) {
        res.status(400).json(e)
      }

      // parse it out
      split = self.splitObjectKeyVals(tasksInfo)
      keys = split.keys
      values = split.values
      escapes = split.escapes

      if (taskExists.rowCount > 0) {
        // get the taskID
        let taskID = taskExists.rows[0].id

        // update the task
        self.client.query(
          `UPDATE tasks SET (${keys}) = (${escapes}) WHERE id = ${taskID} RETURNING *`, values
        ).catch(function (e) {
          console.error('Update Error', e)
          return res.status(400).json(e)
        })
      } else {
        // dont let the user try and finish a task that has not started
        if (input.action.completed) {
          res.status(400).json({
            name: 'error',
            detail: 'You can not close a task that has not yet been opened'
          })
          return
        } else {
          // insert a new task
          self.createInTable(keys, 'tasks', escapes, values)
            .catch(function (e) {
              console.error('Create Error', e)
              return res.status(400).json(e)
            })
        }
      }
    }

    // **************************** //
    // ****** CREATE VERSION ****** //
    // **************************** //

    // pull the information for our version
    let version = {
      SG: input.SG,
      PH: input.PH,
      ABV: input.ABV,
      temperature: input.temperature,
      pressure: input.pressure,
      // if our measured on time was not given, set it to now
      measured_on: input.measured_on ? input.measured_on : new Date().toUTCString(),
      // get the batch id
      batch_id: batchID
    }

    // rebuild the keys, values and escapes, but do it with the version object
    split = self.splitObjectKeyVals(version)
    keys = split.keys
    values = split.values
    escapes = split.escapes

    // put our version info in the versions table
    self.createInTable(keys, 'versions', escapes, values)
      // send back the all ok
      .then(submittedValue => res.status(201).end())
      // log and return errors if we had a problem
      .catch(function (error) {
        console.log(error)
        res.status(400).json(error)
      })
  }

  // PATCH
  async updateBatch (req, res, next) {
    const { keys, values } = self.splitObjectKeyVals(req.body)
    const { query, idx } = await self.buildUpdateString(keys, values)
    values.push(req.params.id)

    const results = await self.update(query, `id = \$${idx}`, values) // eslint-disable-line
    if (results.rowCount > 0) {
      res.json(results.rows[0])
    } else {
      next()
    }
  }

  // DELETE
  async deleteBatch (req, res, next) {
    // remove the versions tied to that batch
    const versions = await self.client.query(
      `DELETE FROM versions
      WHERE batch_id = $1`,
      [req.params.id]
    )
    // remove the batch
    const batch = await self.deleteById(req.params.id)
    if (batch.rowCount > 0) {
      res.json({
        msg: 'Success',
        deletedVersions: versions.rowCount,
        deletedBatches: batch.rowCount
      })
    } else {
      next()
    }
  }
}
