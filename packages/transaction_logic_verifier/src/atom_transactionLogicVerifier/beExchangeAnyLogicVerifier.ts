import { Injectable, Inject } from "@bfchain/util";
import {
  ToExchangeAnyTransaction,
  BeExchangeAnyTransaction,
  RANGE_TYPE,
  PARENT_ASSET_TYPE,
} from "@bfchain/core-model";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { TransactionCore } from "@bfchain/core-transaction";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BeExchangeAnyLogicVerifier",
);

@Injectable()
export class BeExchangeAnyLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;

  constructor(public jsbiHelper: JSBIHelper) {
    super();
  }

  async verify(
    transaction: BeExchangeAnyTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfo>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const beExchangeAny = transaction.asset.beExchangeAny;
    const { transactionSignature } = beExchangeAny;
    const toExchangeAnyTransactionJson =
      await this.transactionGetterHelper.getTransactionBySignature(
        transactionSignature,
        this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
      );
    if (!toExchangeAnyTransactionJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }
    const model = await this.transactionCore.recombineTransaction(toExchangeAnyTransactionJson);
    const toExchangeAnyTransaction = model.as(ToExchangeAnyTransaction, transactionSignature);
    if (!toExchangeAnyTransaction) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }
    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeAnyTransaction.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        be_compare_prop: `senderId ${toExchangeAnyTransaction.senderId}`,
        to_target: "BeExchangeAnyTransaction",
        be_target: "ToExchangeAnyTransaction",
      });
    }

    this.isDependentTransactionMatch(transaction, toExchangeAnyTransaction);

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeAnyTransaction
   */
  isDependentTransactionMatch(
    transaction: BeExchangeAnyTransaction,
    toExchangeAnyTransaction: ToExchangeAnyTransaction,
  ) {
    const beExchangeAny = transaction.asset.beExchangeAny;
    const { exchangeAny, ciphertextSignature } = beExchangeAny;
    const { cipherPublicKeys, assetExchangeWeightRatio, taxInformation } = exchangeAny;
    const trsAsset = toExchangeAnyTransaction.asset.toExchangeAny;
    if (
      trsAsset.toExchangeSource !== exchangeAny.toExchangeSource ||
      trsAsset.beExchangeSource !== exchangeAny.beExchangeSource ||
      trsAsset.toExchangeParentAssetType !== exchangeAny.toExchangeParentAssetType ||
      trsAsset.beExchangeParentAssetType !== exchangeAny.beExchangeParentAssetType ||
      trsAsset.toExchangeAssetType !== exchangeAny.toExchangeAssetType ||
      trsAsset.beExchangeAssetType !== exchangeAny.beExchangeAssetType ||
      trsAsset.toExchangeAssetPrealnum !== exchangeAny.toExchangeAssetPrealnum
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
        to_target: "BeExchangeAnyTransaction",
        be_target: "ToExchangeAnyTransaction",
      });
    }
    if (trsAsset.beExchangeAssetPrealnum) {
      if (!exchangeAny.beExchangeAssetPrealnum) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
          to_target: "BeExchangeAnyTransaction",
          be_target: "ToExchangeAnyTransaction",
        });
      }
      if (trsAsset.beExchangeAssetPrealnum !== exchangeAny.beExchangeAssetPrealnum) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
          to_target: "BeExchangeAnyTransaction",
          be_target: "ToExchangeAnyTransaction",
        });
      }
    } else {
      if (exchangeAny.beExchangeAssetPrealnum) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "beExchangeAssetPrealnum",
          target: "BeExchangeAnyTransaction.beExchangeAny.exchangeAny",
        });
      }
    }

    if (trsAsset.assetExchangeWeightRatio) {
      if (!assetExchangeWeightRatio) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
          to_target: "BeExchangeAnyTransaction",
          be_target: "ToExchangeAnyTransaction",
        });
      }
      if (
        trsAsset.assetExchangeWeightRatio.toExchangeAssetWeight !==
          assetExchangeWeightRatio.toExchangeAssetWeight ||
        trsAsset.assetExchangeWeightRatio.beExchangeAssetWeight !==
          assetExchangeWeightRatio.beExchangeAssetWeight
      ) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
          to_target: "BeExchangeAnyTransaction",
          be_target: "ToExchangeAnyTransaction",
        });
      }
    } else {
      if (assetExchangeWeightRatio) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "assetExchangeWeightRatio",
          target: "BeExchangeAnyTransaction.beExchangeAny.exchangeAny",
        });
      }
    }

    if (trsAsset.taxInformation) {
      if (!taxInformation) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
          to_target: "BeExchangeAnyTransaction",
          be_target: "ToExchangeAnyTransaction",
        });
      }
      if (
        trsAsset.taxInformation.taxCollector !== taxInformation.taxCollector ||
        trsAsset.taxInformation.taxAssetPrealnum !== taxInformation.taxAssetPrealnum
      ) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
          to_target: "BeExchangeAnyTransaction",
          be_target: "ToExchangeAnyTransaction",
        });
      }
    } else {
      if (taxInformation) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "taxInformation",
          target: "BeExchangeAnyTransaction.beExchangeAny.exchangeAny",
        });
      }
    }

    if (trsAsset.cipherPublicKeys.length !== cipherPublicKeys.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
        to_target: "BeExchangeAnyTransaction",
        be_target: "ToExchangeAnyTransaction",
      });
    }
    for (const pk of trsAsset.cipherPublicKeys) {
      if (!cipherPublicKeys.includes(pk)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
          be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
          to_target: "BeExchangeAnyTransaction",
          be_target: "ToExchangeAnyTransaction",
        });
      }
    }
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeAny",
        });
      }
      const { publicKey } = ciphertextSignature;
      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "beExchangeAny.ciphertextSignature",
          be_target: "toExchangeAny.cipherPublicKeys",
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeAny",
        });
      }
    }

    const { toExchangeAssetPrealnum, beExchangeAssetPrealnum } = beExchangeAny;
    if (transaction.senderId === transaction.recipientId) {
      // 主动解冻
      if (exchangeAny.toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        // 可数资产自己赎回也要大于 0 份
        if (toExchangeAssetPrealnum === "0") {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
            prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
            field: "0",
            target: "beExchangeAny",
          });
        }
      } else {
        // 不可数资产只有 1 份
        if (toExchangeAssetPrealnum !== "1") {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
            prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
            field: "1",
            target: "beExchangeAny",
          });
        }
      }
      if (beExchangeAssetPrealnum !== "0") {
        throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
          prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
          field: "0",
          target: "beExchangeAny",
        });
      }
    } else {
      // 被动解冻
      if (toExchangeAssetPrealnum === "0" && beExchangeAssetPrealnum === "0") {
        throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
          prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
          field: "0",
          target: "beExchangeAny",
        });
      }
      if (assetExchangeWeightRatio) {
        // 按比例计算验证是否满足最少需要付的钱，允许多付钱
        // 这里是用 to 算 be，所以是 to / 兑换比例，即 to * 兑换比例的倒数
        const minBeExchangePrealnum_BI = this.jsbiHelper.multiplyRoundFraction(
          toExchangeAssetPrealnum,
          {
            numerator: assetExchangeWeightRatio.beExchangeAssetWeight,
            denominator: assetExchangeWeightRatio.toExchangeAssetWeight,
          },
        );
        if (minBeExchangePrealnum_BI > BigInt(beExchangeAssetPrealnum)) {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
            prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            field: minBeExchangePrealnum_BI.toString(),
            target: "beExchangeAny",
          });
        }
      } else {
        // 允许多付钱
        if (exchangeAny.beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
          // 这里的 to 就是 to 交易发起人给出权益，be 是 be 交易发起人给出的权益
          if (
            BigInt(beExchangeAssetPrealnum) < BigInt(exchangeAny.beExchangeAssetPrealnum as string)
          ) {
            throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
              prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
              field: exchangeAny.beExchangeAssetPrealnum,
              target: "beExchangeAny",
            });
          }
        } else {
          if (beExchangeAssetPrealnum !== "1") {
            throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
              prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
              field: "1",
              target: "beExchangeAny",
            });
          }
        }
      }
    }

    const { rangeType, range } = toExchangeAnyTransaction;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "beExchangeAnyTransaction",
          be_compare_prop: "beExchangeAnyTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.senderId}`,
          to_target: "beExchangeAnyTransaction",
          be_compare_prop: "beExchangeAnyTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "beExchangeAnyTransaction",
          be_compare_prop: "beExchangeAnyTransaction.range",
        });
      }
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: BeExchangeAnyTransaction) {
    const { transactionSignature, exchangeAny, taxInformation } = transaction.asset.beExchangeAny;
    const { toExchangeParentAssetType, beExchangeParentAssetType } = exchangeAny;
    const locks: string[] = [transactionSignature];
    if (
      toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
      toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(exchangeAny.toExchangeAssetType);
      if (exchangeAny.taxInformation) {
        locks.push(exchangeAny.taxInformation.taxCollector);
      }
    }
    if (
      beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
      beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(exchangeAny.beExchangeAssetType);
      if (taxInformation) {
        locks.push(taxInformation.taxCollector);
      }
    }
    return locks;
  }
}
