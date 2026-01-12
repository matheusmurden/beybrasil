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

export enum ActivityStateEnum {
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
  id: number;
  name: string;
  slug: string;
  numEntrants?: number | null;
  state: ActivityStateEnum;
  startAt: number;
  userEntrant?: {
    standing?: {
      placement?: number | null;
    };
  };
  tournament: TournamentObj;
}

export enum TournamentStateEnum {
  CREATED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
}

export interface Participant {
  id: number;
  gamerTag: string;
  user: Pick<User, "id">;
}

export interface TournamentObj {
  id: number;
  name: string;
  slug: string;
  startAt: number;
  isRegistrationOpen: boolean;
  eventRegistrationClosesAt: number;
  events: EventObj[];
  state: TournamentStateEnum;
  unpaidParticipants: {
    pageInfo: {
      total: number;
    };
    nodes: Participant[];
  };
  paidParticipants: {
    pageInfo: {
      total: number;
    };
    nodes: Participant[];
  };
  allParticipants: {
    pageInfo: {
      total: number;
    };
    nodes: Participant[];
  };
}
