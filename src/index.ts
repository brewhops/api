import dotenv from 'dotenv';
import e, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { routes as EmployeesRoutes } from './components/employees/routes';
import { routes as TanksRoutes } from './components/tanks/routes';
import { routes as ActionsRoutes } from './components/actions/routes';
import { routes as RecipesRoutes } from './components/recipes/routes';
import { routes as BatchesRoutes } from './components/batches/routes';
import { insertDevelopmentData } from './util/initial_data';

// tslint:disable:no-any no-unsafe-any
dotenv.config();

// tslint:disable-next-line:no-var-requires no-require-imports
const cors = require('cors');

const app = e();

app.use(bodyParser.json());
app.use(cors());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // tslint:disable-next-line:no-console
  console.log(err);
  res.status(400).json(err);
}); // error handler for validator

app.use('/employees', EmployeesRoutes);
app.use('/tanks', TanksRoutes);
app.use('/actions', ActionsRoutes);
app.use('/recipes', RecipesRoutes);
app.use('/batches', BatchesRoutes);

if (process.env.NODE_ENV === 'development') {
	insertDevelopmentData();
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT, () => {
    // tslint:disable-next-line:no-console
    console.log(`Server running at port ${process.env.PORT}`);
  });
}
