import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(
      context: ExecutionContext,
      ): boolean|Promise<boolean>|Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log('userId in guard: ', request.session.userId);
    return (request.session.logged_in);
  }
}
