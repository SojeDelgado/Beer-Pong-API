import { PartialType } from '@nestjs/mapped-types';
import { CreateRoundRobinDto } from './create-round-robin.dto';

export class UpdateRoundRobinDto extends PartialType(CreateRoundRobinDto) {}
