import { Injectable } from "@bfchain/util";
import {
  BeExchangeAnyMultiTransaction,
  RANGE_TYPE,
  PARENT_ASSET_TYPE,
  NewTransactionRefuseReason,
} from "@bfchain/core-model";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BeExchangeAnyMultiLogicVerifier",
);

@Injectable()
export class BeExchangeAnyMultiLogicVerifier extends TransactionLogicVerifier {
  constructor(public jsbiHelper: JSBIHelper) {
    super();
  }

  async verify(
    transaction: BeExchangeAnyMultiTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    this.__checkTrsFee(transaction);

    const beExchangeAnyMulti = transaction.asset.beExchangeAnyMulti;
    const { transactionSignature } = beExchangeAnyMulti;
    const toExchangeAnyMultiJson = (await this.transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.ToExchangeAnyMultiTransactionJSON | undefined;
    if (!toExchangeAnyMultiJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }

    if (toExchangeAnyMultiJson.type !== this.transactionHelper.TO_EXCHANGE_ANY_MULTI) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeAnyMultiJson.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        be_compare_prop: `senderId ${toExchangeAnyMultiJson.senderId}`,
        to_target: "BeExchangeAnyMultiTransaction",
        be_target: "ToExchangeAnyMultiTransaction",
      });
    }

    this.isDependentTransactionMatch(transaction, toExchangeAnyMultiJson);

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
   * @param toExchangeAnyMultiJson
   */
  isDependentTransactionMatch(
    transaction: BeExchangeAnyMultiTransaction,
    toExchangeAnyMultiJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAnyMultiAssetJSON>,
  ) {
    const {
      toExchangeAssets: prevToExchangeAssets,
      beExchangeAsset: prevBeExchangeAsset,
      cipherPublicKeys,
    } = toExchangeAnyMultiJson.asset.toExchangeAnyMulti;
    const {
      toExchangeAssets: nextToExchangeAssets,
      beExchangeAsset: nextBeExchangeAsset,
      ciphertextSignature,
    } = transaction.asset.beExchangeAnyMulti;

    const prevAssets: {
      [key: string]: {
        toExchangeChainName: string;
        toExchangeParentAssetType: BFChainCore.PARENT_ASSET_TYPE;
        toExchangeAssetPrealnum: string;
        assetExchangeWeightRatio?: BFChainCore.AssetExchangeWeightRatioJSON;
        taxInformation?: BFChainCore.TaxInformationJson;
      };
    } = {};
    for (const toExchangeAsset of prevToExchangeAssets) {
      const {
        toExchangeSource,
        toExchangeChainName,
        toExchangeParentAssetType,
        toExchangeAssetType,
        toExchangeAssetPrealnum,
        assetExchangeWeightRatio,
        taxInformation,
      } = toExchangeAsset;
      prevAssets[`${toExchangeSource}${toExchangeAssetType}`] = {
        toExchangeChainName,
        toExchangeParentAssetType,
        toExchangeAssetPrealnum,
        assetExchangeWeightRatio,
        taxInformation,
      };
    }

    // 基础校验
    for (const toExchangeAsset of nextToExchangeAssets) {
      const {
        toExchangeSource,
        toExchangeChainName,
        toExchangeParentAssetType,
        toExchangeAssetType,
        toExchangeAssetPrealnum,
        assetExchangeWeightRatio,
        taxInformation,
      } = toExchangeAsset;
      const key = `${toExchangeSource}${toExchangeAssetType}`;
      const item = prevAssets[key];
      if (!item) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_INCLUDE, {
          prop: "toExchangeAssets",
          target: "toExchangeAnyMulti",
          value: `toExchangeChainName ${toExchangeChainName} toExchangeSource ${toExchangeSource} toExchangeAssetType ${toExchangeAssetType}`,
        });
      }
      if (
        item.toExchangeChainName !== toExchangeChainName ||
        item.toExchangeParentAssetType !== toExchangeParentAssetType
      ) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify({
            toExchangeSource,
            toExchangeChainName: item.toExchangeChainName,
            toExchangeParentAssetType: item.toExchangeParentAssetType,
            toExchangeAssetType,
          })}`,
          be_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(
            toExchangeAsset.toJSON(),
          )}`,
          to_target: "toExchangeAnyMulti",
          be_target: "beExchangeAnyMulti",
        });
      }
      if (BigInt(toExchangeAssetPrealnum) > BigInt(item.toExchangeAssetPrealnum)) {
        throw new ConsensusException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
          prop: `toExchangeAssets.toExchangeAsset.toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
          target: "beExchangeAnyMulti",
          field: item.toExchangeAssetPrealnum,
        });
      }
      if (item.assetExchangeWeightRatio) {
        if (!assetExchangeWeightRatio) {
          throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
            prop: "assetExchangeWeightRatio",
            target: "beExchangeAnyMulti.beExchangeAsset",
          });
        }
        if (
          item.assetExchangeWeightRatio.toExchangeAssetWeight !==
            assetExchangeWeightRatio.toExchangeAssetWeight ||
          item.assetExchangeWeightRatio.beExchangeAssetWeight !==
            assetExchangeWeightRatio.beExchangeAssetWeight
        ) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify({
              toExchangeSource,
              toExchangeChainName,
              toExchangeAssetType,
            })}`,
            be_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(
              toExchangeAsset.toJSON(),
            )}`,
            to_target: "toExchangeAnyMulti",
            be_target: "beExchangeAnyMulti",
          });
        }
      } else {
        if (assetExchangeWeightRatio) {
          throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "assetExchangeWeightRatio",
            target: "beExchangeAnyMulti.beExchangeAsset",
          });
        }
      }

      if (item.taxInformation) {
        if (!taxInformation) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify({
              toExchangeSource,
              toExchangeChainName,
              toExchangeAssetType,
            })}`,
            be_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(
              toExchangeAsset.toJSON(),
            )}`,
            to_target: "toExchangeAnyMulti",
            be_target: "beExchangeAnyMulti",
          });
        }
        if (
          item.taxInformation.taxCollector !== taxInformation.taxCollector ||
          item.taxInformation.taxAssetPrealnum !== taxInformation.taxAssetPrealnum
        ) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify({
              toExchangeSource,
              toExchangeChainName,
              toExchangeAssetType,
            })}`,
            be_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(
              toExchangeAsset.toJSON(),
            )}`,
            to_target: "toExchangeAnyMulti",
            be_target: "beExchangeAnyMulti",
          });
        }
      } else {
        if (taxInformation) {
          throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "taxInformation",
            target: "BeExchangeAnyMultiTransaction.beExchangeAnyMulti.toExchangeAsset",
          });
        }
      }
    }

    if (
      prevBeExchangeAsset.beExchangeSource !== nextBeExchangeAsset.beExchangeSource ||
      prevBeExchangeAsset.beExchangeChainName !== nextBeExchangeAsset.beExchangeChainName ||
      prevBeExchangeAsset.beExchangeParentAssetType !==
        nextBeExchangeAsset.beExchangeParentAssetType ||
      prevBeExchangeAsset.beExchangeAssetType !== nextBeExchangeAsset.beExchangeAssetType
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `beExchangeAsset: ${JSON.stringify(prevBeExchangeAsset)}`,
        be_compare_prop: `beExchangeAsset: ${JSON.stringify(nextBeExchangeAsset.toJSON())}`,
        to_target: "toExchangeAnyMulti",
        be_target: "beExchangeAnyMulti",
      });
    }

    // 逻辑校验
    const { beExchangeAssetPrealnum, beExchangeParentAssetType } = nextBeExchangeAsset;
    const beapn = BigInt(beExchangeAssetPrealnum as string);
    // 主动解冻
    if (transaction.senderId === transaction.recipientId) {
      for (const toExchangeAsset of nextToExchangeAssets) {
        const { toExchangeParentAssetType, toExchangeAssetPrealnum } = toExchangeAsset;
        // 自己赎回也要大于 0 份
        if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
          if (toExchangeAssetPrealnum === "0") {
            throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
              prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
              field: "0",
              target: "BeExchangeAnyMultiTransaction.beExchangeAnyMulti.toExchangeAssets",
            });
          }
        } else {
          if (toExchangeAssetPrealnum !== "1") {
            throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
              prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
              field: "1",
              target: "BeExchangeAnyMultiTransaction.beExchangeAnyMulti.toExchangeAssets",
            });
          }
        }
      }
      // 主动赎回换到的资产数只能是 0
      if (beExchangeAssetPrealnum !== "0") {
        throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
          prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
          field: "0",
          target: "BeExchangeAnyMultiTransaction.beExchangeAnyMulti.beExchangeAsset",
        });
      }
    }
    // 被动解冻
    else {
      // 被动解冻换到的资产数必须大于 0
      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        let isComplex = false;
        for (const toExchangeAsset of nextToExchangeAssets) {
          const { toExchangeParentAssetType, toExchangeAssetPrealnum, assetExchangeWeightRatio } =
            toExchangeAsset;
          if (toExchangeParentAssetType !== PARENT_ASSET_TYPE.ASSETS) {
            isComplex = true;
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
            if (minBeExchangePrealnum_BI > beapn) {
              throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
                prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
                field: minBeExchangePrealnum_BI.toString(),
                target: "BeExchangeAnyMultiTransaction.beExchangeAnyMulti.beExchangeAsset",
              });
            }
          }
          if (toExchangeAssetPrealnum === "0" && beExchangeAssetPrealnum === "0") {
            throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
              prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
              field: "0",
              target: "BeExchangeAnyMultiTransaction.beExchangeAnyMulti.beExchangeAsset",
            });
          }
        }
        if (isComplex) {
          if (
            prevBeExchangeAsset.beExchangeAssetPrealnum &&
            nextBeExchangeAsset.beExchangeAssetPrealnum
          ) {
            if (
              BigInt(nextBeExchangeAsset.beExchangeAssetPrealnum) <
              BigInt(prevBeExchangeAsset.beExchangeAssetPrealnum)
            ) {
              throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
                prop: `beExchangeAsset.beExchangeAssetPrealnum ${nextBeExchangeAsset.beExchangeAssetPrealnum}`,
                target: "beExchangeAnyMulti",
                field: prevBeExchangeAsset.beExchangeAssetPrealnum,
              });
            }
          }
        }
      }
      // 如果换到的不是可数资产，则只能有 1 份
      else {
        if (beExchangeAssetPrealnum !== "1") {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
            prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            field: "1",
            target: "BeExchangeAnyMultiTransaction.beExchangeAnyMulti.beExchangeAsset",
          });
        }
      }
    }

    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeAnyMulti",
        });
      }
      const { publicKey } = ciphertextSignature;
      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "beExchangeAnyMulti.ciphertextSignature",
          be_target: "toExchangeAnyMulti.cipherPublicKeys",
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeAnyMulti",
        });
      }
    }

    const { rangeType, range } = toExchangeAnyMultiJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "beExchangeAnyMultiTransaction",
          be_compare_prop: "beExchangeAnyMultiTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.senderId}`,
          to_target: "beExchangeAnyMultiTransaction",
          be_compare_prop: "beExchangeAnyMultiTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "beExchangeAnyMultiTransaction",
          be_compare_prop: "beExchangeAnyMultiTransaction.range",
        });
      }
    }
  }

  private __checkTrsFee(transaction: BeExchangeAnyMultiTransaction) {
    const minFee = this.transactionHelper.calcTransactionMinFeeByMulti(
      transaction,
      transaction.asset.beExchangeAnyMulti.toExchangeAssets.length,
    );
    if (BigInt(transaction.fee) < BigInt(minFee)) {
      throw new ConsensusException(ERROR_LIST.TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee,
        target: "transaction",
      });
    }
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: BeExchangeAnyMultiTransaction, byteLength: number) {
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMulti(
          transaction,
          transaction.asset.beExchangeAnyMulti.toExchangeAssets.length,
        ) + this.transactionHelper.calcTransactionBlobFee(transaction)
      ).toString(),
    );
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费和网络手续费
   *
   * @param transaction
   * @param byteLength
   * @param miningMachineMinFeePerByte
   */
  checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: BeExchangeAnyMultiTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMulti(
          transaction,
          transaction.asset.beExchangeAnyMulti.toExchangeAssets.length,
          undefined,
          miningMachineMinFeePerByte,
        ) + this.transactionHelper.calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
      ).toString(),
    );
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: BeExchangeAnyMultiTransaction) {
    const { transactionSignature, toExchangeAssets, beExchangeAsset } =
      transaction.asset.beExchangeAnyMulti;
    const locks: string[] = [transactionSignature];
    const { beExchangeParentAssetType, beExchangeAssetType } = beExchangeAsset;
    for (const toExchangeAsset of toExchangeAssets) {
      const { toExchangeParentAssetType, toExchangeAssetType, taxInformation } = toExchangeAsset;
      if (
        toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
        toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
        toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
      ) {
        locks.push(toExchangeAssetType);
        if (taxInformation) {
          locks.push(taxInformation.taxCollector);
        }
      }
    }
    if (
      beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
      beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(beExchangeAssetType);
      locks.push(beExchangeAssetType);
      if (beExchangeAsset.taxInformation) {
        locks.push(beExchangeAsset.taxInformation.taxCollector);
      }
    }
    return locks;
  }
}
