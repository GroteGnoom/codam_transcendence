import {
    Controller,
    Get,
    Param, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { SessionGuard } from '../auth/session.guard';
import { MatchService } from './match.service';

@UseGuards(SessionGuard)
@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @UseGuards(SessionGuard)
    @Get('history/:id')
    getMatchHistory(@Param('id', ParseIntPipe) playerID: number) {
        return this.matchService.getMatchHistory(playerID);
    }

    @UseGuards(SessionGuard)
    @Get('leaderboard')
    getLeaderboard() {
        return this.matchService.getLeaderboard();
    }

    @UseGuards(SessionGuard)
    @Get('ranking/:id')
    getRanking(@Param('id', ParseIntPipe) playerID: number) {
        return this.matchService.getRanking(Number(playerID));
    }
}
