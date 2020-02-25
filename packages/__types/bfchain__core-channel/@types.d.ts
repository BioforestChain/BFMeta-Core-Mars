declare namespace BFChainCore {
    type BroadcastNewTransactionEvents<DH extends ChainChannel> = {
        startBroadcasting: BFChainUtil.EventInOut<{
            chainChannelList: DH[];
        }, {
            break: boolean;
        }>;
        broadcasted: BFChainUtil.EventInOut<{
            error: boolean;
            result: import("@bfchain/core-model-channel").NewTransactionReturnModel | Error;
            chainChannel: DH;
        }, {
            break: boolean;
        }>;
        endBroadcast: BFChainUtil.EventInOut<{
            duraction: number;
        }, any>;
    };
    type ChainChannelHanlderEventMap = {
        handleMessageError: {
            in: Error;
            out: undefined;
        };
        onQueryTransaction: {
            in: import("@bfchain/core-model").QueryTransactionArgModel;
            out: QueryTransactionReturnParams | undefined;
        };
        onNewTransaction: {
            in: import("@bfchain/core-model").NewTransactionArgModel;
            out: NewTransactionReturnParams | undefined;
        };
        onQueryBlock: {
            in: import("@bfchain/core-model").QueryBlockArgModel;
            out: QueryBlockReturnParams | undefined;
        };
        onNewBlock: {
            in: import("@bfchain/core-model").NewBlockArgModel;
            out: NewBlockReturnParams | undefined;
        };
        onGetPeerInfo: {
            in: import("@bfchain/core-model").GetPeerInfoArgModel;
            out: GetPeerInfoReturnParams | undefined;
        };
    };
    type ChannelRequestOptions = {
        timeout?: number;
        grabSecret?: string;
    };
    type QueneEventEmitterPro<EM extends BFChainUtil.EventInOutMap> = import("@bfchain/util").QueneEventEmitterPro<EM>;
    interface ChainChannel extends ChainChannelBase, QueneEventEmitterPro<ChainChannelHanlderEventMap> {
        mayby_height: number;
        delay: number;
        onClose(handler: (error: BFChainUtil.InterruptedException) => any, once?: boolean): EventListenerRemover;
        postResponseMessage(req_id: number, cmd: import("@bfchain/core-model").DUPLEX_API_CMD, binary: Uint8Array): void;
        queryTransactions(query: QueryTransactionArgJSON["query"], sort?: QueryTransactionArgJSON["sort"], opts?: ChannelRequestOptions): Promise<import("@bfchain/core-model").QueryTransactionReturnModel>;
        initBroadcastTransactionArg(transaction: NewTransactionArgJSON["transaction"], opts?: ChannelRequestOptions): readonly [import("@bfchain/core-model").DUPLEX_API_CMD.NEW_TRANSACTION, Uint8Array, (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").NewTransactionReturnModel, ChannelRequestOptions];
        broadcastTransaction(transaction: NewTransactionArgJSON["transaction"], opts?: ChannelRequestOptions): Promise<import("@bfchain/core-model").NewTransactionReturnModel>;
        queryBlock<B extends Block = Block>(query: QueryBlockArgJSON["query"], opts?: ChannelRequestOptions): Promise<import("@bfchain/core-model").QueryBlockReturnModel<B>>;
        findBlock<B extends Block = Block>(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>): Promise<B | undefined>;
        initBroadcastBlockArg(blockInfo: NewBlockArgJSON, opts?: ChannelRequestOptions): readonly [import("@bfchain/core-model").DUPLEX_API_CMD.NEW_BLOCK, Uint8Array, (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").NewBlockReturn, ChannelRequestOptions | undefined];
        broadcastBlock(blockInfo: NewBlockArgJSON, opts?: ChannelRequestOptions): Promise<import("@bfchain/core-model").NewBlockReturn>;
        initOnMessage(): void;
        _requestWithBinaryData<T>(cmd: import("@bfchain/core-model").DUPLEX_API_CMD, binary: Uint8Array, ResonseBoxer: (bytes: Uint8Array) => T, options?: ChannelRequestOptions | undefined): Promise<T>;
    }
    interface ChainChannelGroup<CC extends ChainChannel> extends ChainChannelBase {
        groupName: string;
        size: number;
        forEach(hanlder: (chainChannel: CC, i: number) => any): void;
        include(chainChannel: CC): boolean;
        [Symbol.iterator](): IterableIterator<CC>;
        startParallelTask(task_id: string): {
            getFreeChainChannel: () => CC | Promise<CC>;
            freeChainChannel: (chainChannel: CC) => void;
            busyChainChannel: (chainChannel: CC) => void;
        };
        releaseParallelTask(task_id: string): false | undefined;
        queryTransactions(query: BFChainUtil.FirstArgument<CC["queryTransactions"]>, sort?: BFChainUtil.SecondArgument<CC["queryTransactions"]>, opts?: BFChainUtil.ThirdArgument<CC["queryTransactions"]>, _resultGenerator?: import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock>): import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock>;
        broadcastTransaction(transaction: NewTransactionArgJSON["transaction"], opts?: ChannelRequestOptions & {
            max_parallel_num?: number;
        }, event?: BFChainUtil.QueneEventEmitter<BroadcastNewTransactionEvents<CC>>): Promise<{
            chainChannel: CC;
            result: {
                error: boolean;
                result: import("@bfchain/core-model").NewTransactionReturnModel | Error;
                chainChannel: CC;
            };
        }[] | undefined>;
        queryBlock(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>): Promise<import("@bfchain/core-model").QueryBlockReturnModel>;
        findBlock<B extends Block = CommonBlock>(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>): Promise<B | undefined>;
        broadcastBlock(...args: BFChainUtil.AllArgument<ChainChannel["broadcastBlock"]>): Promise<{
            chainChannel: CC;
            result: Promise<import("@bfchain/core-model").NewBlockReturn>;
        }[]>;
    }
    type ChainChannelGroupEventMap<CC extends ChainChannel = ChainChannel> = {
        addChainChannel: [CC];
        removeChainChannel: [CC];
    };
    interface ChainChannelBase {
        toBlockGetterHelper(opts?: {
            maxHeight?: number;
            lastBlock?: Block;
        }): BlockGetterHelperSimpleInterface;
    }
}
