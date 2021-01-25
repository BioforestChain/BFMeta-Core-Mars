import type { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  ASSET_IS_ALREADY_MIGRATION,
  CAN_NOT_CARRY_SECOND_PUBLICKEY,
  CAN_NOT_CARRY_SECOND_SIGNATURE,
  PROP_IS_REQUIRE,
} from "@bfchain/core-util-exception";
import { AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "ImmigrateAssetLogicVerifier",
);

@Injectable()
export class ImmigrateAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper) public accountBaseHelper: AccountBaseHelper,
    @Inject(TransactionHelper) public transactionHelper: TransactionHelper,
  ) {
    super();
  }

  async verify(
    transaction: ImmigrateAssetTransaction,
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

    const { emigrateAssetTransaction, genesisDelegateSignature } = transaction.asset.immigrateAsset;

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
          ...Function_Exception_Detail,
        });
      }
    }

    const {
      sourceChainMagic,
      assetType,
      sourceChainName,
    } = emigrateAssetTransaction.asset.emigrateAsset;

    const memchain = await accountGetterHelper.getChain(sourceChainMagic);
    if (!memchain) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Chain with magic ${sourceChainMagic}}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    const genesisAsset = memchain.genesisBlock.asset.genesisAsset;
    if (assetType !== genesisAsset.assetType) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `assetType ${assetType}`,
        be_compare_prop: `assetType ${genesisAsset.assetType}`,
        to_target: "immigrateAsset.emigrateAssetTransaction.asset.emigrateAsset",
        be_target: `registerChain in blockChain with magic ${sourceChainMagic}`,
        ...Function_Exception_Detail,
      });
    }

    if (sourceChainName !== genesisAsset.chainName) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `sourceChainName ${sourceChainName}`,
        be_compare_prop: `sourceChainName ${genesisAsset.chainName}`,
        to_target: "immigrateAsset.emigrateAssetTransaction.asset.emigrateAsset",
        be_target: `registerChain in blockChain with magic ${sourceChainMagic}`,
        ...Function_Exception_Detail,
      });
    }

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

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    this.eventLogicVerifier.listenEventAsset(cloneAccountsAssets, transaction, eventEmitter);

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 不能二次操作同一笔交易(权益迁入)
   *
   * @param transaction
   * @param currentBlockHeight
   * @param transactionGetterHelper
   */
  async checkSecondaryTransaction(
    transaction: ImmigrateAssetTransaction,
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      type: this.transactionHelper.IMMIGRATE_ASSET,
      storageValue: transaction.storageValue as string,
      heightRange: this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    });
    if (isSecondary) {
      throw new ConsensusException(ASSET_IS_ALREADY_MIGRATION, {
        signature: transaction.storageValue,
        function: "checkSecondaryTransaction",
      });
    }
  }
}
