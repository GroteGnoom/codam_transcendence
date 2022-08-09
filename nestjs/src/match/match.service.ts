import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameStats } from 'src/typeorm/gameStats.entity';
import { Match } from 'src/typeorm/match.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MatchService {
    constructor( 
        @InjectRepository(Match) private readonly matchRepository: Repository<Match>,
        @InjectRepository(GameStats) private readonly gameStatsRepository: Repository<GameStats>
    ){}

    addMatch(player_1_id : number, player_2_id : number) {
        const match = this.matchRepository.create({player_1 : {id : player_1_id}, player_2 : {id : player_2_id}, scoreP1: 0, scoreP2: 0});
        return this.matchRepository.save(match);
    }

    async storeResult(matchID : number, scoreP1 : number, scoreP2 : number) {
        const match = await this.matchRepository.findOne({
            where: {id: matchID}
        });

        let player_1_stats = await this.gameStatsRepository.findOne({
            where: {user: {id: match.player_1.id }}
        })
        if (!player_1_stats) {
            player_1_stats = this.gameStatsRepository.create({user: {id: match.player_1.id}})
        }
        let player_2_stats = await this.gameStatsRepository.findOne({
            where: {user: {id: match.player_2.id }}
        })
        if (!player_2_stats) {
            player_2_stats = this.gameStatsRepository.create({user: {id: match.player_2.id }})
        }
        if (scoreP1 > scoreP2) {
            player_1_stats.wins++;
            player_2_stats.losses++;
        } else {
            player_1_stats.losses++;
            player_2_stats.wins++;
        }
        this.gameStatsRepository.save([player_1_stats, player_2_stats]);
        return this.matchRepository.save({id: matchID, scoreP1: scoreP1, scoreP2: scoreP2 });
    }

    getMatchHistory(player_id : number) {      //returns array of match entities
        return this.matchRepository.find({ 
            where : [
                { player_1 : {id : player_id} },    // OR
                { player_2 : {id : player_id} },    //https://orkhan.gitbook.io/typeorm/docs/find-options
            ]
        })   
    }  

    async getLeaderboard() {   
        const leaderboard = await this.gameStatsRepository.find({
            relations: ['user'],
        });
        return leaderboard.sort((statsA, statsB) => (statsB.wins - statsB.losses) - (statsA.wins - statsA.losses) || // if > 0, B comes before A
            statsB.wins - statsA.wins // in case of a tie (in win-loss), the one with the most wins comes first
        );   
    } 

    async getRanking(player_id : number) {   
        const leaderboard = await this.getLeaderboard() // array of gameStats entities
        const rank = leaderboard.findIndex((stats) => //returns index of first element where lambda is true
            stats.user && Number(stats.user.id) === player_id
        )
        return rank + 1
    }  
}