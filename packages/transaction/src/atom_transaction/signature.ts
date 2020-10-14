import { TransactionFactory } from "./_txbase";
import { SignatureTransaction } from "@bfchain/core-model";
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
  SHOULD_NOT_EXIST,
  SHOULD_BE,
} from "@bfchain/core-util-exception";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "SignatureTransactionFactory",
);

/**
 * signature 交易工厂
 *
 */
@Injectable()
export class SignatureTransactionFactory extends TransactionFactory<SignatureTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 signature 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收者账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * asset 是完整的 signature 信息
   * 必须携带合法的欲设置二次密码生成的公钥
   *
   * @param body
   * @param signatureAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    signatureAsset: BFChainCore.SignatureAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, signatureAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    if (body.recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.storage) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const signature = signatureAsset.signature;

    if (!signature) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "signature",
        function: "verifyTransactionBody",
      });
    }

    const SignatureAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "signatureAsset",
    } as const;

    const publicKey = signature.publicKey;

    if (!publicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...SignatureAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSecondPublicKey(publicKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `publicKey ${publicKey}`,
        type: "account second publicKey",
        ...SignatureAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 signature 交易
   *
   * @param body
   * @param signatureAsset
   */
  init(body: BFChainCore.TxBodyJSON, signatureAsset: BFChainCore.SignatureAssetJSON) {
    const transaction = SignatureTransaction.fromObject({
      ...body,
      asset: signatureAsset,
    });

    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  async applyTransaction(
    transaction: SignatureTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    // 设置二次密码
    tasks.next = eventEmitter.emit("setSecondPublicKey", {
      type: "setSecondPublicKey",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        secondPublicKeyBuffer: transaction.asset.signature.publicKeyBuffer,
      },
    });
    return tasks.tryToPromise();
  }
}
