# nestjs-mssql
Mssql module for nestjs

## Installation

```shell
  npm install @strongnguyen/nestjs-mssql mssql
  npm install -D @types/mssql
```
## Quick start

Import and configure `MssqlModule` with the same configuration parameters accepted by `node-mssql`:

```ts
// app.module.ts

@Module({
    imports: [
        MssqlModule.register({
            server: "10.0.0.1",
            port: 0,
            user: "User",
            password: "Password",
            database: "DatabaseName",
            options: {
                encrypt: false, // for azure
                trustServerCertificate: true, // change to true for local dev / self-signed certs
            },
        }),
    ],
    providers: [MyService],
    exports: [MyService],
    controllers: [MyController],
})
export class MyModule {}
```

Or Async module

```ts
// app.module.ts

@Module({
  imports: [
    ConfigModule.forRoot(),
    MssqlModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        server: configService.get<string>('DB_HOST'),
        port: +configService.get<string>('DB_PORT'),
        user: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        options: {
          encrypt: false, // for azure
          trustServerCertificate: true, // change to true for local dev / self-signed certs
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```


Inject and the use `MssqlService` inside your services:

```ts
// app.service.ts

@Injectable()
export class AppService {
    constructor(private mssql: MssqlService) {}
    
    // Example service method with use of MssqlService:
    async callQuery(id: number) {
        const recordset = (
            await this.mssql.getPool().query(`SELECT PartnerId, Name FROM dbo.Partner WHERE PartnerId = '${id}' ORDER BY PartnerId;`)
        ).recordset;
        if (recordset.length) {
            return recordset[0];
        } else {
            throw new NotFoundException();
        }
    }
    
    // Excec SP
    async callSp(dto: RequestDto) {
        const result = await this.mssql.execSP(
            '[dbo].[SP_Test_2]',
            [{ name: '_Input1', type: sql.Int, value: 10 }],
            [{ name: '_Output1', type: sql.Int }]
        )
        console.log(result.recordsets.length); // count of recordsets returned by the procedure
        console.log(result.recordsets[0].length); // count of rows contained in first recordset
        console.log(result.recordset); // first recordset from result.recordsets
        console.log(result.returnValue);
        console.log(result.output); // key/value collection of output values
        console.log(result.rowsAffected); // array of numbers, each number represents the number of rows affected by executed statemens
        return result.recordsets[0]
    }
}
```
