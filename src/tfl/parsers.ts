import { parseArray, parseDate, parseObject, parseString } from "../parsers";
import { Departure } from "../types";

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
