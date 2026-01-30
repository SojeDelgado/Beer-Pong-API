import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Stat, StatSchema } from './schemas/stat.schema';
import { StatsController } from './stats.controller';
import { PlayersModule } from 'src/players/players.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Stat.name, schema: StatSchema }]), PlayersModule ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService]
})
export class StatsModule {}
