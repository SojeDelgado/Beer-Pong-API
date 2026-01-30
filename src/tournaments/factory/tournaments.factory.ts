import { Injectable } from "@nestjs/common";
import { RoundRobinStrategy } from "../strategies/round-robin.strategy";
import { TournamentsStrategy } from "../strategies/tournaments-strategy.interface";
import { SingleEliminationStrategy } from "../strategies/single-elimination.strategy";

@Injectable()
export class TournamentsFactory {
    constructor(
        private readonly rr: RoundRobinStrategy,
        private readonly se: SingleEliminationStrategy
    ) {}

    getStrategy(type: string): TournamentsStrategy {
        switch (type) {
            case 'RoundRobin':
                return this.rr;
            case 'SingleElimination':
                return this.se;
            default:
                throw new Error(`Tipo de torneo no encontrado: ${type}`);
        }
    }
}