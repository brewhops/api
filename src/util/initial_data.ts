import bcrypt from 'bcrypt';
import { EmployeeController, IEmployeeController } from '../components/employees/controller';
import { Employee } from '../components/employees/types';
import { TankController, ITankController } from '../components/tanks/controller';
import { Tank } from '../components/tanks/types';
import { QueryResult } from 'pg';
import { BatchesController, IBatchesController } from '../components/batches/controller';
import { IActionController, ActionController } from '../components/actions/controller';
import { Action } from '../components/actions/types';
import { RecipeController, IRecipeController } from '../components/recipes/controller';
import { Recipe } from '../components/recipes/types';
import CryptoJS from 'crypto-js';
import { IVersionController, VersionController } from '../components/versions/controller';
import { ITaskController, TaskController } from '../components/tasks/controller';

// tslint:disable: no-console no-unsafe-any no-any

function encryptPassword(password: string) {

  return CryptoJS.SHA3(password).toString();
}

const start = new Date('2018-10-01');
const end = new Date('2018-10-16');

const getDateArray = (): Date[] => {
  const arr = [];
  const dt = new Date(start);

  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }

  return arr;
};

async function insertDevAdmin() {
  const employeeController: IEmployeeController = new EmployeeController('employees');
  await employeeController.connect();

  const user: Employee = {
    first_name: 'General',
    last_name: 'Kenobi',
    username: 'admin',
    phone: '555-867-5309',
    admin: true,
    password: encryptPassword('password')
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
      console.log(` + Added tank '${tank.name}'.`);
    } else {
      console.log(` ✔️ Tank '${tank.name}' exists.`);
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
      console.log(` + Added action '${action.name}'.`);
    } else {
      console.log(` ✔️ Action '${action.name}' exists.`);
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
      instructions: JSON.stringify([{
        ingredient: 'hops',
        ratio: `${i}`
      }])
    };
    if (rows.length === 0) {
      const { keys, values, escapes } = recipeController.splitObjectKeyVals(recipe);
      await recipeController.create(keys, escapes, values);
      console.log(` + Added recipe '${recipe.name}'.`);
    } else {
      console.log(` ✔️ Recipe '${recipe.name}' exists.`);
    }
  }

  await recipeController.disconnect();

}

async function insertDevBatches() {
  const batchesController: IBatchesController = new BatchesController('batches');
  const versionsController: IVersionController = new VersionController('versions');
  const tasksController: ITaskController = new TaskController('tasks');
  await batchesController.connect();
  await versionsController.connect();
  await tasksController.connect();

  let idx = 0;
  let iterations = 1;

  for (let i = 1; i < 10; i++) {
    const batchResult: QueryResult = await batchesController.readById(i);
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

    if (batchResult.rows.length === 0) {
      const { keys, values, escapes } = batchesController.splitObjectKeyVals(batch);
      await batchesController.create(keys, escapes, values);
      console.log(` + Added batch '${batch.name}'.`);
    } else {
      console.log(` ✔️ Batch '${batch.name}' exists.`);
    }

    const dateArray: Date[] = getDateArray();
    let dateIter = 0;
    for (let j = idx; j < (iterations * 15); j++, idx++) {
      const versionResult: QueryResult = await versionsController.readById(j);
      const version = {
        SG: Math.random() * Math.floor(2),
        PH: Math.random() * Math.floor(6),
        ABV: 8.0,
        temperature: Math.random() * Math.floor(60),
        pressure: Math.random() * Math.floor(12),
        measured_on: dateArray[dateIter].toUTCString(),
        batch_id: i
      };
      dateIter++;
      if (versionResult.rows.length === 0) {
        const {keys, escapes, values} = batchesController.splitObjectKeyVals(version);
        await batchesController.createInTable(keys, 'versions', escapes, values);
        console.log(` + Added version ${j}.`);
      } else {
        console.log(` ✔️ Version ${j} exists.`);
      }
    }

    const tasksResult: QueryResult = await tasksController.readById(i);
    const task = {
      assigned: true,
      batch_id: i,
      action_id: i,
      employee_id: 1,
      added_on: new Date().toUTCString(),
      completed_on: new Date().toUTCString()
    };

    if (tasksResult.rows.length === 0) {
      const {keys, escapes, values} = batchesController.splitObjectKeyVals(task);
      await batchesController.createInTable(keys, 'tasks', escapes, values);
      console.log(` + Added task ${i}.`);
    } else {
      console.log(` ✔️ Task ${i} exists.`);
    }

    iterations++;
  }
  await batchesController.disconnect();
  await tasksController.disconnect();
  await versionsController.disconnect();
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
