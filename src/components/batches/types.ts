export type Version = {
  id?: number;
  sg: number;
  ph: number;
  abv: number;
  temperature: number;
  pressure: number;
  measured_on?: string;
  completed?: boolean;
  batch_id?: number;
  update_user?: number;
};

export type BatchAction = {
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
  completed_on?: string;
  recipe_id: number;
  tank_id: number;
  update_user?: number;
};