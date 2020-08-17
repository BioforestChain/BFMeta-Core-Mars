import type { ToExchangeAssetTransaction, ToExchangeAssetModel } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ASSET_NOT_EXIST, NOT_MATCH } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "ToExchangeAssetLogicVerifier");

@Injectable()
export class ToExchangeAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const toExchangeAsset = transaction.asset.toExchangeAsset;
    await this.isExchangeAssetAlreadyExist(toExchangeAsset, accountGetterHelper);

    const { sender } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    this.eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, transaction, eventEmitter);

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 交换的双方资产是否已经存在
   *
   * @param toExchangeAssetAsset
   */
  private async isExchangeAssetAlreadyExist(
    toExchangeAssetAsset: ToExchangeAssetModel,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "isExchangeAssetAlreadyExist",
    } as const;

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
    if (memToAssets.sourceChainName !== toExchangeChainName) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `sourceChainName ${memToAssets.sourceChainName}`,
        be_compare_prop: `toExchangeChainName ${toExchangeChainName}`,
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
        to_compare_prop: `sourceChainName ${memBeAssets.sourceChainName}`,
        be_compare_prop: `beExchangeChainName ${beExchangeChainName}`,
        to_target: "memBeAssets",
        be_target: "toExchangeAssetAsset",
        ...Function_Exception_Detail,
      });
    }
  }
}
