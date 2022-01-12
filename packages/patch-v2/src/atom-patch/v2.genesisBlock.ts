import { Injectable } from "@bfchain/util-dep-inject";
import { GenesisBlockFactory } from "@bfchain/core-block";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "GenesisBlockFactory");

@Injectable()
export class V2_GenesisBlockFactory extends GenesisBlockFactory {
  /**
   * 校验输入信息
   *
   * @param body
   * @param genesisBlockAsset
   */
  async verifyBlockBody(
    body: BFChainCore.BlockBody,
    genesisBlockAsset: BFChainCore.GenesisBlockAssetJSON,
    config = this.config,
  ) {
    await super.verifyBlockBody(body, genesisBlockAsset);

    const { maxMultipleOfAssetAndMainAsset } = genesisBlockAsset.genesisAsset;

    if (!maxMultipleOfAssetAndMainAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "maxMultipleOfAssetAndMainAsset",
        target: "genesisAsset",
      });
    }

    if (!this.baseHelper.isPositiveBigFloatNotContainZero(maxMultipleOfAssetAndMainAsset)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxMultipleOfAssetAndMainAsset ${maxMultipleOfAssetAndMainAsset}`,
        target: "genesisAsset",
      });
    }
  }
}
