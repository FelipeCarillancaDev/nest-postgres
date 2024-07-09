import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import * as process from 'node:process';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.BD_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.POSTGRES_DB,
            username: process.env.DB_USERNAME,
            password: process.env.BD_PASSWORD,
            autoLoadEntities: true,
            synchronize: true,
        }),
        ProductsModule,
        CommonModule,
        SeedModule,
        FilesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
