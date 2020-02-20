import { Field, Message, Type, MapField } from "@bfchain/protobuf";
import { BlocksProgressEventModel } from "./blocks.model";
import { ProgressEventModel } from "./progressEvent.model";

/**区块链重建中的事件进度模型 */
@Type.d("BlockchainRebuidingProgressEvent")
export class BlockchainRebuidingProgressEventModel extends ProgressEventModel<"blockchainRebuiding">
  implements BFChainCore.JSONToModelType<BFChainCore.BlockchainRebuildingProgressEventJSON> {
  /**当前正在处理的区块的进度 */
  @Field.d(BlockchainRebuidingProgressEventModel.INC++, BlocksProgressEventModel)
  currentBlockDetails!: BlocksProgressEventModel;
  toJSON(): BFChainCore.BlockchainRebuildingProgressEventJSON {
    return Object.assign(
      {
        currentBlockDetails: this.currentBlockDetails.toJSON(),
      },
      super.toJSON(),
    );
  }
}

/**区块链节点扫描共识中的事件进度模型
 * 大部分情况处于 INDETERMINATE 模式
 * 在扫描节点阶段, total 会一直增加
 * 同时会进行共识, 此时的 loaded 会不断的变动
 */
@Type.d("BlockchainPeerScanningProgressEvent")
export class BlockchainPeerScanningProgressEventModel
  extends ProgressEventModel<"blockchainPeerScanning">
  implements BFChainCore.JSONToModelType<BFChainCore.BlockchainPeerScanningProgressEventJSON> {}

/**区块链验证区块的事件进度模型
 * total 代表着校验交易的数量, 另外每一个区块另外代表着 1 个任务数
 * 验证的过程中如果收到新的区块, 那么 total 也要跟着增加
 */
@Type.d("BlockchainReplayBlockProgressEvent")
export class BlockchainReplayBlockProgressEventModel
  extends ProgressEventModel<"blockchainReplayBlock">
  implements BFChainCore.JSONToModelType<BFChainCore.BlockchainReplayBlockProgressEventJSON> {
  /**当前同步的区块的生效进度 */
  @MapField.d(BlockchainRebuidingProgressEventModel.INC++, "uint32", BlocksProgressEventModel)
  applyDetails!: { [height: number]: BlocksProgressEventModel };
  /**当前下载的区块的进度 */
  @MapField.d(BlockchainRebuidingProgressEventModel.INC++, "uint32", BlocksProgressEventModel)
  syncDetails!: { [height: number]: BlocksProgressEventModel };
  toJSON(): BFChainCore.BlockchainReplayBlockProgressEventJSON {
    const applyDetails: BFChainCore.BlockchainReplayBlockProgressEventJSON["applyDetails"] = {};
    for (const h in this.applyDetails) {
      applyDetails[h] = this.applyDetails[h].toJSON();
    }
    const syncDetails: BFChainCore.BlockchainReplayBlockProgressEventJSON["syncDetails"] = {};
    for (const h in this.syncDetails) {
      syncDetails[h] = this.syncDetails[h].toJSON();
    }
    return Object.assign(
      {
        applyDetails,
        syncDetails,
      },
      super.toJSON(),
    );
  }
}

@Type.d("BlockchainRollbackProgressEventModel")
export class BlockchainRollbackProgressEventModel
  extends ProgressEventModel<"blockchainRollbackBlock">
  implements BFChainCore.JSONToModelType<BFChainCore.BlockchainRollbackProgressEventJSON> {}

/**区块链锻造区块的事件进度模型 */
@Type.d("BlockchainGeneratingProgressEvent")
export class BlockchainGeneratingProgressEventModel
  extends ProgressEventModel<"blockchainGenerating">
  implements BFChainCore.JSONToModelType<BFChainCore.BlockchainGeneratingProgressEventJSON> {}

export type SomeBlockchainStatusProgressEvent =
  | BlockchainRebuidingProgressEventModel
  | BlockchainPeerScanningProgressEventModel
  | BlockchainReplayBlockProgressEventModel
  | BlockchainGeneratingProgressEventModel
  | BlockchainRollbackProgressEventModel;
