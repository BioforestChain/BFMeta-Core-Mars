import { TemplateRemark } from "@bfchain/core-model-transaction";
export declare class TemplateRemarkCore {
    constructor();
    createRemark(anyRemark: {
        [key: string]: string;
    }): TemplateRemark;
}
