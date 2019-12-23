//	自定义交易

import { getSenderWithSecondSecret } from "../../include";
import { getCustomTransaction } from "./common.test";

getCustomTransaction(getSenderWithSecondSecret(), "empty", "testdata");
