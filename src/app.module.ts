import { Module } from '@nestjs/common';

// Modules
import { PlayersModule } from './players/players.module';

// Mongo
import { MongooseModule } from '@nestjs/mongoose';
import { StatsModule } from './stats/stats.module';
import { SingleEliminationModule } from './single-elimination/single-elimination.module';
import { RoundRobinModule } from './round-robin/round-robin.module';
import { MatchesModule } from './matches/matches.module';
import { envs } from './config';

@Module({
  imports: [
    MongooseModule.forRoot(envs.mongoUrl),
    PlayersModule,
    StatsModule,
    MatchesModule,
    SingleEliminationModule,
    RoundRobinModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
