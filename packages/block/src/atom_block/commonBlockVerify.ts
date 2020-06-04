import { Block, GetBlockRemarkJSON } from "@bfchain/core-model-block";
import type {
  BlockHelper,
  BaseHelper,
  MilestonesHelper,
  StatisticsInfo,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  NOT_MATCH,
  ALREADY_EXIST,
  NOT_EXIST,
} from "@bfchain/core-util-exception";
import { cacheGetter, Injectable, Inject } from "@bfchain/util";
import { Writer } from "@bfchain/protobuf";
import { TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE } from "@bfchain/core-model-transaction";
const { ArgumentIllegalException, ConsensusException } = CoreExceptionGenerator(
  "CONTROLLER",
  "_blockbase",
);

@Injectable()
export class CommonBlockVerify<T extends Block> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;

  constructor(
    public blockHelper: BlockHelper,
    public baseHelper: BaseHelper,
    public milestonesHelper: MilestonesHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
  ) {}

  /**
   * 校验区块基础信息
   *
   * @param body
   * @param remark
   */
  verifyBlockBody(body: BFChainCore.BlockBody, remark: GetBlockRemarkJSON<T>) {
    const { baseHelper } = this;
    const Function_Exception_Detail = { function: "verifyBlockBody" };
    if (!body) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "body",
        ...Function_Exception_Detail,
      });
    }

    if (!remark && baseHelper.getVariableType(remark) !== "[object Object]") {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "remark",
        ...Function_Exception_Detail,
      });
    }

    const BlockBody_Exception_Detail = {
      target: "body",
      ...Function_Exception_Detail,
    };

    if (!baseHelper.isPositiveInteger(body.version)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "version",
        type: "positive integer",
        ...BlockBody_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(body.height)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "height",
        type: "positive integer",
        ...BlockBody_Exception_Detail,
      });
    }

    if (body.height > 1 && !body.previousBlockSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "previousBlockSignature",
        ...BlockBody_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(body.timestamp)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "timestamp",
        type: "positive integer or 0",
        ...BlockBody_Exception_Detail,
      });
    }
  }

  /**
   * 校验区块奖励数
   *
   * @param block
   */
  verifyBlockReward(block: T) {
    const expectedReward = this.milestonesHelper.calcReward(block.height).toString();
    if (expectedReward !== block.reward) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `blockReward ${block.reward}`,
        be_compare_prop: `expectedReward ${expectedReward}`,
        to_target: "block",
        be_target: "calculate",
        function: "verifyBlockReward",
      });
    }
  }

  /**
   * 校验区块 remark 大小
   *
   * @param block
   */
  verifyBlockRemarkSize(block: T) {
    this.blockHelper.verifyBlockRemarkSize(block.remark);
  }

  /**
   * 校验区块大小
   *
   */
  verifyBlockSize(block: T, transactionBufferList?: Uint8Array[]) {
    const blockSize = this.calcBlockSize(block, transactionBufferList);
    if (block.blockSize !== blockSize) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `blockSize ${block.blockSize}`,
        be_compare_prop: `blockSize ${blockSize}`,
        to_target: "body",
        be_target: "calculate",
        function: "verifyBlockSize",
      });
    }
  }

  /**
   * 校验签名
   *
   * @param block
   */
  verifySignature(block: T) {
    return this.blockHelper.verifyBlockSignature(block);
  }

  /**
   * 检查交易是否可以被创建
   * @param type
   */
  @cacheGetter
  get canInsertTransaction() {
    return this.transactionCore.canCreateTransaction.bind(this.transactionCore);
  }

  /**
   * 计算出区块的blockSize的正确值
   * @param block
   */
  calcBlockSize(block: Block, transactionBufferList?: Uint8Array[]) {
    const BLOCK_SIZE_FIELD_ID = Block.$type.fields.blockSize.id;
    const getBlockSizeByteSizeInfo = (blockSize: number) => {
      return {
        value: blockSize,
        size:
          blockSize === 0
            ? 0
            : new Writer().uint32(BLOCK_SIZE_FIELD_ID).uint32(blockSize).finish().length,
      };
    };
    const oldBlockSize = block.blockSize;
    let newBlockSize = oldBlockSize;

    newBlockSize =
      block.getBytes(false, transactionBufferList).length +
      (block.signatureBuffer.length ? 0 : 66) /* signature 的前置为 1位 + 32长度的signature */;
    if (oldBlockSize !== newBlockSize) {
      let oldBlockSizeInfo = getBlockSizeByteSizeInfo(oldBlockSize);
      do {
        /**
         * 这里只是算出blockSize这个数字要写入模型中要占用的字节数
         * 而真实的blockSize又要基于这个字节数，加上真实的模型大小的来。
         * 所以在block.blockSize加上blockSize存储所需的字节数后，它会变大
         * blockSize值变大的同时，也就意味着存储这个字所需的字节数也会增加
         * 因此需要有一个循环来让blockSize稳定在一个区间内。
         */
        const newBlockSizeInfo = getBlockSizeByteSizeInfo(newBlockSize);

        if (newBlockSizeInfo.size !== oldBlockSizeInfo.size) {
          newBlockSize += newBlockSizeInfo.size - oldBlockSizeInfo.size;
          oldBlockSizeInfo = newBlockSizeInfo;
        } else {
          break;
        }
      } while (true);
    }
    return newBlockSize;
  }

  /**
   * 指定的区块是否已经存在
   *
   * @param signature
   * @param height
   * @param blockGetterHelper
   */
  async isBlockAlreadyExist(
    signature: string,
    height: number,
    blockGetterHelper: Pick<BFChainCore.BlockGetterHelperInterface, "getCountBlock">,
  ) {
    const Function_Exception_Detail = {
      function: "isBlockAlreadyExist",
    } as const;
    if (typeof blockGetterHelper.getCountBlock !== "function") {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "getCountBlock",
        target: "blockGetterHelper",
        ...Function_Exception_Detail,
      });
    }
    const count = await blockGetterHelper.getCountBlock({ signature });
    if (count > 0) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `Block with signature ${signature}`,
        target: "blockChain",
        errorId: `Block already exists: ${signature} height: ${height}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验交易涉及的账户变动
   *
   * @param trsInBlock
   * @param applyResult
   * @param statisticsInfo
   */
  verifyTransactionAssetChange(
    trsInBlock: BFChainCore.TransactionInBlock,
    applyResult: BFChainCore.AccountChangeResultInfo,
    statisticsInfo: StatisticsInfo,
  ) {
    const Function_Exception_Detail = {
      function: "verifyTransactionAssetChange",
    } as const;
    const { transactionAssetChanges, transaction } = trsInBlock;
    const calTransactionAssetChanges: {
      [assetTypeAndAccountType: string]: string;
    } = {};
    const chainAssetInfoHelper = this.chainAssetInfoHelper;
    for (const address in applyResult) {
      const addressApplyResult = applyResult[address];
      for (const magicAndAssetType in addressApplyResult) {
        const asset = addressApplyResult[magicAndAssetType];
        const keyArray = magicAndAssetType.split("_");
        if (keyArray.length !== 2) {
          throw new ConsensusException(PROP_IS_INVALID, {
            prop: `key ${magicAndAssetType}`,
            target: "applyResult",
            ...Function_Exception_Detail,
          });
        }
        const chainAssetInfo = chainAssetInfoHelper.getAssetInfo(keyArray[0], keyArray[1]);
        const assetStatistic = statisticsInfo.getAssetStatistic(chainAssetInfo);
        if (!assetStatistic) {
          throw new ConsensusException(NOT_EXIST, {
            prop: "assetStatistic",
            target: "statisticsInfo",
            ...Function_Exception_Detail,
          });
        }
        const index = assetStatistic.index;
        if (transaction.senderId === address) {
          calTransactionAssetChanges[
            `${index}_${TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER}`
          ] = asset;
        } else {
          calTransactionAssetChanges[
            `${index}_${TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.RECIPIENT}`
          ] = asset;
        }
      }
    }
    for (const assetChange of transactionAssetChanges) {
      const { assetTypes, accountType, assetBalance } = assetChange;
      const key = `${assetTypes}_${accountType}`;
      if (!calTransactionAssetChanges[key]) {
        throw new ConsensusException(NOT_EXIST, {
          prop: `${assetTypes}_${accountType}`,
          target: "calTransactionAssetChanges",
          ...Function_Exception_Detail,
        });
      }
      if (assetBalance !== calTransactionAssetChanges[key]) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `assetBalance ${assetBalance}`,
          be_compare_prop: `assetBalance ${calTransactionAssetChanges[key]}`,
          to_target: "transactionAssetChanges",
          be_target: "calTransactionAssetChanges",
          ...Function_Exception_Detail,
        });
      }
    }
  }
}
