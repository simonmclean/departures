import { getDepartures } from "./tfl/departures";
import {
  drawErrorMessage,
  drawLoadingText,
  setupLedMatrix,
} from "./display/led-matrix";
import { departuresToRows } from "./display/rows";
import { createFont, drawRows } from "./display/led-matrix";
import { getConfig } from "./config";

async function init() {
  const config = await getConfig();
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
      // Switch off display outside active hours
      if (
        currentHour > config.activeHoursTo &&
        currentHour < config.activeHoursFrom
      ) {
        matrix.clear();
        return;
      }
      const departures = await getDepartures({
        apiKey: config.tflApiKey,
        station: config.stopPointId,
        line: config.lineId,
      });
      const rows = departuresToRows(departures, font);
      drawRows(matrix, font, rows);
    } catch (e) {
      const err =
        e instanceof Error ? e : new Error("An unknown error occured");
      console.error(err);
      drawErrorMessage(matrix, font, err);
    } finally {
      setTimeout(run, config.dataFetchIntervalSeconds * 1000);
    }
  }

  run();
}

init();
