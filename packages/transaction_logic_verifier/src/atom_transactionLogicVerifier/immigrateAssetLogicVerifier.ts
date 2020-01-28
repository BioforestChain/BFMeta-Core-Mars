import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY,
  ASSET_IS_ALREADY_MIGRATION,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "ImmigrateAssetLogicVerifier",
);

@Injectable()
export class ImmigrateAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper) public accountHelper: AccountBaseHelper,
    @Inject(AccountBaseHelper) public transactionHelper: TransactionHelper,
  ) {
    super();
  }

  async verify(
    transaction: ImmigrateAssetTransaction,
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
    const { emigrateAssetTransaction, genesisDelegateSignature } = transaction.asset.immigrateAsset;

    const { publicKey, secondPublicKey } = genesisDelegateSignature;

    const address = this.accountHelper.getAddressFromPublicKeyString(publicKey);

    const delegate = await accountGetterHelper.getAccountInfo(address);

    if (!delegate) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Account with address ${address}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    if (delegate.secondPublicKey) {
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
        throw new ConsensusException(SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY, {
          id: transaction.signature,
          senderId: transaction.senderId,
          applyBlockHeight: transaction.applyBlockHeight,
          type: transaction.type,
          ...Function_Exception_Detail,
        });
      }
    }

    // 查询资产是否已经迁入
    const count = await transactionGetterHelper.getCountTransaction({
      type: this.transactionHelper.IMMIGRATE_ASSET,
      storageValue: emigrateAssetTransaction.signature,
    });

    if (count > 0) {
      throw new ConsensusException(ASSET_IS_ALREADY_MIGRATION, {
        signature: emigrateAssetTransaction.signature,
        ...Function_Exception_Detail,
      });
    }
    return true;
  }
}
