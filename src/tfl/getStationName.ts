import { parseRecord, parseString } from "./parsers";
import { makeRequest } from "./request";

async function getStationDisplayName({
  apiKey,
  stopId,
}: {
  apiKey: string;
  stopId: string;
}): Promise<string | undefined> {
  const endpoint = `/StopPoint/${stopId}?includeCrowdingData=false&app_key=${apiKey}`;
  return makeRequest(endpoint, (response) => {
    const object = parseRecord(response);
    return parseString("commonName", object, true);
  });
}

/**
 * Map of stopID -> station display name
 * The station display name can be undefined, in which case we won't try again.
 * The cache holds promises rather than raw values to avoid multiple in-flight requests for the same stopID
 */
const stationDisplayNames: Map<string, Promise<string | undefined>> = new Map();

export async function memoizedGetStationDisplayName({
  apiKey,
  stopId,
}: {
  apiKey: string;
  stopId: string;
}): Promise<string | undefined> {
  if (stationDisplayNames.has(stopId)) {
    return stationDisplayNames.get(stopId);
  }

  // Don't await the promise in this function, otherwise you'll break memoisation
  const promise = getStationDisplayName({ apiKey, stopId }).then((value) => {
    return value
      ?.replace(" road", "rd")
      .replace(" Road", "Rd")
      .replace(" junction", " jn")
      .replace(" Junction", "Jn");
  });

  stationDisplayNames.set(stopId, promise);
}
