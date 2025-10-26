import { Departure } from "../types";

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
        `Expected object property "${prop}" to have type 'string': ${value}`,
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

function parseDestination(obj: Record<string, unknown>): string {
  const stringValue = parseString("destinationName", obj);
  const [shortName] = stringValue.split(" ");
  return shortName || stringValue;
}

function parseDeparture<T extends {}>(object: T): Departure {
  const destination = parseDestination(object);
  const scheduledDeparture = parseDate(
    "scheduledTimeOfDeparture",
    object,
    true,
  );
  const estimatedDeparture = parseDate(
    "estimatedTimeOfDeparture",
    object,
    true,
  );
  // Set seconds to zero (start of the minute) as we only want minute-level resolution.
  // Otherwise a train might be considered delayed if it's running seconds later than scheduled.
  scheduledDeparture?.setSeconds(0, 0);
  estimatedDeparture?.setSeconds(0, 0);
  const status = parseString("departureStatus", object);
  const delayInformation = parseString("cause", object, true);

  return {
    destination,
    scheduledDeparture,
    estimatedDeparture,
    status,
    delayInformation,
  };
}

export function parseDepartures(response: unknown): Departure[] {
  return parseArray(response).map((element) => {
    const object = parseRecord(element);
    return parseDeparture(object);
  });
}
