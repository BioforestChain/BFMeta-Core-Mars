import { Injectable } from "@bfchain/util-dep-inject";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { V2_GenesisBlockFactory } from "@bfchain/core-patch-v2";

const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "GenesisBlockFactory");

@Injectable()
export class V4_GenesisBlockFactory extends V2_GenesisBlockFactory {
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

    const { baseHelper } = this;

    const GenesisBlockAsset_Exception_Detail = {
      target: "genesisAsset",
    };

    const { issueEntityFactoryMinChainAsset, maxMultipleOfEntityAndMainAsset } =
      genesisBlockAsset.genesisAsset;

    if (!issueEntityFactoryMinChainAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "issueEntityFactoryMinChainAsset",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    // 跳过 空串 和 undefined
    if (!baseHelper.isValidAssetNumber(issueEntityFactoryMinChainAsset)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `issueEntityFactoryMinChainAsset ${issueEntityFactoryMinChainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!maxMultipleOfEntityAndMainAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "maxMultipleOfEntityAndMainAsset",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveBigFloatNotContainZero(maxMultipleOfEntityAndMainAsset)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxMultipleOfEntityAndMainAsset ${maxMultipleOfEntityAndMainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
  }
}
