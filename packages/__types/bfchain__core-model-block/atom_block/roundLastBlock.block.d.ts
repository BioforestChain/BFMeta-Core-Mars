import { Block } from "@bfchain/core-model-block-base";
import { RoundLastBlockRemarkModel } from "@bfchain/core-model-block-remark";
export declare class RoundLastBlock extends Block<BFChainCore.RoundLastBlockRemarkJSON> implements BFChainCore.RoundLastBlock {
    remark: RoundLastBlockRemarkModel;
}
