import {
  NewTransactionRefuseReason,
  PARENT_ASSET_TYPE,
  ToExchangeAnyTransaction,
} from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  DAPPID_IS_NOT_EXIST,
  ENTITY_IS_NOT_EXIST,
  LOCATION_NAME_IS_NOT_EXIST,
  ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE,
  PROP_IS_INVALID,
} from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class ToExchangeAnyLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAnyTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { sender } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };

    const toExchangeAny = transaction.asset.toExchangeAny;
    const {
      toExchangeChainName,
      toExchangeSource,
      toExchangeParentAssetType,
      toExchangeAssetType,
      beExchangeSource,
      beExchangeChainName,
      beExchangeParentAssetType,
      beExchangeAssetType,
    } = toExchangeAny;

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(
        toExchangeChainName,
        toExchangeSource,
        toExchangeAssetType,
        accountGetterHelper,
      );
      eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);
    } else {
      // 冻结 dappid
      if (toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
        eventLogicVerifier.listenEventFrozenDAppid(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      }
      // 冻结 locationName
      else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        eventLogicVerifier.listenEventFrozenLocationName(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      }
      // 冻结 entity
      else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        eventLogicVerifier.listenEventFrozenEntity(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      }
    }

    if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(
        beExchangeChainName,
        beExchangeSource,
        beExchangeAssetType,
        accountGetterHelper,
      );
    } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
      const memDapp = await accountGetterHelper.getDApp(
        beExchangeSource,
        beExchangeAssetType,
        currentBlockHeight,
      );
      if (!memDapp) {
        throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
          dappid: beExchangeAssetType,
          function: "verify",
        });
      }
    } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
      // 只有顶级域名才能交换
      if (beExchangeAssetType.split(",").length > 2) {
        throw new ConsensusException(ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE, {
          function: "verify",
        });
      }
      const memLocation = await accountGetterHelper.getLocationName(
        beExchangeSource,
        beExchangeAssetType,
        currentBlockHeight,
      );
      if (!memLocation) {
        throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
          locationName: beExchangeAssetType,
          errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          function: "verify",
        });
      }
    } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      const memEntity = await accountGetterHelper.getEntity(
        beExchangeSource,
        beExchangeAssetType,
        currentBlockHeight,
      );
      if (!memEntity) {
        throw new ConsensusException(ENTITY_IS_NOT_EXIST, {
          entityId: beExchangeAssetType,
          errorId: NewTransactionRefuseReason.ENTITY_NOT_EXIST,
          function: "verify",
        });
      }
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
