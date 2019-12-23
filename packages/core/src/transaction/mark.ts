import { TransactionFactory } from "./_txbase";
import { MarkTransaction } from "../../model";
import {
  AccountBaseHelper,
  TransactionHelper,
  CoreExceptionGenerator,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  OVER_LENGTH,
  NOT_IN_EXPECTED_RANGE,
  NOT_MATCH,
  SHOULD_BE,
  SHOULD_NOT_EXIST,
} from "../../../helper/src/exception/errorCode";
import { DAppTransactionFactory } from "./dapp";
import { Injectable } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "MarkTransactionFactory");

/**
 * mark 交易工厂
 *
 */
@Injectable()
export class MarkTransactionFactory extends TransactionFactory<MarkTransaction> {
  constructor(
    public accountHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public dappTransactionFactory: DAppTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 mark 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收者账户，并且是 数据存证 的拥有者地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "dappid" value 值必须是设定的值
   * asset 是完整的 mark 信息
   * 必须携带 dapp 的相关信息
   * 必须携带合法的数据所属账户地址，与接收账户地址一致
   * 必须携带存证内容：字符串，最大 1024
   * 必须携带存证类型：字符串 1-10
   *
   * @param body
   * @param markAsset
   */
  verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    markAsset: BFChainCore.MarkAssetJSON,
    config = this.configHelper,
  ) {
    super.verifyTransactionBody(body, markAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    const recipientId = body.recipientId;

    if (!recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "fromMagic",
        to_target: "body",
        be_compare_prop: "chain magic",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
        to_target: "body",
        be_compare_prop: "chain magic",
        target: "body",
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
    if (storage.key !== "dappid") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "dappid",
        ...Function_Exception_Detail,
      });
    }

    const mark = markAsset.mark;

    if (!mark) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "mark",
        function: "verifyTransactionBody",
      });
    }

    const MarkAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "markAsset",
    } as const;

    const dapp = mark.dapp;

    this.dappTransactionFactory.verifyDAppAsset(dapp);

    if (storage.value !== dapp.dappid) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "dappid",
        to_target: "storage",
        be_target: "mark",
        ...Function_Exception_Detail,
      });
    }

    if (mark.markPossessor !== recipientId) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "recipientId",
        be_compare_prop: "markPossessor",
        to_target: "body",
        be_target: "mark",
        ...MarkAsset_Exception_Detail,
      });
    }

    const content = mark.content;
    if (!content) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "content",
        ...MarkAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isString(content)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "content",
        type: "string",
        ...MarkAsset_Exception_Detail,
      });
    }

    if (content.length > 1024) {
      throw new ArgumentIllegalException(OVER_LENGTH, {
        prop: "content",
        limit: 1024,
        ...MarkAsset_Exception_Detail,
      });
    }

    const action = mark.action;
    if (!action) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "action",
        ...MarkAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isString(action)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "action",
        type: "string",
        ...MarkAsset_Exception_Detail,
      });
    }

    const len = action.length;
    if (len < 1 || len > 10) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: "action",
        min: 1,
        max: 10,
        ...MarkAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 mark 交易
   *
   * @param body
   * @param markAsset
   */
  init(body: BFChainCore.TxBodyJSON, markAsset: BFChainCore.MarkAssetJSON) {
    const transaction = MarkTransaction.fromObject({
      ...body,
      asset: markAsset,
    });

    return transaction;
  }
}
