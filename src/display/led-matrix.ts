import {
  LedMatrix,
  MatrixOptions,
  RuntimeOptions,
  LedMatrixInstance,
  GpioMapping,
  FontInstance,
  Color,
  Font,
  LayoutUtils,
} from "rpi-led-matrix";
import { ColorName, Row } from "./rows";

const TEXT_PADDING = {
  x: 2,
  y: 1,
};

const COLOR_MAP: Record<ColorName, Color> = {
  white: { r: 255, g: 255, b: 255 },
  black: { r: 0, g: 0, b: 0 },
  red: { r: 255, g: 0, b: 255 },
  green: { r: 0, g: 255, b: 0 },
};

export function createFont() {
  return new Font("4x6", "fonts/4x6.bdf");
}

export function setupLedMatrix(font: FontInstance): LedMatrixInstance {
  const matrixOptions: MatrixOptions = {
    ...LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 64,
    chainLength: 2,
    hardwareMapping: GpioMapping.Regular,
    disableHardwarePulsing: true, // TODO: shouldn't have to do this
  };

  const runtimeOptions: RuntimeOptions = {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 2,
  };

  const matrix = new LedMatrix(matrixOptions, runtimeOptions);

  matrix.font(font);

  return matrix;
}

export function drawRows(
  matrix: LedMatrixInstance,
  font: FontInstance,
  rows: Row[],
): void {
  matrix.brightness(20);

  let y = TEXT_PADDING.x;

  rows.forEach((row) => {
    let cursor = 0;

    row.left.forEach(({ char, color, w }) => {
      matrix.fgColor(COLOR_MAP[color]).drawText(char, cursor, y);
      cursor += w;
    });

    row.right.forEach(({ char, color, w }) => {
      matrix.fgColor(COLOR_MAP[color]).drawText(char, cursor, y);
      cursor += w;
    });

    y += font.height() + TEXT_PADDING.x * 2;
  });

  matrix.sync();
}

export function drawLoadingText(matrix: LedMatrixInstance): void {
  matrix
    .clear()
    .brightness(20)
    .fgColor(COLOR_MAP.white)
    .drawText("LOADING...", 2, 2)
    .sync();
}

export function drawErrorMessage(
  matrix: LedMatrixInstance,
  font: FontInstance,
  err: Error,
): void {
  matrix.clear().brightness(20).fgColor(COLOR_MAP.red);

  const lines = LayoutUtils.textToLines(font, matrix.width(), err.message);

  const glyphs = LayoutUtils.linesToMappedGlyphs(
    lines,
    font.height(),
    matrix.width(),
    matrix.height(),
  );

  glyphs.forEach(({ char, x, y }) => {
    matrix.drawText(char, x, y);
  });

  matrix.sync();
}
