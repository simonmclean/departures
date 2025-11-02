import { Departure } from "../types";
import { memoizedGetStationDisplayName } from "./stations";
import { parseDepartures } from "./parsers";
import { makeRequest } from "./request";

export async function getDepartures({
  apiKey,
  station,
  line,
}: {
  apiKey: string;
  station: string;
  line: string;
}): Promise<Departure[]> {
  const endpoint = `/StopPoint/${station}/ArrivalDepartures?lineIds=${line}&app_key=${apiKey}`;
  const departures = await makeRequest(endpoint, parseDepartures);
  // Enrich the departure response by getting the destination "commonName" from TFL, instead using the full name
  const departurePromises = departures.map<Promise<Departure>>(
    async ({
      destination,
      destinationId,
      scheduledDeparture,
      estimatedDeparture,
      status,
      delayInformation,
    }) => {
      const destinationDisplayName =
        (await memoizedGetStationDisplayName({
          apiKey,
          stopId: destinationId,
        })) || destination;

      return {
        destination: destinationDisplayName,
        scheduledDeparture,
        estimatedDeparture,
        status,
        delayInformation,
      };
    },
  );
  return Promise.all(departurePromises);
}
