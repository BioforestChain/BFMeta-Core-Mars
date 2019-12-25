"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const _txbaseLogicVerifier_1 = require("./_txbaseLogicVerifier");
const util_1 = require("@bfchain/util");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "DestoryAssetLogicVerifier");
let DestoryAssetLogicVerifier = class DestoryAssetLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor() {
        super();
    }
    async verify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper, customTransactionCenter = this.customTransactionCenter) {
        const Function_Exception_Detail = {
            function: "verify",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        const destoryAsset = transaction.asset.destoryAsset;
        const { sourceChainMagic, assetType } = destoryAsset;
        // 查询本地是否已经存在这个数字资产(注意忽略大小写)
        const memAssets = await accountGetterHelper.getAsset(sourceChainMagic, assetType);
        if (!memAssets) {
            // 不存在的资产不能被销毁
            throw new ConsensusException(core_util_exception_1.ASSET_NOT_EXIST, {
                magic: sourceChainMagic,
                assetType,
                ...Function_Exception_Detail,
            });
        }
        // 资产的创世账户不能销毁资产
        if (memAssets.genesisAddress === transaction.senderId) {
            throw new ConsensusException(core_util_exception_1.CAN_NOT_DESTORY_ASSET, {
                address: transaction.senderId,
                magic: sourceChainMagic,
                assetType,
                reason: "assets genesis account can't destory assets",
                ...Function_Exception_Detail,
            });
        }
        return true;
    }
};
DestoryAssetLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], DestoryAssetLogicVerifier);
exports.DestoryAssetLogicVerifier = DestoryAssetLogicVerifier;
//# sourceMappingURL=destoryAssetLogicVerifier.js.map