import { Block } from "@bfchain/core-model-block-base";
import { CommonBlockRemarkModel } from "@bfchain/core-model-block-remark";
export declare class CommonBlock extends Block<BFChainCore.CommonBlockRemarkJSON> implements BFChainCore.CommonBlock {
    remark: CommonBlockRemarkModel;
}
