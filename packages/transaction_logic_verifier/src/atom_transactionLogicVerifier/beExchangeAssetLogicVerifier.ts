import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { BeExchangeAssetTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "TransactionLogicVerifier",
);

@Injectable()
export class BeExchangeAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: BeExchangeAssetTransaction,
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
    // await this.checkSecondaryTransaction(transaction, transactionGetterHelper);
    const beExchangeAssetAsset = transaction.asset.beExchangeAsset;
    const { transactionSignature } = beExchangeAssetAsset;
    const trs = (await transactionGetterHelper.getTransactionBySignature(transactionSignature)) as
      | BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>
      | undefined;
    if (!trs) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    this.isValidRecipientId(transaction, trs);
    this.isDependentTransactionMatch(transaction, trs);

    return true;
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param toExchangeAssetJson
   */
  isValidRecipientId(
    transaction: BeExchangeAssetTransaction,
    toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>,
  ) {
    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeAssetJson.senderId) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "recipientId",
        be_compare_prop: "senderId",
        to_target: "BeExchangeAssetTransaction",
        be_target: "ToExchangeAssetTransaction",
        function: "isValidRecipientId",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeAssetJson
   */
  isDependentTransactionMatch(
    transaction: BeExchangeAssetTransaction,
    toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>,
  ) {
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const beExchangeAssetAsset = transaction.asset.beExchangeAsset;
    const {
      exchangeAsset,
      applyBlockHeight,
      numberOfEffectiveBlocks,
      transactionRangeType,
      transactionRange,
    } = beExchangeAssetAsset;
    const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset } = exchangeAsset;
    const trsAsset = toExchangeAssetJson.asset.toExchangeAsset;
    if (
      trsAsset.toExchangeSource !== toExchangeSource ||
      trsAsset.beExchangeSource !== beExchangeSource ||
      trsAsset.toExchangeAsset !== toExchangeAsset ||
      trsAsset.beExchangeAsset !== beExchangeAsset ||
      toExchangeAssetJson.applyBlockHeight !== applyBlockHeight ||
      toExchangeAssetJson.rangeType !== transactionRangeType ||
      toExchangeAssetJson.range.length !== transactionRange.length
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "exchangeAssetInfo",
        be_compare_prop: "exchangeAssetInfo",
        to_target: "BeExchangeAssetTransaction",
        be_target: "ToExchangeAssetTransaction",
        ...Function_Exception_Detail,
      });
    }
    const range = toExchangeAssetJson.range;
    for (const item of range) {
      if (!transactionRange.includes(item)) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "exchangeAssetRange",
          be_compare_prop: "exchangeAssetRange",
          to_target: "BeExchangeAssetTransaction",
          be_target: "ToExchangeAssetTransaction",
          ...Function_Exception_Detail,
        });
      }
    }

    if (numberOfEffectiveBlocks !== toExchangeAssetJson.numberOfEffectiveBlocks) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "numberOfEffectiveBlocks",
        be_compare_prop: "numberOfEffectiveBlocks",
        to_target: "BeExchangeAssetTransaction",
        be_target: "ToExchangeAssetTransaction",
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
    transaction: BeExchangeAssetTransaction,
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
        reason: `Can not secondary exchange asset, sender ${transaction.senderId} exchange transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
