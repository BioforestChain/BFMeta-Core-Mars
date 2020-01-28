import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueSubchainAssetModel } from "./issueSubchain.asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * issueSubchain 交易模型
 *
 */
@Type.d("IssueSubchainTransaction")
export class IssueSubchainTransaction extends Transaction<BFChainCore.IssueSubchainAssetJSON>
  implements BFChainCore.IssueSubchainTransactionJSON {
  recipientId!: undefined;
  @Field.d(IssueSubchainTransaction.INC++, IssueSubchainAssetModel)
  asset!: IssueSubchainAssetModel;
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.IssueSubchainAssetJSON,
    { hasRecipientId: false }
  >;
}
