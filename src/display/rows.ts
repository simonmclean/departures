import { FontInstance, Glyph } from "rpi-led-matrix";
import { Departure, PlatformDepartures } from "../types";
import { diffMinutes } from "../utils";

type LATENESS_SEVERITY = "TRIVIAL" | "MINOR" | "SEVERE";

const LATENESS_THRESHOLDS = {
  TRIVIAL: 2,
  MINOR: 5,
};

const LATENESS_COLORS: Record<LATENESS_SEVERITY, ColorName> = {
  TRIVIAL: "white",
  MINOR: "amber",
  SEVERE: "red",
};

export type ColorName = "white" | "black" | "red" | "amber" | "green";

export type GlyphWithColor = Glyph & {
  color: ColorName;
};

export type Row = {
  left: GlyphWithColor[];
  right: GlyphWithColor[];
};

function stringToGlyphs(
  str: string,
  color: ColorName,
  font: FontInstance,
): GlyphWithColor[] {
  const h = font.height();
  return str.split("").map((char) => ({
    char,
    h,
    w: font.stringWidth(char),
    color,
  }));
}

function space(font: FontInstance): GlyphWithColor {
  return stringToGlyphs(" ", "black", font)[0]!;
}

function formatDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getDelaySeverity(
  latenessSeconds: number,
): "TRIVIAL" | "MINOR" | "SEVERE" {
  if (latenessSeconds <= LATENESS_THRESHOLDS.TRIVIAL) return "TRIVIAL";
  if (latenessSeconds <= LATENESS_THRESHOLDS.MINOR) return "MINOR";
  return "SEVERE";
}

/**
 * Maps Departure fields to display values, assigns them to either left or right alignment,
 * then converts the strings into a sequence of glyphs with appropriate color
 * */
function departureToRow(departure: Departure, font: FontInstance): Row {
  const scheduledTime = formatDate(departure.scheduledDeparture);
  const [estimatedTimeOrStatus, estimatedTimeOrStatusColor]: [
    string,
    ColorName,
  ] = (() => {
    if (departure.status === "OnTime") {
      return ["On time", "green"];
    }

    if (!departure.estimatedDeparture) {
      return [departure.status, "red"];
    }

    const delayMins = diffMinutes(
      departure.scheduledDeparture,
      departure.estimatedDeparture,
    );

    const delaySeverity = getDelaySeverity(delayMins);

    const formattedDate = formatDate(departure.estimatedDeparture);

    return [
      delaySeverity === "SEVERE"
        ? `${departure.status} ${formattedDate}`
        : formattedDate,
      LATENESS_COLORS[delaySeverity],
    ];
  })();

  return {
    left: [
      ...stringToGlyphs(scheduledTime, "white", font),
      space(font),
      ...stringToGlyphs(departure.destination, "white", font),
      space(font),
    ],
    right: [
      ...stringToGlyphs(
        estimatedTimeOrStatus,
        estimatedTimeOrStatusColor,
        font,
      ),
    ],
  };
}

export function departuresToRows(
  platformDepartures: PlatformDepartures,
  font: FontInstance,
): Row[] {
  return Object.entries(platformDepartures).flatMap<Row>(([, departures]) => {
    if ("first" in departures) {
      const first = departureToRow(departures.first, font);
      if ("second" in departures) {
        const second = departureToRow(departures.second, font);
        return [first, second];
      }
      return [first];
    }
    return [];
  });
}
