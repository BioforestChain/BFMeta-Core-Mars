import { TransactionFactory } from "./_txbase";
import {
  SetLnsRecordValueTransaction,
  SetLnsRecordValueAssetModel,
  RECORD_TYPE,
  RECORD_OPERATION_TYPE,
} from "@bfchain/core-model";
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
  NOT_EXIST,
  SHOULD_BE,
  NOT_MATCH,
  SHOULD_NOT_EXIST,
  NOT_A_STRING,
  NOT_A_IPV4,
  NOT_A_IPV6,
  NOT_A_LONGITUDE,
  NOT_A_LONGITUDE_LATITUDE,
  NOT_A_LATITUDE,
  NOT_A_ADDRESS,
  NOT_A_LOCATION_NAME,
  NOT_A_DNS,
  NOT_A_EMAIL,
  NOT_A_URL,
} from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "SetLnsRecordValueTransactionFactory",
);

/**
 * setLnsRecordValue 交易工厂
 *
 */
@Injectable()
export class SetLnsRecordValueTransactionFactory extends TransactionFactory<SetLnsRecordValueTransaction> {
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
   * 要验证 lnsRecordValue 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收账户地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "name" value 欲设置解析值的位名
   * asset 是完整的 lnsRecordValue 信息
   * 必须携带合法的欲设置解析值的位名
   * 必须携带合法的欲设置解析值的位名所属链的名称
   * 必须携带合法的欲设置解析值的位名所属链的网络标识符
   * 必须携带合法且存在的解析类型
   * 必须携带合法的新的解析值
   *
   * @param body
   * @param setLnsRecordValueAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    lnsRecordValueAsset: SetLnsRecordValueAssetModel,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, lnsRecordValueAsset, config);

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

    const lnsRecordValue = lnsRecordValueAsset.lnsRecordValue;

    if (!lnsRecordValue) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "lnsRecordValue",
        function: "verifyTransactionBody",
      });
    }

    const LnsRecordValueAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "lnsRecordValueAsset",
    } as const;

    const name = lnsRecordValue.name;

    if (!name) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "name",
        ...LnsRecordValueAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidLnsName(name)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `name ${name}`,
        type: "location name",
        ...LnsRecordValueAsset_Exception_Detail,
      });
    }

    if (storage.value !== name) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `name ${name}`,
        to_target: "storage",
        be_target: "lnsRecordValue",
        ...Function_Exception_Detail,
      });
    }

    const { sourceChainName, sourceChainMagic } = lnsRecordValue;

    this.checkChainName(sourceChainName, "sourceChainName", LnsRecordValueAsset_Exception_Detail);

    this.checkChainMagic(
      sourceChainMagic,
      "sourceChainMagic",
      LnsRecordValueAsset_Exception_Detail,
    );

    switch (lnsRecordValue.operationType) {
      case RECORD_OPERATION_TYPE.ADD:
        if (!lnsRecordValue.addRecord) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "addRecord",
            ...LnsRecordValueAsset_Exception_Detail,
          });
        }
        if (lnsRecordValue.deleteRecord) {
          throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
            prop: "deleteRecord",
            ...LnsRecordValueAsset_Exception_Detail,
          });
        }
        await this.checkLocationNameRecord(lnsRecordValue.addRecord);
        break;
      case RECORD_OPERATION_TYPE.DELETE:
        if (lnsRecordValue.addRecord) {
          throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
            prop: "addRecord",
            ...LnsRecordValueAsset_Exception_Detail,
          });
        }
        if (!lnsRecordValue.deleteRecord) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "deleteRecord",
            ...LnsRecordValueAsset_Exception_Detail,
          });
        }
        await this.checkLocationNameRecord(lnsRecordValue.deleteRecord);
        break;
      case RECORD_OPERATION_TYPE.UPDATE:
        if (!lnsRecordValue.addRecord) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "addRecord",
            ...LnsRecordValueAsset_Exception_Detail,
          });
        }
        if (!lnsRecordValue.deleteRecord) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "deleteRecord",
            ...LnsRecordValueAsset_Exception_Detail,
          });
        }
        await this.checkLocationNameRecord(lnsRecordValue.addRecord);
        await this.checkLocationNameRecord(lnsRecordValue.deleteRecord);
        break;
      default:
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "operationType",
          type: "location name operation type",
          ...LnsRecordValueAsset_Exception_Detail,
        });
    }
  }

  /**
   * 校验解析值是否合法
   *
   * @param record
   */
  async checkLocationNameRecord(record: BFChainCore.LocationNameRecordJSON) {
    const { baseHelper, accountBaseHelper } = this;
    const Function_Exception_Detail = { function: "verifyTransactionBody" } as const;

    if (!record) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "record",
        ...Function_Exception_Detail,
      });
    }

    const LnsRecordValueAsset_Exception_Detail = {
      target: "lnsRecordValue",
      ...Function_Exception_Detail,
    } as const;

    const { recordType, recordValue } = record;

    if (!baseHelper.isString(recordValue)) {
      throw new ArgumentIllegalException(NOT_A_STRING, {
        prop: "recordValue",
        value: recordValue,
        ...LnsRecordValueAsset_Exception_Detail,
      });
    }

    if (recordType === RECORD_TYPE.IPV4) {
      if (!baseHelper.isIpV4(recordValue)) {
        throw new ArgumentIllegalException(NOT_A_IPV4, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
    } else if (recordType === RECORD_TYPE.IPV6) {
      if (!baseHelper.isIpV6(recordValue)) {
        throw new ArgumentIllegalException(NOT_A_IPV6, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
    } else if (recordType === RECORD_TYPE.LNG_LAT) {
      const items = recordValue.split(",");
      if (items.length !== 2) {
        throw new ArgumentIllegalException(NOT_A_LONGITUDE_LATITUDE, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
      // 经度（-180，+180）：负坐标表示西半球，正坐标标识东半球
      if (!baseHelper.isLongitude(items[0])) {
        throw new ArgumentIllegalException(NOT_A_LONGITUDE, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
      // 纬度（-90，+90）：负坐标标识南半球，正坐标表示北半球
      if (!baseHelper.isLatitude(items[1])) {
        throw new ArgumentIllegalException(NOT_A_LATITUDE, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
    } else if (recordType === RECORD_TYPE.ADDRESSV1) {
      if (!(await accountBaseHelper.isAddress(recordValue))) {
        throw new ArgumentIllegalException(NOT_A_ADDRESS, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
    } else if (recordType === RECORD_TYPE.LOCATION_NAME) {
      if (!baseHelper.isValidLnsName(recordValue)) {
        throw new ArgumentIllegalException(NOT_A_LOCATION_NAME, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
    } else if (recordType === RECORD_TYPE.DNS) {
      if (!baseHelper.isDNS(recordValue)) {
        throw new ArgumentIllegalException(NOT_A_DNS, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
    } else if (recordType === RECORD_TYPE.EMAIL) {
      if (!baseHelper.isEmail(recordValue)) {
        throw new ArgumentIllegalException(NOT_A_EMAIL, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
    } else if (recordType === RECORD_TYPE.URL) {
      if (!baseHelper.isURL(recordValue)) {
        throw new ArgumentIllegalException(NOT_A_URL, {
          prop: "recordValue",
          value: recordValue,
          ...LnsRecordValueAsset_Exception_Detail,
        });
      }
    } else if (recordType === RECORD_TYPE.UNKNOWN) {
      /// 无需验证
    } else {
      throw new ArgumentIllegalException(NOT_EXIST, {
        prop: "recordType",
        ...LnsRecordValueAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 setLnsRecordValue 交易
   *
   * @param body
   * @param setLnsRecordValueAsset
   */
  init(body: BFChainCore.TxBodyJSON, lnsRecordValueAsset: BFChainCore.SetLnsRecordValueAssetJSON) {
    const transaction = SetLnsRecordValueTransaction.fromObject({
      ...body,
      asset: lnsRecordValueAsset,
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
    transaction: SetLnsRecordValueTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { name, sourceChainMagic, operationType, addRecord, deleteRecord } =
        transaction.asset.lnsRecordValue;
      taskList.next = eventEmitter.emit("setLnsRecordValue", {
        type: "setLnsRecordValue",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          name,
          sourceChainMagic,
          operationType,
          addRecord,
          deleteRecord,
        },
      });
    });
  }
}
