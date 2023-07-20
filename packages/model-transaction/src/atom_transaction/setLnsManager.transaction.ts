import { Type, Field } from "@bfchain/protobuf";
import { SetLnsManagerAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * setLnsManager 交易模型
 *
 */
@Type.d("SetLnsManagerTransaction")
export class SetLnsManagerTransaction
  extends AbstractTransaction<BFChainCore.SetLnsManagerAssetJSON>
  implements BFChainCore.SetLnsManagerTransactionJSON
{
  toJSON!: () => BFChainCore.SetLnsManagerTransactionJSON;
  recipientId!: string;
  @Field.d(SetLnsManagerTransaction.INC++, SetLnsManagerAssetModel)
  asset!: SetLnsManagerAssetModel;
}
