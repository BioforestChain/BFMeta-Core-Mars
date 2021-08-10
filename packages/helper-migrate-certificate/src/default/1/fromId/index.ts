import { ConverterMap } from "../../../converterMap";
import { FromIdV1Converter } from "./fromId.v1";

export function FromIdConverter<N extends string = "fromId">(name = "fromId" as N) {
  const v1 = new FromIdV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]]);
}
