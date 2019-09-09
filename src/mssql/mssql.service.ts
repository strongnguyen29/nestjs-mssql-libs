import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ScannerService } from "@quickts/nestjs-scanner";
import { MSSQL_POOL_OPTIONS, MSSQL_POOL_METADATA } from "./mssql.constants";
import { ConnectionPool, config } from "mssql";

@Injectable()
export class MssqlService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger("MssqlService");
    private pool: ConnectionPool = null;
    constructor(
        @Inject(MSSQL_POOL_OPTIONS) private readonly options: config, //
        private readonly scannerService: ScannerService
    ) {}

    async onModuleInit() {
        this.pool = new ConnectionPool(this.options);
        await this.pool.connect();
        this.pool.on("error", err => {
            this.logger.error(err);
        });
        await this.scannerService.scanProviderPropertyMetadates(MSSQL_POOL_METADATA, async (instance: any, propertyKey: string) => {
            instance[propertyKey] = this.pool;
        });

        await this.scannerService.scanProvider(async instance => {
            if (instance["onMssqlPoolInit"]) {
                await instance["onMssqlPoolInit"](this.pool);
            }
        });
    }

    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.close();

            this.pool = null;
        }
    }

    getPool() {
        return this.pool;
    }
}
