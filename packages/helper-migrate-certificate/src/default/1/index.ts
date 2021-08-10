import { FromChainIdConverter } from "./fromChainId";
import { ToChainIdConverter } from "./toChainId";
import { FromIdConverter } from "./fromId";
import { ToIdConverter } from "./toId";
import { AssetTypeIdConverter } from "./assetTypeId";
import { SignatureConverter } from "./signature";
import { ConverterMap } from "../../converterMap";

export function FieldConverter<N extends number = 1>(name = 1 as N) {
  return new ConverterMap()
    .mergeWithPrefix(`${name}/`, FromChainIdConverter())
    .mergeWithPrefix(`${name}/`, ToChainIdConverter())
    .mergeWithPrefix(`${name}/`, FromIdConverter())
    .mergeWithPrefix(`${name}/`, ToIdConverter())
    .mergeWithPrefix(`${name}/`, AssetTypeIdConverter())
    .mergeWithPrefix(`${name}/`, SignatureConverter());
}
