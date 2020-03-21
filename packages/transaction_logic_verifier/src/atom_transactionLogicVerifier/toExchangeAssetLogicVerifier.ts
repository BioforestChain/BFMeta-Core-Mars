import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { ToExchangeAssetTransaction, ToExchangeAssetModel } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, ASSET_NOT_EXIST, NOT_EXIST, NOT_MATCH } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeAssetLogicVerifier",
);

@Injectable()
export class ToExchangeAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    // FIXME: no need to verify
    const toExchangeAsset = transaction.asset.toExchangeAsset;
    await this.isExchangeAssetAlreadyExist(toExchangeAsset, accountGetterHelper);

    return true;
  }

  /**
   * 交换的双方资产是否已经存在
   *
   * @param toExchangeAssetAsset
   */
  async isExchangeAssetAlreadyExist(
    toExchangeAssetAsset: ToExchangeAssetModel,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isExchangeAssetAlreadyExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const {
      toExchangeSource,
      toExchangeChainName,
      toExchangeAsset,
      beExchangeSource,
      beExchangeChainName,
      beExchangeAsset,
    } = toExchangeAssetAsset;
    const memToAssets = await accountGetterHelper.getAsset(toExchangeSource, toExchangeAsset);
    if (!memToAssets) {
      // 不存在的资产不能被交换
      throw new ConsensusException(ASSET_NOT_EXIST, {
        magic: toExchangeSource,
        assetType: toExchangeAsset,
        ...Function_Exception_Detail,
      });
    }
    if (memToAssets.sourceChainName !== beExchangeChainName) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "sourcehChainName",
        be_compare_prop: "beExchangeChainName",
        to_target: "memToAssets",
        be_target: "toExchangeAssetAsset",
        ...Function_Exception_Detail,
      });
    }
    const memBeAssets = await accountGetterHelper.getAsset(beExchangeSource, beExchangeAsset);
    if (!memBeAssets) {
      // 不存在的资产不能被交换
      throw new ConsensusException(ASSET_NOT_EXIST, {
        magic: beExchangeSource,
        assetType: beExchangeAsset,
        ...Function_Exception_Detail,
      });
    }
    if (memBeAssets.sourceChainName !== beExchangeChainName) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "sourcehChainName",
        be_compare_prop: "beExchangeChainName",
        to_target: "memBeAssets",
        be_target: "toExchangeAssetAsset",
        ...Function_Exception_Detail,
      });
    }
  }
}
