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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const _txbaseLogicVerifier_1 = require("./_txbaseLogicVerifier");
const util_1 = require("@bfchain/util");
const core_helper_account_1 = require("@bfchain/core-helper-account");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "EmigrateAssetLogicVerifier");
let EmigrateAssetLogicVerifier = class EmigrateAssetLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor(accountHelper) {
        super();
        this.accountHelper = accountHelper;
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
        const { sourceChainMagic, assetType, amount, genesisDelegateSignature, } = transaction.asset.emigrateAsset;
        const { publicKey, secondPublicKey } = genesisDelegateSignature;
        const address = this.accountHelper.getAddressFromPublicKeyString(publicKey);
        const delegate = await accountGetterHelper.getAccountInfo(address);
        if (!delegate) {
            throw new ConsensusException(core_util_exception_1.NOT_EXIST, {
                prop: `Account with address ${address}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
        if (delegate.secondPublicKey) {
            if (delegate.secondPublicKey !== secondPublicKey) {
                throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "secondPublicKey",
                    be_compare_prop: "secondPublicKey",
                    to_target: "transaction",
                    be_target: "delegate",
                    ...Function_Exception_Detail,
                });
            }
        }
        else {
            if (secondPublicKey) {
                throw new ConsensusException(core_util_exception_1.SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY, {
                    id: transaction.signature,
                    senderId: transaction.senderId,
                    applyBlockHeight: transaction.applyBlockHeight,
                    type: transaction.type,
                    ...Function_Exception_Detail,
                });
            }
        }
        const assets = sender.accountAssets;
        this.isPossessAssetExceptForChainAsset(assets);
        const totalSpend = BigInt(transaction.fee) + BigInt(amount);
        if (assets[sourceChainMagic][assetType].assetNumber !== totalSpend) {
            throw new ConsensusException(core_util_exception_1.NEED_EMIGRATE_TOTAL_ASSET, {
                address: transaction.senderId,
                ...Function_Exception_Detail,
            });
        }
        return true;
    }
};
EmigrateAssetLogicVerifier = __decorate([
    util_1.Injectable(),
    __param(0, util_1.Inject(core_helper_account_1.AccountBaseHelper)),
    __metadata("design:paramtypes", [core_helper_account_1.AccountBaseHelper])
], EmigrateAssetLogicVerifier);
exports.EmigrateAssetLogicVerifier = EmigrateAssetLogicVerifier;
//# sourceMappingURL=emigrateAssetLogicVerifier.js.map