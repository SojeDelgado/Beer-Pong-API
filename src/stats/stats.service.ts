import { Injectable, NotFoundException } from '@nestjs/common';
import { Stat } from './schemas/stat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateStatDto } from './dto/update-stat.dto';
import { PlayersService } from 'src/players/players.service';
import { UpdateManyStatsByMatchesDto } from './dto/upddate-many-stats-by-matches.dto';
import { filter } from 'rxjs';



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

    async createOrUpdateMany(dto: UpdateManyStatsByMatchesDto) {
        const bulkOps: any[] = []; //Array donde se guaradarn las consultas a la db
        const playersInTournament = new Set<string>();

        dto.matches.forEach((match) => {
            const homeWon = match.homeScore > match.awayScore;
            const awayWon = match.awayScore > match.homeScore;

            playersInTournament.add(match.home.toString());
            playersInTournament.add(match.away.toString());

            // Operacion para jugador Home:
            bulkOps.push({
                updateOne: {
                    filter: { player: match.home },
                    update: {
                        $inc: {
                            puntos_favor_totales: match.homeScore,
                            puntos_contra_totales: match.awayScore,
                            partidas_jugadas: 1,
                            partidas_ganadas: homeWon ? 1 : 0,
                            partidas_perdidas: awayWon ? 1 : 0,
                            islas: match.homeIsla ? 1 : 0,
                            s2in1: match.home2in1 ? 1 : 0,
                            s3in1: match.home3in1 ? 1 : 0,
                        }
                    },
                    upsert: true
                }
            })

            // Operacion para jugador Away:
            bulkOps.push({
                updateOne: {
                    filter: { player: match.away },
                    update: {
                        $inc: {
                            puntos_favor_totales: match.awayScore,
                            puntos_contra_totales: match.homeScore,
                            partidas_jugadas: 1,
                            partidas_ganadas: awayWon ? 1 : 0,
                            partidas_perdidas: homeWon ? 1 : 0,
                            islas: match.awayIsla ? 1 : 0,
                            s2in1: match.away2in1 ? 1 : 0,
                            s3in1: match.away3in1 ? 1 : 0,
                        }
                    },
                    upsert: true
                }
            });
        })

        if (dto.tournamentWinner) {
            playersInTournament.forEach(playerId => {
                const isWinner = playerId === dto.tournamentWinner!.toString();

                bulkOps.push({
                    updateOne: {
                        filter: { player: playerId },
                        update: {
                            $inc: {
                                torneos_jugados: 1,
                                torneos_ganados: isWinner ? 1 : 0,
                                torneos_perdidos: !isWinner ? 1 : 0,
                            }
                        },
                        upsert: true
                    }
                });
            });
        }

        const result = await this.statModel.bulkWrite(bulkOps);
        return {
            modified: result.modifiedCount,
            inserted: result.upsertedCount,
            total: dto.matches.length * 2
        };
    }

    async findAll(): Promise<Stat[]> {
        return this.statModel.find()
            .populate('player', 'nickname')
            .exec();
    }

}
