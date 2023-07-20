import { Type, Field } from "@bfchain/protobuf";
import { SetLnsRecordValueAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * setLnsRecordValue 交易模型
 *
 */
@Type.d("SetLnsRecordValueTransaction")
export class SetLnsRecordValueTransaction
  extends AbstractTransaction<BFChainCore.SetLnsRecordValueAssetJSON>
  implements BFChainCore.SetLnsRecordValueTransactionJSON
{
  toJSON!: () => BFChainCore.SetLnsRecordValueTransactionJSON;
  recipientId!: undefined;
  @Field.d(SetLnsRecordValueTransaction.INC++, SetLnsRecordValueAssetModel)
  asset!: SetLnsRecordValueAssetModel;
}
