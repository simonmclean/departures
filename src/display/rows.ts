import { FontInstance, Glyph } from "rpi-led-matrix";
import { Departure } from "../types";
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
  const scheduledTime =
    departure.scheduledDeparture && formatDate(departure.scheduledDeparture);

  const [estimatedTimeOrStatus, estimatedTimeOrStatusColor]: [
    string,
    ColorName,
  ] = (() => {
    if (departure.status === "OnTime") {
      return ["On time", "green"];
    }

    if (!departure.estimatedDeparture || !departure.scheduledDeparture) {
      return [departure.status, "red"];
    }

    const delayMins = diffMinutes(
      departure.scheduledDeparture,
      departure.estimatedDeparture,
    );

    if (delayMins === 0) {
      return ["On time", "green"];
    }

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
      ...stringToGlyphs(scheduledTime || "", "white", font),
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

const MAX_DATE = new Date(8640000000000000);

export function departuresToRows(
  departures: Departure[],
  font: FontInstance,
): Row[] {
  return departures
    .toSorted((a, b) => {
      const aDeparture = a.scheduledDeparture || MAX_DATE;
      const bDeparture = b.scheduledDeparture || MAX_DATE;
      return aDeparture.getTime() - bDeparture.getTime();
    })
    .slice(0, 4)
    .map((departure) => departureToRow(departure, font));
}
