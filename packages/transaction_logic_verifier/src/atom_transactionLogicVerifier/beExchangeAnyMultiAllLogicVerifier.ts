import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  BeExchangeAnyMultiAllTransaction,
  RANGE_TYPE,
  PARENT_ASSET_TYPE,
  NewTransactionRefuseReason,
} from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { JSBIHelper } from "@bfchain/core-helper-bigint";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BeExchangeAnyMultiAllLogicVerifier",
);

@Injectable()
export class BeExchangeAnyMultiAllLogicVerifier extends TransactionLogicVerifier {
  constructor(public jsbiHelper: JSBIHelper) {
    super();
  }

  async verify(
    transaction: BeExchangeAnyMultiAllTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    this.__checkTrsFee(transaction);

    const beExchangeAnyMultiAll = transaction.asset.beExchangeAnyMultiAll;
    const { transactionSignature } = beExchangeAnyMultiAll;
    const toExchangeAnyMultiAllJson = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.ToExchangeAnyMultiAllTransactionJSON | undefined;
    if (!toExchangeAnyMultiAllJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }

    if (toExchangeAnyMultiAllJson.type !== this.transactionHelper.TO_EXCHANGE_ANY_MULTI_ALL) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeAnyMultiAllJson.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        be_compare_prop: `senderId ${toExchangeAnyMultiAllJson.senderId}`,
        to_target: "BeExchangeAnyMultiAllTransaction",
        be_target: "ToExchangeAnyMultiAllTransaction",
      });
    }

    this.isDependentTransactionMatch(transaction, toExchangeAnyMultiAllJson);

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

    const { toExchangeAssets, beExchangeAssets } = beExchangeAnyMultiAll;

    let alreadyListenAsset = false;
    let alreadyListenPayTax = false;

    let alreadyListenCdp = false;
    let alreadyListenClp = false;
    let alreadyListenCEp = false;

    for (const beExchangeAsset of beExchangeAssets) {
      const { beExchangeParentAssetType, beExchangeAssetPrealnum, taxInformation } =
        beExchangeAsset;
      if (beExchangeAssetPrealnum !== "0") {
        if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
          if (alreadyListenAsset) {
            continue;
          }
          eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);
          alreadyListenAsset = true;
        } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
          if (alreadyListenCdp) {
            continue;
          }
          eventLogicVerifier.listenEventChangeDAppidPossessor(
            currentBlockHeight,
            accountGetterHelper,
            eventEmitter,
          );
          alreadyListenCdp = true;
        } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
          if (alreadyListenClp) {
            continue;
          }
          eventLogicVerifier.listenEventChangeLocationNamePossessor(
            currentBlockHeight,
            accountGetterHelper,
            eventEmitter,
          );
          alreadyListenClp = true;
        } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
          if (alreadyListenCEp) {
            continue;
          }
          eventLogicVerifier.listenEventChangeEntityPossessor(
            currentBlockHeight,
            accountGetterHelper,
            eventEmitter,
          );
          alreadyListenCEp = true;
        } else {
          throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `beExchangeParentAssetType ${beExchangeParentAssetType}`,
            target: "beExchangeAnyMultiAll.beExchangeAssets.beExchangeAsset",
          });
        }
      }

      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        if (alreadyListenPayTax) {
          continue;
        }
        eventLogicVerifier.listenEventPayTax(currentBlockHeight, accountGetterHelper, eventEmitter);
        if (!alreadyListenAsset) {
          continue;
        }
        eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);
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

        if (taxInformation) {
          if (taxInformation.taxAssetPrealnum === "0") {
            if (!alreadyListenAsset) {
              eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);
              alreadyListenAsset = true;
            }
          } else {
            if (!alreadyListenUnfrozenAsset) {
              eventLogicVerifier.listenEventUnfrozenAsset(
                currentBlockHeight,
                accountGetterHelper,
                eventEmitter,
              );
              alreadyListenUnfrozenAsset = true;
            }
          }
        }
      } else {
        throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
          target: "beExchangeAnyMultiAll.toExchangeAssets.toExchangeAsset",
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
  isDependentTransactionMatch(
    transaction: BeExchangeAnyMultiAllTransaction,
    toExchangeAnyMultiJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAnyMultiAllAssetJSON>,
  ) {
    const {
      toExchangeAssets: prevToExchangeAssets,
      beExchangeAssets: prevBeExchangeAssets,
      cipherPublicKeys,
    } = toExchangeAnyMultiJson.asset.toExchangeAnyMultiAll;
    const {
      toExchangeAssets: nextToExchangeAssets,
      beExchangeAssets: nextBeExchangeAssets,
      ciphertextSignature,
    } = transaction.asset.beExchangeAnyMultiAll;

    if (prevToExchangeAssets.length !== nextToExchangeAssets.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `toExchangeAssets.length: ${prevToExchangeAssets.length}`,
        be_compare_prop: `toExchangeAssets.length: ${nextToExchangeAssets.length}`,
        to_target: "toExchangeAnyMultiAll",
        be_target: "beExchangeAnyMultiAll",
      });
    }
    if (prevBeExchangeAssets.length !== nextBeExchangeAssets.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `beExchangeAssets.length: ${prevBeExchangeAssets.length}`,
        be_compare_prop: `beExchangeAssets.length: ${nextBeExchangeAssets.length}`,
        to_target: "toExchangeAnyMultiAll",
        be_target: "beExchangeAnyMultiAll",
      });
    }

    const prevAssets: {
      [key: string]: {
        toExchangeChainName: string;
        toExchangeParentAssetType: BFChainCore.PARENT_ASSET_TYPE;
        toExchangeAssetPrealnum: string;
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
        taxInformation,
      } = toExchangeAsset;
      prevAssets[`${toExchangeSource}${toExchangeAssetType}`] = {
        toExchangeChainName,
        toExchangeParentAssetType,
        toExchangeAssetPrealnum,
        taxInformation,
      };
    }
    const nextAssets: {
      [key: string]: {
        beExchangeChainName: string;
        beExchangeParentAssetType: BFChainCore.PARENT_ASSET_TYPE;
        beExchangeAssetPrealnum: string;
        taxInformation?: BFChainCore.TaxInformationJson;
      };
    } = {};
    for (const beExchangeAsset of prevBeExchangeAssets) {
      const {
        beExchangeSource,
        beExchangeChainName,
        beExchangeParentAssetType,
        beExchangeAssetType,
        beExchangeAssetPrealnum,
        taxInformation,
      } = beExchangeAsset;
      nextAssets[`${beExchangeSource}${beExchangeAssetType}`] = {
        beExchangeChainName,
        beExchangeParentAssetType,
        beExchangeAssetPrealnum,
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
        taxInformation,
      } = toExchangeAsset;
      const key = `${toExchangeSource}${toExchangeAssetType}`;
      const item = prevAssets[key];
      if (!item) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_INCLUDE, {
          prop: "toExchangeAssets",
          target: "toExchangeAnyMultiAll",
          value: `toExchangeChainName ${toExchangeChainName} toExchangeSource ${toExchangeSource} toExchangeAssetType ${toExchangeAssetType}`,
        });
      }
      const toExchangeInfo = {
        toExchangeSource,
        toExchangeChainName: item.toExchangeChainName,
        toExchangeParentAssetType: item.toExchangeParentAssetType,
        toExchangeAssetType,
      };
      if (
        item.toExchangeChainName !== toExchangeChainName ||
        item.toExchangeParentAssetType !== toExchangeParentAssetType
      ) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(toExchangeInfo)}`,
          be_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(
            toExchangeAsset.toJSON(),
          )}`,
          to_target: "toExchangeAnyMultiAll",
          be_target: "beExchangeAnyMultiAll",
        });
      }
      if (toExchangeAssetPrealnum !== item.toExchangeAssetPrealnum) {
        throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
          prop: `toExchangeAssets.toExchangeAsset.toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
          target: "beExchangeAnyMultiAll",
          field: item.toExchangeAssetPrealnum,
        });
      }

      if (item.taxInformation) {
        if (!taxInformation) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(toExchangeInfo)}`,
            be_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(
              toExchangeAsset.toJSON(),
            )}`,
            to_target: "toExchangeAnyMultiAll",
            be_target: "beExchangeAnyMultiAll",
          });
        }
        if (
          item.taxInformation.taxCollector !== taxInformation.taxCollector ||
          item.taxInformation.taxAssetPrealnum !== taxInformation.taxAssetPrealnum
        ) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify({
              ...toExchangeInfo,
              taxInformation: {
                taxCollector: taxInformation.taxCollector,
                taxAssetPrealnum: taxInformation.taxAssetPrealnum,
              },
            })}`,
            be_compare_prop: `toExchangeAssets.toExchangeAsset: ${JSON.stringify(
              toExchangeAsset.toJSON(),
            )}`,
            to_target: "toExchangeAnyMultiAll",
            be_target: "beExchangeAnyMultiAll",
          });
        }
      } else {
        if (taxInformation) {
          throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "taxInformation",
            target: "beExchangeAnyMultiAll.toExchangeAssets.toExchangeAsset",
          });
        }
      }
    }

    for (const beExchangeAsset of nextBeExchangeAssets) {
      const {
        beExchangeSource,
        beExchangeChainName,
        beExchangeParentAssetType,
        beExchangeAssetType,
        beExchangeAssetPrealnum,
        taxInformation,
      } = beExchangeAsset;
      const key = `${beExchangeSource}${beExchangeAssetType}`;
      const item = nextAssets[key];
      if (!item) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_INCLUDE, {
          prop: "beExchangeAssets",
          target: "beExchangeAnyMultiAll",
          value: `beExchangeChainName ${beExchangeChainName} beExchangeSource ${beExchangeSource} beExchangeAssetType ${beExchangeAssetType}`,
        });
      }
      const beExchangeInfo = {
        beExchangeSource,
        beExchangeChainName: item.beExchangeChainName,
        beExchangeParentAssetType: item.beExchangeParentAssetType,
        beExchangeAssetType,
      };
      if (
        beExchangeChainName !== item.beExchangeChainName ||
        beExchangeParentAssetType !== item.beExchangeParentAssetType
      ) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `beExchangeAssets.beExchangeAsset: ${JSON.stringify(beExchangeInfo)}`,
          be_compare_prop: `beExchangeAssets.beExchangeAsset: ${JSON.stringify(
            beExchangeAsset.toJSON(),
          )}`,
          to_target: "toExchangeAnyMultiAll",
          be_target: "beExchangeAnyMultiAll",
        });
      }
      // 主动解冻
      if (transaction.senderId === transaction.recipientId) {
        if (beExchangeAssetPrealnum !== "0") {
          throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
            prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            field: "0",
            target: "beExchangeAnyMultiAll.beExchangeAssets.beExchangeAsset",
          });
        }
      }
      // 被动解冻
      else {
        if (beExchangeAssetPrealnum !== item.beExchangeAssetPrealnum) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `beExchangeAssets.beExchangeAsset: ${JSON.stringify(beExchangeInfo)}`,
            be_compare_prop: `beExchangeAssets.beExchangeAsset: ${JSON.stringify(
              beExchangeAsset.toJSON(),
            )}`,
            to_target: "toExchangeAnyMultiAll",
            be_target: "beExchangeAnyMultiAll",
          });
        }
      }
      if (item.taxInformation) {
        if (!taxInformation) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `beExchangeAssets.beExchangeAsset: ${JSON.stringify(beExchangeInfo)}`,
            be_compare_prop: `beExchangeAssets.beExchangeAsset: ${JSON.stringify(
              beExchangeAsset.toJSON(),
            )}`,
            to_target: "toExchangeAnyMultiAll",
            be_target: "beExchangeAnyMultiAll",
          });
        }
        if (
          item.taxInformation.taxCollector !== taxInformation.taxCollector ||
          item.taxInformation.taxAssetPrealnum !== taxInformation.taxAssetPrealnum
        ) {
          throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `beExchangeAssets.beExchangeAsset: ${JSON.stringify({
              ...beExchangeInfo,
              taxInformation: {
                taxCollector: taxInformation.taxCollector,
                taxAssetPrealnum: taxInformation.taxAssetPrealnum,
              },
            })}`,
            be_compare_prop: `beExchangeAssets.beExchangeAsset: ${JSON.stringify(
              beExchangeAsset.toJSON(),
            )}`,
            to_target: "toExchangeAnyMultiAll",
            be_target: "beExchangeAnyMultiAll",
          });
        }
      } else {
        if (taxInformation) {
          throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "taxInformation",
            target: "beExchangeAnyMultiAll.beExchangeAssets.beExchangeAsset",
          });
        }
      }
    }

    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeAnyMultiAll",
        });
      }
      const { publicKey } = ciphertextSignature;
      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "beExchangeAnyMultiAll.ciphertextSignature",
          be_target: "toExchangeAnyMultiAll.cipherPublicKeys",
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "beExchangeAnyMultiAll",
        });
      }
    }

    const { rangeType, range } = toExchangeAnyMultiJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "beExchangeAnyMultiAllTransaction",
          be_compare_prop: "beExchangeAnyMultiAllTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.senderId}`,
          to_target: "beExchangeAnyMultiAllTransaction",
          be_compare_prop: "beExchangeAnyMultiAllTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "beExchangeAnyMultiAllTransaction",
          be_compare_prop: "beExchangeAnyMultiAllTransaction.range",
        });
      }
    }
  }

  private __checkTrsFee(transaction: BeExchangeAnyMultiAllTransaction) {
    const { toExchangeAssets, beExchangeAssets } = transaction.asset.beExchangeAnyMultiAll;
    const minFee = this.transactionHelper.calcTransactionMinFeeByMulti(
      transaction,
      toExchangeAssets.length + beExchangeAssets.length,
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
  checkTrsFeeAndWebFee(transaction: BeExchangeAnyMultiAllTransaction, byteLength: number) {
    const { toExchangeAssets, beExchangeAssets } = transaction.asset.beExchangeAnyMultiAll;
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMulti(
          transaction,
          toExchangeAssets.length + beExchangeAssets.length,
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
    transaction: BeExchangeAnyMultiAllTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    const { toExchangeAssets, beExchangeAssets } = transaction.asset.beExchangeAnyMultiAll;
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMulti(
          transaction,
          toExchangeAssets.length + beExchangeAssets.length,
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
  getLockData(transaction: BeExchangeAnyMultiAllTransaction) {
    const { transactionSignature, toExchangeAssets, beExchangeAssets } =
      transaction.asset.beExchangeAnyMultiAll;
    const locks: string[] = [transactionSignature];
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
    for (const beExchangeAsset of beExchangeAssets) {
      const { beExchangeParentAssetType, beExchangeAssetType, taxInformation } = beExchangeAsset;
      if (
        beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
        beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
        beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
      ) {
        locks.push(beExchangeAssetType);
        locks.push(beExchangeAssetType);
        if (taxInformation) {
          locks.push(taxInformation.taxCollector);
        }
      }
    }
    return locks;
  }
}
