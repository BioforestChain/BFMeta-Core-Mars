import { ConverterMap } from "../../../converterMap";
import { AssetIdV1Converter } from "./assetId.v1";

export function AssetIdConverter<N extends string = "assetId">(name = "assetId" as N) {
  const v1 = new AssetIdV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]]);
}
