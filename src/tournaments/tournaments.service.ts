// Nest
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// Services
import { PlayersService } from 'src/players/players.service';
// Schemas
import { Tournament } from './schemas/tournaments.schema';
import { Match } from 'src/matches/schemas/matches.schema';
import { Model } from 'mongoose';
// Interfaces
import { MatchUp } from './strategies/tournaments-strategy.interface';
import { TournamentTypesEnum } from './enums/tournament-types.enum';
// Factory
import { TournamentsFactory } from './factory/tournaments.factory';
// Dtos
import { UpdateMatchesTournamentDto } from './dtos/update-matches-tournament-match.dto';
import { CreateTournamentDto } from './dtos/create-tournament.dto';
import { UpdateTournamentDto } from './dtos/update-tournament-dto';

@Injectable()
export class TournamentsService {

    constructor(
        @InjectModel(Tournament.name) private tournamentModel: Model<Tournament>,
        private readonly playersService: PlayersService,
        private readonly factory: TournamentsFactory
    ) { }

    async findMatchesById(tournamentId: string): Promise<Match[]> {
        try {
            const tournament = await this.tournamentModel.findById(tournamentId)
                .populate({
                    path: 'matches.home',
                    select: 'nickname'
                })
                .populate({
                    path: 'matches.away',
                    select: 'nickname'
                });

            if (!tournament) {
                throw new NotFoundException(`Torneo con id ${tournamentId} no encontrado`);
            }
            return tournament.matches;
        } catch (err) {
            if (err.name === 'CastError') {
                throw new BadRequestException(`ID "${tournamentId}" no es válido`);
            }
            throw err;
        }
    }

    async findByType(type: TournamentTypesEnum): Promise<Tournament[]> {
        if (!Object.values(TournamentTypesEnum).includes(type)) {
            throw new NotFoundException('No existe ese tipo de torneo')
        }
        return this.tournamentModel.find({ type }).exec();
    }

    async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
        try {
            const matches = await this.generateMatchups(
                createTournamentDto.playersIds,
                createTournamentDto.type
            );

            const tournament = new this.tournamentModel({
                name: createTournamentDto.name,
                place: createTournamentDto.place,
                type: createTournamentDto.type,
                matches: matches
            });

            return tournament.save();

        } catch (err) {
            throw new BadRequestException('Error al intentar crear un torneo', {
                description: `Error: ${err.message || err}`
            });
        }
    }

    async generateMatchups(playersIds: string[], type: string): Promise<MatchUp[]> {
        const players = await this.playersService.findManyByIds(playersIds);

        if (players.length != playersIds.length) {
            throw new NotFoundException('Uno o mas jugadores no ha sido encontrado')
        }

        const strategy = this.factory.getStrategy(type);
        return strategy.generateMatchups(players);
    }

    // Actualizar RoundRobin Match
    async updateRRMatchResult(updateTournamentMatchDto: UpdateMatchesTournamentDto) {
        const updateFields = {};
        const fields = ['homeScore', 'awayScore', 'homeIsla', 'awayIsla', 'home2in1', 'away2in1', 'home3in1', 'away3in1'];

        fields.forEach(field => {
            if (updateTournamentMatchDto[field] !== undefined) {
                updateFields[`matches.$[current].${field}`] = updateTournamentMatchDto[field];
            }
        });

        try {
            const updatedTournament = await this.tournamentModel.findOneAndUpdate(
                { _id: updateTournamentMatchDto.tournamentId },
                { $set: updateFields },
                {
                    arrayFilters: [{ "current.matchId": updateTournamentMatchDto.matchId }],
                    new: true
                }
            );

            if (!updatedTournament) {
                throw new NotFoundException('Torneo o partido no encontrado');
            }

            return { message: "Partido de Round Robin actualizado con éxito", data: updatedTournament };
        } catch (error) {
            console.error("Error:", error);
            throw new Error('Error interno al actualizar el partido');
        }
    }


    async updateSEMatchResult(updateTournamentMatchDto: UpdateMatchesTournamentDto) {
        const updateFields = {};
        const filters: any = [];

        const fields = ['homeScore', 'awayScore', 'homeIsla', 'awayIsla', 'home2in1', 'away2in1', 'home3in1', 'away3in1'];

        fields.forEach(field => {
            if (updateTournamentMatchDto[field] !== undefined) {
                updateFields[`matches.$[current].${field}`] = updateTournamentMatchDto[field];
            }
        });

        filters.push({ "current.matchId": updateTournamentMatchDto.matchId });

        const nextId = updateTournamentMatchDto.nextMatchId;

        if (nextId !== undefined && nextId !== null) {
            const winner = updateTournamentMatchDto.homeScore > updateTournamentMatchDto.awayScore
                ? updateTournamentMatchDto.home
                : updateTournamentMatchDto.away;

            const slot = updateTournamentMatchDto.matchId % 2 === 0 ? 'away' : 'home';

            updateFields[`matches.$[next].${slot}`] = winner;
            filters.push({ "next.matchId": nextId });

        } else if (updateTournamentMatchDto.home && updateTournamentMatchDto.away) {
            try {
                await this.tournamentModel.updateOne(
                    { _id: updateTournamentMatchDto.tournamentId },
                    { $set: { status: "Completado" } }  // Update operation
                )
            } catch (error) {
                console.log(error);
                throw new NotFoundException('Torneo no encontrado');
            }
        }

        try {
            const updatedTournament = await this.tournamentModel.findOneAndUpdate(
                { _id: updateTournamentMatchDto.tournamentId },
                { $set: updateFields },
                {
                    arrayFilters: filters,
                    new: true
                }
            );

            if (!updatedTournament) {
                throw new NotFoundException('Torneo no encontrado o los filtros de partidos no coinciden');
            }

            return { message: "Partido actualizado y ganador promovido si aplica" };
        } catch (error) {
            // Si el matchId: 0 no existe en el array, MongoDB fallará aquí
            console.error("Error en el update:", error.message);
            throw new BadRequestException('Error al actualizar: asegúrate de que el matchId de destino existe.');
        }
    }

    async getTournamentStatus(tournamentId: string) {
        try {
            const tournament = await this.tournamentModel.findById(tournamentId)

            if (!tournament) {
                throw new NotFoundException(`Torneo con id ${tournamentId} no encontrado`);
            }
            return {
                status: tournament.status
            };

        } catch (err) {
            if (err.name === 'CastError') {
                throw new BadRequestException(`ID "${tournamentId}" no es válido`);
            }
            throw err;
        }
    }

    async update(tournamentId: string, updateTournamentDto: UpdateTournamentDto) {
        try {
            return this.tournamentModel.findByIdAndUpdate(
                tournamentId,
                updateTournamentDto,
                {
                    new: true
                }
            )
        } catch (err) {
            if (err.name === 'CastError') {
                throw new BadRequestException(`ID "${tournamentId}" no es válido`);
            }
            throw err;
        }
    }

}
