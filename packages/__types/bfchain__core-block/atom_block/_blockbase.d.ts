/// <reference types="node" />
import { Block, GetBlockRemarkJSON } from "@bfchain/core-model-block";
import { TransactionInBlock } from "@bfchain/core-model-transaction";
import type { BlockHelper, BaseHelper, ConfigHelper, MilestonesHelper, AsymmetricHelper, ChainAssetInfoHelper, BlockBaseStatisticsHelper } from "@bfchain/core-helper";
export declare abstract class BlockFactory<T extends Block> {
    abstract transactionCore: import("@bfchain/core-transaction").TransactionCore;
    abstract blockHelper: BlockHelper;
    abstract baseHelper: BaseHelper;
    abstract cryptoHelper: BFChainCore.CryptoHelperInterface;
    abstract config: ConfigHelper;
    abstract statisticsHelper: BlockBaseStatisticsHelper;
    abstract milestonesHelper: MilestonesHelper;
    abstract asymmetricHelper: AsymmetricHelper;
    abstract chainAssetInfoHelper: ChainAssetInfoHelper;
    abstract fromJSON(blockBody: BFChainCore.BlockJSON<GetBlockRemarkJSON<T>>): T;
    transactionInBlockFromJSON<T extends BFChainCore.TransactionJSON>(twi: BFChainCore.TransactionInBlockJSON<T>): TransactionInBlock<import("@bfchain/core-model-transaction").Transaction<T["asset"]>>;
    generateBlock(body: BFChainCore.BlockBody, remark: GetBlockRemarkJSON<T>, transactions: AsyncIterable<TransactionInBlock>, keypair: {
        publicKey: Buffer;
        secretKey?: Buffer;
    }, eventEmitter?: BFChainCore.GenerateBlockEventEmitter, config?: ConfigHelper): Promise<T>;
    abstract _generateBlock(body: BFChainCore.BlockBody, remark: GetBlockRemarkJSON<T>): T;
    insertTransactions(block: T, trsGenerator: AsyncIterable<TransactionInBlock>, keypair: {
        publicKey: Buffer;
        secretKey?: Buffer;
    }, eventEmitter?: BFChainCore.ApplyTransactionEventEmitter): Promise<T>;
    calcBlockSize(block: Block): number;
    verifyKeypair(keypair: BFChainCore.Keypair): void;
    verifyBlockBody(body: BFChainCore.BlockBody, remark: GetBlockRemarkJSON<T>, config?: ConfigHelper): void;
    verifyBlockTransactions(block: T, config?: ConfigHelper, eventEmitter?: BFChainCore.ApplyTransactionEventEmitter): void;
    verifyBaseInfo(block: T, config?: ConfigHelper): void;
    verifySignature(block: T): void;
    verifyRemarkSize(block: T): void;
    verify(block: T, config?: ConfigHelper): void;
    generateSignature(block: Block): string;
}
