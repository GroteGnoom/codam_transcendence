import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from 'src/typeorm/match.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MatchService {
    constructor( 
        @InjectRepository(Match) private readonly matchRepository: Repository<Match>,

    ){}

    addMatch(player_1_id : number, player_2_id : number) {
        const match = this.matchRepository.create({player_1 : {id : player_1_id}, player_2 : {id : player_2_id}});
        return this.matchRepository.save(match);
    }

    async storeResult(matchID : number, scoreP1 : number, scoreP2 : number) {
        
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
}