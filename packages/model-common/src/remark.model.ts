import { Message, MapField, Type } from "@bfchain/protobuf";
import { StringKeyMap } from "./mapField";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";

@Type.d("TemplateRemark")
export class TemplateRemark extends Message {
  /**交易的备注信息 */
  @MapField.d(1, "string", "string")
  remark!: { [key: string]: string };
  private _remarkMap?: StringKeyMap<string>;
  get remarkMap() {
    if (!this._remarkMap) {
      this._remarkMap = new StringKeyMap(this.remark);
    }
    return this._remarkMap;
  }
  toJSON() {
    return {
      remark: this.remark,
    };
  }
  @cacheBytesGetter
  getBytes() {
    return this.$type.encode(this).finish();
  }
}
