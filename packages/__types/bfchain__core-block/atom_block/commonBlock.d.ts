import { BlockFactory } from "./_blockbase";
import { CommonBlock } from "@bfchain/core-model-block";
import { BlockHelper, BaseHelper, ConfigHelper, MilestonesHelper, AsymmetricHelper, ChainAssetInfoHelper, BlockBaseStatisticsHelper } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
export declare class CommonBlockFactory extends BlockFactory<CommonBlock> {
    blockHelper: BlockHelper;
    baseHelper: BaseHelper;
    config: ConfigHelper;
    statisticsHelper: BlockBaseStatisticsHelper;
    milestonesHelper: MilestonesHelper;
    asymmetricHelper: AsymmetricHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    moduleMap: ModuleStroge;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    transactionCore: import("@bfchain/core-transaction").TransactionCore;
    constructor(blockHelper: BlockHelper, baseHelper: BaseHelper, config: ConfigHelper, statisticsHelper: BlockBaseStatisticsHelper, milestonesHelper: MilestonesHelper, asymmetricHelper: AsymmetricHelper, chainAssetInfoHelper: ChainAssetInfoHelper, moduleMap: ModuleStroge, cryptoHelper: BFChainCore.CryptoHelperInterface);
    fromJSON(blockBody: BFChainCore.BlockJSON<BFChainCore.CommonBlockRemarkJSON>, opts?: {
        verify?: boolean;
        config?: ConfigHelper;
    }): CommonBlock;
    verifyBlockBody(body: BFChainCore.BlockBody, commonBlockRemark: BFChainCore.CommonBlockRemarkJSON, config?: ConfigHelper): void;
    _generateBlock(body: BFChainCore.BlockBody, commonBlockRemark: BFChainCore.CommonBlockRemarkJSON): CommonBlock;
}
