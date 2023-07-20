import { Type, Field } from "@bfchain/protobuf";
import { DelegateAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * delegate 交易模型
 *
 */
@Type.d("DelegateTransaction")
export class DelegateTransaction
  extends AbstractTransaction<BFChainCore.DelegateAssetJSON>
  implements BFChainCore.DelegateTransactionJSON
{
  toJSON!: () => BFChainCore.DelegateTransactionJSON;
  recipientId!: undefined;
  @Field.d(DelegateTransaction.INC++, DelegateAssetModel)
  asset!: DelegateAssetModel;
}
