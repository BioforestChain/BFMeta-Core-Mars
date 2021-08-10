import { ConverterMap } from "../../../converterMap";
import { ToChainIdV1Converter } from "./toChainId.v1";

export function ToChainIdConverter<N extends string = "toChainId">(name = "toChainId" as N) {
  const v1 = new ToChainIdV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]]);
}
