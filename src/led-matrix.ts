import {
  LedMatrix,
  MatrixOptions,
  RuntimeOptions,
  LedMatrixInstance,
  GpioMapping,
  FontInstance,
} from "rpi-led-matrix";
import { PlatformDepartures } from "./types";

export function setupLedMatrix(font: FontInstance): LedMatrixInstance {
  const matrixOptions: MatrixOptions = {
    ...LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 64,
    chainLength: 1,
    hardwareMapping: GpioMapping.Regular,
    disableHardwarePulsing: true, // TODO: shouldn't have to do this
  };

  console.log({ matrixOptions });

  const runtimeOptions: RuntimeOptions = {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 2,
  };

  console.log({ runtimeOptions });

  const matrix = new LedMatrix(matrixOptions, runtimeOptions);

  matrix.font(font);

  return matrix;
}

export function drawDepartures(
  matrix: LedMatrixInstance,
  departures: PlatformDepartures,
) {
  matrix
    .clear()
    .brightness(50)
    .fgColor({ r: 255, g: 255, b: 255 })
    // .setPixel(0, 0)
    // .drawCircle(matrix.width() / 2, matrix.height() / 2, matrix.width() / 2 - 1)
    // .drawRect(
    //   matrix.width() / 4,
    //   matrix.height() / 4,
    //   matrix.width() / 2,
    //   matrix.height() / 2,
    // )
    // .drawLine(0, 0, matrix.width(), matrix.height())
    .drawText("Hello world", 1, 1)
    .sync();
}
