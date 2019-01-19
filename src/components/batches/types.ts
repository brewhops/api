export type Version = {
  SG: number;
  PH: number;
  ABV: number;
  temperature: number;
  pressure: number;
};

export type Batch = {
  id?: number;
  name: string;
  volume: number;
  bright: number;
  generation: number;
  started_on: Date;
  completed_on: Date | undefined;
  recipe_id: number;
  tank_id: number;
};