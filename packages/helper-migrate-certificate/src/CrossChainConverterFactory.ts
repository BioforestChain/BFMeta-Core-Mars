import { CrossChainDefaultConverter } from "./default";
import { CoreExceptionGenerator, PROP_IS_REQUIRE } from "@bfchain/core-util-exception";

const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

export function getVerion(filedValue: string) {
  return filedValue.split("/", 1)[0];
}

export function CrossChainConverterFactory(json?: any): BFChainCore.CrossChain.CrossChainConverter {
  if (!json) {
    return new CrossChainDefaultConverter();
  }
  const { body, signature } = json;
  if (!body) {
    throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
      prop: "json.body",
      function: "MigrateCertificateFactory",
    });
  }

  if (!signature) {
    throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
      prop: "json.signature",
      function: "MigrateCertificateFactory",
    });
  }

  const { fromChainId, toChainId, fromId, toId, assetTypeId } = body;

  const fromChainIdVersion = getVerion(fromChainId);
  const toChainIdVersion = getVerion(toChainId);
  const fromIdVersion = getVerion(fromId);
  const toIdVersion = getVerion(toId);
  const assetTypeIdVersion = getVerion(assetTypeId);
  const signatureVersion = getVerion(signature);

  // if (patcthFieldConverter.has(fromChainIdVersion)) {
  // } else {
  return new CrossChainDefaultConverter({
    fromChainIdVersion: fromChainIdVersion as never,
    toChainIdVersion: toChainIdVersion as never,
    fromIdVersion: fromIdVersion as never,
    toIdVersion: toIdVersion as never,
    assetTypeIdVersion: assetTypeIdVersion as never,
    signatureVersion: signatureVersion as never,
  });
  // }
}
