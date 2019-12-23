import { TemplateRemark } from "../model/templateRemark";
import { Injectable } from "@bfchain/util";

@Injectable()
export class TemplateRemarkCore {
  constructor() {}

  createRemark(anyRemark: { [key: string]: string }) {
    return TemplateRemark.fromObject({ remark: anyRemark });
  }
}
