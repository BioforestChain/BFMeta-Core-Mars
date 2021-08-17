import { ConverterMap } from "../../../converterMap";
import { ToAuthSignatureV1Converter } from "./toAuthSignature.v1";

export function ToAuthSignatureConverter<N extends string = "toAuthSignature">(
  name = "toAuthSignature" as N,
) {
  const v1 = new ToAuthSignatureV1Converter();
  return new ConverterMap([[`${name}/${v1.version}` as `${N}/${typeof v1.version}`, v1]]);
}
