import { Message, Type, Field } from "@bfchain/protobuf";
@Type.d("NextRoundDelegateModel")
export class NextRoundDelegateModel
  extends Message<NextRoundDelegateModel>
  implements BFChainCore.JSONToModelType<BFChainCore.NextRoundDelegateJSON>
{
  static INC = 1;
  @Field.d(NextRoundDelegateModel.INC++, "string")
  address!: string;
  @Field.d(NextRoundDelegateModel.INC++, "uint32")
  numberOfEntities!: number;
  toJSON() {
    return {
      address: this.address,
      numberOfEntities: this.numberOfEntities,
    };
  }
}

@Type.d("RoundDelegateModel")
export class RoundDelegateModel<T extends RoundDelegateModel<T>>
  extends Message<T>
  implements BFChainCore.JSONToModelType<BFChainCore.RoundDelegateJSON>
{
  static INC = 1;
  /**下一轮的打块账户以及其相关信息 */
  @Field.d(RoundDelegateModel.INC++, NextRoundDelegateModel, "repeated")
  nextRoundDelegates!: NextRoundDelegateModel[];
  private _next_round_delegate_address_list?: string[];
  get nextRoundDelegateAddressList() {
    if (!this._next_round_delegate_address_list) {
      this._next_round_delegate_address_list = [];
      for (const equ of this.nextRoundDelegates) {
        this._next_round_delegate_address_list.push(equ.address);
      }
    }
    return this._next_round_delegate_address_list;
  }
  toJSON() {
    const res: BFChainCore.RoundDelegateJSON = {
      nextRoundDelegates: this.nextRoundDelegates.map((rd) => rd.toJSON()),
    };
    return res;
  }
}
