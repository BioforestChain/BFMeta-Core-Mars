import { QueryTransactionArgModel, QueryTransactionReturnModel, NewTransactionArgModel, NewTransactionReturnModel, QueryBlockArgModel, QueryBlockReturnModel, NewBlockArgModel, NewBlockReturn, GetPeerInfoArgModel, GetPeerInfoReturnModel } from "@bfchain/core-model";
import { BaseHelper, AccountBaseHelper, TransactionHelper, BlockHelper } from "@bfchain/core-helper";
export declare class ChainChannelHelper {
    private baseHelper;
    private accountHelper;
    private transctionHelper;
    private blockHelper;
    constructor(baseHelper: BaseHelper, accountHelper: AccountBaseHelper, transctionHelper: TransactionHelper, blockHelper: BlockHelper);
    /**
     * 生成并校验交易查询的传入参数
     */
    boxQueryTransactionArg(params: ArrayBuffer | Uint8Array): QueryTransactionArgModel;
    /**
     * 生成并校验交易查询的返回结果
     */
    boxQueryTransactionReturn(params: ArrayBuffer | Uint8Array): QueryTransactionReturnModel;
    /**
     * 生成并校验交易广播的传入参数
     */
    boxNewTransactionArg(params: ArrayBuffer | Uint8Array): NewTransactionArgModel;
    /**
     * 生成并校验交易广播的返回结果
     */
    boxNewTransactionReturn(params: ArrayBuffer | Uint8Array): NewTransactionReturnModel;
    /**
     * 生成并校验区块查询的传入参数
     */
    boxQueryBlockArg(params: ArrayBuffer | Uint8Array): QueryBlockArgModel;
    /**
     * 生成并校验区块查询的返回结果
     */
    boxQueryBlockReturn(params: ArrayBuffer | Uint8Array): QueryBlockReturnModel;
    /**
     * 生成并校验区块查询的传入参数
     */
    boxNewBlockArg(params: ArrayBuffer | Uint8Array): NewBlockArgModel;
    /**
     * 生成并校验区块查询的返回结果
     */
    boxNewBlockReturn(params: ArrayBuffer | Uint8Array): NewBlockReturn;
    /**
     * 生成并校验获取节点信息的传入参数
     */
    boxGetPeerInfoArg(params: ArrayBuffer | Uint8Array): GetPeerInfoArgModel;
    /**
     * 生成并校验获取节点信息的返回结果
     */
    boxGetPeerInfoReturn(params: ArrayBuffer | Uint8Array): GetPeerInfoReturnModel;
}
//# sourceMappingURL=chainChannelHelper.d.ts.map