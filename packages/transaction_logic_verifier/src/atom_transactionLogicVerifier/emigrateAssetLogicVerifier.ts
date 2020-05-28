import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { EmigrateAssetTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  NEED_EMIGRATE_TOTAL_ASSET,
  PROP_IS_REQUIRE,
  CAN_NOT_CARRY_SECOND_PUBLICKEY,
  CAN_NOT_CARRY_SECOND_SIGNATURE,
} from "@bfchain/core-util-exception";
import { AccountBaseHelper } from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "EmigrateAssetLogicVerifier",
);

@Injectable()
export class EmigrateAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(@Inject(AccountBaseHelper) protected accountBaseHelper: AccountBaseHelper) {
    super();
  }

  async verify(
    transaction: EmigrateAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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

    const {
      sourceChainMagic,
      assetType,
      amount,
      genesisDelegateSignature,
    } = transaction.asset.emigrateAsset;

    const { publicKey, secondPublicKey, signSignature } = genesisDelegateSignature;

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
          to_compare_prop: "secondPublicKey",
          be_compare_prop: "secondPublicKey",
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

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);

    this.eventLogicVerifier.listenEventFrozenAccount(cloneAccountsInfo);

    await this.eventLogicVerifier.awaitEventResult(transaction);

    const assets = sender.accountAssets;

    this.helperLogicVerifier.isPossessAssetExceptForChainAsset(assets);

    await this.helperLogicVerifier.isDAppPossessor(
      transaction.senderId,
      this.configHelper,
      accountGetterHelper,
    );

    await this.helperLogicVerifier.isLnsPossessorOrManager(
      transaction.senderId,
      this.configHelper,
      accountGetterHelper,
    );

    const totalSpend = BigInt(transaction.fee) + BigInt(amount);

    if (assets[sourceChainMagic][assetType].assetNumber !== totalSpend) {
      throw new ConsensusException(NEED_EMIGRATE_TOTAL_ASSET, {
        address: transaction.senderId,
        ...Function_Exception_Detail,
      });
    }

    return true;
  }
}
