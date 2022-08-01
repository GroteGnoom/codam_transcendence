import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from "src/typeorm";
import {DatabaseFile} from '../typeorm/databaseFile.entity';

import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {DatabaseFilesService} from './databaseFiles.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([ User ]),
    TypeOrmModule.forFeature([ DatabaseFile ])
  ],
  controllers : [ UsersController ],
  providers : [ UsersService, DatabaseFilesService ],
  exports : [ UsersService, DatabaseFilesService ]
})
export class UsersModule {
}
