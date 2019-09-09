import { Provider } from "@nestjs/common";
import { config } from "mssql";
import { MSSQL_POOL_OPTIONS } from "./mssql.constants";

export function createOptionProvider(options: config): Provider<config> {
    return {
        provide: MSSQL_POOL_OPTIONS,
        useValue: options
    };
}
