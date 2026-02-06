import { Module } from '@nestjs/common';
import { RoundRobinService } from './round-robin.service';
import { RoundRobinController } from './round-robin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoundRobin, RoundRobinSchema } from './schemas/round-robin.schema';
import { PlayersModule } from 'src/players/players.module';
import { MatchupsBuilder } from 'src/common/logic/genereate-single-elimination-matches';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoundRobin.name, schema: RoundRobinSchema }]),
    PlayersModule, // Para validaciones de los jugadores 
    StatsModule
  ],
  controllers: [RoundRobinController],
  providers: [RoundRobinService, MatchupsBuilder],
})
export class RoundRobinModule {}
