import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from "../typeorm";

@Injectable()
export class AccountService {
    constructor(
		@InjectRepository(Account) private readonly accountRepository: Repository<Account>
	) {}

    getAccount(){
        return this.accountRepository.find();
    };
}