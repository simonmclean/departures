import { Departure } from "../types";

export function parseArray(thing: unknown): unknown[] {
  if (!Array.isArray(thing)) {
    throw new Error(`Expected value to be an array: ${JSON.stringify(thing)}`);
  }
  return thing;
}

export function parseObject(thing: unknown) {
  if (!thing || typeof thing !== "object" || Array.isArray(thing)) {
    throw new Error(`expected value to be an object: ${JSON.stringify(thing)}`);
  }

  const obj = thing as Record<string, unknown>;

  return {
    prop<T>(key: string, parser: (value: unknown) => T) {
      return parser(obj[key]);
    },
    optionalProp<T>(key: string, parser: (value: unknown) => T): T | undefined {
      try {
        return parser(obj[key]);
      } catch {}
    },
  };
}

export function parseString(thing: unknown): string {
  if (thing && typeof thing === "string") {
    return thing;
  }
  throw new Error(
    `Expect value to be of type "string", got ${typeof thing}: ${JSON.stringify(thing)}`,
  );
}

function parseDate(thing: unknown): Date {
  const stringValue = parseString(thing);
  const date = new Date(stringValue);
  if (date.toString() === "Invalid Date") {
    throw new Error(
      `Failed to parse "${thing}" as Date: ${JSON.stringify(thing)}`,
    );
  }
  return date;
}

type DepartureWithDestinationId = Departure & { destinationId: string };

function parseDeparture(thing: unknown): DepartureWithDestinationId {
  const parser = parseObject(thing);
  const destination = parser.prop("destinationName", parseString);
  const destinationId = parser.prop("destinationNaptanId", parseString);
  const scheduledDeparture = parser.optionalProp(
    "scheduledTimeOfDeparture",
    parseDate,
  );
  const estimatedDeparture = parser.optionalProp(
    "estimatedTimeOfDeparture",
    parseDate,
  );
  // Set seconds to zero (start of the minute) as we only want minute-level resolution.
  // Otherwise a train might be considered delayed if it's running seconds later than scheduled.
  scheduledDeparture?.setSeconds(0, 0);
  estimatedDeparture?.setSeconds(0, 0);
  const status = parser.prop("departureStatus", parseString);
  const delayInformation = parser.optionalProp("cause", parseString);

  return {
    destination,
    destinationId,
    scheduledDeparture,
    estimatedDeparture,
    status,
    delayInformation,
  };
}

export function parseDepartures(
  response: unknown,
): DepartureWithDestinationId[] {
  return parseArray(response).map((element) => {
    return parseDeparture(element);
  });
}
