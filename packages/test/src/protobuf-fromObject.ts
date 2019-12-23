import { Type, Field, Message, util } from "./@bfchain/protobuf";

@Type.d("QAQ")
class QAQ extends Message<QAQ> {
  @Field.d(1, "string")
  name!: string;
  @Field.d(2, "bytes")
  buf!: Uint8Array;
  get mm() {
    return Buffer.from(this.buf).toString("hex");
  }
  set mm(v: string) {
    this.buf = Buffer.from(v, "hex");
  }
  static fromObject(obj: any) {
    const res = super.fromObject(obj) as QAQ;
    obj.mm && (res.mm = obj.mm);
    return res as any;
  }
}
@Type.d("QUQ")
class QUQ extends Message<QUQ> {
  @Field.d(1, QAQ)
  qaq!: QAQ;
  @Field.d(2, QAQ, "repeated")
  qaqList!: QAQ[];
  buf!: Uint8Array;
  get zz() {
    return Buffer.from(this.buf).toString("hex");
  }
  set zz(v: string) {
    this.buf = Buffer.from(v, "hex");
  }
  toJSON() {
    return {
      zz: this.zz,
    };
  }
  static fromObject(obj: any) {
    const res = super.fromObject(obj) as QUQ;
    obj.zz && (res.zz = obj.zz);
    return res as any;
  }
}
const quq = QUQ.fromObject({
  qaq: { name: "zzz", mm: "44" },
  qaqList: [{ name: "xx" }],
  zz: "ff",
});
console.log(quq.qaq);
console.log(quq);
