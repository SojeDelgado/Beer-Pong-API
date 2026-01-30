import { Player } from "src/players/schemas/player.schema";

export interface MatchUp {
  home: Player | null;
  away: Player | null;
  round: number;
  matchId: number;
  nextMatchId: number | null;
}

export interface TournamentsStrategy {
  generateMatchups(players: Player[]): MatchUp[];
}
