import bcrypt from 'bcrypt';
import { EmployeeController, IEmployeeController } from '../components/employees/controller';
import { Employee } from '../components/employees/types';
import { TankController, ITankController } from '../components/tanks/controller';
import { Tank } from '../components/tanks/types';
import { QueryResult } from 'pg';
import { BatchesController, IBatchesController } from '../components/batches/controller';
import { IActionController, ActionController } from '../components/actions/controller';
import { Action } from '../components/actions/types';
import { Batch, Task, Version } from '../components/batches/types';
import { RecipeController, IRecipeController } from '../components/recipes/controller';
import { Recipe } from '../components/recipes/types';

// tslint:disable: no-console no-unsafe-any

function encryptPassword(password: string, username: string) {
  const saltRounds = 8;
  // const hash = CryptoJS.AES.encrypt(password, username).toString();

  return bcrypt.hashSync(password, saltRounds);
}

async function insertDevAdmin() {
  const employeeController: IEmployeeController = new EmployeeController('employees');
  await employeeController.connect();

  const user: Employee = {
    first_name: 'General',
    last_name: 'Kenobi',
    username: 'admin',
    phone: '555-867-5309',
    admin: true,
    password: encryptPassword('password', 'admin')
  };

  try {
    // Check for existing user
    const prevUser: QueryResult = await employeeController.readByUsername(user.username);

    if (prevUser.rows.length === 0) {
      // No existing user, add admin
      const { keys, values, escapes } = employeeController.splitObjectKeyVals(user);
      await employeeController.create(keys, escapes, values);
      console.log(' + Added test admin user.');
    } else {
      // Existing user
      console.log(' ✔️ Test admin exists.');
    }
  } catch (e) {
    console.log(' x Error inserting test admin user.', e);
  }

  await employeeController.disconnect();
}

async function insertDevTanks() {
  const tankController: ITankController = new TankController('tanks');
  await tankController.connect();

  for (let i = 1; i < 10; i++) {
    const { rows }: QueryResult = await tankController.readById(i);
    const tank: Tank = {
      name: `F${i}`,
      status: 'available',
      in_use: true
    };
    if (rows.length === 0) {
      const { keys, values, escapes } = tankController.splitObjectKeyVals(tank);
      await tankController.create(keys, escapes, values);
      console.log(`inserted tank ${tank.name}.`);
    } else {
      console.log(`tank ${tank.name} exists.`);
    }
  }

  await tankController.disconnect();
}

async function insertDevActions() {
  const actionController: IActionController = new ActionController('actions');
  await actionController.connect();

  for (let i = 1; i < 10; i++) {
    const { rows }: QueryResult = await actionController.readById(i);
    const action: Action = {
      name: `Action ${i}`,
      description: `Description for action ${i}`
    };
    if (rows.length === 0) {
      const { keys, values, escapes } = actionController.splitObjectKeyVals(action);
      await actionController.create(keys, escapes, values);
      console.log(`inserted tank ${action.name}.`);
    } else {
      console.log(`tank ${action.name} exists.`);
    }
  }
  await actionController.disconnect();
}

async function insertDevRecipes() {
  const recipeController: IRecipeController = new RecipeController('recipes');
  await recipeController.connect();

  for (let i = 1; i < 10; i++) {
    const { rows }: QueryResult = await recipeController.readById(i);
    const recipe: Recipe = {
      name: `Recipe ${i}`,
      airplane_code: 'ABC',
      yeast: 5,
      instructions: JSON.stringify({
        directions: `brew the beer according to recipe ${i}`
      })
    };
    if (rows.length === 0) {
      const { keys, values, escapes } = recipeController.splitObjectKeyVals(recipe);
      await recipeController.create(keys, escapes, values);
      console.log(`inserted recipe ${recipe.name}.`);
    } else {
      console.log(`recipe ${recipe.name} exists.`);
    }
  }

  await recipeController.disconnect();

}

async function insertDevBatches() {
  const batchesController: IBatchesController = new BatchesController('batches');
  await batchesController.connect();

  for (let i = 1; i < 10; i++) {
    const { rows }: QueryResult = await batchesController.readById(i);
    const batch = {
      name: `Batch ${i}`,
      // tslint:disable: insecure-random
      volume: Math.random() * Math.floor(5),
      bright: Math.random() * Math.floor(5),
      generation: Math.floor(Math.random() * Math.floor(20)),
      started_on: new Date().toUTCString(),
      recipe_id: i,
      tank_id: i
    };

    const version = {
      SG: 1.23,
      PH: 5.64,
      ABV: 8.0,
      temperature: 57,
      pressure: 12,
      measured_on: new Date().toUTCString(),
      batch_id: i
    };

    const task = {
      id: i,
      assigned: true,
      batch_id: i,
      action_id: i,
      employee_id: 1,
      added_on: new Date().toUTCString(),
      completed_on: new Date().toUTCString()
    };

    if (rows.length === 0) {
      const { keys, values, escapes } = batchesController.splitObjectKeyVals(batch);
      await batchesController.create(keys, escapes, values);
      const taskKeys = batchesController.splitObjectKeyVals(task);
      await batchesController.createInTable(taskKeys.keys, 'tasks', taskKeys.escapes, taskKeys.values);
      const versionKeys = batchesController.splitObjectKeyVals(version);
      await batchesController.createInTable(versionKeys.keys, 'versions', versionKeys.escapes, versionKeys.values);
      console.log(`inserted batch ${batch.name}.`);
    } else {
      console.log(`batch ${batch.name} exists.`);
    }
  }
  await batchesController.disconnect();
}


export async function insertDevelopmentData() {
  try {
    await insertDevAdmin();
    await insertDevTanks();
    await insertDevActions();
    await insertDevRecipes();
    await insertDevBatches();
  } catch (err) {
    console.error(err);
  }
}
