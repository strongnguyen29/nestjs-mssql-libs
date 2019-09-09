import { ConnectionPool } from "mssql";

export interface OnMssqlPoolInit {
    onMssqlPoolInit(pool: ConnectionPool): any;
}
