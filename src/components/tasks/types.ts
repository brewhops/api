export interface Task {
    id?: number;
    added_on?: string;
    completed_on?: string;
    assigned?: boolean;
    batch_id: number;
    action_id: number;
    exception_reason?: string;
    employee_id?: number;
    update_user?: number;
}
