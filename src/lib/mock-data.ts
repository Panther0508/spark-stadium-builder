export type Team = { id: string; name: string; short: string; color: string };
export type MatchStatus = "live" | "scheduled" | "finished";
export type Match = {
  id: string;
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute?: number;
  date: string; // ISO
  venue: string;
};
export type MatchEvent = {
  id: string;
  matchId: string;
  minute: number;
  type: "goal" | "yellow" | "red" | "sub";
  player: string;
  detail?: string;
};
export type Player = {
  id: string;
  name: string;
  team: string;
  position: "GK" | "DF" | "MF" | "FW";
  number: number;
  goals: number;
  assists: number;
  appearances: number;
  yellow: number;
  red: number;
};
export type Announcement = { id: string; title: string; body: string; date: string };
export type Highlight = { id: string; title: string; thumb: string; type: "video" | "photo" };
export type StandingRow = {
  pos: number; team: Team; gp: number; w: number; d: number; l: number;
  gf: number; ga: number; pts: number;
};

export const teams: Team[] = [
  { id: "t1", name: "Crimson Lions", short: "CRL", color: "#E63946" },
  { id: "t2", name: "Azure Sharks", short: "AZS", color: "#4361EE" },
  { id: "t3", name: "Golden Eagles", short: "GLE", color: "#F4A261" },
  { id: "t4", name: "Emerald Wolves", short: "EMW", color: "#00A859" },
  { id: "t5", name: "Violet Vipers", short: "VVP", color: "#7B2CBF" },
  { id: "t6", name: "Silver Hawks", short: "SLH", color: "#8D99AE" },
];

export const matches: Match[] = [
  { id: "m1", home: teams[0], away: teams[1], homeScore: 2, awayScore: 1, status: "live", minute: 67, date: new Date().toISOString(), venue: "Halls Arena" },
  { id: "m2", home: teams[2], away: teams[3], homeScore: 0, awayScore: 0, status: "live", minute: 23, date: new Date().toISOString(), venue: "North Pitch" },
  { id: "m3", home: teams[4], away: teams[5], homeScore: 0, awayScore: 0, status: "scheduled", date: new Date(Date.now() + 86400000).toISOString(), venue: "Halls Arena" },
  { id: "m4", home: teams[0], away: teams[2], homeScore: 0, awayScore: 0, status: "scheduled", date: new Date(Date.now() + 172800000).toISOString(), venue: "East Field" },
  { id: "m5", home: teams[1], away: teams[3], homeScore: 3, awayScore: 2, status: "finished", date: new Date(Date.now() - 86400000).toISOString(), venue: "Halls Arena" },
  { id: "m6", home: teams[5], away: teams[4], homeScore: 1, awayScore: 1, status: "finished", date: new Date(Date.now() - 172800000).toISOString(), venue: "South Pitch" },
];

export const matchEvents: MatchEvent[] = [
  { id: "e1", matchId: "m1", minute: 12, type: "goal", player: "J. Carter", detail: "Assist: M. Rivera" },
  { id: "e2", matchId: "m1", minute: 34, type: "yellow", player: "T. Lee" },
  { id: "e3", matchId: "m1", minute: 41, type: "goal", player: "S. Okafor" },
  { id: "e4", matchId: "m1", minute: 58, type: "goal", player: "D. Park", detail: "Penalty" },
  { id: "e5", matchId: "m1", minute: 63, type: "sub", player: "R. Singh", detail: "for K. Yamamoto" },
];

export const players: Player[] = Array.from({ length: 24 }).map((_, i) => {
  const team = teams[i % teams.length];
  const positions: Player["position"][] = ["GK", "DF", "MF", "FW"];
  return {
    id: `p${i + 1}`,
    name: ["J. Carter","M. Rivera","T. Lee","S. Okafor","D. Park","R. Singh","K. Yamamoto","L. Dubois","A. Costa","N. Petrov","F. Müller","O. Hassan"][i % 12] + ` ${i + 1}`,
    team: team.name,
    position: positions[i % 4],
    number: (i % 30) + 1,
    goals: (i * 3) % 14,
    assists: (i * 2) % 9,
    appearances: 6 + (i % 5),
    yellow: i % 4,
    red: i % 9 === 0 ? 1 : 0,
  };
});

export const announcements: Announcement[] = [
  { id: "a1", title: "Final week kicks off Saturday", body: "All teams report to Halls Arena by 9 AM.", date: new Date().toISOString() },
  { id: "a2", title: "New broadcast partner", body: "Live streams now available on the highlights page.", date: new Date(Date.now() - 86400000).toISOString() },
  { id: "a3", title: "Player of the Week voting open", body: "Cast your vote in the app before Friday midnight.", date: new Date(Date.now() - 2 * 86400000).toISOString() },
];

export const highlights: Highlight[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `h${i + 1}`,
  title: `Highlight reel #${i + 1}`,
  thumb: `https://picsum.photos/seed/halls${i}/600/400`,
  type: i % 3 === 0 ? "video" : "photo",
}));

export const standings: StandingRow[] = teams.map((t, i) => ({
  pos: i + 1,
  team: t,
  gp: 8,
  w: 6 - i,
  d: 1 + (i % 2),
  l: i,
  gf: 18 - i * 2,
  ga: 4 + i * 2,
  pts: (6 - i) * 3 + (1 + (i % 2)),
})).sort((a, b) => b.pts - a.pts).map((r, i) => ({ ...r, pos: i + 1 }));

export const champions = {
  championTeam: teams[3],
  topScorer: { name: "J. Carter 1", team: teams[0].name, value: 12 },
  bestKeeper: { name: "K. Yamamoto 7", team: teams[1].name, value: "0.6 GA/g" },
  mostAssists: { name: "M. Rivera 2", team: teams[1].name, value: 9 },
  fairPlay: teams[5],
};
