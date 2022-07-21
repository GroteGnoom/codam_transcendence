import {
    Controller,
    Get,
    Delete,
    Post,
    Put,
    Param,
    ValidationPipe,
    UsePipes
} from '@nestjs/common'
import AccountService from './account.service';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {} // construct helper functions

    @Get()
    getAccount() {
        return this.accountService.getAccount();
    }

    @Post(':name')
    @UsePipes(ValidationPipe) //exception when wrong input
    saveUsername(@Param('name') username: string){
        return this.accountService.saveUsername(username);
    }    
}