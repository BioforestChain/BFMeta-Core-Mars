import { Transaction } from "@bfchain/core-model-transaction-base";
import { SetLnsRecordValueAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * setLnsRecordValue 交易模型
 *
 */
@Type.d("SetLnsRecordValueTransaction")
export class SetLnsRecordValueTransaction
  extends Transaction<BFChainCore.SetLnsRecordValueAssetJSON>
  implements BFChainCore.SetLnsRecordValueTransactionJSON
{
  toJSON!: () => BFChainCore.SetLnsRecordValueTransactionJSON;
  recipientId!: undefined;
  @Field.d(SetLnsRecordValueTransaction.INC++, SetLnsRecordValueAssetModel)
  asset!: SetLnsRecordValueAssetModel;
}
