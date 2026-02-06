import { Player } from "src/players/schemas/player.schema";

export interface MatchUp {
  home: Player | null;
  away: Player | null;
  matchId?: number | null;
  nextMatchId?: number | null;
  round: number;
}