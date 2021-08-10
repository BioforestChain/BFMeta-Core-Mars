import { FieldConverter } from "./1";
import { ConverterMap } from "../converterMap";
export * from "./CrossChainV1DefaultConverter";
export { CrossChainV1DefaultConverter as CrossChainDefaultConverter } from "./CrossChainV1DefaultConverter";

export function DefaultFieldConverter<N extends string = "default">(name = "default" as N) {
  return new ConverterMap().mergeWithPrefix(`${name}/`, FieldConverter());
}
