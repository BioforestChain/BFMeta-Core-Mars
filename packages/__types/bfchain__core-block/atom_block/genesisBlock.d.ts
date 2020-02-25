import { BlockFactory } from "./_blockbase";
import { GenesisBlock } from "@bfchain/core-model-block";
import { BlockHelper, BaseHelper, AccountBaseHelper, ConfigHelper, MilestonesHelper, AsymmetricHelper, ChainAssetInfoHelper, BlockBaseStatisticsHelper, ConfigHelperMap } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
export declare class GenesisBlockFactory extends BlockFactory<GenesisBlock> {
    blockHelper: BlockHelper;
    accountBaseHelper: AccountBaseHelper;
    baseHelper: BaseHelper;
    config: ConfigHelper;
    statisticsHelper: BlockBaseStatisticsHelper;
    milestonesHelper: MilestonesHelper;
    asymmetricHelper: AsymmetricHelper;
    moduleMap: ModuleStroge;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private configMap;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    transactionCore: import("@bfchain/core-transaction").TransactionCore;
    constructor(blockHelper: BlockHelper, accountBaseHelper: AccountBaseHelper, baseHelper: BaseHelper, config: ConfigHelper, statisticsHelper: BlockBaseStatisticsHelper, milestonesHelper: MilestonesHelper, asymmetricHelper: AsymmetricHelper, moduleMap: ModuleStroge, chainAssetInfoHelper: ChainAssetInfoHelper, configMap: ConfigHelperMap, cryptoHelper: BFChainCore.CryptoHelperInterface);
    fromJSON(blockBody: BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>, opts?: {
        verify?: boolean;
        config?: ConfigHelper;
    }): GenesisBlock;
    verifyBlockBody(body: BFChainCore.BlockBody, remark: BFChainCore.GenesisBlockRemarkJSON, config?: ConfigHelper): void;
    private _blockCore;
    _generateBlock(body: BFChainCore.BlockBody, genesisBlockRemark: BFChainCore.GenesisBlockRemarkJSON): GenesisBlock;
}
