import { Player } from "src/players/schemas/player.schema";

export interface MatchUp {
  home: Player | null;
  away: Player | null;
  round: number;
  matchId?: number | null;
  nextMatchId?: number | null;
}