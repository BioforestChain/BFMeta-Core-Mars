import { TransactionFactory } from "@bfchain/core-transaction";
import { RegisterChainTransaction, ACCOUNT_STATUS } from "@bfchain/core-model";
import {
  TransactionHelper,
  AccountBaseHelper,
  BaseHelper,
  ConfigHelper,
  ConfigHelperMap,
  ChainAssetInfoHelper,
  RegisterChainCertificateHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  Injectable,
  Inject,
  TaskList,
  getHexFromArrayBuffer,
  parseHexToArrayBuffer,
} from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "RegisterChainTransactionFactory",
);

/**
 * registerChain 交易工厂
 *
 */
@Injectable()
export class RegisterChainTransactionFactory extends TransactionFactory<RegisterChainTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public registerChainCertificateHelper: RegisterChainCertificateHelper,
    private configMap: ConfigHelperMap,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 registerChain 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收者账户，并且是 dapp 的拥有者地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   *  key 值必须是 "magic" value 值必须是设定的值
   * asset 是完整的 registerChain 信息
   * 需要携带要注册的链的创世块
   * 验证创世块信息是否合法
   *
   * @param body
   * @param registerChainAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    registerChainAsset: BFChainCore.RegisterChainAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, registerChainAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    if (body.recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "magic") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "magic",
        ...Function_Exception_Detail,
      });
    }

    const registerChain = registerChainAsset.registerChain;

    if (!registerChain) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "registerChain",
      });
    }

    const RegisterChainAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "registerChainAsset",
    } as const;

    const genesisBlockString = registerChain.genesisBlock;
    if (!genesisBlockString) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "genesisBlock",
        ...RegisterChainAsset_Exception_Detail,
      });
    }
    if (!this.baseHelper.isString(genesisBlockString)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "genesisBlock",
        ...RegisterChainAsset_Exception_Detail,
      });
    }
    const certificate = this.registerChainCertificateHelper.decode(genesisBlockString);
    await this.registerChainCertificateHelper.verifyRegisterChainCertificate(certificate);
    const { bnid, magic, assetType, chainName } = certificate.body.genesisBlockInfo;
    if (magic === config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `magic ${magic}`,
        to_target: "genesisBlockJson.asset.genesisAsset",
        be_compare_prop: config.magic,
        ...RegisterChainAsset_Exception_Detail,
      });
    }
    if (assetType === config.assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `assetType ${assetType}`,
        to_target: "genesisBlockJson.asset.genesisAsset",
        be_compare_prop: config.assetType,
        ...RegisterChainAsset_Exception_Detail,
      });
    }
    if (chainName === config.chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `chainName ${chainName}`,
        to_target: "genesisBlockJson.asset.genesisAsset",
        be_compare_prop: config.chainName,
        ...RegisterChainAsset_Exception_Detail,
      });
    }
    if (config.initials !== bnid) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `initials ${config.initials}`,
        be_compare_prop: `bnid ${bnid}`,
        to_target: "config",
        be_target: "genesisBlockJson.asset.genesisBlock",
        ...Function_Exception_Detail,
      });
    }
  }

  @Inject("bfchain-core:BlockCore")
  private _blockCore!: import("@bfchain/core-block").BlockCore;

  /**
   * 初始化 registerChain 交易
   *
   * @param body
   * @param registerChain
   */
  init(body: BFChainCore.TxBodyJSON, registerChain: BFChainCore.RegisterChainAssetJSON) {
    const transaction = RegisterChainTransaction.fromObject({
      ...body,
      asset: registerChain,
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
    transaction: RegisterChainTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const { senderId, senderPublicKeyBuffer } = transaction;
    const genesisBlockString = transaction.asset.registerChain.genesisBlock;
    const genesisBlock = this.registerChainCertificateHelper.decode(genesisBlockString);

    const {
      genesisAccount,
      genesisBlockSignature,
      bnid,
      magic,
      assetType,
      chainName,
      genesisDelegates,
    } = genesisBlock.body.genesisBlockInfo;

    // 冻结发起账户
    tasks.next = eventEmitter.emit("frozenAccount", {
      type: "frozenAccount",
      transaction,
      applyInfo: {
        address: senderId,
        publicKeyBuffer: senderPublicKeyBuffer,
        accountStatus: ACCOUNT_STATUS.FROZEN_OUT,
      },
    });
    // 注册链
    tasks.next = eventEmitter.emit("registerChain", {
      type: "registerChain",
      transaction,
      applyInfo: {
        address: senderId,
        publicKeyBuffer: senderPublicKeyBuffer,
        genesisBlock: {
          bnid,
          magic,
          assetType,
          chainName,
          signature: genesisBlockSignature,
          genesisAccount,
          genesisDelegates,
        },
      },
    });
    return tasks.toPromise();
  }
}
