import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { GrabAssetTransaction, RANGE_TYPE } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
  SHOULD_BE,
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
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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
    const trsWithBlockSign = await transactionGetterHelper.getTransactionAndBlockSignatureBySignature(
      transactionSignature,
    );

    if (!trsWithBlockSign) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "grabAsset",
        ...Function_Exception_Detail,
      });
    }

    const trs = trsWithBlockSign.transaction as BFChainCore.TransactionJSON<
      BFChainCore.GiftAssetAssetJSON
    >;

    this.isValidRecipientId(transaction, trs);
    this.isBlockSignatureMatch(transaction, trsWithBlockSign.blockSignature);
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
   * 交易所在的区块签名是否匹配
   *
   * @param transaction
   * @param blockSignature
   */
  isBlockSignatureMatch(transaction: GrabAssetTransaction, blockSignature: string) {
    if (blockSignature !== transaction.asset.grabAsset.blockSignature) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "blockSignature",
        be_compare_prop: "blockSignature",
        to_target: "grabAsset",
        be_target: "blockChain",
        function: "isBlockSignatureMatch",
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
    const { giftAsset } = grabAsset;

    const { sourceChainMagic, assetType, giftDistributionRule } = giftAsset;

    const trsAsset = giftAssetJson.asset.giftAsset;

    if (
      trsAsset.sourceChainMagic !== sourceChainMagic ||
      trsAsset.assetType !== assetType ||
      trsAsset.giftDistributionRule !== giftDistributionRule
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "giftAssetInfo",
        be_compare_prop: "giftAssetInfo",
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    const { rangeType, range } = giftAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "senderId",
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "dappid",
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "lns",
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 不能二次操作同一笔交易(资产赠送)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: GrabAssetTransaction,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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

    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
    });
    if (isSecondary) {
      throw new ConsensusException(CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary grab asset, sender ${transaction.senderId} gift transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
