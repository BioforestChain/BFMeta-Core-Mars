import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { SignForAssetTransaction, AccountSignatureModel } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_CARRY_SECOND_PUBLICKEY,
  CAN_NOT_SECONDARY_TRANSACTION,
  PROP_IS_REQUIRE,
  CAN_NOT_CARRY_SECOND_SIGNATURE,
} from "@bfchain/core-util-exception";
import { AccountBaseHelper } from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "SignForAssetLogicVerifier",
);

@Injectable()
export class SignForAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(@Inject(AccountBaseHelper) public accountBaseHelper: AccountBaseHelper) {
    super();
  }

  async verify(
    transaction: SignForAssetTransaction,
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
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const { transactionSignature, thirdPartySignatures } = transaction.asset.signForAsset;

    const trs = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
    )) as BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>;

    if (!trs) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
    this.isValidRecipientId(transaction, trs);
    await this.isValidThirdPartySignatures(thirdPartySignatures, accountGetterHelper);
    await this.isDependentTransactionMatch(transaction, trs);

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

    this.eventLogicVerifier.listenEventUnfrozenAsset(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction);

    return true;
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param trustAssetJson
   */
  isValidRecipientId(
    transaction: SignForAssetTransaction,
    trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>,
  ) {
    // 签收交易的接收账户必须是委托交易的接收账户
    if (transaction.recipientId !== trustAssetJson.recipientId) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "recipientId",
        be_compare_prop: "senderId",
        to_target: "SignForAssetTransaction",
        be_target: "TrustAssetTransaction",
        function: "isValidRecipientId",
      });
    }
  }

  /**
   * 第三方签名是否合法
   *
   * @param thirdPartySignatures
   */
  async isValidThirdPartySignatures(
    thirdPartySignatures: AccountSignatureModel[],
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "isValidThirdPartySignatures",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const { accountBaseHelper } = this;
    for (const thirdPartySignature of thirdPartySignatures) {
      const { publicKey, secondPublicKey, signSignature } = thirdPartySignature;
      const address = await accountBaseHelper.getAddressFromPublicKeyString(publicKey);
      const trustee = await accountGetterHelper.getAccountInfo(address);
      if (!trustee) {
        throw new ConsensusException(NOT_EXIST, {
          prop: `Account with address ${address}`,
          target: "blockChain",
          ...Function_Exception_Detail,
        });
      }
      if (trustee.secondPublicKey) {
        if (!secondPublicKey) {
          throw new ConsensusException(PROP_IS_REQUIRE, {
            prop: "secondPublicKey",
            target: "thirdPartySignature",
            ...Function_Exception_Detail,
          });
        }
        if (!signSignature) {
          throw new ConsensusException(PROP_IS_REQUIRE, {
            prop: "signSignature",
            target: "thirdPartySignature",
            ...Function_Exception_Detail,
          });
        }
        if (trustee.secondPublicKey !== secondPublicKey) {
          throw new ConsensusException(NOT_MATCH, {
            to_compare_prop: "secondPublicKey",
            be_compare_prop: "secondPublicKey",
            to_target: "trustee",
            be_target: "thirdPartySignature",
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
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param trustAssetJson
   */
  async isDependentTransactionMatch(
    transaction: SignForAssetTransaction,
    trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>,
  ) {
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const { trustAsset } = transaction.asset.signForAsset;
    const trsAsset = trustAssetJson.asset.trustAsset;

    if (
      trsAsset.sourceChainMagic !== trustAsset.sourceChainMagic ||
      trsAsset.assetType !== trustAsset.assetType ||
      trsAsset.amount !== trustAsset.amount ||
      trsAsset.trustees.length !== trustAsset.trustees.length
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "trustAssetInfo",
        be_compare_prop: "trustAssetInfo",
        to_target: "SignForAssetTransaction",
        be_target: "TrustAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    const trustTrsRange = [...trsAsset.trustees];
    const trustRange = [...trustAsset.trustees];

    for (const address of trustTrsRange) {
      if (!trustRange.includes(address)) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "trustees",
          be_compare_prop: "trustees",
          to_target: "SignForAssetTransaction",
          be_target: "TrustAssetTransaction",
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 不能二次操作同一笔交易(委托资产)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: SignForAssetTransaction,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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

    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
    });
    if (isSecondary) {
      throw new ConsensusException(CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary sign for asset, sender ${transaction.senderId} trust transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
