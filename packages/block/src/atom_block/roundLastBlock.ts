import { BlockFactory, BlockBody } from "./_blockbase";
import { RoundLastBlock } from "../../model";
import {
  CoreExceptionGenerator,
  BlockHelper,
  AccountBaseHelper,
  BaseHelper,
  ConfigHelper,
  MilestonesHelper,
  AsymmetricHelper,
  ChainAssetInfoHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import {
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  NOT_MATCH,
  SHOULD_BE,
  SHOULD_NOT_INCLUDE,
} from "../../../helper/src/exception/errorCode";
import { Injectable, Inject } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "RoundLastBlockFactory");

/**
 * roundLastBlock 工厂
 *
 */
@Injectable()
export class RoundLastBlockFactory extends BlockFactory<RoundLastBlock> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("../transaction").TransactionCore;
  constructor(
    public blockHelper: BlockHelper,
    public accountHelper: AccountBaseHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public milestonesHelper: MilestonesHelper,
    public asymmetricHelper: AsymmetricHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
  ) {
    super();
  }

  /**
   * 从 json 转出 protobuf
   * JSON格式一般是进程内部通讯在使用,所以JSON格式默认不校验
   *
   * @param blockBody
   */
  fromJSON(
    blockBody: BFChainCore.BlockJSON<BFChainCore.RoundLastBlockRemarkJSON>,
    opts?: { verify?: boolean; config?: ConfigHelper },
  ) {
    const block = RoundLastBlock.fromObject(blockBody);
    block.transactions = blockBody.transactions.map(twi => {
      return this.transactionInBlockFromJSON(twi);
    });
    if (opts && opts.verify) {
      this.verify(block, opts.config);
    }
    return block;
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param roundLastBlockRemark
   */
  verifyBlockBody(body: BlockBody, roundLastBlockRemark: BFChainCore.RoundLastBlockRemarkJSON) {
    super.verifyBlockBody(body, roundLastBlockRemark);

    const Function_Exception_Detail = { function: "verifyBlockBody" };
    const RoundLastBlockRemark_Exception_Detail = {
      target: "RoundLastBlock.remark",
      ...Function_Exception_Detail,
    };

    const nextRoundDelegates = roundLastBlockRemark.nextRoundDelegates;
    if (this.baseHelper.getVariableType(nextRoundDelegates) !== "[object Array]") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "nextRoundDelegates",
        type: "array",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    const { baseHelper } = this;
    // FIXME: 这里注释的代码别删除 @Gaubee
    // TODO: 这里 nextRoundDelegates应该是CORE内部自己生成，无需校验
    /*
    if (nextRoundDelegates.length !== this.config.blockPerRound) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "nextRoundDelegates.length",
        be_compare_prop: "blockPerRound",
        to_target: "roundLastBlockRemark",
        be_target: "config",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    for (const delegate of nextRoundDelegates) {
      if (!this.accountHelper.isAddress(delegate)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "nextRoundDelegates item",
          value: delegate,
          type: "account address",
          ...RoundLastBlockRemark_Exception_Detail,
        });
      }
    }

    if (!roundLastBlockRemark.newDelegates) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "newDelegates",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    const newDelegates = roundLastBlockRemark.newDelegates;
    if (this.baseHelper.getVariableType(newDelegates) !== "[object Array]") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "newDelegates",
        type: "array",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    for (const delegate of newDelegates) {
      if (!this.accountHelper.isAddress(delegate)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "newDelegates item",
          value: delegate,
          type: "account address",
          ...RoundLastBlockRemark_Exception_Detail,
        });
      }
    }

    if (!baseHelper.isValidAssetNumber(roundLastBlockRemark.maxBeginBalance)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxBeginBalance",
        type: "asset number",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(roundLastBlockRemark.maxTxCount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxTxCount",
        type: "asset number",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    const equities = roundLastBlockRemark.equities;
    if (baseHelper.getVariableType(equities) !== "[object Array]") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "equities",
        to_target: "GenesisBlockRemark",
        be_compare_prop: "array",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    if (nextRoundDelegates.length !== equities.length) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "nextRoundDelegates.length",
        be_compare_prop: "equities.length",
        to_target: "GenesisBlockRemark",
        be_target: "GenesisBlockRemark",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    for (const equity of equities) {
      const address = equity.address;
      if (!this.accountHelper.isAddress(address)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "equity.address",
          type: "account address",
          ...Function_Exception_Detail,
        });
      }
      if (!nextRoundDelegates.includes(address)) {
        throw new ArgumentIllegalException(SHOULD_NOT_INCLUDE, {
          prop: "equity.address",
          target: "equities",
          value: address,
          ...Function_Exception_Detail,
        });
      }
      if (!this.baseHelper.isValidAccountEquity(equity.equity)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "equity.equity",
          type: "account equity",
          ...Function_Exception_Detail,
        });
      }
    }

    if (!baseHelper.isValidEquityRate(roundLastBlockRemark.rate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "rate",
        type: "equity rate",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }
    */

    if (!baseHelper.isString(roundLastBlockRemark.debug)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "debug",
        type: "string",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isString(roundLastBlockRemark.info)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "info",
        type: "string",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidBlockParticipation(roundLastBlockRemark.blockParticipation)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "blockParticipation",
        type: "block participation",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidRemarkHash(roundLastBlockRemark.hash)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "hash",
        type: "remarkHash",
        ...RoundLastBlockRemark_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 roundLastBlock
   *
   * @param body
   * @param roundLastBlockRemark
   */
  _generateBlock(body: BlockBody, roundLastBlockRemark: BFChainCore.RoundLastBlockRemarkJSON) {
    const block = RoundLastBlock.fromObject({
      ...body,
      remark: roundLastBlockRemark,
      statisticInfo: {},
    });
    // 绑定区块奖励
    block.reward = this.milestonesHelper.calcReward(block.height);

    return block;
  }
}
