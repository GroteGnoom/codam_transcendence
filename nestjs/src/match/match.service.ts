import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { GameStats } from 'src/typeorm/gameStats.entity';
import { Match } from 'src/typeorm/match.entity';
import { User } from 'src/typeorm/user.entity';
import { StatusGateway } from 'src/users/status.gateway';
import { Repository } from 'typeorm';

@Injectable()
export class MatchService {
    constructor( 
        @InjectRepository(Match) private readonly matchRepository: Repository<Match>,
        @InjectRepository(GameStats) private readonly gameStatsRepository: Repository<GameStats>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly statusGateway: StatusGateway,
    ){}

    async addMatch(player_1_id : number, player_2_id : number) {
        const match = this.matchRepository.create({player_1 : {id : player_1_id}, player_2 : {id : player_2_id}, scoreP1: 0, scoreP2: 0});
        await this.setGameStatus(player_1_id, player_2_id, true, match.id)
        return this.matchRepository.save(match).catch( (e) => {
			throw new BadRequestException('could not add match');
		})
    }

    async storeResult(matchID : number, scoreP1 : number, scoreP2 : number, server: Server) {
        const match = await this.matchRepository.findOne({
            where: {id: matchID}
        }).catch( (e) => {
			throw new BadRequestException('could not retrieve match');
		});

        let player_1_stats = await this.gameStatsRepository.findOne({
            where: { user: { id: match.player_1.id }}
        }).catch( (e) => {
			throw new BadRequestException('could not retrieve player stats');
		});
        if (!player_1_stats)
            player_1_stats = this.gameStatsRepository.create({ user: {id: match.player_1.id }, wins:0, losses:0 })

        let player_2_stats = await this.gameStatsRepository.findOne({
            where: { user: { id: match.player_2.id }}
        }).catch( (e) => {
			throw new BadRequestException('could not retrieve player stats');
		});
        if (!player_2_stats)
            player_2_stats = this.gameStatsRepository.create({ user: {id: match.player_2.id }, wins:0, losses:0 })
        if (player_1_stats.wins + player_1_stats.losses === 0) {
            await server.emit("achievement", {
                "achievement": "First Game",
                "user": match.player_1.id
            });
        }
        if (player_2_stats.wins + player_2_stats.losses === 0) {
            await server.emit("achievement", {
                "achievement": "First Game",
                "user": match.player_2.id
            });
        }
        if (scoreP1 > scoreP2) {
            player_1_stats.wins++;
            player_2_stats.losses++;
            //if 3rd win P1
            if (player_1_stats.wins === 3) {
                await server.emit("achievement", {
                    "achievement": "3 wins!",
                    "user": match.player_1.id
                });
            }
        } else {
            player_1_stats.losses++;
            player_2_stats.wins++;
            //if 3rd win P2
            if (player_2_stats.wins === 3) {
                await server.emit("achievement", {
                    "achievement": "3 wins!",
                    "user": match.player_2.id
                });
            }
        }
        await this.gameStatsRepository.save([player_1_stats, player_2_stats]).catch( (e) => {
			throw new BadRequestException('could not save game stats');
		}) ;
        await this.setGameStatus(Number(match.player_1.id), Number(match.player_2.id), false, match.id)
        let numberOne = (await this.getLeaderboard())[0];   // for the leaderboard achievement
        numberOne.beenNumberOne = true;
        this.gameStatsRepository.save(numberOne).catch( (e) => {
			throw new BadRequestException('could not save leaderboard achievement');
		}) ;
        return this.matchRepository.save({id: matchID, scoreP1: scoreP1, scoreP2: scoreP2 }).catch( (e) => {
			throw new BadRequestException('could not save match');
		});
    }

    async getMatchHistory(player_id : number) {      //returns array of match entities
        return this.matchRepository.find({ 
            where : [
                { player_1 : {id : player_id} },    // OR
                { player_2 : {id : player_id} },    //https://orkhan.gitbook.io/typeorm/docs/find-options
            ]
        }).catch( (e) => {
			throw new BadRequestException('could not find match');
		});
    }  

    async getLeaderboard() {   
        const leaderboard = await this.gameStatsRepository.find({
            relations: ['user'],
        }).catch( (e) => {
			throw new BadRequestException('could not find leaderboard');
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

    private async setGameStatus (player_1_id : number, player_2_id : number, status: boolean, match_id: number) {
        let player_1 = await this.userRepository.findOneBy({id : player_1_id})
        let player_2 = await this.userRepository.findOneBy({id : player_2_id})
        player_1.inGame = status;
        player_2.inGame = status;
        this.userRepository.save(player_1).catch( (e) => {
			throw new BadRequestException('could not save player 1');
		});
        this.userRepository.save(player_2).catch( (e) => {
			throw new BadRequestException('could not save player 2');
		});

        this.statusGateway.inGameStatus(player_1_id, status) // currently in or out a game
        this.statusGateway.inGameStatus(player_2_id, status)  
    }
}
