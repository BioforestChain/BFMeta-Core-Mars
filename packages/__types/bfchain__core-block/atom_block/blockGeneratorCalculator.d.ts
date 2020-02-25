import { BlockHelper, ConfigHelper, AccountBaseHelper, TransactionHelper, ChainTimeHelper } from "@bfchain/core-helper";
import type { Block } from "@bfchain/core-model-block";
export declare class BlockGeneratorCalculator {
    private config;
    private timeHelper;
    private blockHelper;
    private accountBaseHelper;
    private transactionHelper;
    constructor(config: ConfigHelper, timeHelper: ChainTimeHelper, blockHelper: BlockHelper, accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper);
    private blockGetterHelper?;
    calcGenerateBlockDelegate(currentBlock: {
        timestamp: number;
        height: number;
    }, opts: {
        usedAddressCache?: BFChainCore.UsedAddressCacheJSON;
        curTime?: number;
        blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
    }): Promise<{
        address: string;
        timestamp: number;
    }>;
    private __idNumberMap;
    calcGenerateBlockDelegateGenerator(currentBlock: {
        timestamp: number;
        height: number;
    }, opts: {
        heightAcc: number;
        timeAcc?: number;
        curTime?: number;
        blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
        cache_block?: {
            [height: number]: Promise<Block | undefined>;
        };
        usedAddressCache?: BFChainCore.UsedAddressCacheJSON;
    }): AsyncGenerator<{
        address: string;
        timestamp: number;
    }, void, unknown>;
    private _getStringHash;
    private _pickDelegateAddressCommon;
    private _pickEmergencyDelegateAddress;
    private _recoverUsedGeneratorAddressMap;
    private _fillUsedAddressMap;
}
