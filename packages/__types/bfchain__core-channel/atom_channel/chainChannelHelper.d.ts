import { QueryTransactionArgModel, QueryTransactionReturnModel, NewTransactionArgModel, NewTransactionReturnModel, QueryBlockArgModel, QueryBlockReturnModel, NewBlockArgModel, NewBlockReturn, GetPeerInfoArgModel, GetPeerInfoReturnModel } from "@bfchain/core-model";
import { BaseHelper, AccountBaseHelper, TransactionHelper, BlockHelper } from "@bfchain/core-helper";
export declare class ChainChannelHelper {
    private baseHelper;
    private accountBaseHelper;
    private transctionHelper;
    private blockHelper;
    constructor(baseHelper: BaseHelper, accountBaseHelper: AccountBaseHelper, transctionHelper: TransactionHelper, blockHelper: BlockHelper);
    boxQueryTransactionArg(params: ArrayBuffer | Uint8Array): QueryTransactionArgModel;
    boxQueryTransactionReturn(params: ArrayBuffer | Uint8Array): QueryTransactionReturnModel;
    boxNewTransactionArg(params: ArrayBuffer | Uint8Array): NewTransactionArgModel;
    boxNewTransactionReturn(params: ArrayBuffer | Uint8Array): NewTransactionReturnModel;
    boxQueryBlockArg(params: ArrayBuffer | Uint8Array): QueryBlockArgModel;
    boxQueryBlockReturn(params: ArrayBuffer | Uint8Array): QueryBlockReturnModel<import("@bfchain/core-model").Block<BFChainCore.CommonBlockRemarkJSON>>;
    boxNewBlockArg(params: ArrayBuffer | Uint8Array): NewBlockArgModel;
    boxNewBlockReturn(params: ArrayBuffer | Uint8Array): NewBlockReturn;
    boxGetPeerInfoArg(params: ArrayBuffer | Uint8Array): GetPeerInfoArgModel;
    boxGetPeerInfoReturn(params: ArrayBuffer | Uint8Array): GetPeerInfoReturnModel;
}
