import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { EmigrateAssetTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY,
  NEED_EMIGRATE_TOTAL_ASSET,
} from "@bfchain/core-util-exception";
import { AccountBaseHelper } from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "EmigrateAssetLogicVerifier",
);

@Injectable()
export class EmigrateAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(@Inject(AccountBaseHelper) protected accountHelper: AccountBaseHelper) {
    super();
  }

  async verify(
    transaction: EmigrateAssetTransaction,
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
    const {
      sourceChainMagic,
      assetType,
      amount,
      genesisDelegateSignature,
    } = transaction.asset.emigrateAsset;

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

    const assets = sender.accountAssets;

    this.isPossessAssetExceptForChainAsset(assets);

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
