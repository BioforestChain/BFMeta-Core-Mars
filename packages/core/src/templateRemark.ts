import { TemplateRemark } from "@bfchain/core-model-transaction";
import { Injectable } from "@bfchain/util";

@Injectable()
export class TemplateRemarkCore {
  constructor() {}

  createRemark(anyRemark: { [key: string]: string }) {
    return TemplateRemark.fromObject({ remark: anyRemark });
  }
}
