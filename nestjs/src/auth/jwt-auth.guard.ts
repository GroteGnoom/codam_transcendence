import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//this is not necessary, but it solves the weird situation that guards are linked by string instead of a class name
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
