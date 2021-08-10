import { ConverterMap } from "../../../converterMap";
import { FromChainIdV1Converter } from "./fromChainId.v1";

export function FromChainIdConverter<N extends string = "fromChainId">(name = "fromChainId" as N) {
  const v1 = new FromChainIdV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]] as const);
}
