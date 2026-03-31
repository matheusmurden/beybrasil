export interface User {
  id: number;
  name: string;
  genderPronoun?: string;
  images: {
    id: number;
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
  entrant: Entrant;
}

export enum ActivityStateEnum {
  CREATED = "CREATED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export interface SetGame {
  id: number;
  entrant1Score?: number | null;
  entrant2Score?: number | null;
  winnerId?: number;
}

export interface EventSetPlayerSlot {
  id: number;
  entrant: Entrant;
}

export interface EventSet {
  id: number;
  identifier: string;
  winnerId?: number;
  state: SetStateEnum;
  fullRoundText: string;
  displayScore: string;
  games: SetGame[];
  slots: EventSetPlayerSlot[];
}

export interface EventPhase {
  id: number;
  name: string;
  phaseOrder: number;
  sets: {
    pageInfo: PageInfo;
    nodes: EventSet[];
  };
}

export interface LeagueObj {
  name: string;
  city?: string | null;
  endAt: number;
  entrantCount: number;
  events: {
    pageInfo: PageInfo;
    nodes: EventObj[];
  };
  standings: {
    pageInfo: PageInfo;
    nodes: Standing[];
  };
}

export interface EventObj {
  id: number;
  name: string;
  slug: string;
  numEntrants?: number;
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
    pageInfo: PageInfo;
    nodes: Entrant[];
  };
  standings: {
    pageInfo: PageInfo;
    nodes: Standing[];
  };
  userEntrant?: {
    standing?: {
      placement?: number | null;
    };
  };
  tournament: TournamentObj;
  phases: EventPhase[];
}

export enum TournamentStateEnum {
  CREATED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
}

export enum SetStateEnum {
  CREATED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
}

export interface PageInfo {
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
  sortBy: string;
}

export interface Participant {
  id: number;
  gamerTag: string;
  user: Pick<User, "id">;
  entrants?: Entrant[];
}

export interface Entrant {
  id: number;
  name: string;
  participants: Participant[];
  standing?: Standing;
  team?: Team;
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
  admins?: {
    player?: {
      gamerTag?: string;
      user?: User;
    };
  }[];
  images?: {
    id: number;
    type: "banner" | "profile";
    url: string;
  }[];
  participants: {
    pageInfo: PageInfo;
    nodes: Participant[];
  };
  allParticipants: {
    pageInfo: PageInfo;
    nodes: Participant[];
  };
}

export interface Team {
  id: number;
  name: string;
  images?: {
    id: number;
    url: string;
    type: string;
  }[];
  members?: TeamMember[];
}

export interface TeamMember {
  player: {
    user: User;
  };
}

export interface LeagueLoaderReturnType {
  league: LeagueObj;
  allRankedLeagueEvents: number[];
  upcomingTournaments: TournamentObj[];
  pastTournaments: TournamentObj[];
  currentTournaments: TournamentObj[];
  ranking: Standing[];
  currentUser: User | null;
  tournamentCounts: Record<number, Set<number>>;
  tournamentparticipants: {
    tournamentId: number;
    userId: number;
  }[];
  userTournamentCounts: {
    tournamentsCount: number;
    userId: number;
  }[];
  numberOfRankedPodiumsByUser: (
    | {
        rankedEventId: number;
        eventId: number;
        isPodium: boolean;
        userId: number;
      }
    | undefined
  )[];
  numberOfRankedVictoriesByUser: (
    | {
        rankedEventId: number;
        eventId: number;
        isVictory: boolean;
        userId: number;
      }
    | undefined
  )[];
}
