import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './schemas/matches.schema';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PlayersModule } from 'src/players/players.module';
import { StatsModule } from 'src/stats/stats.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]), PlayersModule, StatsModule],
    providers: [MatchesService],
    controllers: [MatchesController],
})
export class MatchesModule {}
