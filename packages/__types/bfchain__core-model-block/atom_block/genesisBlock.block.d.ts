import { Block } from "@bfchain/core-model-block-base";
import { GenesisBlockRemarkModel } from "@bfchain/core-model-block-remark";
export declare class GenesisBlock extends Block<BFChainCore.GenesisBlockRemarkJSON> implements BFChainCore.GenesisBlock {
    remark: GenesisBlockRemarkModel;
}
