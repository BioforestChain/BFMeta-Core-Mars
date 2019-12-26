import { AccountBaseHelper } from "@bfchain/core-helper";
import { Injectable } from "@bfchain/util";

@Injectable()
export class AccountCore {
  constructor(public accountHelper: AccountBaseHelper) {}
}
