import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { Player, PlayerSchema } from './schemas/player.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayersService } from './players.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }])],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService]
})
export class PlayersModule { }
