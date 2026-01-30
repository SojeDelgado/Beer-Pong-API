import { Injectable } from '@nestjs/common';
import { Stat } from './schemas/stat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateStatDto } from './dto/update-stat.dto';
import { PlayersService } from 'src/players/players.service';


@Injectable()
export class StatsService {
    constructor(
        @InjectModel(Stat.name) private statModel: Model<Stat>,
        private readonly playerService: PlayersService
    ) { }

    async createOrUpdate(player: string, updateStatDto: UpdateStatDto): Promise<Stat> {

        await this.playerService.findById(player);

        return this.statModel.findOneAndUpdate(
            { player },
            { $inc: updateStatDto },
            { new: true, upsert: true }
        )
    }

    async findAll(): Promise<Stat[]> {
        return this.statModel.find()
        .populate('player', 'nickname')
        .exec();
    }

}
