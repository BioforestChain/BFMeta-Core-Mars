import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { ToExchangeAssetTransaction, ToExchangeAssetModel } from "../../model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, ASSET_NOT_EXIST, NOT_EXIST } from "@bfchain/core-helper";

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
    customTransactionCenter = this.customTransactionCenter,
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
      toExchangeAsset,
      beExchangeSource,
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
    const memBeAssets = await accountGetterHelper.getAsset(beExchangeSource, beExchangeAsset);
    if (!memBeAssets) {
      // 不存在的资产不能被交换
      throw new ConsensusException(ASSET_NOT_EXIST, {
        magic: beExchangeSource,
        assetType: beExchangeAsset,
        ...Function_Exception_Detail,
      });
    }
  }
}
