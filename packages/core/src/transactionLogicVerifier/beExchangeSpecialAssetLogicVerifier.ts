import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  BeExchangeSpecialAssetTransaction,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
  NewTransactionRefuseReason,
  ASSET_STATUS,
} from "../../model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  NOT_BEGIN_UNFROZEN_YET,
  FROZEN_ASSET_EXPIRATION,
  DAPPID_IS_NOT_EXIST,
  LOCATION_NAME_IS_NOT_EXIST,
  ACCOUNT_NOT_DAPPID_POSSESSOR,
  ACCOUNT_NOT_LOCATION_NAME_POSSESSOR,
  DAPPID_NOT_FROZEN,
  LOCATION_NAME_NOT_FROZEN,
  NO_NEED_TO_PURCHASE_SPECIAL_ASSET,
  CAN_NOT_SECONDARY_TRANSACTION,
} from "@bfchain/core-helper";

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

    // await this.checkSecondaryTransaction(transaction, transactionGetterHelper);

    const beExchangeSpecialAsset = transaction.asset.beExchangeSpecialAsset;
    const { transactionSignature } = beExchangeSpecialAsset;
    const toExchangeSpecialAssetJson = (await transactionGetterHelper.getTransactionById(
      transactionSignature,
    )) as BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON> | undefined;
    if (!toExchangeSpecialAssetJson) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `Transaction with id ${transactionSignature}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    this.isValidRecipientId(transaction, toExchangeSpecialAssetJson);
    this.isDependentTransactionMatch(transaction, toExchangeSpecialAssetJson);
    await this.isValidToUnfrozenAsset(
      transaction,
      toExchangeSpecialAssetJson,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

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

    if (toExchangeSpecialAssetJson.numberOfEffectiveBlocks) {
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
  }

  /**
   * 能否正常解冻资产
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   * @param currentBlockHeight
   */
  async isValidToUnfrozenAsset(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<
      BFChainCore.ToExchangeSpecialAssetAssetJSON
    >,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isValidToUnfrozenAsset",
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
    const {
      exchangeSpecialAsset,
      applyBlockHeight,
      // numberOfBeginUnfrozenBlocks,
      numberOfEffectiveBlocks,
    } = transaction.asset.beExchangeSpecialAsset;

    const {
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeAsset,
      exchangeAssetType,
      exchangeDirection,
    } = exchangeSpecialAsset;
    // 交易是否开始解冻
    if (applyBlockHeight > transaction.applyBlockHeight) {
      throw new ConsensusException(NOT_BEGIN_UNFROZEN_YET, {
        frozenId: toExchangeSpecialAssetJson.signature,
        ...Function_Exception_Detail,
      });
    }

    const senderId = transaction.senderId;

    let maxEffectiveHeight =
      applyBlockHeight + this.configHelper.maxApplyAndConfirmedBlockHeightDiff;

    // 交易交易是否过期
    if (currentBlockHeight > maxEffectiveHeight) {
      throw new ConsensusException(FROZEN_ASSET_EXPIRATION, {
        frozenId: toExchangeSpecialAssetJson.signature,
        ...Function_Exception_Detail,
      });
    }

    if (maxEffectiveHeight < transaction.applyBlockHeight) {
      throw new ConsensusException(FROZEN_ASSET_EXPIRATION, {
        frozenId: toExchangeSpecialAssetJson.signature,
        ...Function_Exception_Detail,
      });
    }

    // 校验资产
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        const memDapp = (await accountGetterHelper.getDApp(
          beExchangeSource,
          beExchangeAsset,
          currentBlockHeight,
        )) as BFChainCore.DAppInfo;
        if (!memDapp) {
          throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
            dappid: beExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        if (memDapp.possessorAddress !== senderId) {
          throw new ConsensusException(ACCOUNT_NOT_DAPPID_POSSESSOR, {
            address: senderId,
            dappid: beExchangeAsset,
            errorId: NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
            ...Function_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        // 域名是否存在
        const memLocation = (await accountGetterHelper.getLocationName(
          beExchangeSource,
          beExchangeAsset,
          currentBlockHeight,
        )) as BFChainCore.LocationNameInfo;
        if (!memLocation) {
          throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
            locationName: beExchangeAsset,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
            ...Function_Exception_Detail,
          });
        }
        if (memLocation.possessorAddress !== senderId) {
          throw new ConsensusException(ACCOUNT_NOT_LOCATION_NAME_POSSESSOR, {
            address: senderId,
            locationName: beExchangeAsset,
            errorId: NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
            ...Function_Exception_Detail,
          });
        }
      }
    } else {
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        const memDapp = (await accountGetterHelper.getDApp(
          toExchangeSource,
          toExchangeAsset,
          currentBlockHeight,
        )) as BFChainCore.DAppInfo;
        if (!memDapp) {
          throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
            dappid: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        if (memDapp.status === ASSET_STATUS.NORMAL) {
          throw new ConsensusException(DAPPID_NOT_FROZEN, {
            dappid: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        if (memDapp.possessorAddress === senderId) {
          throw new ConsensusException(NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
            type: "dappid",
            asset: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        // 域名是否存在
        const memLocation = (await accountGetterHelper.getLocationName(
          toExchangeSource,
          toExchangeAsset,
          currentBlockHeight,
        )) as BFChainCore.LocationNameInfo;
        if (!memLocation) {
          throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
            locationName: toExchangeAsset,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
            ...Function_Exception_Detail,
          });
        }
        if (memLocation.status === ASSET_STATUS.NORMAL) {
          throw new ConsensusException(LOCATION_NAME_NOT_FROZEN, {
            locationName: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        if (memLocation.possessorAddress === senderId) {
          throw new ConsensusException(NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
            type: "locationName",
            asset: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
      }
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
