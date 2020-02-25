import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { SignForAssetTransaction, AccountSignatureModel } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_CARRY_SECOND_PUBLICKEY,
  CAN_NOT_SECONDARY_TRANSACTION,
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
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
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
    this.isDependentTransactionMatch(transaction, trs);

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
    accountGetterHelper = this.accountGetterHelper,
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
      const { publicKey, secondPublicKey } = thirdPartySignature;
      const address = accountBaseHelper.getAddressFromPublicKeyString(publicKey);
      const trustee = await accountGetterHelper.getAccountInfo(address);
      if (!trustee) {
        throw new ConsensusException(NOT_EXIST, {
          prop: `Account with address ${address}`,
          target: "blockChain",
          ...Function_Exception_Detail,
        });
      }
      if (trustee.secondPublicKey) {
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
      }
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param trustAssetJson
   */
  isDependentTransactionMatch(
    transaction: SignForAssetTransaction,
    trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>,
  ) {
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const {
      transactionSignature,
      applyBlockHeight,
      // numberOfBeginUnfrozenBlocks,
      numberOfEffectiveBlocks,
      trustSenderId,
      trustRecipientId,
      trustNumberOfSignFor,
      trustAsset,
    } = transaction.asset.signForAsset;
    const trsAsset = trustAssetJson.asset.trustAsset;

    if (
      trsAsset.sourceChainMagic !== trustAsset.sourceChainMagic ||
      trsAsset.assetType !== trustAsset.assetType ||
      trsAsset.amount !== trustAsset.amount ||
      trsAsset.trustees.length !== trustAsset.trustees.length ||
      trsAsset.numberOfSignFor !== trustNumberOfSignFor ||
      trustAssetJson.applyBlockHeight !== applyBlockHeight ||
      trustAssetJson.senderId !== trustSenderId ||
      trustAssetJson.recipientId !== trustRecipientId
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "trustAssetInfo",
        be_compare_prop: "trustAssetInfo",
        to_target: "SignForAssetTransaction",
        be_target: "TrustAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    if (numberOfEffectiveBlocks !== trustAssetJson.numberOfEffectiveBlocks) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "numberOfEffectiveBlocks",
        be_compare_prop: "numberOfEffectiveBlocks",
        to_target: "SignForAssetTransaction",
        be_target: "TrustAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    // if (trsAsset.numberOfBeginUnfrozenBlocks) {
    //     if (numberOfBeginUnfrozenBlocks !== trsAsset.numberOfBeginUnfrozenBlocks) {
    //         throw new ConsensusException(`Trust asset not match`, `transaction signature ${tr.signature} trust asset transaction signature ${transactionSignature}`);
    //     }
    // }

    const trustTrsRange = [...trustAssetJson.range, ...trsAsset.trustees];
    const trustRange = [...trustAsset.trustees];

    for (const address of trustTrsRange) {
      if (!trustRange.includes(address)) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "trustAssetRange",
          be_compare_prop: "trustAssetRange",
          to_target: "SignForAssetTransaction",
          be_target: "TrustAssetTransaction",
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 不能二次操作同一笔交易(红包/资产交换/委托资产)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: SignForAssetTransaction,
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
        reason: `Can not secondary sign for asset, sender ${transaction.senderId} trust transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
