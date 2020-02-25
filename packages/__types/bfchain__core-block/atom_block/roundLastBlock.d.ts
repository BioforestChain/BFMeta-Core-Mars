import { BlockFactory } from "./_blockbase";
import { RoundLastBlock } from "@bfchain/core-model-block";
import { BlockHelper, AccountBaseHelper, BaseHelper, ConfigHelper, MilestonesHelper, AsymmetricHelper, ChainAssetInfoHelper, BlockBaseStatisticsHelper } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
export declare class RoundLastBlockFactory extends BlockFactory<RoundLastBlock> {
    blockHelper: BlockHelper;
    accountBaseHelper: AccountBaseHelper;
    baseHelper: BaseHelper;
    config: ConfigHelper;
    statisticsHelper: BlockBaseStatisticsHelper;
    milestonesHelper: MilestonesHelper;
    asymmetricHelper: AsymmetricHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    moduleMap: ModuleStroge;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    transactionCore: import("@bfchain/core-transaction").TransactionCore;
    constructor(blockHelper: BlockHelper, accountBaseHelper: AccountBaseHelper, baseHelper: BaseHelper, config: ConfigHelper, statisticsHelper: BlockBaseStatisticsHelper, milestonesHelper: MilestonesHelper, asymmetricHelper: AsymmetricHelper, chainAssetInfoHelper: ChainAssetInfoHelper, moduleMap: ModuleStroge, cryptoHelper: BFChainCore.CryptoHelperInterface);
    fromJSON(blockBody: BFChainCore.BlockJSON<BFChainCore.RoundLastBlockRemarkJSON>, opts?: {
        verify?: boolean;
        config?: ConfigHelper;
    }): RoundLastBlock;
    verifyBlockBody(body: BFChainCore.BlockBody, roundLastBlockRemark: BFChainCore.RoundLastBlockRemarkJSON, config?: ConfigHelper): void;
    _generateBlock(body: BFChainCore.BlockBody, roundLastBlockRemark: BFChainCore.RoundLastBlockRemarkJSON): RoundLastBlock;
}
