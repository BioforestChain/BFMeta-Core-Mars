import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { BeExchangeAssetTransaction, RANGE_TYPE } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

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
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const beExchangeAssetAsset = transaction.asset.beExchangeAsset;
    const { transactionSignature } = beExchangeAssetAsset;
    const trs = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.ToExchangeAssetTransactionJSON | undefined;
    if (!trs) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }

    if (trs.type !== this.transactionHelper.TO_EXCHANGE_ASSET) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    this.isValidRecipientId(transaction, trs);
    this.isDependentTransactionMatch(transaction, trs);

    const { sender, recipient } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };
    const cloneAccountsInfo = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
      cloneAccountsInfo[address] = this.helperLogicVerifier.deepClone(recipient.accountInfo);
    }

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventUnfrozenAsset(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param toExchangeAssetJson
   */
  private isValidRecipientId(
    transaction: BeExchangeAssetTransaction,
    toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>,
  ) {
    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeAssetJson.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `BeExchangeAssetTransaction recipientId ${transaction.recipientId}`,
        be_compare_prop: `ToExchangeAssetTransaction senderId ${toExchangeAssetJson.senderId}`,
        to_target: "BeExchangeAssetTransaction",
        be_target: "ToExchangeAssetTransaction",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeAssetJson
   */
  private isDependentTransactionMatch(
    transaction: BeExchangeAssetTransaction,
    toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>,
  ) {
    const beExchangeAssetAsset = transaction.asset.beExchangeAsset;
    const { exchangeAsset, ciphertextSignature } = beExchangeAssetAsset;
    const {
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeAsset,
      toExchangeChainName,
      beExchangeChainName,
      toExchangeNumber,
      cipherPublicKeys,
      exchangeRate,
    } = exchangeAsset;
    const trsAsset = toExchangeAssetJson.asset.toExchangeAsset;
    if (
      trsAsset.toExchangeSource !== toExchangeSource ||
      trsAsset.beExchangeSource !== beExchangeSource ||
      trsAsset.toExchangeChainName !== toExchangeChainName ||
      trsAsset.beExchangeChainName !== beExchangeChainName ||
      trsAsset.toExchangeAsset !== toExchangeAsset ||
      trsAsset.beExchangeAsset !== beExchangeAsset ||
      trsAsset.toExchangeNumber !== toExchangeNumber
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeAsset: ${JSON.stringify(exchangeAsset.toJSON())}`,
        to_target: "BeExchangeAssetTransaction",
        be_target: "ToExchangeAssetTransaction",
      });
    }

    if (trsAsset.exchangeRate) {
      if (!exchangeRate) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAsset: ${JSON.stringify(exchangeAsset.toJSON())}`,
          to_target: "BeExchangeAssetTransaction",
          be_target: "ToExchangeAssetTransaction",
        });
      }
      if (
        trsAsset.exchangeRate.prevWeight !== exchangeRate.prevWeight ||
        trsAsset.exchangeRate.nextWeight !== exchangeRate.nextWeight
      ) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAsset: ${JSON.stringify(exchangeAsset.toJSON())}`,
          to_target: "BeExchangeAssetTransaction",
          be_target: "ToExchangeAssetTransaction",
        });
      }
    } else {
      if (exchangeRate) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "exchangeRate",
          target: "BeExchangeAssetTransaction.beExchangeAsset.exchangeAsset",
        });
      }
    }

    if (trsAsset.cipherPublicKeys.length !== cipherPublicKeys.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeAsset: ${JSON.stringify(exchangeAsset.toJSON())}`,
        to_target: "BeExchangeAssetTransaction",
        be_target: "ToExchangeAssetTransaction",
      });
    }
    for (const pk of trsAsset.cipherPublicKeys) {
      if (!cipherPublicKeys.includes(pk)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAsset: ${JSON.stringify(exchangeAsset.toJSON())}`,
          to_target: "BeExchangeAssetTransaction",
          be_target: "ToExchangeAssetTransaction",
        });
      }
    }
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeAsset",
        });
      }
      const { publicKey } = ciphertextSignature;
      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "beExchangeAsset.ciphertextSignature",
          be_target: "toExchangeAsset.cipherPublicKeys",
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeAsset",
        });
      }
    }

    const { rangeType, range } = toExchangeAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      range.push(toExchangeAssetJson.senderId);
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "beExchangeAssetTransaction",
          be_compare_prop: "toExchangeAssetTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.dappid}`,
          to_target: "beExchangeAssetTransaction",
          be_compare_prop: "toExchangeAssetTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "beExchangeAssetTransaction",
          be_compare_prop: "toExchangeAssetTransaction.range",
        });
      }
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: BeExchangeAssetTransaction) {
    return [transaction.asset.beExchangeAsset.transactionSignature];
  }
}
