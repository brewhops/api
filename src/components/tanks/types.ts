export interface Tank {
    id?: number;
    name: string;
    status: string;
    in_use: boolean;
    disabled?: boolean;
    update_user?: number;
}
