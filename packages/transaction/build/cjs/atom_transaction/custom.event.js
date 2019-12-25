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
const core_util_exception_1 = require("@bfchain/core-util-exception");
const util_1 = require("@bfchain/util");
const core_model_1 = require("@bfchain/core-model");
const core_helper_1 = require("@bfchain/core-helper");
const { ArgumentIllegalException, ConsensusException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "CustomTransactionEvent");
let CustomTransactionEvent = class CustomTransactionEvent {
    constructor(accountHelper, baseHelper, configHelper, transactionHelper, chainAssetInfoHelper, configMap, moduleMap) {
        this.accountHelper = accountHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.transactionHelper = transactionHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
        this.configMap = configMap;
        this.moduleMap = moduleMap;
    }
    verifyAddress(address) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyAddress",
        };
        if (!this.accountHelper.isAddress(address)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "address",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyPublicKey(publicKey) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyPublicKey",
        };
        if (!this.baseHelper.isValidPublicKey(publicKey)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "publicKey",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyRecipientId(recipientId) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyRecipientId",
        };
        if (!this.accountHelper.isAddress(recipientId)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "recipientId",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyPossessorAddress(possessorAddress) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyPossessorAddress",
        };
        if (!this.accountHelper.isAddress(possessorAddress)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "possessorAddress",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyAssetNumber(assetNumber) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyPublicKey",
        };
        if (!this.baseHelper.isValidAssetNumber(assetNumber)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "amount",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyMagic(magic) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyMagic",
        };
        if (!this.baseHelper.isValidChainMagic(magic)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "magic",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyAssetType(assetType) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyAssetType",
        };
        if (!this.baseHelper.isValidAssetType(assetType)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "assetType",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyChainName(chainName) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyChainName",
        };
        if (!this.baseHelper.isValidChainName(chainName)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "chainName",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyDAppid(dappid) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyDAppid",
        };
        if (!this.baseHelper.isValidDAppId(dappid)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "dappid",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction) {
        const { transactionHelper } = this;
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyMinAndMaxEffectiveHeight",
        };
        const calMinEffectiveHeight = transactionHelper.getTransactionMinEffectiveHeight(transaction);
        if (minEffectiveHeight !== calMinEffectiveHeight) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "minEffectiveHeight",
                ...Function_Exception_Detail,
            });
        }
        const calMaxEffectiveHeight = transactionHelper.getTransactionMaxEffectiveHeight(transaction);
        if (maxEffectiveHeight !== calMaxEffectiveHeight) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "maxEffectiveHeight",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyLocationName(lns) {
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyLocationName",
        };
        if (!this.baseHelper.isValidLnsName(lns)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "locationName",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 校验解析值是否合法
     *
     * @param record
     */
    verifyLocationNameRecord(record) {
        const { baseHelper, accountHelper } = this;
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyLocationNameRecord",
        };
        if (!baseHelper.isValidLocationNameRecord(record)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "record",
                type: "location name record",
                ...Function_Exception_Detail,
            });
        }
        const { recordType, recordValue } = record;
        if (core_model_1.RECORD_TYPE.IPV4 === recordType) {
            if (!baseHelper.isIpV4(recordValue)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "recordValue",
                    type: "ipv4",
                    ...Function_Exception_Detail,
                });
            }
        }
        else if (core_model_1.RECORD_TYPE.IPV6 === recordType) {
            if (!baseHelper.isIpV6(recordValue)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "recordValue",
                    type: "ipv6",
                    ...Function_Exception_Detail,
                });
            }
        }
        else if (core_model_1.RECORD_TYPE.LNG_LAT === recordType) {
            if (!baseHelper.isString(recordValue)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "recordValue",
                    type: "string",
                    ...Function_Exception_Detail,
                });
            }
        }
        else if (core_model_1.RECORD_TYPE.ADDRESSV1 === recordType) {
            if (!accountHelper.isAddress(recordValue)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "recordValue",
                    type: "block chain account address",
                    ...Function_Exception_Detail,
                });
            }
        }
        else {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_EXIST, {
                prop: "recordType",
                ...Function_Exception_Detail,
            });
        }
    }
    verifyApplyResult(applyResult, transaction) {
        const { baseHelper, accountHelper, transactionHelper } = this;
        const Function_Exception_Detail = {
            target: "applyResult",
            function: "verifyApplyResult",
        };
        const { address, publicKey } = applyResult.applyInfo;
        this.verifyAddress(address);
        if (publicKey) {
            this.verifyPublicKey(publicKey);
        }
        if (applyResult.type === "setSecondPublicKey") {
            const { secondPublicKey } = applyResult.applyInfo;
            if (!baseHelper.isValidSecondPublicKey(secondPublicKey)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "secondPublicKey",
                    ...Function_Exception_Detail,
                });
            }
            return;
        }
        if (applyResult.type === "setUsername") {
            const applyInfo = applyResult.applyInfo;
            if (!baseHelper.isValidUsername(applyInfo.alias)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "alias",
                    ...Function_Exception_Detail,
                });
            }
            return;
        }
        if (applyResult.type === "registerToDelegate" ||
            applyResult.type === "acceptVote" ||
            applyResult.type === "rejectVote") {
            return;
        }
        if (applyResult.type === "voteEquity") {
            const { equity, recipientId } = applyResult.applyInfo;
            if (!baseHelper.isValidAccountEquity(equity)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "voteEquity",
                    ...Function_Exception_Detail,
                });
            }
            this.verifyRecipientId(recipientId);
            return;
        }
        if (applyResult.type === "asset") {
            const { magic, assetType, amount, action } = applyResult.applyInfo;
            this.verifyAssetNumber(amount);
            this.verifyMagic(magic);
            this.verifyAssetType(assetType);
            if (!(action === "+" || action === "-")) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "action",
                    ...Function_Exception_Detail,
                });
            }
            return;
        }
        if (applyResult.type === "destoryAsset") {
            const { magic, assetType, amount } = applyResult.applyInfo;
            this.verifyAssetNumber(amount);
            this.verifyMagic(magic);
            this.verifyAssetType(assetType);
            return;
        }
        if (applyResult.type === "frozenAsset") {
            const { magic, assetType, amount, minEffectiveHeight, maxEffectiveHeight, } = applyResult.applyInfo;
            this.verifyAssetNumber(amount);
            this.verifyMagic(magic);
            this.verifyAssetType(assetType);
            this.verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction);
            return;
        }
        if (applyResult.type === "unfrozenAsset") {
            const { magic, assetType, amount, frozenId, recipientId } = applyResult.applyInfo;
            this.verifyAssetNumber(amount);
            this.verifyMagic(magic);
            this.verifyAssetType(assetType);
            this.verifyRecipientId(recipientId);
            if (!(transaction.storage &&
                transaction.storage.key === "transactionSignature" &&
                transaction.storage.value === frozenId)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "frozenId",
                    ...Function_Exception_Detail,
                });
            }
            return;
        }
        if (applyResult.type === "frozenAccount") {
            const { accountStatus } = applyResult.applyInfo;
            if (core_model_1.ACCOUNT_STATUS[accountStatus]) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "accountStatus",
                    ...Function_Exception_Detail,
                });
            }
            return;
        }
        if (applyResult.type === "issueDAppid") {
            const { sourceChainName, sourceChainMagic, dappid, possessorAddress, type, purchaseAsset, } = applyResult.applyInfo;
            this.verifyMagic(sourceChainMagic);
            this.verifyChainName(sourceChainName);
            this.verifyPossessorAddress(possessorAddress);
            this.verifyDAppid(dappid);
            if (!core_model_1.DAPP_TYPE[type]) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "type",
                    ...Function_Exception_Detail,
                });
            }
            if (purchaseAsset) {
                const { sourceChainMagic, sourceChainName, assetType, amount } = purchaseAsset;
                this.verifyMagic(sourceChainMagic);
                this.verifyChainName(sourceChainName);
                this.verifyAssetType(assetType);
                this.verifyAssetNumber(amount);
            }
            return;
        }
        if (applyResult.type === "saleDAppid") {
            const { dappid, sourceChainMagic, minEffectiveHeight, maxEffectiveHeight, } = applyResult.applyInfo;
            this.verifyDAppid(dappid);
            this.verifyMagic(sourceChainMagic);
            this.verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction);
            return;
        }
        if (applyResult.type === "purchaseDAppid") {
            const { dappid, possessorAddress, sourceChainMagic } = applyResult.applyInfo;
            this.verifyDAppid(dappid);
            this.verifyMagic(sourceChainMagic);
            this.verifyPossessorAddress(possessorAddress);
            return;
        }
        if (applyResult.type === "issueAsset") {
            const { applyAddress, sourceChainName, sourceChainMagic, assetType, genesisAddress, expectedIssuedAssets, remainAssets, } = applyResult.applyInfo;
            this.verifyMagic(sourceChainMagic);
            this.verifyChainName(sourceChainName);
            this.verifyAssetType(assetType);
            if (!accountHelper.isAddress(applyAddress)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "applyAddress",
                    ...Function_Exception_Detail,
                });
            }
            if (!accountHelper.isAddress(genesisAddress)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "genesisAddress",
                    ...Function_Exception_Detail,
                });
            }
            if (!baseHelper.isValidAssetNumber(expectedIssuedAssets)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "expectedIssuedAssets",
                    ...Function_Exception_Detail,
                });
            }
            if (!baseHelper.isValidAssetNumber(remainAssets)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "remainAssets",
                    ...Function_Exception_Detail,
                });
            }
            return;
        }
        if (applyResult.type === "issueSubchain") {
            throw new ConsensusException(core_util_exception_1.PERMISSION_DENIED, {
                operationName: "issueSubchain",
                ...Function_Exception_Detail,
            });
            // const {
            //   chainName,
            //   assetType,
            //   magic,
            //   bnid,
            //   maxTPSPerBlock,
            //   blockPerRound,
            //   delegates,
            //   genesisBlock,
            // } = applyResult.applyInfo;
            // let subchainConfig = this.configMap.get(genesisBlock.magic);
            // if (!subchainConfig) {
            //   // FIXME: 没有子链的配置文件就生成一个
            //   subchainConfig = new ConfigHelper(genesisBlock, this.configHelper.business);
            // }
            // const BFChainCoreFactory = this.moduleMap.get<
            //   typeof import("../../index").BFChainCoreFactory
            // >("BFChainCoreFactory");
            // if (!BFChainCoreFactory) {
            //   throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            //     prop: "BFChainCoreFactory",
            //     ...Function_Exception_Detail,
            //   });
            // }
            // const subchainCore = BFChainCoreFactory({
            //   config: subchainConfig,
            //   Buffer: this.moduleMap.get("Buffer"),
            //   cryptoHelper: this.moduleMap.get("cryptoHelper"),
            //   keypairHelper: this.moduleMap.get("keypairHelper"),
            //   ed2curveHelper: this.moduleMap.get("ed2curveHelper"),
            // });
            // subchainCore.block.getBlockFactoryFromHeight(genesisBlock.height).verify(genesisBlock);
            // const remark = genesisBlock.remark;
            // if (remark.chainName !== chainName) {
            //   throw new ArgumentIllegalException(NOT_MATCH, {
            //     to_compare_prop: "chainName",
            //     be_compare_prop: "chainName",
            //     to_target: "genesisBlock.remark",
            //     be_target: "applyResult",
            //     ...Function_Exception_Detail,
            //   });
            // }
            // if (remark.assetType !== assetType) {
            //   throw new ArgumentIllegalException(NOT_MATCH, {
            //     to_compare_prop: "assetType",
            //     be_compare_prop: "assetType",
            //     to_target: "genesisBlock.remark",
            //     be_target: "applyResult",
            //     ...Function_Exception_Detail,
            //   });
            // }
            // if (remark.magic !== magic) {
            //   throw new ArgumentIllegalException(NOT_MATCH, {
            //     to_compare_prop: "magic",
            //     be_compare_prop: "magic",
            //     to_target: "genesisBlock.remark",
            //     be_target: "applyResult",
            //     ...Function_Exception_Detail,
            //   });
            // }
            // if (remark.bnid !== bnid) {
            //   throw new ArgumentIllegalException(NOT_MATCH, {
            //     to_compare_prop: "bnid",
            //     be_compare_prop: "bnid",
            //     to_target: "genesisBlock.remark",
            //     be_target: "applyResult",
            //     ...Function_Exception_Detail,
            //   });
            // }
            // if (remark.maxTPSPerBlock !== maxTPSPerBlock) {
            //   throw new ArgumentIllegalException(NOT_MATCH, {
            //     to_compare_prop: "maxTPSPerBlock",
            //     be_compare_prop: "maxTPSPerBlock",
            //     to_target: "genesisBlock.remark",
            //     be_target: "applyResult",
            //     ...Function_Exception_Detail,
            //   });
            // }
            // if (remark.blockPerRound !== blockPerRound) {
            //   throw new ArgumentIllegalException(NOT_MATCH, {
            //     to_compare_prop: "blockPerRound",
            //     be_compare_prop: "blockPerRound",
            //     to_target: "genesisBlock.remark",
            //     be_target: "applyResult",
            //     ...Function_Exception_Detail,
            //   });
            // }
            // if (remark.delegates !== delegates) {
            //   throw new ArgumentIllegalException(NOT_MATCH, {
            //     to_compare_prop: "delegates",
            //     be_compare_prop: "delegates",
            //     to_target: "genesisBlock.remark",
            //     be_target: "applyResult",
            //     ...Function_Exception_Detail,
            //   });
            // }
        }
        if (applyResult.type === "setLnsRecordValue") {
            const { name, sourceChainMagic, operationType, addRecord, deleteRecord, } = applyResult.applyInfo;
            this.verifyLocationName(name);
            this.verifyMagic(sourceChainMagic);
            if (operationType === core_model_1.RECORD_OPERATION_TYPE.ADD) {
                if (!addRecord) {
                    throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                        prop: "addRecord",
                        ...Function_Exception_Detail,
                    });
                }
                if (deleteRecord) {
                    throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_EXIST, {
                        prop: "deleteRecord",
                        ...Function_Exception_Detail,
                    });
                }
                this.verifyLocationNameRecord(addRecord);
            }
            else if (operationType === core_model_1.RECORD_OPERATION_TYPE.DELETE) {
                if (addRecord) {
                    throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_EXIST, {
                        prop: "addRecord",
                        ...Function_Exception_Detail,
                    });
                }
                if (!deleteRecord) {
                    throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                        prop: "deleteRecord",
                        ...Function_Exception_Detail,
                    });
                }
                this.verifyLocationNameRecord(deleteRecord);
            }
            else if (operationType === core_model_1.RECORD_OPERATION_TYPE.UPDATE) {
                if (!addRecord) {
                    throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                        prop: "addRecord",
                        ...Function_Exception_Detail,
                    });
                }
                if (!deleteRecord) {
                    throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                        prop: "deleteRecord",
                        ...Function_Exception_Detail,
                    });
                }
                this.verifyLocationNameRecord(addRecord);
                this.verifyLocationNameRecord(deleteRecord);
            }
            else {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "operationType",
                    ...Function_Exception_Detail,
                });
            }
            return;
        }
        if (applyResult.type === "saleLocationName") {
            const { name, sourceChainMagic, minEffectiveHeight, maxEffectiveHeight, } = applyResult.applyInfo;
            this.verifyLocationName(name);
            this.verifyMagic(sourceChainMagic);
            this.verifyMinAndMaxEffectiveHeight(minEffectiveHeight, maxEffectiveHeight, transaction);
            return;
        }
        if (applyResult.type === "purchaseLocationName") {
            const { possessorAddress, name, sourceChainMagic } = applyResult.applyInfo;
            this.verifyPossessorAddress(possessorAddress);
            this.verifyLocationName(name);
            this.verifyMagic(sourceChainMagic);
            return;
        }
        throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
            prop: "type",
            ...Function_Exception_Detail,
        });
    }
    combineApplyEvent(transaction, eventEmitter, applyResult) {
        if (applyResult.type === "setUsername") {
            const { address, publicKey, alias } = applyResult.applyInfo;
            return eventEmitter.emit("setUsername", {
                type: "setUsername",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    alias,
                },
            });
        }
        if (applyResult.type === "setSecondPublicKey") {
            const { address, publicKey, secondPublicKey } = applyResult.applyInfo;
            return eventEmitter.emit("setSecondPublicKey", {
                type: "setSecondPublicKey",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    secondPublicKeyBuffer: util_1.parseHexToArrayBuffer(secondPublicKey),
                },
            });
        }
        if (applyResult.type === "registerToDelegate") {
            const { address, publicKey } = applyResult.applyInfo;
            return eventEmitter.emit("registerToDelegate", {
                type: "registerToDelegate",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                },
            });
        }
        if (applyResult.type === "acceptVote") {
            const { address, publicKey } = applyResult.applyInfo;
            return eventEmitter.emit("acceptVote", {
                type: "acceptVote",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                },
            });
        }
        if (applyResult.type === "rejectVote") {
            const { address, publicKey } = applyResult.applyInfo;
            return eventEmitter.emit("rejectVote", {
                type: "rejectVote",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                },
            });
        }
        if (applyResult.type === "voteEquity") {
            const { address, publicKey, equity, recipientId } = applyResult.applyInfo;
            return eventEmitter.emit("voteEquity", {
                type: "voteEquity",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    equity: "-" + equity,
                    sourceEquity: equity,
                    recipientId,
                },
            });
        }
        if (applyResult.type === "asset") {
            const { address, publicKey, magic, assetType, amount, action } = applyResult.applyInfo;
            const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
            return eventEmitter.emit("asset", {
                type: "asset",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: publicKey ? util_1.parseHexToArrayBuffer(publicKey) : undefined,
                    assetInfo,
                    amount: action === "-" ? "-" + amount : amount,
                    sourceAmount: amount,
                },
            });
        }
        if (applyResult.type === "destoryAsset") {
            const { address, publicKey, magic, assetType, amount } = applyResult.applyInfo;
            const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
            return eventEmitter.emit("destoryAsset", {
                type: "destoryAsset",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    assetInfo,
                    amount: amount,
                    sourceAmount: amount,
                },
            });
        }
        if (applyResult.type === "frozenAsset") {
            const { address, publicKey, magic, assetType, amount, minEffectiveHeight, maxEffectiveHeight, totalUnfrozenTimes, } = applyResult.applyInfo;
            const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
            return eventEmitter.emit("frozenAsset", {
                type: "frozenAsset",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    assetInfo,
                    amount: `-${amount}`,
                    sourceAmount: amount,
                    frozenIdBuffer: transaction.signatureBuffer,
                    minEffectiveHeight,
                    maxEffectiveHeight,
                    totalUnfrozenTimes,
                },
            });
        }
        if (applyResult.type === "unfrozenAsset") {
            const { address, publicKey, magic, assetType, amount, frozenId, recipientId, } = applyResult.applyInfo;
            const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
            return eventEmitter.emit("unfrozenAsset", {
                type: "unfrozenAsset",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    assetInfo,
                    amount: amount,
                    sourceAmount: amount,
                    frozenIdBuffer: util_1.parseHexToArrayBuffer(frozenId),
                    recipientId,
                },
            });
        }
        if (applyResult.type === "frozenAccount") {
            const { address, publicKey, accountStatus } = applyResult.applyInfo;
            return eventEmitter.emit("frozenAccount", {
                type: "frozenAccount",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    accountStatus,
                },
            });
        }
        if (applyResult.type === "issueDAppid") {
            const { address, publicKey, sourceChainName, sourceChainMagic, dappid, type, purchaseAsset, } = applyResult.applyInfo;
            return eventEmitter.emit("issueDAppid", {
                type: "issueDAppid",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    sourceChainName,
                    sourceChainMagic,
                    dappid,
                    possessorAddress: address,
                    type,
                    purchaseAsset,
                },
            });
        }
        if (applyResult.type === "saleDAppid") {
            const { address, dappid, sourceChainMagic, minEffectiveHeight, maxEffectiveHeight, } = applyResult.applyInfo;
            return eventEmitter.emit("saleDAppid", {
                type: "saleDAppid",
                transaction,
                applyInfo: {
                    address,
                    sourceChainMagic,
                    dappid,
                    minEffectiveHeight,
                    maxEffectiveHeight,
                },
            });
        }
        if (applyResult.type === "purchaseDAppid") {
            const { address, publicKey, dappid, sourceChainMagic, possessorAddress, } = applyResult.applyInfo;
            return eventEmitter.emit("purchaseDAppid", {
                type: "purchaseDAppid",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    sourceChainMagic,
                    dappid,
                    possessorAddress,
                },
            });
        }
        if (applyResult.type === "issueAsset") {
            const { address, publicKey, sourceChainName, sourceChainMagic, assetType, genesisAddress, expectedIssuedAssets, } = applyResult.applyInfo;
            return eventEmitter.emit("issueAsset", {
                type: "issueAsset",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    applyAddress: address,
                    sourceChainName,
                    sourceChainMagic,
                    assetType,
                    genesisAddress,
                    expectedIssuedAssets,
                    remainAssets: expectedIssuedAssets,
                },
            });
        }
        if (applyResult.type === "issueSubchain") {
            throw new ConsensusException(core_util_exception_1.PERMISSION_DENIED, {
                operationName: "issueSubchain",
                function: "combineApplyEvent",
            });
            // const {
            //   address,
            //   publicKey,
            //   chainName,
            //   assetType,
            //   magic,
            //   bnid,
            //   maxTPSPerBlock,
            //   blockPerRound,
            //   delegates,
            //   genesisBlock,
            // } = applyResult.applyInfo;
            // return eventEmitter.emit("issueSubchain", {
            //   type: "issueSubchain",
            //   transaction,
            //   applyInfo: {
            //     address,
            //     publicKeyBuffer: parseHexToArrayBuffer(publicKey),
            //     chainName,
            //     assetType,
            //     magic,
            //     bnid,
            //     maxTPSPerBlock,
            //     blockPerRound,
            //     delegates,
            //     genesisBlock,
            //   },
            // });
        }
        if (applyResult.type === "registerLocationName") {
            const { address, publicKey, name, sourceChainMagic, sourceChainName } = applyResult.applyInfo;
            return eventEmitter.emit("registerLocationName", {
                type: "registerLocationName",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    name,
                    sourceChainMagic,
                    sourceChainName,
                },
            });
        }
        if (applyResult.type === "cancelLocationName") {
            const { address, publicKey, name, sourceChainMagic } = applyResult.applyInfo;
            return eventEmitter.emit("cancelLocationName", {
                type: "cancelLocationName",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    name,
                    sourceChainMagic,
                },
            });
        }
        if (applyResult.type === "setLnsManager") {
            const { address, publicKey, name, sourceChainMagic, manager } = applyResult.applyInfo;
            return eventEmitter.emit("setLnsManager", {
                type: "setLnsManager",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    name,
                    sourceChainMagic,
                    manager,
                },
            });
        }
        if (applyResult.type === "setLnsRecordValue") {
            const { address, publicKey, name, sourceChainMagic, operationType, addRecord, deleteRecord, } = applyResult.applyInfo;
            return eventEmitter.emit("setLnsRecordValue", {
                type: "setLnsRecordValue",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    name,
                    sourceChainMagic,
                    operationType,
                    addRecord,
                    deleteRecord,
                },
            });
        }
        if (applyResult.type === "saleLocationName") {
            const { address, name, sourceChainMagic, minEffectiveHeight, maxEffectiveHeight, } = applyResult.applyInfo;
            return eventEmitter.emit("saleLocationName", {
                type: "saleLocationName",
                transaction,
                applyInfo: {
                    address,
                    sourceChainMagic,
                    name,
                    minEffectiveHeight,
                    maxEffectiveHeight,
                },
            });
        }
        if (applyResult.type === "purchaseLocationName") {
            const { address, publicKey, name, sourceChainMagic, possessorAddress, } = applyResult.applyInfo;
            return eventEmitter.emit("purchaseLocationName", {
                type: "purchaseLocationName",
                transaction,
                applyInfo: {
                    address,
                    publicKeyBuffer: util_1.parseHexToArrayBuffer(publicKey),
                    sourceChainMagic,
                    name,
                    possessorAddress,
                },
            });
        }
        throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
            prop: "eventType",
            target: "applyResult",
            function: "combineApplyEvent",
        });
    }
};
CustomTransactionEvent = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.ChainAssetInfoHelper,
        core_helper_1.ConfigHelperMap,
        util_1.ModuleStroge])
], CustomTransactionEvent);
exports.CustomTransactionEvent = CustomTransactionEvent;
//# sourceMappingURL=custom.event.js.map