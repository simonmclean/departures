export type Departure = {
  destination: string;
  platform: string;
  scheduledDeparture?: Date;
  estimatedDeparture?: Date;
  status: string;
  delayInformation?: string;
};

export type Platform = string;

export type UpcomingDepartures =
  | { first?: Departure }
  | { first: Departure; second?: Departure };

export type PlatformDepartures = Record<Platform, UpcomingDepartures>;
