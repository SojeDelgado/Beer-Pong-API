import { Module } from '@nestjs/common';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { PlayersModule } from 'src/players/players.module';
import { TournamentsFactory } from './factory/tournaments.factory';
import { RoundRobinStrategy } from './strategies/round-robin.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { Tournament, TournamentSchema } from './schemas/tournaments.schema';
import { SingleEliminationStrategy } from './strategies/single-elimination.strategy';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tournament.name, schema: TournamentSchema }]),  PlayersModule],
  controllers: [TournamentsController],
  providers: [TournamentsService, TournamentsFactory, RoundRobinStrategy, SingleEliminationStrategy]
})
export class TournamentsModule {}
