import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from "src/typeorm";
import {DatabaseFile} from '../typeorm/databaseFile.entity';

import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {DatabaseFilesService} from './databaseFiles.service';
import { StatusGateway } from './status.gateway';
import {uniqueUserConstraint} from './validators'

@Module({
  imports : [
    TypeOrmModule.forFeature([ User, DatabaseFile ])
  ],
  controllers : [ UsersController ],
  providers : [ uniqueUserConstraint, UsersService, DatabaseFilesService, StatusGateway ],
  exports : [ UsersService, DatabaseFilesService ]
})
export class UsersModule {
}
