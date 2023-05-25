import { Injectable, QueneEventEmitter } from "@bfchain/util";
import {
  BeExchangeSpecialAssetTransaction,
  RANGE_TYPE,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
} from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

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
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent = false,
  ) {
    const beExchangeSpecialAsset = transaction.asset.beExchangeSpecialAsset;
    const { transactionSignature } = beExchangeSpecialAsset;
    const toExchangeSpecialAssetJson = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.ToExchangeSpecialAssetTransactionJSON | undefined;
    if (!toExchangeSpecialAssetJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }

    if (toExchangeSpecialAssetJson.type !== this.transactionHelper.TO_EXCHANGE_SPECIAL_ASSET) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    this.isValidRecipientId(transaction, toExchangeSpecialAssetJson);
    this.isDependentTransactionMatch(transaction, toExchangeSpecialAssetJson);

    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(
        accountMap,
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   */
  private isValidRecipientId(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>,
  ) {
    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeSpecialAssetJson.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        be_compare_prop: `senderId ${toExchangeSpecialAssetJson.senderId}`,
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   */
  private isDependentTransactionMatch(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>,
  ) {
    const beExchangeAssetAsset = transaction.asset.beExchangeSpecialAsset;
    const { exchangeSpecialAsset, ciphertextSignature } = beExchangeAssetAsset;
    const {
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeAsset,
      toExchangeChainName,
      beExchangeChainName,
      exchangeNumber,
      exchangeAssetType,
      exchangeDirection,
      cipherPublicKeys,
    } = exchangeSpecialAsset;
    const trsAsset = toExchangeSpecialAssetJson.asset.toExchangeSpecialAsset;
    if (
      trsAsset.toExchangeSource !== toExchangeSource ||
      trsAsset.beExchangeSource !== beExchangeSource ||
      trsAsset.toExchangeAsset !== toExchangeAsset ||
      trsAsset.beExchangeAsset !== beExchangeAsset ||
      trsAsset.toExchangeChainName !== toExchangeChainName ||
      trsAsset.beExchangeChainName !== beExchangeChainName ||
      trsAsset.exchangeNumber !== exchangeNumber ||
      trsAsset.exchangeAssetType !== exchangeAssetType ||
      trsAsset.exchangeDirection !== exchangeDirection
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeSpecialAsset: ${JSON.stringify(exchangeSpecialAsset.toJSON())}`,
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
      });
    }

    if (trsAsset.cipherPublicKeys.length !== cipherPublicKeys.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeSpecialAsset: ${JSON.stringify(exchangeSpecialAsset.toJSON())}`,
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
      });
    }
    for (const pk of trsAsset.cipherPublicKeys) {
      if (!cipherPublicKeys.includes(pk)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeSpecialAsset: ${JSON.stringify(exchangeSpecialAsset.toJSON())}`,
          to_target: "BeExchangeSpecialAssetTransaction",
          be_target: "ToExchangeSpecialAssetTransaction",
        });
      }
    }
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeSpecialAsset",
        });
      }
      const { publicKey } = ciphertextSignature;
      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "beExchangeSpecialAsset.ciphertextSignature",
          be_target: "toExchangeSpecialAsset.cipherPublicKeys",
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeSpecialAsset",
        });
      }
    }

    const { rangeType, range } = toExchangeSpecialAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.senderId}`,
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
        });
      }
    }
  }

  /**
   * 不能二次操作同一笔交易(资产交换)
   *
   * @param transaction
   * @param currentBlockHeight
   * @param transactionGetterHelper
   */
  async checkSecondaryTransaction(
    transaction: BeExchangeSpecialAssetTransaction,
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
      heightRange: this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    });
    if (isSecondary) {
      throw new ConsensusException(ERROR_LIST.CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary exchange special asset, sender ${transaction.senderId} exchange transaction signature ${transaction.storageValue}`,
      });
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: BeExchangeSpecialAssetTransaction) {
    const { transactionSignature, exchangeSpecialAsset } = transaction.asset.beExchangeSpecialAsset;
    const { exchangeAssetType, exchangeDirection, toExchangeAsset, beExchangeAsset } =
      exchangeSpecialAsset;
    const locks: string[] = [transactionSignature];
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_SENDER) {
      if (
        exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY
      ) {
        locks.push(toExchangeAsset);
      }
    } else {
      if (
        exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY
      ) {
        locks.push(beExchangeAsset);
      }
    }
    return locks;
  }
}
