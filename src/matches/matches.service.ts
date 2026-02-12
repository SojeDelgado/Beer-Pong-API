import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Match } from './schemas/matches.schema';
import { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { StatsService } from 'src/stats/stats.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DateEnum } from 'src/common/enums/date.enum';

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
    const createdMatch = new this.matchModel(createMatchDto)

    const homeData = {
      partidas_jugadas: 1,
      partidas_ganadas: createMatchDto.homeScore > createMatchDto.awayScore ? 1 : 0,
      partidas_perdidas: createMatchDto.homeScore > createMatchDto.awayScore ? 0 : 1,
      puntos_favor_totales: createMatchDto.homeScore,
      puntos_contra_totales: createMatchDto.awayScore,
      islas: createMatchDto.homeIsla ? 1 : 0,
      s2in1: createMatchDto.home2in1 ? 1 : 0,
      s3in1: createMatchDto.home3in1 ? 1 : 0,
    }

    const awayData = {
      partidas_jugadas: 1,
      partidas_ganadas: createMatchDto.awayScore > createMatchDto.homeScore ? 1 : 0,
      partidas_perdidas: createMatchDto.awayScore > createMatchDto.homeScore ? 0 : 1,
      puntos_favor_totales: createMatchDto.awayScore,
      puntos_contra_totales: createMatchDto.homeScore,
      islas: createMatchDto.awayIsla ? 1 : 0,
      s2in1: createMatchDto.away2in1 ? 1 : 0,
      s3in1: createMatchDto.away3in1 ? 1 : 0,
    }

    await Promise.all([
      this.statsService.createOrUpdate(createMatchDto.home, homeData),
      this.statsService.createOrUpdate(createMatchDto.away, awayData)
    ]);

    await createdMatch.save();

    const populateOptions = [
      {
        path: 'home away',
        select: 'nickname'
      }
    ]

    return createdMatch.populate(populateOptions)
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, dateFilter } = paginationDto;
    const totalPages = await this.matchModel.countDocuments().exec()
    const lastPage = Math.ceil(totalPages / limit!)
    let date;
    if(dateFilter === DateEnum.RECIENTES){
      date = -1;
    } else {
      date = 1;
    }

    return {
      data: await this.matchModel.find()
        .populate('home', 'nickname')
        .populate('away', 'nickname')
        .skip((page! - 1) * limit!)
        .limit(limit!)
        .sort({ date: date})
        .exec(),

      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage
      }
    }
  }


  findOne(id: number) {
    return `This action returns a #${id} match`;
  }

  update(id: number, updateMatchDto: UpdateMatchDto) {
    return `This action updates a #${id} match`;
  }

  remove(id: number) {
    return `This action removes a #${id} match`;
  }
}
