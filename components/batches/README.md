# Guide for the Batches API

## POST
`/batches/`

The one stop shop for creating and updating a batch. 
This where a lot of the work of the app happens, so this one requires a bit of documentation.

An example of something you would send in would look something like this:

```javascript
{
	"name": "6589-6593",
	"volume": 130,
	"bright": 90,
	"generation": 1,
	"recipe_id": 1,
	"tank_id": 1,
	"SG": 1.10025,
	"PH": 3.45,
	"ABV": 6.54,
	"temperature": 50,
	"pressure": 90,
	"action": {
		"id": 1,
		"completed": false,
		"assigned": false,
		"employee": {
			"id": 1
		}
	}
}
```

Which is composed of three different parts, each submitting or affecting a different table

The batches info

```javascript
"name": "6589-6593",
"volume": 130,
"bright": 90,
"generation": 1,
"recipe_id": 1,
"tank_id": 1
```
The versions info

```javascript
"SG": 1.10025,
"PH": 3.45,
"ABV": 6.54,
"temperature": 50,
"pressure": 90
```

The actions info

```javascript
"action": {
	"id": 1,
	"completed": false,
	"assigned": false,
	"employee": {
		"id": 1
	}
}
```

### Batches

* If you enter a batch that does not exist, it will make one for you
* If that batch does exist, it will patch the info in that batch

### Versions

The versions will always create a new entry.

### Actions

The actions info is where it gets more interesting and is likely to cause errors for people that do not know how to use it.

**Note**: In order to submit all this information, the associated info such as *employee_id*, *tank_id*, *action_id* and *recipe_id* must exist first.

The tasks table is what binds an action to a batch. This is what the tasks table looks like:

```SQL
id SERIAL NOT NULL PRIMARY KEY,
added_on TIMESTAMPTZ NOT NULL,
completed_on TIMESTAMPTZ DEFAULT NULL,
assigned BOOLEAN DEFAULT FALSE NOT NULL,
batch_id SERIAL REFERENCES batches(id) NOT NULL,
action_id SERIAL REFERENCES actions(id) NOT NULL,
employee_id SERIAL REFERENCES employees(id)
```
The behaviour of the post route will rely on this order of operations:

* If an action does not exist, it will be created and the **added_on** time will be set to the time of submission
* If an action does exist, it will be updated
	* If the **completed** tag is `false`, all information about the task will be updated with the newest info
	* If the **completed** tag is `true`, the **completed_on** time will be set to the time of submission
* You will get an error if you set **completed** to `true` before creating the action