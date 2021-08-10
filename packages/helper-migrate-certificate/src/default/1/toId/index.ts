import { ConverterMap } from "../../../converterMap";
import { ToIdV1Converter } from "./toId.v1";

export function ToIdConverter<N extends string = "toId">(name = "toId" as N) {
  const v1 = new ToIdV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]]);
}
