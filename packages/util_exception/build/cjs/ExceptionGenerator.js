"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_util_exception_errorcode_1 = require("@bfchain/util-helper-exception-errorcode");
const util_exception_1 = require("@bfchain/util-exception");
function CoreExceptionGenerator(MODULE, FILE) {
    return util_exception_1.UtilExceptionGenerator(MODULE, FILE, { errorCodeMap: core_util_exception_errorcode_1.errorCode });
}
exports.CoreExceptionGenerator = CoreExceptionGenerator;
//# sourceMappingURL=ExceptionGenerator.js.map