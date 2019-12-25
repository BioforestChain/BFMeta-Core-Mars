import { AsyncIteratorGenerator, QueneEventEmitter } from "@bfchain/util";
import { BaseHelper, ConfigHelper } from "@bfchain/core-helper";
import { Block, CommonBlock, PeerInfoModel, TransactionInBlock } from "@bfchain/core-model";
import { ChainChannel, ChainChannelBase } from "./ChainChannel";
export declare const CHAIN_CHANNEL_GROUP_ARGS: {
    GROUP_NAME: symbol;
    CHANNEL_LIST: symbol;
    OPTIONS: symbol;
};
/**
 * 批量双工通讯管理器
 */
export declare class ChainChannelGroup<DH extends ChainChannel = ChainChannel> extends ChainChannelBase {
    groupName: string;
    protected baseHelper: BaseHelper;
    protected config: ConfigHelper;
    private timeHelper;
    protected chainChannelSet: Set<DH>;
    get size(): number;
    forEach(hanlder: (chainChannel: DH, i: number) => any): void;
    include(chainChannel: DH): boolean;
    [Symbol.iterator](): IterableIterator<DH>;
    options: {
        disableAutoRemove?: boolean;
    };
    constructor(chainChannelList: DH[], groupName?: string, opts?: Partial<ChainChannelGroup["options"]>);
    private _parallelTasksMap;
    /**开始一个节点并发任务 */
    startParallelTask(task_id: string): {
        getFreeChainChannel: () => DH | Promise<DH>;
        freeChainChannel: (chainChannel: DH) => void;
        busyChainChannel: (chainChannel: DH) => void;
    };
    /**释放并发任务 */
    releaseParallelTask(task_id: string): false | undefined;
    /**
     * 查询交易
     */
    queryTransactions(query: BFChainUtil.FirstArgument<DH["queryTransactions"]>, sort?: BFChainUtil.SecondArgument<DH["queryTransactions"]>, opts?: BFChainUtil.ThirdArgument<DH["queryTransactions"]>, _resultGenerator?: AsyncIteratorGenerator<TransactionInBlock>): AsyncIteratorGenerator<TransactionInBlock<import("@bfchain/core-model").Transaction<object>>>;
    /**
     * 广播交易体
     */
    broadcastTransaction(transaction: BFChainCore.NewTransactionArgJSON["transaction"], opts?: BFChainCore.ChannelRequestOptions & {
        max_parallel_num?: number;
    }, event?: QueneEventEmitter<BFChainCore.BroadcastNewTransactionEvents<DH>>): Promise<{
        chainChannel: DH;
        result: {
            error: boolean;
            result: import("@bfchain/core-model").NewTransactionReturnModel | Error;
            chainChannel: DH;
        };
    }[] | undefined>;
    /**
     * 查询区块
     */
    queryBlock(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>): Promise<import("@bfchain/core-model").QueryBlockReturnModel>;
    findBlock<B extends Block = CommonBlock>(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>): Promise<B | undefined>;
    /**
     * 广播区块
     */
    broadcastBlock(...args: BFChainUtil.AllArgument<ChainChannel["broadcastBlock"]>): Promise<{
        chainChannel: DH;
        result: Promise<import("@bfchain/core-model").NewBlockReturn>;
    }[]>;
    getPeerInfo(...args: BFChainUtil.AllArgument<ChainChannel["getPeerInfo"]>): Promise<PeerInfoModel | undefined>;
    /**
     * chainChannel autoRemove When Close ListenerRemover WeakMap
     */
    private _DAWCLWM;
    addChainChannel(chainChannel: DH, opts?: {
        disableAutoRemove?: boolean | undefined;
    }): boolean;
    removeChainChannel(chainChannel: DH): boolean;
    private _eventFollower;
    private addChainChannel_;
    destroy(): void;
}
//# sourceMappingURL=ChainChannelGroup.d.ts.map