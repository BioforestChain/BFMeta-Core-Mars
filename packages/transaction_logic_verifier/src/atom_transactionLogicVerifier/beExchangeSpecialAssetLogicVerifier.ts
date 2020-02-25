import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { BeExchangeSpecialAssetTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BeExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class BeExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: BeExchangeSpecialAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const beExchangeSpecialAsset = transaction.asset.beExchangeSpecialAsset;
    const { transactionSignature } = beExchangeSpecialAsset;
    const toExchangeSpecialAssetJson = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
    )) as BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON> | undefined;
    if (!toExchangeSpecialAssetJson) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    this.isValidRecipientId(transaction, toExchangeSpecialAssetJson);
    this.isDependentTransactionMatch(transaction, toExchangeSpecialAssetJson);

    return true;
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   */
  isValidRecipientId(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<
      BFChainCore.ToExchangeSpecialAssetAssetJSON
    >,
  ) {
    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeSpecialAssetJson.senderId) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "recipientId",
        be_compare_prop: "senderId",
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
        function: "isValidRecipientId",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   */
  isDependentTransactionMatch(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<
      BFChainCore.ToExchangeSpecialAssetAssetJSON
    >,
  ) {
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const beExchangeAssetAsset = transaction.asset.beExchangeSpecialAsset;
    const {
      exchangeSpecialAsset,
      applyBlockHeight,
      numberOfEffectiveBlocks,
      transactionRangeType,
      transactionRange,
    } = beExchangeAssetAsset;
    const {
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeAsset,
    } = exchangeSpecialAsset;
    const trsAsset = toExchangeSpecialAssetJson.asset.toExchangeSpecialAsset;
    if (
      trsAsset.toExchangeSource !== toExchangeSource ||
      trsAsset.beExchangeSource !== beExchangeSource ||
      trsAsset.toExchangeAsset !== toExchangeAsset ||
      trsAsset.beExchangeAsset !== beExchangeAsset ||
      toExchangeSpecialAssetJson.applyBlockHeight !== applyBlockHeight ||
      toExchangeSpecialAssetJson.rangeType !== transactionRangeType ||
      toExchangeSpecialAssetJson.range.length !== transactionRange.length
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "exchangeSpecialAssetInfo",
        be_compare_prop: "exchangeSpecialAssetInfo",
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
        ...Function_Exception_Detail,
      });
    }
    const range = toExchangeSpecialAssetJson.range;
    for (const item of range) {
      if (!transactionRange.includes(item)) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "exchangeSpecialAssetRange",
          be_compare_prop: "exchangeSpecialAssetRange",
          to_target: "BeExchangeSpecialAssetTransaction",
          be_target: "ToExchangeSpecialAssetTransaction",
          ...Function_Exception_Detail,
        });
      }
    }

    if (numberOfEffectiveBlocks !== toExchangeSpecialAssetJson.numberOfEffectiveBlocks) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "numberOfEffectiveBlocks",
        be_compare_prop: "numberOfEffectiveBlocks",
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 不能二次操作同一笔交易(红包/资产交换/委托资产)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: BeExchangeSpecialAssetTransaction,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "checkSecondaryTransaction",
    } as const;

    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const count = await transactionGetterHelper.getCountTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue,
    });
    if (count > 0) {
      throw new ConsensusException(CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary exchange special asset, sender ${transaction.senderId} exchange transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
