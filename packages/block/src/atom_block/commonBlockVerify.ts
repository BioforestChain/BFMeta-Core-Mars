import {
  BlockHelper,
  BaseHelper,
  MilestonesHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Writer } from "@bfchain/protobuf";
import { Block } from "@bfchain/core-model-block";
import { cacheGetter, Injectable, Inject } from "@bfchain/util";

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
   * @param asset
   */
  verifyBlockBody(body: BFChainCore.BlockBody, asset: BFChainCore.GetBlockAssetJSON<T>) {
    const { baseHelper } = this;
    if (!body) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "body",
      });
    }

    if (!asset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "asset",
      });
    }

    const BlockBody_Exception_Detail = {
      target: "body",
    };

    if (!baseHelper.isPositiveInteger(body.version)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `version ${body.version}`,
        type: "positive integer",
        ...BlockBody_Exception_Detail,
      });
    }

    const height = body.height;
    if (!baseHelper.isPositiveInteger(height)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `height ${height}`,
        type: "positive integer",
        ...BlockBody_Exception_Detail,
      });
    }

    if (height > 1 && !body.previousBlockId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "previousBlockId",
        ...BlockBody_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(body.timestamp)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `timestamp ${body.timestamp}`,
        type: "positive integer or 0",
        ...BlockBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAccountEquity(body.generatorEquity)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "generatorEquity",
        type: "account equity",
        ...BlockBody_Exception_Detail,
      });
    }

    const remark = body.remark;
    if (!remark) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "remark",
        ...BlockBody_Exception_Detail,
      });
    }
    if (baseHelper.getVariableType(remark) !== "[object Object]") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "remark",
        ...BlockBody_Exception_Detail,
      });
    }
    for (const key in remark) {
      if (!baseHelper.isString(remark[key])) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "remark",
          ...BlockBody_Exception_Detail,
        });
      }
    }

    if (!remark && baseHelper.getVariableType(remark) !== "[object Object]") {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "remark",
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
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `blockReward ${block.reward}`,
        be_compare_prop: `expectedReward ${expectedReward}`,
        to_target: "block",
        be_target: "calculate",
      });
    }
  }

  /**
   * 校验区块大小
   *
   */
  verifyBlockSize(block: T, transactionBufferList?: Uint8Array[]) {
    const blockSize = this.calcBlockSize(block, transactionBufferList);
    if (block.blockSize !== blockSize) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `blockSize ${block.blockSize}`,
        be_compare_prop: `blockSize ${blockSize}`,
        to_target: "body",
        be_target: "calculate",
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
      block.getBytes(false, false, transactionBufferList).length +
      (block.signatureBuffer.length ? 0 : 66) /* signature 的前置为 1位 + 32长度的signature */;
    if (block.generatorPublicKeyBuffer) {
      const signSignatureSize =
        (block.signSignatureBuffer && block.signSignatureBuffer.length) || 0;
      newBlockSize += signSignatureSize ? 0 : 66;
    }
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
        if (newBlockSizeInfo.size === oldBlockSizeInfo.size) {
          break;
        }
        newBlockSize += newBlockSizeInfo.size - oldBlockSizeInfo.size;
        oldBlockSizeInfo = newBlockSizeInfo;
      } while (true);
    }
    return newBlockSize;
  }

  /**
   * 指定的区块是否已经存在
   *
   * @param blockId
   * @param height
   * @param blockGetterHelper
   */
  async isBlockAlreadyExist(
    blockId: string,
    height: number,
    blockGetterHelper: Pick<BFChainCore.BlockGetterHelperInterface, "getCountBlock">,
  ) {
    if (typeof blockGetterHelper.getCountBlock !== "function") {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "getCountBlock",
        target: "blockGetterHelper",
      });
    }
    const count = await blockGetterHelper.getCountBlock({ blockId });
    if (count > 0) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `Block with blockId ${blockId}`,
        target: "blockChain",
        errorId: `Block already exists: ${blockId} height: ${height}`,
      });
    }
  }
}
