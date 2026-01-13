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

export interface Standing {
  id: number;
  player: {
    id: number;
    gamerTag: string;
    prefix: string;
    user: User;
  };
  placement: number;
  totalPoints: number;
  setRecordWithoutByes?: {
    wins?: number;
    losses?: number;
    winPercentage?: string;
  };
  metadata: {
    points: number;
    extraPossiblePoints: number;
    pointContributions: Record<
      string,
      {
        doesContribute: boolean;
        isVerified: boolean;
      }
    >;
  };
  stats: {
    score?: {
      value?: number;
      label?: string;
      displayValue?: string;
    };
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
  standings: {
    nodes: Standing[];
  };
}

export interface EventObj {
  id: number;
  name: string;
  slug: string;
  numEntrants?: number | null;
  entryFee?: number;
  prizingInfo?: {
    enablePrizing: boolean;
    payoutType: string;
    payoutTotal: number | null;
    markdown: string;
    prizing: unknown[];
  };
  rulesMarkdown?: string;
  state: ActivityStateEnum;
  startAt: number;
  entrants?: {
    nodes: Entrant[];
  };
  standings: {
    nodes: Standing[];
  };
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

export interface Entrant {
  id: number;
  name: string;
  participants: Participant[];
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
