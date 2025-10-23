import {
  Departure,
  Platform,
  UpcomingDepartures,
  PlatformDepartures,
} from "../types";

function parseRecord(thing: unknown): Record<string, unknown> {
  if (thing && typeof thing === "object" && !Array.isArray(thing)) {
    return thing as Record<string, unknown>;
  }
  throw new Error(`expected value to be an object: ${JSON.stringify(thing)}`);
}

function parseArray(thing: unknown): unknown[] {
  if (!Array.isArray(thing)) {
    throw new Error(`Expected value to be an array: ${JSON.stringify(thing)}`);
  }
  return thing;
}

function parseString(prop: string, obj: Record<string, unknown>): string;
function parseString(
  prop: string,
  obj: Record<string, unknown>,
  optional: true,
): string | undefined;

function parseString(
  prop: string,
  obj: Record<string, unknown>,
  optional?: true,
): string | undefined {
  try {
    if (prop in obj) {
      const value = obj[prop];
      if (typeof value === "string") {
        return value;
      }
      throw new Error(
        `Expected object property "${prop}" to be a string: ${value}`,
      );
    }
    throw new Error(
      `Expected object to have property "${prop}": ${JSON.stringify(obj)}`,
    );
  } catch (e) {
    if (!optional) {
      throw e;
    }
  }
}

function parseDate(prop: string, obj: Record<string, unknown>): Date;
function parseDate(
  prop: string,
  obj: Record<string, unknown>,
  optional: true,
): Date | undefined;

function parseDate(
  prop: string,
  obj: Record<string, unknown>,
  optional?: true,
): Date | undefined {
  try {
    const stringValue = parseString(prop, obj);
    const date = new Date(stringValue);
    if (date.toString() === "Invalid Date") {
      throw new Error(`Failed to parse "${prop}" as Date: ${stringValue}`);
    }
    return date;
  } catch (e) {
    if (!optional) {
      throw e;
    }
  }
}

function parseDestination(obj: Record<string, unknown>): Platform {
  const stringValue = parseString("destinationName", obj);
  const [shortName] = stringValue.split(" ");
  return shortName || stringValue;
}

export function parsePlatformDepartures(response: unknown): PlatformDepartures {
  const departures = parseArray(response)
    .map<Departure>((element) => {
      const record = parseRecord(element);
      const destination = parseDestination(record);
      const scheduledDeparture = parseDate("scheduledTimeOfDeparture", record);
      const estimatedDeparture = parseDate(
        "estimatedTimeOfDeparture",
        record,
        true,
      );
      const platform = parseString("platformName", record);
      const status = parseString("departureStatus", record);
      const delayInformation = parseString("cause", record, true);
      return {
        platform,
        destination,
        scheduledDeparture,
        status,
        ...(estimatedDeparture ? { estimatedDeparture } : undefined),
        ...(delayInformation ? { delayInformation } : undefined),
      };
    })
    .filter(({ platform }) => platform.includes("1") || platform.includes("2"));

  const zipped = departures.map<[Platform, Departure]>((departure) => [
    departure.platform,
    departure,
  ]);

  const grouped = zipped.reduce<Record<Platform, Departure[]>>(
    (result, [platform, departure]) => {
      const existing = result[platform];

      if (!existing) {
        return {
          ...result,
          [platform]: [departure],
        };
      }

      return {
        ...result,
        [platform]: [...existing, departure],
      };
    },
    {},
  );

  const withNextTwoDepartures = Object.entries(grouped).map<
    [Platform, UpcomingDepartures]
  >(([platform, departures]) => {
    const sorted = departures.toSorted((a, b) => {
      return a.scheduledDeparture < b.scheduledDeparture ? -1 : 1;
    });

    const [first, second] = sorted;

    if (!first) {
      throw new Error("No first departure");
    }

    if (!second) {
      throw new Error("No second departure");
    }

    return [platform, { first, second }];
  });

  return Object.fromEntries(withNextTwoDepartures);
}
