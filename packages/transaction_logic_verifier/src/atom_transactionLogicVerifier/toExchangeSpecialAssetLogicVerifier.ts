import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  ToExchangeSpecialAssetTransaction,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
} from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ASSET_NOT_EXIST,
  NOT_MATCH,
  PROP_IS_INVALID,
} from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class ToExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeSpecialAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;

    const toExchangeSpecialAssetAsset = transaction.asset.toExchangeSpecialAsset;
    const {
      toExchangeChainName,
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeChainName,
      beExchangeAsset,
      exchangeDirection,
      exchangeAssetType,
    } = toExchangeSpecialAssetAsset;
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_SENDER) {
      // 特殊资产来自发起账户，则要交换的 数字资产必须存在
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
          to_compare_prop: memBeAssets.sourceChainName,
          be_compare_prop: beExchangeChainName,
          to_target: "chainAsset",
          be_target: "toExchangeSpecialAssetAsset",
          ...Function_Exception_Detail,
        });
      }
    } else if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      // 特殊资产来自发起账户，则要交换的 数字资产必须存在
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
          to_compare_prop: memToAssets.sourceChainName,
          be_compare_prop: toExchangeChainName,
          to_target: "chainAsset",
          be_target: "toExchangeSpecialAssetAsset",
          ...Function_Exception_Detail,
        });
      }
    } else {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "exchangeDirection",
        target: "toExchangeSpecialAssetAsset",
        ...Function_Exception_Detail,
      });
    }

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

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      this.eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, transaction);
    } else {
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        this.eventLogicVerifier.listenEventSaleDAppid(currentBlockHeight, accountGetterHelper);
      } else {
        this.eventLogicVerifier.listenEventSaleLocationName(
          currentBlockHeight,
          accountGetterHelper,
        );
      }
    }

    await this.eventLogicVerifier.awaitEventResult(transaction);

    return true;
  }
}
