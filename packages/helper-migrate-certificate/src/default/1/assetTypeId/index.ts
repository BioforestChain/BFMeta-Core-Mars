import { ConverterMap } from "../../../converterMap";
import { AssetTypeIdV1Converter } from "./assetTypeId.v1";

export function AssetTypeIdConverter<N extends string = "assetTypeId">(name = "assetTypeId" as N) {
  const v1 = new AssetTypeIdV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]]);
}
