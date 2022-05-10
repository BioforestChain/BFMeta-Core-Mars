import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  BeExchangeAnyMultiTransaction,
  RANGE_TYPE,
  PARENT_ASSET_TYPE,
  NewTransactionRefuseReason,
} from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BeExchangeAnyMultiLogicVerifier",
);

@Injectable()
export class BeExchangeAnyMultiLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: BeExchangeAnyMultiTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    this.__checkTrsFee(transaction);

    const beExchangeAnyMulti = transaction.asset.beExchangeAnyMulti;
    const { transactionSignature } = beExchangeAnyMulti;
    const toExchangeAnyJson = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.ToExchangeAnyMultiTransactionJSON | undefined;
    if (!toExchangeAnyJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }

    if (toExchangeAnyJson.type !== this.transactionHelper.TO_EXCHANGE_ANY_MULTI) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeAnyJson.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `BeExchangeAnyMultiTransaction.recipientId ${transaction.recipientId}`,
        be_compare_prop: `ToExchangeAnyTransaction.senderId ${toExchangeAnyJson.senderId}`,
        to_target: "BeExchangeAnyMultiTransaction",
        be_target: "ToExchangeAnyTransaction",
      });
    }

    this.isDependentTransactionMatch(transaction, toExchangeAnyJson);

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

    const { toExchangeAssets, beExchangeAsset } = beExchangeAnyMulti;

    const { beExchangeParentAssetType, taxInformation } = beExchangeAsset;

    if (beExchangeAnyMulti.beExchangeAssetPrealnum !== "0") {
      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);
      } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
        eventLogicVerifier.listenEventChangeDAppidPossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        eventLogicVerifier.listenEventChangeLocationNamePossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        eventLogicVerifier.listenEventChangeEntityPossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );

        eventLogicVerifier.listenEventPayTax(currentBlockHeight, accountGetterHelper, eventEmitter);

        if (taxInformation && taxInformation.taxAssetPrealnum !== "0") {
          eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);
        }
      } else {
        throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `beExchangeParentAssetType ${beExchangeParentAssetType}`,
          target: "transaction.asset.beExchangeAnyMulti.toExchangeAssets.beExchangeAsset",
        });
      }
    }

    let alreadyListenUnfrozenAsset = false;
    let alreadyListenUnfrozenDAppid = false;
    let alreadyListenUnfrozenLocationName = false;
    let alreadyListenUnfrozenEntity = false;

    for (const toExchangeAsset of toExchangeAssets) {
      const { toExchangeParentAssetType, taxInformation } = toExchangeAsset;
      if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        if (alreadyListenUnfrozenAsset) {
          continue;
        }
        eventLogicVerifier.listenEventUnfrozenAsset(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
        alreadyListenUnfrozenAsset = true;
      } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
        if (alreadyListenUnfrozenDAppid) {
          continue;
        }
        eventLogicVerifier.listenEventUnfrozenDAppid(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
        alreadyListenUnfrozenDAppid = true;
      } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        if (alreadyListenUnfrozenLocationName) {
          continue;
        }
        eventLogicVerifier.listenEventUnfrozenLocationName(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
        alreadyListenUnfrozenLocationName = true;
      } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        if (!alreadyListenUnfrozenEntity) {
          eventLogicVerifier.listenEventUnfrozenEntity(
            currentBlockHeight,
            accountGetterHelper,
            eventEmitter,
          );
          alreadyListenUnfrozenEntity = true;
        }

        if (taxInformation && taxInformation.taxAssetPrealnum !== "0") {
          if (!alreadyListenUnfrozenAsset) {
            eventLogicVerifier.listenEventUnfrozenAsset(
              currentBlockHeight,
              accountGetterHelper,
              eventEmitter,
            );
            alreadyListenUnfrozenAsset = true;
          }
        }
      } else {
        throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
          target: "transaction.asset.beExchangeAnyMulti.toExchangeAssets.toExchangeAsset",
        });
      }
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
  private isDependentTransactionMatch(
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

    let isBeExchangeMulti =
      prevBeExchangeAsset.beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS;
    if (!isBeExchangeMulti) {
      if (prevToExchangeAssets.length !== nextToExchangeAssets.length) {
        throw new ConsensusException(ERROR_LIST.PROP_LENGTH_SHOULD_EQ_FIELD, {
          prop: "toExchangeAssets",
          target: "beExchangeAnyMulti",
          field: prevToExchangeAssets.length,
        });
      }
    }

    const prevAssets: {
      [key: string]: {
        toExchangeAssetPrealnum: string;
        assetExchangeWeightRatio?: BFChainCore.AssetExchangeWeightRatioJSON;
      };
    } = {};
    for (const toExchangeAsset of prevToExchangeAssets) {
      const {
        toExchangeSource,
        toExchangeAssetType,
        toExchangeAssetPrealnum,
        assetExchangeWeightRatio,
      } = toExchangeAsset;
      prevAssets[`${toExchangeSource}${toExchangeAssetType}`] = {
        toExchangeAssetPrealnum,
        assetExchangeWeightRatio,
      };
    }

    for (const toExchangeAsset of nextToExchangeAssets) {
      const {
        toExchangeSource,
        toExchangeChainName,
        toExchangeAssetType,
        toExchangeAssetPrealnum,
        assetExchangeWeightRatio,
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
      if (isBeExchangeMulti) {
        if (BigInt(toExchangeAssetPrealnum) > BigInt(item.toExchangeAssetPrealnum)) {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
            prop: `toExchangeAssets.toExchangeAsset ${toExchangeAssetPrealnum}`,
            target: "beExchangeAnyMulti",
            field: item.toExchangeAssetPrealnum,
          });
        }
      } else {
        if (toExchangeAssetPrealnum !== item.toExchangeAssetPrealnum) {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
            prop: `toExchangeAssets.toExchangeAsset ${toExchangeAssetPrealnum}`,
            target: "beExchangeAnyMulti",
            field: item.toExchangeAssetPrealnum,
          });
        }
      }
      if (item.assetExchangeWeightRatio && !assetExchangeWeightRatio) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "assetExchangeWeightRatio",
          target: "beExchangeAnyMulti.beExchangeAsset",
        });
      }
      if (!item.assetExchangeWeightRatio && assetExchangeWeightRatio) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "assetExchangeWeightRatio",
          target: "beExchangeAnyMulti.beExchangeAsset",
        });
      }
      if (item.assetExchangeWeightRatio && assetExchangeWeightRatio) {
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
      }
    }

    if (
      prevBeExchangeAsset.beExchangeSource !== nextBeExchangeAsset.beExchangeSource ||
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
    }

    const { rangeType, range } = toExchangeAnyMultiJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      range.push(toExchangeAnyMultiJson.senderId);
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
      this.transactionHelper.calcTransactionMinFeeByMulti(
        transaction,
        transaction.asset.beExchangeAnyMulti.toExchangeAssets.length,
      ),
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
      this.transactionHelper.calcTransactionMinFeeByMulti(
        transaction,
        transaction.asset.beExchangeAnyMulti.toExchangeAssets.length,
        undefined,
        miningMachineMinFeePerByte,
      ),
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
