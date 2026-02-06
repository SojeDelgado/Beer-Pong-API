import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SingleEliminationService } from './single-elimination.service';
import { SingleEliminationController } from './single-elimination.controller';
import { SingleElimination, SingleEliminationSchema } from './schemas/single-elimination.schema';
import { PlayersModule } from 'src/players/players.module';
import { MatchupsBuilder } from 'src/common/logic/genereate-single-elimination-matches';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SingleElimination.name, schema: SingleEliminationSchema }]),
    PlayersModule, // Para validaciones de los jugadores 
    StatsModule
  ],
  controllers: [SingleEliminationController],
  providers: [SingleEliminationService, MatchupsBuilder],
})
export class SingleEliminationModule {}
