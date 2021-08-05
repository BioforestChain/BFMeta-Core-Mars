import { Message, Type, Field } from "@bfchain/protobuf";
@Type.d("NextRoundDelegateModel")
export class NextRoundDelegateModel
  extends Message<NextRoundDelegateModel>
  implements BFChainCore.JSONToModelType<BFChainCore.NextRoundDelegateJSON>
{
  static INC = 1;
  @Field.d(NextRoundDelegateModel.INC++, "string")
  address!: string;
  @Field.d(NextRoundDelegateModel.INC++, "string")
  equity!: string;
  toJSON() {
    return {
      address: this.address,
      equity: this.equity,
    };
  }
}

@Type.d("RoundDelegateModel")
export class RoundDelegateModel<T extends RoundDelegateModel<T>>
  extends Message<T>
  implements BFChainCore.JSONToModelType<BFChainCore.RoundDelegateJSON>
{
  static INC = 1;
  /**本轮新增的受托人 */
  @Field.d(RoundDelegateModel.INC++, "string", "repeated")
  newDelegates!: string[];
  /**上一轮的最大余额 */
  @Field.d(RoundDelegateModel.INC++, "string")
  maxBeginBalance!: string;
  /**上一轮的最大交易量 */
  @Field.d(RoundDelegateModel.INC++, "uint32")
  maxTxCount!: number;
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
  private _equitie_map?: Map<string, string>;
  get nextRoundDelegateEquitieMap() {
    if (!this._equitie_map) {
      this._equitie_map = new Map();
      for (const equ of this.nextRoundDelegates) {
        this._equitie_map.set(equ.address, equ.equity);
      }
    }
    return this._equitie_map;
  }
  /**最大余额和最大交易量的比值 */
  // @Field.d(RoundDelegateModel.INC++, "string")
  private _rate?: string;
  get rate() {
    if (!this._rate) {
      this._rate = (BigInt(this.maxBeginBalance) / BigInt(this.maxTxCount || 1)).toString();
    }
    return this._rate;
  }
  toJSON(): BFChainCore.RoundDelegateJSON {
    return {
      newDelegates: this.newDelegates,
      maxBeginBalance: this.maxBeginBalance,
      maxTxCount: this.maxTxCount,
      nextRoundDelegates: this.nextRoundDelegates.map((rd) => rd.toJSON()),
      rate: this.rate,
    };
  }
}
