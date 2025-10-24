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

  async function go() {
    try {
      const departures = await getDepartures({
        apiKey: env.TFL_API_KEY,
        station: env.STOP_POINT_ID,
        line: env.LINE_ID,
      });
      // console.log(departures);
      const rows = departuresToRows(departures, font);
      matrix.clear();
      drawRows(matrix, font, rows);
    } catch (e) {
      const err =
        e instanceof Error ? e : new Error("An unknown error occured");
      console.error(err);
      drawErrorMessage(matrix, font, err);
    }
  }

  go();

  setInterval(go, DATA_FETCH_INTERVAL_SECONDS * 1000);
}

init();
