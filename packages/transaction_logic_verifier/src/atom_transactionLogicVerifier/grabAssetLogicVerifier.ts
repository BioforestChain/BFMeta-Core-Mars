import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { GrabAssetTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "GrabAssetLogicVerifier",
);

@Injectable()
export class GrabAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GrabAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
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

    const grabAsset = transaction.asset.grabAsset;

    const { transactionSignature } = grabAsset;
    const trs = (await transactionGetterHelper.getTransactionById(transactionSignature)) as
      | BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>
      | undefined;

    if (!trs) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `Transaction with id ${transactionSignature}`,
        target: "grabAsset",
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
   * @param giftAssetJson
   */
  isValidRecipientId(
    transaction: GrabAssetTransaction,
    giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>,
  ) {
    if (transaction.recipientId !== giftAssetJson.senderId) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "recipientId",
        be_compare_prop: "senderId",
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
        function: "isValidRecipientId",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param giftAssetJson
   */
  isDependentTransactionMatch(
    transaction: GrabAssetTransaction,
    giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>,
  ) {
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const grabAsset = transaction.asset.grabAsset;
    const {
      applyBlockHeight,
      numberOfBeginUnfrozenBlocks,
      numberOfEffectiveBlocks,
      transactionRangeType,
      transactionRange,
      giftAsset,
    } = grabAsset;

    const { sourceChainMagic, assetType, giftDistributionRule } = giftAsset;

    const trsAsset = giftAssetJson.asset.giftAsset;

    if (
      trsAsset.sourceChainMagic !== sourceChainMagic ||
      trsAsset.assetType !== assetType ||
      trsAsset.giftDistributionRule !== giftDistributionRule ||
      giftAssetJson.applyBlockHeight !== applyBlockHeight ||
      giftAssetJson.rangeType !== transactionRangeType ||
      giftAssetJson.range.length !== transactionRange.length
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "giftAssetInfo",
        be_compare_prop: "giftAssetInfo",
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    const range = transaction.range;
    for (const item of range) {
      if (!transactionRange.includes(item)) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "giftAssetRange",
          be_compare_prop: "giftAssetRange",
          to_target: "GrabAssetTransaction",
          be_target: "GiftAssetTransaction",
          ...Function_Exception_Detail,
        });
      }
    }

    if (transaction.numberOfEffectiveBlocks) {
      if (numberOfEffectiveBlocks !== transaction.numberOfEffectiveBlocks) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "numberOfEffectiveBlocks",
          be_compare_prop: "numberOfEffectiveBlocks",
          to_target: "GrabAssetTransaction",
          be_target: "GiftAssetTransaction",
          ...Function_Exception_Detail,
        });
      }
    }

    if (trsAsset.numberOfBeginUnfrozenBlocks) {
      if (numberOfBeginUnfrozenBlocks !== trsAsset.numberOfBeginUnfrozenBlocks) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "numberOfBeginUnfrozenBlocks",
          be_compare_prop: "numberOfBeginUnfrozenBlocks",
          to_target: "GrabAssetTransaction",
          be_target: "GiftAssetTransaction",
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 不能二次操作同一笔交易(红包/资产交换/委托资产)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: GrabAssetTransaction,
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
        reason: `Can not secondary grab asset, sender ${
          transaction.senderId
        } gift transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
