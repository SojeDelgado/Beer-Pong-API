import { Player } from "src/players/schemas/player.schema";
import { MatchUp } from "../models/matchup.model";

export class MatchupsBuilder {

    // metodo para randomizar los players que vengan de round-robin.
    shuffle(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private getSeedOrder(numRounds: number): number[] {
        let seeds = [0, 1];
        for (let i = 1; i < numRounds; i++) {
            const nextSeeds: number[] = [];
            const playersInRound = Math.pow(2, i + 1);
            for (const seed of seeds) {
                nextSeeds.push(seed);
                nextSeeds.push(playersInRound - 1 - seed);
            }
            seeds = nextSeeds;
        }
        return seeds;
    }

    private promoteToNextRound(matchups: MatchUp[], nextMatchId: number | null, player: Player, currentMatchId: number) {
        if (nextMatchId === null) return;
        const nextMatch = matchups[nextMatchId];
        if (currentMatchId % 2 !== 0) {
            nextMatch.home = player;
        } else {
            nextMatch.away = player;
        }
    }


    generateSingleEliminationMatchups(players: Player[]): MatchUp[] {
        const n = players.length;
        const numRounds = Math.ceil(Math.log2(n));
        const bracketSize = Math.pow(2, numRounds);
        const totalMatches = bracketSize - 1;

        const seedOrder = this.getSeedOrder(numRounds);
        const matchups: MatchUp[] = [];

        for (let i = 1; i <= totalMatches; i++) {
            matchups.push({
                matchId: i - 1,
                nextMatchId: i === 1 ? null : Math.floor(i / 2) - 1,
                home: null,
                away: null,
                round: numRounds - Math.floor(Math.log2(i)) - 1
            });
        }

        const firstRoundStartIndex = Math.floor(totalMatches / 2);

        for (let i = 0; i < bracketSize / 2; i++) {
            const match = matchups[firstRoundStartIndex + i];

            const player1 = players[seedOrder[i * 2]] || null;
            const player2 = players[seedOrder[i * 2 + 1]] || null;

            if (player1 && player2) {
                match.home = player1;
                match.away = player2;
            } else if (player1 || player2) {
                const winner = player1 || player2;
                this.promoteToNextRound(matchups, match.nextMatchId!, winner, match.matchId!);

                match.home = player1;
                match.away = player2;
            }
        }
        return matchups;
    }

    generateRoundRobinMatchups(players: Player[]): MatchUp[] {
        const matchups: MatchUp[] = [];
        let tempPlayers: (Player | null)[] = this.shuffle([...players]);
        let matchId = 0;

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
                    });
                }
                matchId++;
            }
            tempPlayers.splice(1, 0, tempPlayers.pop()!);
        }
        return matchups;
    }

}