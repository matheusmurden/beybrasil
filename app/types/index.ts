export interface User {
  id: number;
  name: string;
  genderPronoun?: string;
  images: {
    type: string;
    url: string;
  }[];
  player?: {
    prefix?: string;
    gamerTag: string;
  };
}

export enum ActivityState {
  CREATED = "CREATED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export interface LeagueObj {
  name: string;
  city?: string | null;
  endAt: number;
  entrantCount: number;
  events: {
    nodes: EventObj[];
  };
}

export interface EventObj {
  id: string;
  name: string;
  numEntrants?: number | null;
  state: ActivityState;
  startAt: number;
  userEntrant?: {
    standing?: {
      placement?: number | null;
    };
  };
  tournament: TournamentObj;
}

export interface TournamentObj {
  id: string;
  isRegistrationOpen: boolean;
  eventRegistrationClosesAt: number;
  events: EventObj[];
}
