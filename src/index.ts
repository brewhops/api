import dotenv from 'dotenv';
import e, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { routes as EmployeesRoutes } from './components/employees/routes';
import { routes as TanksRoutes } from './components/tanks/routes';
import { routes as ActionsRoutes } from './components/actions/routes';
import { routes as RecipesRoutes } from './components/recipes/routes';
import { routes as BatchesRoutes } from './components/batches/routes';
import { routes as TasksRoutes } from './components/tasks/routes';
import { insertDevelopmentData } from './util/initial_data';
import Boom from 'boom';

// tslint:disable:no-any no-unsafe-any
dotenv.config();

// tslint:disable-next-line:no-var-requires no-require-imports
const cors = require('cors');

const app = e();

app.use(bodyParser.json());
app.use(cors());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => res.status(400).send(Boom.badRequest(err.message)));

app.use('/employees', EmployeesRoutes());
app.use('/tanks', TanksRoutes());
app.use('/actions', ActionsRoutes());
app.use('/recipes', RecipesRoutes());
app.use('/batches', BatchesRoutes());
app.use('/tasks', TasksRoutes());

if (process.env.NODE_ENV === 'development') {
  app.post('/init', async (req: Request, res: Response) => {
    try {
      await insertDevelopmentData();
      res.status(200).send('success');
    } catch (error) {
      res.status(500).send(Boom.badImplementation('failed'));
    }
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT, () => {
    // tslint:disable-next-line:no-console
    console.log(`Server running at port ${process.env.PORT}`);
  });
}
