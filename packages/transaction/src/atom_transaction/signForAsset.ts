import { TransactionFactory } from "./_txbase";
import { SignForAssetTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  NOT_MATCH,
  SHOULD_NOT_DUPLICATE,
  PROP_LENGTH_SHOULD_LTE_FIELD,
  PROP_LENGTH_SHOULD_GTE_FIELD,
} from "@bfchain/core-util-exception";
import { TrustAssetTransactionFactory } from "./trustAsset";
import { Injectable, parseHexToArrayBuffer, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "signForAssetTransactionFactory",
);

/**
 * sigForAsset 交易工厂
 *
 */
@Injectable()
export class SignForAssetTransactionFactory extends TransactionFactory<SignForAssetTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private trustAssetTransactionFactory: TrustAssetTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 signForAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 signForAsset 交易的发起账户地址)
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "transactionSignature" value 必须是 trustAsset 的签名
   * asset 是完整的 signForAsset 信息
   * 必须携带 trustAsset 交易的签名
   * 必须携带 trustAsset 的发起交易高度
   * 如果 trustAsset 有指定开始交易高度间隔，则必须携带则个值
   * 如果 trustAsset 有指定交易的有效区块高度，则必须携带这个值
   * 必须携带 trustAsset 交易的发起账户地址
   * 必须携带 trustAsset 交易的接收账户地址
   * 必须携带委托方签名，签名合法，且签名人是 trustAsset 的发起人/接收人/指定的委托账户
   * 委托方签名数量必须大于等于 trustAsset 指定的有效的委托方签名数量
   * 委托方的签名和二次签名必须合法
   *
   * @param body
   * @param signForAssetAsset
   */
  verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    signForAssetAsset: BFChainCore.SignForAssetAssetJSON,
    config = this.configHelper,
  ) {
    super.verifyTransactionBody(body, signForAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper, accountBaseHelper, transactionHelper } = this;

    const recipientId = body.recipientId;

    if (!recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "recipientId",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    const senderId = body.senderId;

    // if (senderId === recipientId) {
    //   throw new ArgumentIllegalException(SHOULD_NOT_BE, {
    //     to_compare_prop: "senderId",
    //     to_target: "body",
    //     be_compare_prop: "recipientId",
    //     ...Function_Exception_Detail,
    //   });
    // }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "fromMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "storage",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "transactionSignature") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "transactionSignature",
        ...Function_Exception_Detail,
      });
    }

    const SignForAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "signForAssetAsset",
    } as const;

    const signForAsset = signForAssetAsset.signForAsset;

    if (!signForAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "signForAsset",
        function: "verifyTransactionBody",
      });
    }

    const {
      trustAsset,
      trustSenderId,
      trustRecipientId,
      thirdPartySignatures,
      transactionSignature,
    } = signForAsset;
    if (!transactionSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "transactionSignature",
        type: "transaction signature",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "transactionSignature",
        to_target: "storage",
        be_target: "signForAsset",
        ...Function_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(signForAsset.applyBlockHeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "applyBlockHeight",
        type: "positive integer",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(signForAsset.trustNumberOfSignFor)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "trustNumberOfSignFor",
        type: "positive integer",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    // if (signForAsset.numberOfBeginUnfrozenBlocks) {
    //   if (!baseHelper.isPositiveInteger(signForAsset.numberOfBeginUnfrozenBlocks)) {
    //     throw new ArgumentIllegalException(PROP_IS_INVALID, {
    //       prop: "numberOfBeginUnfrozenBlocks",
    //       type: "positive integer",
    //       ...SignForAssetAsset_Exception_Detail,
    //     });
    //   }
    // }

    if (signForAsset.numberOfEffectiveBlocks) {
      if (!baseHelper.isPositiveInteger(signForAsset.numberOfEffectiveBlocks)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "numberOfEffectiveBlocks",
          type: "positive integer",
          ...SignForAssetAsset_Exception_Detail,
        });
      }
    }

    if (!trustSenderId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "trustSenderId",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!accountBaseHelper.isAddress(trustSenderId)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "trustSenderId",
        type: "account address",
        target: "trustAsset",
        ...Function_Exception_Detail,
      });
    }

    if (!trustRecipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "trustRecipientId",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!accountBaseHelper.isAddress(trustRecipientId)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "trustRecipientId",
        type: "account address",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (recipientId !== trustRecipientId) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "recipientId",
        to_target: "body",
        be_compare_prop: "trustRecipientId",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!thirdPartySignatures) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "thirdPartySignatures",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidThirdPartySignatures(thirdPartySignatures)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "thirdPartySignatures",
        type: "third party signatures",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    /**
     * 校验`trustAsset`的基本格式
     */
    this.trustAssetTransactionFactory.verifyTrustAsset(trustAsset);

    const { numberOfSignFor, trustees } = trustAsset;
    const thirdPartySignatureLength = thirdPartySignatures.length;

    if (numberOfSignFor > thirdPartySignatureLength) {
      throw new ArgumentIllegalException(PROP_LENGTH_SHOULD_GTE_FIELD, {
        prop: "thirdPartySignatures",
        field: numberOfSignFor,
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    const tempTrustees = [...trustees];
    tempTrustees[tempTrustees.length] = trustSenderId;
    tempTrustees[tempTrustees.length] = trustRecipientId;

    if (thirdPartySignatureLength > tempTrustees.length) {
      throw new ArgumentIllegalException(PROP_LENGTH_SHOULD_LTE_FIELD, {
        prop: "thirdPartySignatures",
        field: tempTrustees.length,
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!tempTrustees.includes(senderId)) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "senderId",
        be_compare_prop: "trustees",
        to_target: "body",
        be_target: "trustAsset and trust sender and trust recipient",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    const transactionSignatureBuffer = parseHexToArrayBuffer(transactionSignature);
    const trusteePublicKeys: string[] = [];
    for (const thirdPartySignature of thirdPartySignatures) {
      const { publicKey, signature, secondPublicKey, signSignature } = thirdPartySignature;
      if (trusteePublicKeys.includes(publicKey)) {
        throw new ArgumentIllegalException(SHOULD_NOT_DUPLICATE, {
          prop: "thirdPartySignatures",
          ...SignForAssetAsset_Exception_Detail,
        });
      }
      trusteePublicKeys[trusteePublicKeys.length] = publicKey;
      const address = accountBaseHelper.getAddressFromPublicKeyString(publicKey);
      if (!tempTrustees.includes(address)) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "publicKey address",
          be_compare_prop: "address",
          to_target: "thirdPartySignature",
          be_target: "trustees",
          ...SignForAssetAsset_Exception_Detail,
        });
      }
      const signatureBuffer = parseHexToArrayBuffer(signature);
      if (
        !transactionHelper.verifyThirdPartySignature({
          secretPublicKey: parseHexToArrayBuffer(publicKey),
          signatureBuffer,
          transactionSignatureBuffer,
          senderId: trustSenderId,
          recipientId: trustRecipientId,
        })
      ) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "thirdPartySignature",
          type: "signature",
          target: "thirdPartySignatures",
          ...Function_Exception_Detail,
        });
      }
      if (secondPublicKey && signSignature) {
        if (
          !transactionHelper.verifyThirdPartySignature({
            secretPublicKey: parseHexToArrayBuffer(secondPublicKey),
            signatureBuffer: parseHexToArrayBuffer(signSignature),
            transactionSignatureBuffer,
            senderId: trustSenderId,
            recipientId: trustRecipientId,
            thirdPartySignatureBuffer: signatureBuffer,
          })
        ) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: "thirdPartySignature",
            type: "signature",
            target: "thirdPartySignatures",
            ...Function_Exception_Detail,
          });
        }
      }
    }
  }

  /**
   * 初始化 signForAsset 交易
   *
   * @param body
   * @param signForAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, signForAssetAsset: BFChainCore.SignForAssetAssetJSON) {
    const transaction = SignForAssetTransaction.fromObject({
      ...body,
      asset: signForAssetAsset,
    });
    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  applyTransaction(
    transaction: SignForAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const {
      transactionSignatureBuffer,
      trustAsset,
      trustSenderId,
    } = transaction.asset.signForAsset;
    const { amount, assetType, sourceChainMagic } = trustAsset;
    const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
    // 接收账户(委托交易指定的签收人)将得到的资产解冻并收入账下
    tasks.next = eventEmitter.emit("unfrozenAsset", {
      type: "unfrozenAsset",
      transaction: transaction,
      applyInfo: {
        address: transaction.recipientId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        assetInfo,
        amount: amount,
        sourceAmount: amount,
        frozenIdBuffer: transactionSignatureBuffer,
        recipientId: trustSenderId, // 资产冻结账户
      },
    });
    return tasks.tryToPromise();
  }
}
