import { FromChainIdConverter } from "./fromChainId";
import { ToChainIdConverter } from "./toChainId";
import { FromIdConverter } from "./fromId";
import { ToIdConverter } from "./toId";
import { AssetIdConverter } from "./assetId";
import { SignatureConverter } from "./signature";
import { FromAuthSignatureConverter } from "./fromAuthSignature";
import { ToAuthSignatureConverter } from "./toAuthSignature";
import { ConverterMap } from "../../converterMap";

export function FieldConverter<N extends number = 1>(name = 1 as N) {
  return new ConverterMap()
    .mergeWithPrefix(`${name}/`, FromChainIdConverter())
    .mergeWithPrefix(`${name}/`, ToChainIdConverter())
    .mergeWithPrefix(`${name}/`, FromIdConverter())
    .mergeWithPrefix(`${name}/`, ToIdConverter())
    .mergeWithPrefix(`${name}/`, AssetIdConverter())
    .mergeWithPrefix(`${name}/`, SignatureConverter())
    .mergeWithPrefix(`${name}/`, FromAuthSignatureConverter())
    .mergeWithPrefix(`${name}/`, ToAuthSignatureConverter());
}
