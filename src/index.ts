import "dotenv/config";
import { getDepartures } from "./tfl/getDepartures";
import { parseNonEmptyTrimmedString } from "./utils";
import {
  drawErrorMessage,
  drawLoadingText,
  setupLedMatrix,
} from "./display/led-matrix";
import { departuresToRows } from "./display/rows";
import { createFont, drawRows } from "./display/led-matrix";

const DATA_FETCH_INTERVAL_SECONDS = 15;
const ACTIVE_HOURS_FROM = 8; // 8am
const ACTIVE_HOURS_TO = 1; // 1am

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
  // NOTE: `font` variable must not be garbage collected, otherwise text rendering won't work
  const font = createFont();
  const matrix = setupLedMatrix(font);

  // Clear the display before letting the process terminate
  process.on("SIGINT", () => {
    matrix.clear().sync();
    process.exit(0);
  });

  drawLoadingText(matrix);

  async function run() {
    try {
      const currentHour = new Date().getHours();
      if (currentHour > ACTIVE_HOURS_TO && currentHour < ACTIVE_HOURS_FROM) {
        // Switch off display outside active hours
        matrix.clear();
        return;
      }
      const departures = await getDepartures({
        apiKey: env.TFL_API_KEY,
        station: env.STOP_POINT_ID,
        line: env.LINE_ID,
      });
      const rows = departuresToRows(departures, font);
      matrix.clear();
      drawRows(matrix, font, rows);
      setTimeout(() => {
        run();
      }, DATA_FETCH_INTERVAL_SECONDS * 1000);
    } catch (e) {
      const err =
        e instanceof Error ? e : new Error("An unknown error occured");
      console.error(err);
      drawErrorMessage(matrix, font, err);
      setTimeout(() => {
        run();
      }, DATA_FETCH_INTERVAL_SECONDS * 1000);
    }
  }

  run();
}

init();
