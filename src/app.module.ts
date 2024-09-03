import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { envs } from './config';
import { MessageWsModule } from './message-ws/message-ws.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.host,
      port: envs.dbPort,
      database: envs.postgresDb,
      username: envs.postgresUser,
      password: envs.dbPassword, // Asegúrate de usar dbPassword aquí
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    MessageWsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
