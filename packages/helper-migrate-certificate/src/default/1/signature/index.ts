import { ConverterMap } from "../../../converterMap";
import { SignatureV1Converter } from "./signature.v1";

export function SignatureConverter<N extends string = "signature">(name = "signature" as N) {
  const v1 = new SignatureV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]]);
}
