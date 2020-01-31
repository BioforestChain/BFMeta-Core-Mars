import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { Injectable } from "@bfchain/util";

@Injectable()
export class AccountCore {
  constructor(public accountBaseHelper: AccountBaseHelper) {}
}
