import { ConverterMap } from "../converterMap";

export function PatcthFieldConverter<N extends string = "patch">(name = "patch" as N) {
  return new ConverterMap();
}
