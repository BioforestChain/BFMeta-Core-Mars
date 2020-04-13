import { TemplateRemark } from "@bfchain/core-model-common";
import { Injectable } from "@bfchain/util";

@Injectable()
export class TemplateRemarkCore {
  createRemark(anyRemark: { [key: string]: string }) {
    return TemplateRemark.fromObject({ remark: anyRemark });
  }
}
