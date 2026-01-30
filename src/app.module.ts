import { Module } from '@nestjs/common';

// Modules
import { PlayersModule } from './players/players.module';

// Mongo
import { MongooseModule } from '@nestjs/mongoose';
import { StatsModule } from './stats/stats.module';
import { MatchesModule } from './matches/matches.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { SingleEliminationModule } from './single-elimination/single-elimination.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/beerpong'),
    PlayersModule,
    StatsModule,
    MatchesModule,
    TournamentsModule,
    SingleEliminationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
