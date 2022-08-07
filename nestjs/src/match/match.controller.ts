import { Controller, Get, Param } from '@nestjs/common';
import { MatchService } from './match.service';


@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Get('history/:id')
    getMatchHistory(@Param('id') playerID: number) {
        return this.matchService.getMatchHistory(playerID);
    }
}