import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from './schemas/player.schema';
import { Model } from 'mongoose';
import { CreatePlayerDto } from './dtos/create-player.dto';

@Injectable()
export class PlayersService {
    constructor(
        @InjectModel(Player.name) private playerModel: Model<Player>,
    ) { }

    async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
        const createdPlayer = await new this.playerModel(createPlayerDto).save();
        return createdPlayer;
    }

    async findById(playerId: string): Promise<Player> {
        try {
            const player = await this.playerModel.findById(playerId);
            if (!player) {
                throw new NotFoundException(`Jugador con id ${playerId} no encontrado`);
            }
            return player;

        } catch (err) {
            if (err.name === 'CastError') {
                throw new BadRequestException(`ID "${playerId}" no es válido`);
            }
            throw err;
        }
    }

    async findManyByIds(ids: string[]): Promise<Player[]> {
        try {
            return await this.playerModel.find({ _id: { $in: ids } })
        } catch (error) {
            if (error.name === 'CastError') {
                throw new BadRequestException(`Id/s inválido`);
            }
            throw error;
        }
    }

    async findAll(): Promise<Player[]> {
        return this.playerModel.find().exec();
    }
}
