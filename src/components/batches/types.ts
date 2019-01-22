export type Version = {
  SG: number;
  PH: number;
  ABV: number;
  temperature: number;
  pressure: number;
};

export type Task = {
  id: number;
  completed: boolean;
  assigned: boolean;
  employee: {
    id: number;
  };
};


export type Batch = {
  id?: number;
  name: string;
  volume: number;
  bright: number;
  generation: number;
  started_on: string;
  completed_on: string | undefined;
  recipe_id: number;
  tank_id: number;
  action: Task;
} & Version;