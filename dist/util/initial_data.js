"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../components/employees/controller");
const controller_2 = require("../components/tanks/controller");
const controller_3 = require("../components/batches/controller");
const controller_4 = require("../components/recipes/controller");
const crypto_js_1 = __importDefault(require("crypto-js"));
const controller_5 = require("../components/versions/controller");
const controller_6 = require("../components/tasks/controller");
const papaparse_1 = __importDefault(require("papaparse"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
// tslint:disable: no-console no-unsafe-any no-any
function encryptPassword(password) {
    return crypto_js_1.default.SHA3(password).toString();
}
const start = new Date('2018-10-01');
const end = new Date('2018-10-16');
const getDateArray = () => {
    const arr = [];
    const dt = new Date(start);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
};
// tslint:disable: max-func-body-length
async function insertCSVTestData() {
    fs_1.default.readFile('./src/util/test_data.csv', 'utf8', (err, data) => {
        papaparse_1.default.parse(data, {
            header: true,
            dynamicTyping: true,
            complete: async (results) => {
                const tanks = {};
                const tankIndexes = {};
                const recipes = {};
                const recipeIndexes = {};
                const batches = {};
                const batchIndexes = {};
                const versions = [];
                // Read data
                for (const row of results.data) {
                    if (!(row['Tank'] in tanks)) {
                        tanks[row['Tank']] = {
                            name: row['Tank'],
                            status: 'available',
                            in_use: false,
                            update_user: 1
                        };
                        tankIndexes[row['Tank']] = Object.keys(tankIndexes).length + 1;
                    }
                    if (!(row['Recipe'] in recipes)) {
                        recipes[row['Recipe']] = {
                            name: row['Recipe'],
                            airplane_code: row['Recipe'],
                            yeast: 5,
                            instructions: JSON.stringify([{
                                    ingredient: 'hops',
                                    ratio: 3
                                }]),
                            update_user: 1
                        };
                        recipeIndexes[row['Recipe']] = Object.keys(recipeIndexes).length + 1;
                    }
                    if (!(row['Batch'] in batches)) {
                        batches[row['Batch']] = {
                            name: row['Batch'],
                            volume: row['Volume'],
                            bright: row['Bright'],
                            generation: row['Generation'],
                            started_on: moment_1.default(row['Date']),
                            completed_on: moment_1.default(row['Date']),
                            recipe_id: recipeIndexes[row['Recipe']],
                            tank_id: tankIndexes[row['Tank']],
                            update_user: 1
                        };
                        batchIndexes[row['Batch']] = Object.keys(batchIndexes).length + 1;
                    }
                    const date = moment_1.default(row['Date']);
                    if (batches[row['Batch']].started_on > date) {
                        batches[row['Batch']].started_on = date;
                    }
                    if (batches[row['Batch']].completed_on < date) {
                        batches[row['Batch']].completed_on = date;
                    }
                    versions.push({
                        SG: row['SG'],
                        PH: row['pH'],
                        ABV: row['ABV'],
                        temperature: row['Temperature'],
                        pressure: row['Pressure'],
                        measured_on: date,
                        batch_id: batchIndexes[row['Batch']],
                        update_user: 1
                    });
                }
                // Insert data
                const tankController = new controller_2.TankController('tanks');
                for (const tank of Object.values(tanks)) {
                    const { rows } = await tankController.readById(tankIndexes[tank.name]);
                    if (rows.length === 0) {
                        const { keys, values, escapes } = tankController.splitObjectKeyVals(tank);
                        await tankController.create(keys, escapes, values);
                        console.log(` + Added tank '${tank.name}'.`);
                    }
                    else {
                        console.log(` ✔️ Tank '${tank.name}' exists.`);
                    }
                }
                const recipeController = new controller_4.RecipeController('recipes');
                for (const recipe of Object.values(recipes)) {
                    const { rows } = await recipeController.readById(recipeIndexes[recipe.name]);
                    if (rows.length === 0) {
                        const { keys, values, escapes } = recipeController.splitObjectKeyVals(recipe);
                        await recipeController.create(keys, escapes, values);
                        console.log(` + Added recipe '${recipe.name}'.`);
                    }
                    else {
                        console.log(` ✔️ Recipe '${recipe.name}' exists.`);
                    }
                }
                let exists = false;
                const batchesController = new controller_3.BatchesController('batches');
                const tasksController = new controller_6.TaskController('tasks');
                for (const batch of Object.values(batches)) {
                    const batchResult = await batchesController.readById(batchIndexes[batch.name]);
                    if (batchResult.rows.length === 0) {
                        const { keys, values, escapes } = batchesController.splitObjectKeyVals(batch);
                        await batchesController.create(keys, escapes, values);
                        console.log(` + Added batch '${batch.name}'.`);
                        const actionId = batch.tank_id % 10;
                        if (actionId !== 0) {
                            const task = {
                                assigned: true,
                                batch_id: batchIndexes[batch.name],
                                action_id: actionId,
                                employee_id: 1,
                                added_on: batch.started_on,
                                update_user: 1
                            };
                            const { keys, escapes, values } = tasksController.splitObjectKeyVals(task);
                            await tasksController.createInTable(keys, 'tasks', escapes, values);
                            console.log(` + Added task  '${batch.name}'.`);
                        }
                    }
                    else {
                        exists = true;
                        console.log(` ✔️ Batch '${batch.name}' exists.`);
                    }
                }
                if (!exists) {
                    for (const version of versions) {
                        const { keys, escapes, values } = batchesController.splitObjectKeyVals(version);
                        await batchesController.createInTable(keys, 'versions', escapes, values);
                        console.log(` + Added version for batch ${version.batch_id}.`);
                    }
                    for (const tankId of Object.values(tankIndexes)) {
                        if (tankId % 10 !== 0) {
                            const { rows } = await batchesController.read('*', 'tank_id = $1', [tankId]);
                            if (rows.length > 0) {
                                // Update batch
                                {
                                    // Find most recent batch for tank
                                    const batch = rows.sort((a, b) => {
                                        return moment_1.default.utc(b.started_on).diff(moment_1.default.utc(a.started_on));
                                    })[0];
                                    batch.completed_on = undefined;
                                    batch.started_on = moment_1.default(batch.started_on);
                                    const { keys, values, escapes } = batchesController.splitObjectKeyVals(batch);
                                    keys.push('completed_on');
                                    // tslint:disable: no-null-keyword
                                    values.push(null);
                                    // set an update
                                    const { query, idx } = await batchesController.buildUpdateString(keys);
                                    values.push(batch.id);
                                    // update the batch
                                    await batchesController.update(query, `id = \$${idx}`, values);
                                }
                                // Update tank
                                {
                                    const result = await tankController.readById(tankId);
                                    const tank = result.rows[0];
                                    tank.in_use = true;
                                    tank.status = 'brewing';
                                    const { keys, values, escapes } = tankController.splitObjectKeyVals(tank);
                                    // set an update
                                    const { query, idx } = await tankController.buildUpdateString(keys);
                                    values.push(tankId);
                                    // update the tank
                                    await tankController.update(query, `id = \$${idx}`, values);
                                }
                            }
                        }
                    }
                }
            }
        });
    });
}
async function insertDevAdmin() {
    const employeeController = new controller_1.EmployeeController('employees');
    const user = {
        first_name: 'General',
        last_name: 'Kenobi',
        username: 'admin',
        phone: '555-867-5309',
        admin: true,
        password: encryptPassword('password')
    };
    try {
        // Check for existing user
        const prevUser = await employeeController.readByUsername(user.username);
        if (prevUser.rows.length === 0) {
            // No existing user, add admin
            const { keys, values, escapes } = employeeController.splitObjectKeyVals(user);
            await employeeController.create(keys, escapes, values);
            console.log(' + Added test admin user.');
        }
        else {
            // Existing user
            console.log(' ✔️ Test admin exists.');
        }
    }
    catch (e) {
        console.log(' x Error inserting test admin user.', e);
    }
}
async function insertDevTanks() {
    const tankController = new controller_2.TankController('tanks');
    for (let i = 1; i < 13; i++) {
        const { rows } = await tankController.readById(i);
        const tank = {
            name: `F${i}`,
            status: 'brewing',
            in_use: true,
            update_user: 1
        };
        if (i > 9) {
            tank.status = 'available';
            tank.in_use = false;
        }
        if (rows.length === 0) {
            const { keys, values, escapes } = tankController.splitObjectKeyVals(tank);
            await tankController.create(keys, escapes, values);
            console.log(` + Added tank '${tank.name}'.`);
        }
        else {
            console.log(` ✔️ Tank '${tank.name}' exists.`);
        }
    }
}
async function insertDevRecipes() {
    const recipeController = new controller_4.RecipeController('recipes');
    for (let i = 1; i < 13; i++) {
        const { rows } = await recipeController.readById(i);
        const recipe = {
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
        }
        else {
            console.log(` ✔️ Recipe '${recipe.name}' exists.`);
        }
    }
}
async function insertDevBatches() {
    const batchesController = new controller_3.BatchesController('batches');
    const versionsController = new controller_5.VersionController('versions');
    let idx = 0;
    let iterations = 1;
    for (let i = 1; i < 10; i++) {
        const batchResult = await batchesController.readById(i);
        const batch = {
            name: `Batch ${i}`,
            // tslint:disable: insecure-random
            volume: Math.random() * Math.floor(5),
            bright: Math.random() * Math.floor(5),
            generation: Math.floor(Math.random() * Math.floor(20)),
            started_on: new Date().toUTCString(),
            recipe_id: i,
            tank_id: i,
            update_user: 1
        };
        if (batchResult.rows.length === 0) {
            const { keys, values, escapes } = batchesController.splitObjectKeyVals(batch);
            await batchesController.create(keys, escapes, values);
            console.log(` + Added batch '${batch.name}'.`);
        }
        else {
            console.log(` ✔️ Batch '${batch.name}' exists.`);
        }
        const dateArray = getDateArray();
        let dateIter = 0;
        for (let j = idx; j < (iterations * 15); j++, idx++) {
            const versionResult = await versionsController.readById(j);
            const version = {
                SG: Math.random() * Math.floor(2),
                PH: Math.random() * Math.floor(6),
                ABV: 8.0,
                temperature: Math.random() * Math.floor(60),
                pressure: Math.random() * Math.floor(12),
                measured_on: dateArray[dateIter].toUTCString(),
                batch_id: i,
                update_user: 1
            };
            dateIter++;
            if (versionResult.rows.length === 0) {
                const { keys, escapes, values } = batchesController.splitObjectKeyVals(version);
                await batchesController.createInTable(keys, 'versions', escapes, values);
                console.log(` + Added version ${j}.`);
            }
            else {
                console.log(` ✔️ Version ${j} exists.`);
            }
        }
        iterations++;
    }
}
async function insertDevTasks() {
    const tasksController = new controller_6.TaskController('tasks');
    for (let i = 1; i < 10; i++) {
        const tasksResult = await tasksController.readById(i);
        const task = {
            assigned: true,
            batch_id: i,
            action_id: (i % 9) + 1,
            employee_id: 1,
            added_on: new Date().toUTCString(),
            update_user: 1
        };
        if (tasksResult.rows.length === 0) {
            const { keys, escapes, values } = tasksController.splitObjectKeyVals(task);
            await tasksController.createInTable(keys, 'tasks', escapes, values);
            console.log(` + Added task ${i}.`);
        }
        else {
            console.log(` ✔️ Task ${i} exists.`);
        }
    }
}
async function insertDevelopmentData(useTestData) {
    try {
        await insertDevAdmin();
        if (useTestData) {
            await insertCSVTestData();
        }
        else {
            await insertDevTanks();
            await insertDevRecipes();
            await insertDevBatches();
            await insertDevTasks();
        }
    }
    catch (err) {
        console.error(err);
    }
}
exports.insertDevelopmentData = insertDevelopmentData;
//# sourceMappingURL=initial_data.js.map