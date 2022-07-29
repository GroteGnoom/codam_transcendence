import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from "src/typeorm";

import {UsersController} from './users.controller';
import {UsersService} from './users.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([ User ]),
  ],
  controllers : [ UsersController ],
  providers : [ UsersService ],
  exports : [ UsersService ]
})
export class UsersModule {
}
