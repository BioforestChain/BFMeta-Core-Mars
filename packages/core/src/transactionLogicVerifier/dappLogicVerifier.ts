import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  NewTransactionRefuseReason,
  DAppTransaction,
  DAppPurchaseAssetModel,
  DAppModel,
} from "../../model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  ASSET_NOT_EXIST,
  ASSET_NOT_ENOUGH,
  DAPPID_IS_ALREADY_EXIST,
} from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "DAppLogicVerifier",
);

@Injectable()
export class DAppLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DAppTransaction,
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
    const dapp = transaction.asset.dapp;
    const { purchaseAsset } = dapp;
    if (purchaseAsset) {
      await this.isPurchaseAssetExist(purchaseAsset, accountGetterHelper);
    }

    await this.isPurchaseDAppidExist(dapp, currentBlockHeight, accountGetterHelper);

    return true;
  }

  /**
   * 用于购买 dapp 的资产是否存在
   *
   * @param purchaseAsset
   */
  async isPurchaseAssetExist(
    purchaseAsset: DAppPurchaseAssetModel,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isPurchaseAssetExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const { sourceChainMagic, assetType, amount } = purchaseAsset;
    const memAsset = await accountGetterHelper.getAsset(sourceChainMagic, assetType);
    if (!memAsset) {
      throw new ConsensusException(ASSET_NOT_EXIST, {
        magic: sourceChainMagic,
        assetType,
        ...Function_Exception_Detail,
      });
    }
    if (sourceChainMagic !== this.configHelper.magic && assetType !== this.configHelper.assetType) {
      if (memAsset.remainAssets < BigInt(amount)) {
        throw new ConsensusException(ASSET_NOT_ENOUGH, {
          reason: `Purchase asset amount greater than remain assets, spend ${amount}, remain ${memAsset.remainAssets}`,
          errorId: NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 购买的 dappid 是否存在
   *
   * @param dapp
   * @param currentBlockHeight
   * @param accountGetterHelper
   */
  async isPurchaseDAppidExist(
    dapp: DAppModel,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isPurchaseDAppidExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const memDapp = await accountGetterHelper.getDApp(
      dapp.sourceChainMagic,
      dapp.dappid,
      currentBlockHeight,
    );
    if (memDapp) {
      throw new ConsensusException(DAPPID_IS_ALREADY_EXIST, {
        dappid: dapp.dappid,
        errorId: NewTransactionRefuseReason.DAPP_ALREADY_EXISTS,
        ...Function_Exception_Detail,
      });
    }
  }
}
