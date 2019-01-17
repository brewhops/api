require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 8;
const CryptoJS = require("crypto-js");
const employees = require("../src/components/employees/logic");

function encryptPassword(password, username) {
	let hash = CryptoJS.AES.encrypt(password, username).toString();
	return bcrypt.hashSync(hash, saltRounds);
}

async function insertData() {
	
	let Employees = new employees('employees');
	Employees.connectToDB()
		.then(() => console.log('Employees route connected to database'))
		.catch(e => console.log('Error! Connection refused', e));

	let user = {
		first_name: "General",
		last_name: "Kenobi",
		username: "admin",
		phone: "5555555555",
		admin: true
	};
	user.password = encryptPassword("password", user.username);
	
	try {
		const { keys, values, escapes } = Employees.splitObjectKeyVals(user);
		await Employees.create(keys, escapes, values);
		console.log('Success!');
	} catch(e) {
		console.log('Error!', e)
	}
	
}

insertData().then(() => process.exit());
