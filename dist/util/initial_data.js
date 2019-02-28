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
    const tasksController = new controller_6.TaskController('tasks');
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
            tank_id: i
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
        iterations++;
    }
}
async function insertDevelopmentData() {
    try {
        await insertDevAdmin();
        await insertDevTanks();
        await insertDevRecipes();
        await insertDevBatches();
    }
    catch (err) {
        console.error(err);
    }
}
exports.insertDevelopmentData = insertDevelopmentData;
//# sourceMappingURL=initial_data.js.map