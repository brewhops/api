export type Task = {
    id?: number;
    added_on?: string;
    completed_on?: string;
    assigned?: boolean;
    batch_id: number;
    action_id: number;
    employee_id?: number;
};