import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ScannerService } from "@quickts/nestjs-scanner";
import { MSSQL_POOL_OPTIONS, MSSQL_POOL_METADATA } from "./mssql.constants";
import {ConnectionPool, config, Promise, IProcedureResult} from "mssql";
import sql = require('mssql');
import {MssqlRequestInput, MssqlRequestOutput} from "./mssql.interface";

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

    getPool() : ConnectionPool {
        return this.pool;
    }

    async execSP(spName: string, inputs?: MssqlRequestInput[], outputs?: MssqlRequestOutput[]): Promise<IProcedureResult<any>> {
        this.logger.debug(' execSP: DTO: ' + JSON.stringify({ spName, inputs: inputs, outputs: outputs }))
        const request = new sql.Request(this.pool);

        if (inputs && inputs.length > 0) {
            inputs.forEach((input) => {
                if (input.type) {
                    request.input(input.name, input.type, input.value);
                } else {
                    request.input(input.name, input.value);
                }
            })
        }

        if (outputs && outputs.length > 0) {
            outputs.forEach((output) => {
                if (output.value) {
                    request.output(output.name, output.type, output.value);
                } else {
                    request.output(output.name, output.type);
                }
            })
        }

        const result = await request.execute(spName);
        this.logger.debug(' execSP: RESULT: ' + JSON.stringify({ spName: spName, result: result }));
        // this.logger.log(result.recordsets[0].length); // count of rows contained in first recordset
        // this.logger.log(result.recordset); // first recordset from result.recordsets
        // this.logger.log(result.returnValue);
        // this.logger.log(result.output); // key/value collection of output values
        // this.logger.log(result.rowsAffected); // array of numbers, each number represents the number of rows affected by executed statemens
        return result;
    }
}
