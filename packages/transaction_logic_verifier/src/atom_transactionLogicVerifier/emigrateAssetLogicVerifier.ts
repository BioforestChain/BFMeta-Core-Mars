import { EmigrateAssetTransaction, NewTransactionRefuseReason } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  NEED_EMIGRATE_TOTAL_ASSET,
  PROP_IS_REQUIRE,
  CAN_NOT_CARRY_SECOND_PUBLICKEY,
  CAN_NOT_CARRY_SECOND_SIGNATURE,
  VOTE_RECENTLY,
  POSSESS_FROZEN_ASSET,
  MIGRATE_MAIN_ASSET_ONLY,
  DELEGATE_CAN_NOT_MIGRATE_ASSET,
} from "@bfchain/core-util-exception";
import { AccountBaseHelper } from "@bfchain/core-helper";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "EmigrateAssetLogicVerifier");

@Injectable()
export class EmigrateAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper)
    protected accountBaseHelper: AccountBaseHelper,
  ) {
    super();
  }

  async verify(
    transaction: EmigrateAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;

    if (accountsInfo.sender.accountInfo.isDelegate) {
      throw new ConsensusException(DELEGATE_CAN_NOT_MIGRATE_ASSET, {
        ...Function_Exception_Detail,
      });
    }

    const emigrateAsset = transaction.asset.emigrateAsset;
    const assetType = emigrateAsset.assetType;
    const magic = emigrateAsset.fromChain.magic;
    if (!(magic === this.configHelper.magic && assetType === this.configHelper.assetType)) {
      throw new ConsensusException(MIGRATE_MAIN_ASSET_ONLY, {
        assetType,
        mainAsset: this.configHelper.assetType,
        errorId: NewTransactionRefuseReason.MIGRATE_MAIN_ASSET_ONLY,
        function: "verify",
      });
    }

    const { publicKey, secondPublicKey, signSignature } = emigrateAsset.signatureJson;
    const address = await this.accountBaseHelper.getAddressFromPublicKeyString(publicKey);
    const delegate = await accountGetterHelper.getAccountInfo(address);

    if (!delegate) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Account with address ${address}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    if (delegate.secondPublicKey) {
      if (!secondPublicKey) {
        throw new ConsensusException(PROP_IS_REQUIRE, {
          prop: `secondPublicKey`,
          target: "genesisDelegateSignature",
          ...Function_Exception_Detail,
        });
      }
      if (!signSignature) {
        throw new ConsensusException(PROP_IS_REQUIRE, {
          prop: `signSignature`,
          target: "genesisDelegateSignature",
          ...Function_Exception_Detail,
        });
      }
      if (delegate.secondPublicKey !== secondPublicKey) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `secondPublicKey ${delegate.secondPublicKey}`,
          be_compare_prop: `secondPublicKey ${secondPublicKey}`,
          to_target: "transaction",
          be_target: "delegate",
          ...Function_Exception_Detail,
        });
      }
    } else {
      if (secondPublicKey) {
        throw new ConsensusException(CAN_NOT_CARRY_SECOND_PUBLICKEY, {
          ...Function_Exception_Detail,
        });
      }
      if (signSignature) {
        throw new ConsensusException(CAN_NOT_CARRY_SECOND_SIGNATURE, {
          signature: transaction.signature,
          senderId: transaction.senderId,
          applyBlockHeight: transaction.applyBlockHeight,
          type: transaction.type,
          ...Function_Exception_Detail,
        });
      }
    }

    const { sender, recipient } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const senderId = transaction.senderId;
    const cloneAccountsAssets = {
      [senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };
    const cloneAccountsInfo = {
      [senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
      cloneAccountsInfo[address] = this.helperLogicVerifier.deepClone(recipient.accountInfo);
    }

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    eventLogicVerifier.listenEventFrozenAccount(cloneAccountsInfo, eventEmitter);

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    const assets = sender.accountAssets;

    const isVote = await accountGetterHelper.isVoteRecently(
      senderId,
      this.blockHelper.calcRoundByHeight(currentBlockHeight),
    );
    if (isVote) {
      throw new ConsensusException(VOTE_RECENTLY, {
        ...Function_Exception_Detail,
      });
    }

    const isFrozenAsset = await accountGetterHelper.isFrozenAsset(senderId);
    if (isFrozenAsset) {
      throw new ConsensusException(POSSESS_FROZEN_ASSET, {
        ...Function_Exception_Detail,
      });
    }

    await this.helperLogicVerifier.isPossessAssetExceptChainAsset(
      senderId,
      assets,
      accountGetterHelper,
    );

    await this.helperLogicVerifier.isDAppPossessor(
      senderId,
      this.configHelper,
      accountGetterHelper,
    );

    await this.helperLogicVerifier.isLnsPossessorOrManager(
      senderId,
      this.configHelper,
      accountGetterHelper,
    );

    const totalSpend = BigInt(transaction.fee) + BigInt(emigrateAsset.assets);

    if (assets[magic][assetType].assetNumber !== totalSpend) {
      throw new ConsensusException(NEED_EMIGRATE_TOTAL_ASSET, {
        address: senderId,
        ...Function_Exception_Detail,
      });
    }

    return true;
  }
}
