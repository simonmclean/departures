import { parsePlatformDepartures } from "./parsers";

const BASE_URL = "https://api.tfl.gov.uk";

async function makeRequest<T>(
  url: string,
  handleResponse: (response: unknown) => T,
): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status < 500) {
        const body = await response.json();
        throw new Error(`Response ${response.status}: ${JSON.stringify(body)}`);
      }
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return handleResponse(result);
  } catch (e) {
    // TODO: Handle error
    throw e;
  }
}

export async function getDepartures({
  apiKey,
  station,
  line,
}: {
  apiKey: string;
  station: string;
  line: string;
}) {
  const url = `${BASE_URL}/StopPoint/${station}/ArrivalDepartures?lineIds=${line}&app_key=${apiKey}`;
  return makeRequest(url, parsePlatformDepartures);
}
