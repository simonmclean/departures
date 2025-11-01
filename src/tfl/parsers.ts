import { parseArray, parseDate, parseObject, parseString } from "../parsers";
import { Departure } from "../types";

type DepartureWithDestinationId = Departure & { destinationId: string };

function toStartOfMinute(date?: Date): Date | undefined {
  date?.setSeconds(0, 0);
  return date;
}

function parseDeparture(thing: unknown): DepartureWithDestinationId {
  const parser = parseObject(thing);
  const parseStr = (key: string) => parser.prop(key, parseString);

  return {
    destination: parseStr("destinationName"),
    destinationId: parseStr("destinationNaptanId"),
    // Set seconds to zero (start of the minute) as we only want minute-level resolution.
    // Otherwise a train might be considered delayed if it's running seconds later than scheduled.
    scheduledDeparture: toStartOfMinute(
      parser.optionalProp("scheduledTimeOfDeparture", parseDate),
    ),
    estimatedDeparture: toStartOfMinute(
      parser.optionalProp("estimatedTimeOfDeparture", parseDate),
    ),
    status: parseStr("departureStatus"),
    delayInformation: parser.optionalProp("cause", parseString),
  };
}

export function parseDepartures(
  response: unknown,
): DepartureWithDestinationId[] {
  return parseArray(response).map((element) => parseDeparture(element));
}
