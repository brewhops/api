export interface Employee {
  id?: number;
  first_name: string;
  last_name: string;
  username: string;
  password?: string;
  phone: string;
  admin: boolean;
  client_id: number;
}
