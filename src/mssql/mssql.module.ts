import { Global, Module, DynamicModule } from "@nestjs/common";
import { config } from "mssql";
import { createOptionProvider } from "./mssql.provider";
import { MssqlService } from "./mssql.service";
import { ScannerModule } from "@quickts/nestjs-scanner";

@Module({})
export class MssqlModule {
    static forRoot(options: config): DynamicModule {
        const optionProvider = createOptionProvider(options);
        return {
            module: MssqlModule,
            imports: [ScannerModule.forRoot(false)],
            providers: [optionProvider, MssqlService],
            exports: [MssqlService]
        };
    }
}

@Global()
@Module({})
export class MssqlGlobalModule {
    static forRoot(options: config): DynamicModule {
        const optionProvider = createOptionProvider(options);
        return {
            module: MssqlGlobalModule,
            imports: [ScannerModule.forRoot(true)],
            providers: [optionProvider, MssqlService],
            exports: [MssqlService]
        };
    }
}
