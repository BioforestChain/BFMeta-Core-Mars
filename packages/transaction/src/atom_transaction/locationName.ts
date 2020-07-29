import { TransactionFactory } from "./_txbase";
import { LocationNameTransaction, LOCATION_NAME_OPERATION_TYPE } from "@bfchain/core-model";
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
  OVER_LENGTH,
  SHOULD_NOT_START_WITH_OR_END_WITH,
  SHOULD_BE,
  NOT_MATCH,
} from "@bfchain/core-util-exception";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "LocationNameTransactionFactory",
);

/**
 * locationName 交易工厂
 *
 */
@Injectable()
export class LocationNameTransactionFactory extends TransactionFactory<LocationNameTransaction> {
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
   * 要验证 locationName 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收账户地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "name" value 值必须是设定的值
   * asset 是完整的 locationName
   * 必须携带合法的链域名：是一个字符串；长度要大于 2，最大不超过 1024；不能以 . 开头或结尾；一级域名只能是小写字母组成；
   * 多级域名首字母只能是大小写字母，其他部分可以是数字；每级域名的长度最大为 128，根域名只能是本链链名
   * 必须携带合法的所属链名,并且是本链
   * 必须携带合法的所属链网络标识符,并且是本链
   * 必须携带合法的链域名操作类型
   *
   * @param body
   * @param locationName
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    locationNameAsset: BFChainCore.LocationNameAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, locationNameAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    if (!body.recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
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

    if (!body.storage) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "name") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "name",
        ...Function_Exception_Detail,
      });
    }

    const locationName = locationNameAsset.locationName;

    if (!locationName) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "locationName",
        function: "verifyTransactionBody",
      });
    }

    const LocationName_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "locationName",
    } as const;

    const operateLnsName = locationName.name;
    if (!operateLnsName) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "name",
        ...LocationName_Exception_Detail,
      });
    }

    if (!baseHelper.isString(operateLnsName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `name ${operateLnsName}`,
        type: "string",
        ...LocationName_Exception_Detail,
      });
    }

    const lenNameLength = operateLnsName.length;
    if (lenNameLength > 1024) {
      throw new ArgumentIllegalException(OVER_LENGTH, {
        prop: `name ${operateLnsName}`,
        limit: 1024,
        ...LocationName_Exception_Detail,
      });
    }

    // 不能以 . 开头或结尾
    if (baseHelper.isStartWithOrEndWithPoint(operateLnsName)) {
      throw new ArgumentIllegalException(SHOULD_NOT_START_WITH_OR_END_WITH, {
        prop: `name ${operateLnsName}`,
        field: ".",
        ...LocationName_Exception_Detail,
      });
    }

    const names = operateLnsName.split(".");
    const namesLength = names.length;
    if (namesLength < 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `name ${operateLnsName}`,
        ...LocationName_Exception_Detail,
      });
    }

    for (let i = 0; i < namesLength; i++) {
      const lnsName = names[i];
      if (lnsName.length > 128) {
        throw new ArgumentIllegalException(OVER_LENGTH, {
          prop: `name ${lnsName}`,
          limit: 128,
          ...LocationName_Exception_Detail,
        });
      }
      if (i === namesLength - 2) {
        // 顶级域名必须是小写字母
        if (!baseHelper.isLowerCase(lnsName)) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: `name ${lnsName}`,
            type: "lowercase",
            ...LocationName_Exception_Detail,
          });
        }
      } else if (i === namesLength - 1) {
        // 根域名必须是本链链名
        if (lnsName !== config.chainName) {
          throw new ArgumentIllegalException(SHOULD_BE, {
            to_compare_prop: "root location name",
            to_target: `name ${lnsName}`,
            be_compare_prop: config.chainName,
            ...LocationName_Exception_Detail,
          });
        }
      } else {
        if (lnsName.length <= 2) {
          if (!baseHelper.isLowerCaseOrNumber(lnsName)) {
            throw new ArgumentIllegalException(PROP_IS_INVALID, {
              prop: `name ${lnsName}`,
              type: "lowercase letter or number",
              ...LocationName_Exception_Detail,
            });
          }
        } else {
          if (!baseHelper.isLowerCaseOrNumberOrUnderline(lnsName)) {
            throw new ArgumentIllegalException(PROP_IS_INVALID, {
              prop: `name ${lnsName}`,
              type: "lowercase letter or number or underline",
              ...LocationName_Exception_Detail,
            });
          }
        }
      }
    }

    if (storage.value !== operateLnsName) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `name ${operateLnsName}`,
        to_target: "storage",
        be_target: "locationName",
        ...Function_Exception_Detail,
      });
    }

    const { sourceChainName, sourceChainMagic, operationType } = locationName;

    this.checkChainName(sourceChainName, "sourceChainName", LocationName_Exception_Detail);

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain name",
        ...Function_Exception_Detail,
      });
    }

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", LocationName_Exception_Detail);

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `sourceChainMagic ${sourceChainMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!LOCATION_NAME_OPERATION_TYPE[operationType]) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `operationType ${operationType}`,
        be_compare_prop: "locationNameType",
        to_target: "locationName",
        be_target: "LOCATION_NAME_OPERATION_TYPE",
        ...LocationName_Exception_Detail,
      });
    }

    if (operationType === LOCATION_NAME_OPERATION_TYPE.CANCELLATION) {
      // 发起账户地址和接收账户地址必须是同一个
      if (body.senderId !== body.recipientId) {
        throw new ArgumentIllegalException(SHOULD_BE, {
          to_compare_prop: `recipientId ${body.recipientId}`,
          to_target: "transaction",
          be_compare_prop: body.senderId,
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 locationName 交易
   *
   * @param body
   * @param locationName
   */
  init(body: BFChainCore.TxBodyJSON, locationName: BFChainCore.LocationNameAssetJSON) {
    const transaction = LocationNameTransaction.fromObject({
      ...body,
      asset: locationName,
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
    transaction: LocationNameTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const { senderId, recipientId } = transaction;
    const {
      name,
      sourceChainMagic,
      sourceChainName,
      operationType,
    } = transaction.asset.locationName;
    // 发行链域名
    if (operationType === LOCATION_NAME_OPERATION_TYPE.REGISTRATION) {
      tasks.next = eventEmitter.emit("registerLocationName", {
        type: "registerLocationName",
        transaction,
        applyInfo: {
          address: senderId,
          name,
          sourceChainMagic,
          sourceChainName,
          possessorAddress: recipientId,
        },
      });
    } else {
      tasks.next = eventEmitter.emit("cancelLocationName", {
        type: "cancelLocationName",
        transaction,
        applyInfo: {
          address: senderId,
          name,
          sourceChainMagic
        },
      });
    }
    return tasks.tryToPromise();
  }
}
