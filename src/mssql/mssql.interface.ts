import {config, ConnectionPool} from "mssql";
import {ModuleMetadata, Type} from "@nestjs/common";

export interface OnMssqlPoolInit {
    onMssqlPoolInit(pool: ConnectionPool): any;
}

export interface MssqlOptionFactory {
    createMssqlConnectOptions(): | Promise<config> | config;
}

export interface MssqlModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<MssqlOptionFactory>;
    useClass?: Type<MssqlOptionFactory>;
    useFactory?: (...args: any[]) => Promise<config> | config;
    inject?: any[];
}
