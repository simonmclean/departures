const BASE_URL = "https://api.tfl.gov.uk";

export async function makeRequest<T>(
  endpoint: string,
  handleResponse: (response: unknown) => T,
): Promise<T> {
  try {
    const response = await fetch(BASE_URL + endpoint);
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
    throw e instanceof Error
      ? e
      : new Error(`Error requesting ${endpoint} ${JSON.stringify(e)}`);
  }
}
