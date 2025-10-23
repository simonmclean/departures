import {
  LedMatrix,
  LedMatrixUtils,
  PixelMapperType,
  MatrixOptions,
  RuntimeOptions,
  LedMatrixInstance,
  GpioMapping,
} from "rpi-led-matrix";
import { PlatformDepartures } from "./types";

export function setupLedMatrix(): LedMatrixInstance {
  const matrixOptions: MatrixOptions = {
    ...LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 64,
    chainLength: 2,
    hardwareMapping: GpioMapping.Regular,
    pixelMapperConfig: LedMatrixUtils.encodeMappers({
      type: PixelMapperType.U,
    }),
  };

  const runtimeOptions: RuntimeOptions = {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 2,
  };

  const matrix = new LedMatrix(matrixOptions, runtimeOptions);

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
    .drawText("Hello world", 0, 0)
    .sync();
}
