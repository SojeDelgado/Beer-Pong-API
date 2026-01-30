import { Injectable } from "@nestjs/common";
import { MatchUp, TournamentsStrategy } from "./tournaments-strategy.interface";
import { Player } from "src/players/schemas/player.schema";


@Injectable()
export class RoundRobinStrategy implements TournamentsStrategy {

    private shuffle(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    generateMatchups(players: Player[]): MatchUp[] {
        const matchups: MatchUp[] = [];
        let tempPlayers: (Player | null)[] = this.shuffle([...players]);
        let matchId = 0

        if (tempPlayers.length % 2 !== 0) {
            tempPlayers.push(null);
        }

        const numPlayers = tempPlayers.length;
        const numRounds = numPlayers - 1;
        const matchesPerRound = numPlayers / 2;

        for (let round = 0; round < numRounds; round++) {
            for (let i = 0; i < matchesPerRound; i++) {
                const home = tempPlayers[i];
                const away = tempPlayers[numPlayers - 1 - i];

                if (home !== null && away !== null) {
                    const isFlipped = Math.random() > 0.5;
                    matchups.push({
                        home: isFlipped ? away : home,
                        away: isFlipped ? home : away,
                        round: round + 1,
                        matchId: matchId,
                        nextMatchId: 0,
                    });
                }
                matchId ++;
            }
            tempPlayers.splice(1, 0, tempPlayers.pop()!);
        }
        return matchups;
    }
}