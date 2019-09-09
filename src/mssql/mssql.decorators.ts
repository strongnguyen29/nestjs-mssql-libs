import { MSSQL_POOL_METADATA } from "./mssql.constants";

export function MssqlPool() {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.set(target, propertyKey, null);
        Reflect.defineMetadata(MSSQL_POOL_METADATA, true, target, propertyKey);
    };
}
