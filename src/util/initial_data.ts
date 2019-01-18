import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import { EmployeeController } from '../components/employees/controller';
import { Employee } from '../components/employees/types';

// tslint:disable: no-console
function encryptPassword(password: string, username: string) {
  const saltRounds = 8;
  // const hash = CryptoJS.AES.encrypt(password, username).toString();

  return bcrypt.hashSync(password, saltRounds);
}

async function insertDevAdmin() {
  const employeeController = new EmployeeController('employees');
  await employeeController.connect();

  const user: Employee = {
    first_name: 'General',
    last_name: 'Kenobi',
    username: 'admin',
    phone: '5555555555',
    admin: true,
    password: 'password'
  };
  user.password = encryptPassword('password', user.username);

  try {
    // Check for existing user
    const prevUser = await employeeController.readByUsername(user.username);

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
}

export async function insertDevelopmentData() {
  console.log('Inserting development data...');

  await insertDevAdmin();
}
