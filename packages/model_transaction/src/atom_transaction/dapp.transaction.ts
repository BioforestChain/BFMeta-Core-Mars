import { Transaction } from "@bfchain/core-model-transaction-base";
import { DAppAssetModel } from "@bfchain/core-model-transaction-asset/dapp";
import { Type, Field } from "@bfchain/protobuf";

/**
 * dapp 交易模型
 *
 */
@Type.d("DAppTransaction")
export class DAppTransaction extends Transaction<BFChainCore.DAppAssetJSON>
  implements BFChainCore.TransactionMixJSON<BFChainCore.DAppAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.DAppAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(DAppTransaction.INC++, DAppAssetModel)
  asset!: DAppAssetModel;
}
