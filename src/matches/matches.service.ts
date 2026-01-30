import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Match } from './schemas/matches.schema';
import { Model } from 'mongoose';
import { CreateMatchDto } from './dtos/create-match.dto';
import { PlayersService } from 'src/players/players.service';
import { StatsService } from 'src/stats/stats.service';

@Injectable()
export class MatchesService {

    constructor(
        @InjectModel(Match.name) private matchModel: Model<Match>,
        private readonly playerService: PlayersService,
        private readonly statsService: StatsService
    ) { }

    async create(createMatchDto: CreateMatchDto): Promise<Match> {
        await this.playerService.findById(createMatchDto.home);
        await this.playerService.findById(createMatchDto.away);
        const createdMatch = new this.matchModel(createMatchDto);

        const homeData = {
            partidas_jugadas: 1,
            partidas_ganadas: createMatchDto.homeScore > createMatchDto.awayScore ? 1 : 0,
            partidas_perdidas: createMatchDto.homeScore > createMatchDto.awayScore ? 0 : 1,
            puntos_favor_totales: createMatchDto.homeScore,
            puntos_contra_totales: createMatchDto.awayScore,
            islas: createMatchDto.homeIsla ? 1 : 0,
        }

        const awayData = {
            partidas_jugadas: 1,
            partidas_ganadas: createMatchDto.awayScore > createMatchDto.homeScore ? 1 : 0,
            partidas_perdidas: createMatchDto.awayScore > createMatchDto.homeScore ? 0 : 1,
            puntos_favor_totales: createMatchDto.awayScore,
            puntos_contra_totales: createMatchDto.homeScore,
            islas: createMatchDto.awayIsla ? 1 : 0,
        }

        await Promise.all([
            this.statsService.createOrUpdate(createMatchDto.home, homeData),
            this.statsService.createOrUpdate(createMatchDto.away, awayData)
        ]);

        return createdMatch.save();
    }

    findAll(): Promise<Match[]> {
        return this.matchModel.find()
            .populate('home', 'nickname')
            .populate('away', 'nickname')
            .exec();    
    }
}
