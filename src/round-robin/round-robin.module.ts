import { Module } from '@nestjs/common';
import { RoundRobinService } from './round-robin.service';
import { RoundRobinController } from './round-robin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoundRobin, RoundRobinSchema } from './schemas/round-robin.schema';
import { PlayersModule } from 'src/players/players.module';
import { MatchupsBuilder } from 'src/common/logic/genereate-single-elimination-matches';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoundRobin.name, schema: RoundRobinSchema }]),
    PlayersModule // Para validaciones de los jugadores 
  ],
  controllers: [RoundRobinController],
  providers: [RoundRobinService, MatchupsBuilder],
})
export class RoundRobinModule {}
