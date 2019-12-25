import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  ToExchangeSpecialAssetTransaction,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
  NewTransactionRefuseReason,
  LOCATION_NAME_LEVEL,
  ASSET_STATUS,
} from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  ASSET_NOT_EXIST,
  DAPPID_IS_NOT_EXIST,
  NO_NEED_TO_PURCHASE_SPECIAL_ASSET,
  LOCATION_NAME_IS_NOT_EXIST,
  ACCOUNT_NOT_DAPPID_POSSESSOR,
  DAPPID_ALREADY_FROZEN,
  ACCOUNT_NOT_LOCATION_NAME_POSSESSOR,
  LOCATION_NAME_ALREADY_FROZEN,
  ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class ToExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeSpecialAssetTransaction,
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
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const toExchangeSpecialAssetAsset = transaction.asset.toExchangeSpecialAsset;
    const { senderId } = transaction;
    const {
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeAsset,
      exchangeDirection,
      exchangeAssetType,
    } = toExchangeSpecialAssetAsset;
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      const memToAssets = await accountGetterHelper.getAsset(toExchangeSource, toExchangeAsset);
      if (!memToAssets) {
        // 不存在的资产不能被交换
        throw new ConsensusException(ASSET_NOT_EXIST, {
          magic: toExchangeSource,
          assetType: toExchangeAsset,
          ...Function_Exception_Detail,
        });
      }
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        const memDapp = (await accountGetterHelper.getDApp(
          beExchangeSource,
          beExchangeAsset,
          currentBlockHeight,
        )) as BFChainCore.DAppInfo | undefined;
        if (!memDapp) {
          throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
            dappid: beExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        if (memDapp.possessorAddress === senderId) {
          throw new ConsensusException(NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
            type: "dappid",
            asset: beExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        // 域名是否存在
        const memLocation = (await accountGetterHelper.getLocationName(
          beExchangeSource,
          beExchangeAsset,
          currentBlockHeight,
        )) as BFChainCore.LocationNameInfo | undefined;
        if (!memLocation) {
          throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
            locationName: beExchangeAsset,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
            ...Function_Exception_Detail,
          });
        }
        if (memLocation.possessorAddress === senderId) {
          throw new ConsensusException(NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
            type: "locationName",
            asset: beExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        // 只有顶级域名能交换
        if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
          throw new ConsensusException(ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE, {
            ...Function_Exception_Detail,
          });
        }
      }
    } else {
      const memBeAssets = await accountGetterHelper.getAsset(beExchangeSource, beExchangeAsset);
      if (!memBeAssets) {
        // 不存在的资产不能被交换
        throw new ConsensusException(ASSET_NOT_EXIST, {
          magic: beExchangeSource,
          assetType: beExchangeAsset,
          ...Function_Exception_Detail,
        });
      }
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        const memDapp = (await accountGetterHelper.getDApp(
          toExchangeSource,
          toExchangeAsset,
          currentBlockHeight,
        )) as BFChainCore.DAppInfo | undefined;
        if (!memDapp) {
          throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
            dappid: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        if (memDapp.possessorAddress !== senderId) {
          throw new ConsensusException(ACCOUNT_NOT_DAPPID_POSSESSOR, {
            address: senderId,
            dappid: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        if (memDapp.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(DAPPID_ALREADY_FROZEN, {
            dappid: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        // 域名是否存在
        const memLocation = (await accountGetterHelper.getLocationName(
          toExchangeSource,
          toExchangeAsset,
          currentBlockHeight,
        )) as BFChainCore.LocationNameInfo | undefined;
        if (!memLocation) {
          throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
            locationName: toExchangeAsset,
            errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
            ...Function_Exception_Detail,
          });
        }
        if (memLocation.possessorAddress !== senderId) {
          throw new ConsensusException(ACCOUNT_NOT_LOCATION_NAME_POSSESSOR, {
            address: senderId,
            locationName: toExchangeAsset,
            errorId: NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
            ...Function_Exception_Detail,
          });
        }
        if (memLocation.status === ASSET_STATUS.FROZEN) {
          throw new ConsensusException(LOCATION_NAME_ALREADY_FROZEN, {
            locationName: toExchangeAsset,
            ...Function_Exception_Detail,
          });
        }
        // 只有顶级域名能交换
        if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
          throw new ConsensusException(ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE, {
            ...Function_Exception_Detail,
          });
        }
      }
    }

    return true;
  }
}
