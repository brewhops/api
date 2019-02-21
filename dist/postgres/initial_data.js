"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = require("bcrypt");
const crypto_js_1 = require("crypto-js");
const logic_1 = require("../components/employees/logic");
dotenv_1.default.config();
const saltRounds = 8;
// tslint:disable:indent no-console
function encryptPassword(password, username) {
    const hash = crypto_js_1.AES.encrypt(password, username).toString();
    return bcrypt_1.hashSync(hash, saltRounds);
}
async function insertData() {
    const Employees = new logic_1.UserLogic('employees');
    Employees.connect()
        .then(() => console.log('Employees route connected to database'))
        .catch(e => console.log('Error! Connection refused', e));
    const user = {
        first_name: 'General',
        last_name: 'Kenobi',
        username: 'admin',
        phone: '5555555555',
        admin: true,
        password: encryptPassword('password', 'admin')
    };
    try {
        const { keys, values, escapes } = Employees.splitObjectKeyVals(user);
        await Employees.create(keys, escapes, values);
        console.log('Success!');
    }
    catch (e) {
        console.log('Error!', e);
    }
}
exports.insertData = insertData;
insertData().then(() => process.exit());
//# sourceMappingURL=initial_data.js.map