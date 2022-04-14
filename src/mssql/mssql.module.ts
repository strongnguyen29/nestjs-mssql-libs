import { Module, DynamicModule, Provider} from "@nestjs/common";
import { config } from "mssql";
import { createOptionProvider } from "./mssql.provider";
import { MssqlService } from "./mssql.service";
import { ScannerModule } from "@quickts/nestjs-scanner";
import {MssqlModuleAsyncOptions, MssqlOptionFactory} from "./mssql.interface";
import {MSSQL_POOL_OPTIONS} from "./mssql.constants";

@Module({})
export class MssqlModule {

    static register(options: config): DynamicModule {
        const optionProvider = createOptionProvider(options);
        return {
            module: MssqlModule,
            imports: [ScannerModule.forRoot(false)],
            providers: [optionProvider, MssqlService],
            exports: [MssqlService]
        };
    }

    static registerAsync(options: MssqlModuleAsyncOptions): DynamicModule {
        const imports = [ScannerModule.forRoot(false)]
        if (options.imports) imports.push(...imports)
        return {
            module: MssqlModule,
            imports: imports,
            providers: [...this.createAsyncProviders(options), MssqlService],
            exports: [MssqlService]
        };
    }

    private static createAsyncProviders(
        options: MssqlModuleAsyncOptions
    ): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass
            }
        ];
    }

    private static createAsyncOptionsProvider(
        options: MssqlModuleAsyncOptions
    ): Provider {
        if (options.useFactory) {
            return {
                provide: MSSQL_POOL_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }
        return {
            provide: MSSQL_POOL_OPTIONS,
            useFactory: async (optionsFactory: MssqlOptionFactory) =>
                await optionsFactory.createMssqlConnectOptions(),
            inject: [options.useExisting || options.useClass]
        };
    }
}
