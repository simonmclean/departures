export type Departure = {
  destination: string;
  scheduledDeparture: Date | undefined;
  estimatedDeparture: Date | undefined;
  status: string;
  delayInformation: string | undefined;
};
