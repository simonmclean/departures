import "dotenv/config";
import { getDepartures } from "./tfl/getDepartures";
import { parseNonEmptyTrimmedString } from "./utils";
import { drawDepartures, setupLedMatrix } from "./led-matrix";

function parseEnv(): {
  TFL_API_KEY: string;
  STOP_POINT_ID: string;
  LINE_ID: string;
} {
  const { TFL_API_KEY, STOP_POINT_ID, LINE_ID } = process.env;
  return {
    TFL_API_KEY: parseNonEmptyTrimmedString(TFL_API_KEY),
    STOP_POINT_ID: parseNonEmptyTrimmedString(STOP_POINT_ID),
    LINE_ID: parseNonEmptyTrimmedString(LINE_ID),
  };
}

async function init() {
  const env = parseEnv();
  // const matrix = setupLedMatrix();
  const departures = await getDepartures({
    apiKey: env.TFL_API_KEY,
    station: env.STOP_POINT_ID,
    line: env.LINE_ID,
  });
  console.log(departures);
  // drawDepartures(matrix, departures);
}

init();
