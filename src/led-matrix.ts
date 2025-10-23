import {
  LedMatrix,
  LedMatrixUtils,
  PixelMapperType,
  MatrixOptions,
  RuntimeOptions,
  LedMatrixInstance,
  GpioMapping,
  Font,
} from "rpi-led-matrix";
import { PlatformDepartures } from "./types";

export function setupLedMatrix(): LedMatrixInstance {
  const matrixOptions: MatrixOptions = {
    ...LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 64,
    chainLength: 2,
    hardwareMapping: GpioMapping.Regular,
    disableHardwarePulsing: true, // TODO: shouldn't have to do this
    pixelMapperConfig: LedMatrixUtils.encodeMappers({
      type: PixelMapperType.U,
    }),
  };

  console.log({ matrixOptions });

  const runtimeOptions: RuntimeOptions = {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 2,
  };

  console.log({ runtimeOptions });

  const matrix = new LedMatrix(matrixOptions, runtimeOptions);

  matrix.font(new Font("6x10", __dirname + "/fonts/6x10.bdf"));

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
