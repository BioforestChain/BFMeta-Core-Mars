import { ConverterMap } from "../../../converterMap";
import { FromAuthSignatureV1Converter } from "./fromAuthSignature.v1";

export function FromAuthSignatureConverter<N extends string = "fromAuthSignature">(
  name = "fromAuthSignature" as N,
) {
  const v1 = new FromAuthSignatureV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]]);
}
