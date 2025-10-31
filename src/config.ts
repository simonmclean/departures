import path from "node:path";
import { parseNumber, parseObject, parseString } from "./parsers";

export type Config = {
  // Required
  tflApiKey: string;
  stopPointId: string;
  lineId: string;
  // Optional
  dataFetchIntervalSeconds: number;
  activeHoursTo: number;
  activeHoursFrom: number;
};

const DEFAULTS = {
  DATA_FETCH_INTERVAL_SECONDS: 15,
  ACTIVE_HOURS_FROM: 8, // 8am
  ACTIVE_HOURS_TO: 1, // 1am
};

function parseConfig(value: unknown): Config {
  const objectParser = parseObject(value);

  const parseStr = (key: string) => {
    const str = objectParser.prop(key, parseString).trim();
    if (str === "") {
      throw new Error(`Expected ${key} to be non-empty: ${str}`);
    }
    return str;
  };

  const parseHour = (key: string) => {
    const num = objectParser.optionalProp(key, parseNumber);

    if ((num && num < 0) || (num && num > 12)) {
      throw new Error(
        `Expected ${key} to be a number between 0 - 12 inclusive: ${num}`,
      );
    }

    return num;
  };

  const parseInterval = (key: string) => {
    const num = objectParser.optionalProp(key, parseNumber);

    if (num && num < 1) {
      throw new Error(`Expected ${key} to be a positive number: ${num}`);
    }

    return num;
  };

  return {
    tflApiKey: parseStr("tflApiKey"),
    lineId: parseStr("lineId"),
    stopPointId: parseStr("stopPointId"),
    activeHoursFrom: parseHour("activeHoursFrom") ?? DEFAULTS.ACTIVE_HOURS_FROM,
    activeHoursTo: parseHour("activeHoursTo") ?? DEFAULTS.ACTIVE_HOURS_TO,
    dataFetchIntervalSeconds:
      parseInterval("dataFetchIntervalSeconds") ??
      DEFAULTS.DATA_FETCH_INTERVAL_SECONDS,
  };
}

export async function getConfig(): Promise<Config> {
  const configPath = path.resolve(process.cwd(), "config.json");

  const jsonImport = await import(configPath, {
    with: { type: "json" },
  });

  return parseConfig(jsonImport.default);
}
