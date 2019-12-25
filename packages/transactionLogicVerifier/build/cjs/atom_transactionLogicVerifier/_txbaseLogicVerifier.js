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
const util_1 = require("@bfchain/util");
const core_helper_1 = require("@bfchain/core-helper");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const core_model_1 = require("@bfchain/core-model");
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "TransactionLogicVerifier");
class TransactionLogicVerifier {
    async logicVerify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper) {
        const Function_Exception_Detail = {
            function: "logicVerify",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const { senderId, recipientId, senderPublicKey } = transaction;
        // 获取账户信息和资产信息
        const sender = await accountGetterHelper.getAccountInfoAndAssets(senderId);
        if (!(sender && sender.accountInfo && sender.accountAssets)) {
            throw new NoFoundException(core_util_exception_1.NOT_FOUND, {
                prop: "sender",
                ...Function_Exception_Detail,
            });
        }
        const senderAccountInfo = sender.accountInfo;
        // 初始化账户公钥
        if (!senderAccountInfo.publicKey) {
            const address = senderAccountInfo.address;
            await accountGetterHelper.initAccountPublicKey(address, senderPublicKey, currentBlockHeight);
            senderAccountInfo.publicKey = senderPublicKey;
        }
        // 校验发起账户状态
        this.checkSenderAccountStatus(senderAccountInfo);
        // 检验二次密码
        this.checkSecondPublicKey(senderAccountInfo, transaction);
        // 校验交易的发起高度
        this.checkApplyBlockHeight(transaction, currentBlockHeight);
        // 校验交易的 magic
        await this.checkTransactionMagic(transaction, accountGetterHelper);
        // 校验交易的时间戳
        this.checkTransactionTimestamp(transaction);
        // 校验交易的接收范围
        await this.checkTransactionRange(transaction, currentBlockHeight, accountGetterHelper);
        // 校验交易的接收账户状态
        let recipient;
        if (recipientId) {
            recipient = await accountGetterHelper.getAccountInfoAndAssets(recipientId);
            if (recipient && recipient.accountInfo && recipient.accountAssets) {
                this.checkRecipientAccountStatus(recipient.accountInfo);
            }
        }
        // 校验账户资产是否充足
        await this.checkAccountAssetsEnough(transaction, sender, recipient, currentBlockHeight);
        // 校验交易的最大字节数
        this.checkTrsMaxBytes(transaction.getBytes().length);
        // 校验交易的 dappid
        await this.checkDAppId(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        // 校验交易的 lns
        await this.checkLocationName(transaction, currentBlockHeight, accountGetterHelper);
        return sender;
    }
    /**
     * 校验发起账户状态
     *
     * @param accountInfo
     */
    checkSenderAccountStatus(accountInfo) {
        const Function_Exception_Detail = {
            function: "checkSenderAccountStatus",
        };
        if (!(accountInfo && accountInfo.hasOwnProperty("accountStatus"))) {
            throw new ConsensusException(core_util_exception_1.PROP_LOSE, {
                prop: "accountStatus",
                target: "accountInfo",
                ...Function_Exception_Detail,
            });
        }
        if (accountInfo.accountStatus === core_model_1.ACCOUNT_STATUS.FROZEN_OUT ||
            accountInfo.accountStatus === core_model_1.ACCOUNT_STATUS.FROZEN_IN_AND_OUT) {
            throw new ConsensusException(core_util_exception_1.ACCOUNT_FROZEN, {
                address: accountInfo.address,
                errorId: core_model_1.NewTransactionRefuseReason.TRANSACTION_SENDER_ASSET_FROZEN,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 校验接收账户的状态
     *
     * @param accountInfo
     */
    checkRecipientAccountStatus(accountInfo) {
        const Function_Exception_Detail = {
            function: "checkRecipientAccountStatus",
        };
        if (!(accountInfo && accountInfo.hasOwnProperty("accountStatus"))) {
            throw new ConsensusException(core_util_exception_1.PROP_LOSE, {
                prop: "accountStatus",
                target: "accountInfo",
                ...Function_Exception_Detail,
            });
        }
        if (accountInfo.accountStatus === core_model_1.ACCOUNT_STATUS.FROZEN_IN ||
            accountInfo.accountStatus === core_model_1.ACCOUNT_STATUS.FROZEN_IN_AND_OUT) {
            throw new ConsensusException(core_util_exception_1.ACCOUNT_FROZEN, {
                address: accountInfo.address,
                errorId: core_model_1.NewTransactionRefuseReason.TRANSACTION_RECIPIENT_ASSET_FROZEN,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 校验二次密码
     *
     * @param accountInfo
     * @param tr
     */
    checkSecondPublicKey(accountInfo, tr) {
        const Function_Exception_Detail = {
            function: "checkSecondPublicKey",
        };
        if (accountInfo.secondPublicKey) {
            if (!(tr.senderSecondPublicKey && tr.signSignature)) {
                throw new ConsensusException(core_util_exception_1.TRANSACTION_SIGN_SIGNATURE_IS_REQUIRED, {
                    id: tr.id,
                    senderId: tr.senderId,
                    applyBlockHeight: tr.applyBlockHeight,
                    type: tr.type,
                    ...Function_Exception_Detail,
                });
            }
            if (accountInfo.secondPublicKey !== tr.senderSecondPublicKey) {
                throw new ConsensusException(core_util_exception_1.SECOND_PUBLICKEY_ALREADY_CHANGE, {
                    id: tr.id,
                    senderId: tr.senderId,
                    applyBlockHeight: tr.applyBlockHeight,
                    type: tr.type,
                    ...Function_Exception_Detail,
                });
            }
        }
        else {
            if (tr.senderSecondPublicKey) {
                throw new ConsensusException(core_util_exception_1.SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY, {
                    id: tr.id,
                    senderId: tr.senderId,
                    applyBlockHeight: tr.applyBlockHeight,
                    type: tr.type,
                    ...Function_Exception_Detail,
                });
            }
            if (tr.signSignature) {
                throw new ConsensusException(core_util_exception_1.TRANSACTION_SHOULD_NOT_HAVE_SIGN_SIGNATURE, {
                    id: tr.id,
                    senderId: tr.senderId,
                    applyBlockHeight: tr.applyBlockHeight,
                    type: tr.type,
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 校验交易的发起高度是否已经大于最大区块间隔
     *
     * @param tr
     * @param currentBlockHeight
     */
    checkApplyBlockHeight(tr, currentBlockHeight) {
        const Function_Exception_Detail = {
            function: "checkApplyBlockHeight",
        };
        const trsApplyHeight = tr.applyBlockHeight;
        if (trsApplyHeight > currentBlockHeight) {
            throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT, {
                reason: "must less than currnt block height",
                ...Function_Exception_Detail,
            });
        }
        const diffHeight = currentBlockHeight - trsApplyHeight;
        const maxApplyAndConfirmedBlockHeightDiff = this.configHelper
            .maxApplyAndConfirmedBlockHeightDiff;
        if (tr.numberOfEffectiveBlocks) {
            const numberOfEffectiveBlocks = tr.numberOfEffectiveBlocks;
            if (numberOfEffectiveBlocks > maxApplyAndConfirmedBlockHeightDiff) {
                throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT, {
                    reason: "must less than maxApplyAndConfirmedBlockHeightDiff",
                    ...Function_Exception_Detail,
                });
            }
            if (diffHeight > numberOfEffectiveBlocks) {
                throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT, {
                    reason: `Transaction apply block height ${trsApplyHeight}, current block height ${currentBlockHeight}, number of effective blocks ${numberOfEffectiveBlocks}`,
                    ...Function_Exception_Detail,
                });
            }
        }
        else {
            if (diffHeight > maxApplyAndConfirmedBlockHeightDiff) {
                throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT, {
                    reason: `Transaction apply block height ${trsApplyHeight}, current block height ${currentBlockHeight}, max apply and confirmed block height diff ${maxApplyAndConfirmedBlockHeightDiff}`,
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 校验 fromMagic、toMagic
     *
     * @param tr
     */
    async checkTransactionMagic(tr, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "checkTransactionMagic",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_FOUND, {
                prop: "accountGetterHelper",
                ...Function_Exception_Detail,
            });
        }
        const fromMagic = tr.fromMagic;
        const toMagic = tr.toMagic;
        const chainMagic = this.configHelper.magic;
        const parentGenesisBlock = this.configHelper.parentGenesisBlock;
        const parentMagic = parentGenesisBlock && parentGenesisBlock.remark.magic;
        if (fromMagic === chainMagic) {
            // 来自本链的交易
            if (toMagic === chainMagic) {
                return;
            }
            // 去往他链的交易
            if (parentMagic === chainMagic) {
                // 当前链是父链，去往的子链必须存在
                const subchain = await accountGetterHelper.getSubchain(toMagic);
                if (!subchain) {
                    throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_TO_MAGIC, {
                        reason: "Transaction toMagic subchain not exists",
                        id: tr.id,
                        senderId: tr.senderId,
                        applyBlockHeight: tr.applyBlockHeight,
                        type: tr.type,
                        ...Function_Exception_Detail,
                    });
                }
            }
            else {
                // 当前链是子链，必须是去往父链的交易
                if (toMagic !== parentMagic) {
                    throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_TO_MAGIC, {
                        reason: "Transaction toMagic must be local magic or parent magic",
                        id: tr.id,
                        senderId: tr.senderId,
                        applyBlockHeight: tr.applyBlockHeight,
                        type: tr.type,
                        ...Function_Exception_Detail,
                    });
                }
            }
        }
        else {
            // 来自外链的交易
            if (parentMagic !== chainMagic) {
                // 当前是子链，必须是来自父链的交易
                if (fromMagic !== parentMagic) {
                    throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_TO_MAGIC, {
                        reason: "Transaction fromMagic must be parent",
                        id: tr.id,
                        senderId: tr.senderId,
                        applyBlockHeight: tr.applyBlockHeight,
                        type: tr.type,
                        ...Function_Exception_Detail,
                    });
                }
            }
            else {
                // 当前链是主链，来自的子链必须存在
                const subchain = await accountGetterHelper.getSubchain(fromMagic);
                if (!subchain) {
                    throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_TO_MAGIC, {
                        reason: "Transaction fromMagic subchain not exists",
                        id: tr.id,
                        senderId: tr.senderId,
                        applyBlockHeight: tr.applyBlockHeight,
                        type: tr.type,
                        ...Function_Exception_Detail,
                    });
                }
            }
            // 必须是去往本链的交易
            if (toMagic !== chainMagic) {
                throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_TO_MAGIC, {
                    reason: "Transaction to magic must be local",
                    id: tr.id,
                    senderId: tr.senderId,
                    applyBlockHeight: tr.applyBlockHeight,
                    type: tr.type,
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 校验交易的时间戳
     *
     * @param tr
     */
    checkTransactionTimestamp(tr) {
        const { timeHelper } = this;
        if (timeHelper.getSlotNumberByTimestamp(tr.timestamp) > timeHelper.getSlotNumberByTimestamp()) {
            throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_TIMESTAMP, {
                reason: "Transaction timestamp in future. Transaction time is ahead of the time on the server",
                id: tr.id,
                senderId: tr.senderId,
                applyBlockHeight: tr.applyBlockHeight,
                type: tr.type,
                function: "checkTransactionTimestamp",
            });
        }
    }
    /**
     * 校验交易的接收范围
     *
     * @param tr
     * @param currentBlockHeight
     * @param accountGetterHelper
     */
    async checkTransactionRange(tr, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "checkTransactionRange",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const { rangeType, range } = tr;
        if (rangeType === core_model_1.RANGE_TYPE.EMPTY) {
            return;
        }
        const { magic } = this.configHelper;
        switch (rangeType) {
            case core_model_1.RANGE_TYPE.MULTI_ADDRESS:
                for (const address of range) {
                    const accountInfo = await accountGetterHelper.getAccountInfo(address);
                    if (accountInfo) {
                        this.checkRecipientAccountStatus(accountInfo);
                    }
                }
                break;
            case core_model_1.RANGE_TYPE.MULTI_DAPPID:
                for (const dappid of range) {
                    // FIXME: dappid 全是本链的
                    const memDapp = await accountGetterHelper.getDApp(magic, dappid, currentBlockHeight);
                    if (!memDapp) {
                        throw new ConsensusException(core_util_exception_1.DAPPID_IS_NOT_EXIST, {
                            dappid,
                            ...Function_Exception_Detail,
                        });
                    }
                }
                break;
            case core_model_1.RANGE_TYPE.MULTI_LOCATION_NAME:
                for (const lns of range) {
                    const memLocationName = await accountGetterHelper.getLocationName(magic, lns, currentBlockHeight);
                    if (!memLocationName) {
                        throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                            locationName: lns,
                            ...Function_Exception_Detail,
                        });
                    }
                }
                break;
            default:
                throw new ConsensusException(core_util_exception_1.UNKNOWN_RANGE_TYPE, {
                    rangeType,
                    ...Function_Exception_Detail,
                });
        }
    }
    deepClone(obj) {
        let result = Array.isArray(obj) ? [] : {};
        if (typeof obj === "object") {
            for (let key in obj) {
                if (obj[key] && typeof obj[key] === "object") {
                    result[key] = this.deepClone(obj[key]);
                }
                else {
                    result[key] = obj[key];
                }
            }
            return result;
        }
        else {
            return obj;
        }
    }
    /**
     * 校验账户资产是否充足
     *
     * @param tr
     * @param sender
     * @param recipient
     * @param currentBlockHeight
     */
    async checkAccountAssetsEnough(tr, sender, recipient, currentBlockHeight) {
        const Function_Exception_Detail = {
            function: "checkAccountAssetsEnough",
        };
        const accountAssets = {
            [tr.senderId]: this.deepClone(sender.accountAssets),
        };
        const accountInfo = {
            [tr.senderId]: this.deepClone(sender.accountInfo),
        };
        if (recipient && recipient.accountInfo && recipient.accountAssets) {
            const address = recipient.accountInfo.address;
            accountAssets[address] = this.deepClone(recipient.accountAssets);
            accountInfo[address] = this.deepClone(recipient.accountInfo);
        }
        const event = new util_1.QueneEventEmitter();
        // 交易的总手续费
        let trsFee = BigInt(0);
        // 这里不做设置账户用名、注册受托人，开启/关闭投票，设置二次密码，销毁资产等校验
        // 因为自定义交易可能对这些数据有不同的处理逻辑，所以只在每种交易自己的 verify 中
        // 校验。
        //注册事件错误处理器
        event.onError((err, { eventname, arg }) => {
            throw err;
        });
        // 扣除交易的手续费
        event.on("fee", ({ applyInfo }, next) => {
            // 手续费扣除的只能是链资产
            const { magic, assetType } = this.configHelper;
            const fee = BigInt(applyInfo.amount);
            const address = applyInfo.address;
            accountAssets[address] = accountAssets[address] || {};
            accountAssets[address][magic] = accountAssets[address][magic] || {};
            accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
                sourceChainMagic: magic,
                assetType: assetType,
                assetNumber: BigInt(0),
                history: {},
            };
            const hodingAsset = accountAssets[address][magic][assetType];
            const remainAsset = hodingAsset.assetNumber;
            hodingAsset.assetNumber += fee;
            trsFee += fee;
            if (hodingAsset.assetNumber < BigInt(0)) {
                throw new ConsensusException(core_util_exception_1.ASSET_NOT_ENOUGH, {
                    reason: `Transaction id: ${tr.id} address: ${address} magic ${applyInfo.assetInfo.magic} assetType: ${applyInfo.assetInfo.assetType} hodingAsset: ${remainAsset.toString()} spendFee: ${applyInfo.amount}`,
                    errorId: core_model_1.NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
                    ...Function_Exception_Detail,
                });
            }
            next();
        });
        // 扣除交易的资产数量
        event.on("asset", ({ applyInfo }, next) => {
            const { magic, assetType } = applyInfo.assetInfo;
            const address = applyInfo.address;
            accountAssets[address] = accountAssets[address] || {};
            accountAssets[address][magic] = accountAssets[address][magic] || {};
            accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
                sourceChainMagic: magic,
                assetType: assetType,
                assetNumber: BigInt(0),
                history: {},
            };
            const hodingAsset = accountAssets[address][magic][assetType];
            const remainAsset = hodingAsset.assetNumber;
            hodingAsset.assetNumber += BigInt(applyInfo.amount);
            if (hodingAsset.assetNumber < BigInt(0)) {
                throw new ConsensusException(core_util_exception_1.ASSET_NOT_ENOUGH, {
                    reason: `Transaction id: ${tr.id} address: ${address} magic ${applyInfo.assetInfo.magic} assetType: ${applyInfo.assetInfo.assetType} hodingAsset: ${remainAsset.toString()} spendAsset: ${applyInfo.amount}`,
                    errorId: core_model_1.NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
                    ...Function_Exception_Detail,
                });
            }
            next();
        });
        // 冻结交易的资产数量
        event.on("frozenAsset", async ({ applyInfo }, next) => {
            const { magic, assetType } = applyInfo.assetInfo;
            const address = applyInfo.address;
            accountAssets[address] = accountAssets[address] || {};
            accountAssets[address][magic] = accountAssets[address][magic] || {};
            accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
                sourceChainMagic: magic,
                assetType: assetType,
                assetNumber: BigInt(0),
                history: {},
            };
            const hodingAsset = accountAssets[address][magic][assetType];
            const remainAsset = hodingAsset.assetNumber;
            hodingAsset.assetNumber += BigInt(applyInfo.amount);
            if (hodingAsset.assetNumber < BigInt(0)) {
                throw new ConsensusException(core_util_exception_1.ASSET_NOT_ENOUGH, {
                    reason: `Transaction id: ${tr.id} address: ${address} magic ${applyInfo.assetInfo.magic} assetType: ${applyInfo.assetInfo.assetType} hodingAsset: ${remainAsset.toString()} frozenAsset: ${applyInfo.amount}`,
                    errorId: core_model_1.NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
                    ...Function_Exception_Detail,
                });
            }
            next();
        });
        // 这里不监听 unfrozenAsset 事件，因为每种涉及冻结资产的逻辑校验不一致
        // 在每种交易各自 verify 的时候做。
        event.on("voteEquity", ({ applyInfo }, next) => {
            const round = this.blockHelper.calcRoundByHeight(currentBlockHeight) - 1;
            const address = applyInfo.address;
            accountInfo[address] = accountInfo[address] || {};
            const equityInfo = accountInfo[address].equityInfo;
            const minEquity = BigInt(0);
            let accountEquity = equityInfo.round === round ? equityInfo.equity : minEquity;
            const remainEquity = accountEquity;
            accountEquity += BigInt(applyInfo.equity);
            if (accountEquity < minEquity) {
                throw new ConsensusException(core_util_exception_1.EQUITY_NOT_ENOUGH, {
                    reason: `Transaction id: ${tr.id} address: ${address} hodingEquity: ${remainEquity.toString()} spendEquity: ${applyInfo.equity}`,
                    ...Function_Exception_Detail,
                });
            }
            next();
        });
        await this.transactionCore.getTransactionFactoryFromType(tr.type).applyTransaction(tr, event);
        return trsFee;
    }
    /**
     * 校验交易的最大字节数
     *
     * @param trs
     * @param byteLength
     */
    checkTrsMaxBytes(byteLength) {
        if (BigInt(byteLength) > BigInt(this.configHelper.maxTransactionSize)) {
            throw new ConsensusException(core_util_exception_1.INVALID_TRANSACTION_BYTE_LENGTH, {
                reason: "The size of the transaction exceeds the limit",
                function: "checkTrsMaxBytes",
            });
        }
    }
    /**
     * 校验 dappid
     *
     * @param trs
     * @param currentBlockHeight
     */
    async checkDAppId(trs, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper) {
        const Function_Exception_Detail = {
            function: "checkDAppId",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const { dappid, senderId } = trs;
        if (!dappid) {
            return;
        }
        const dapp = (await accountGetterHelper.getDApp(trs.fromMagic, dappid, currentBlockHeight));
        if (!dapp) {
            throw new ConsensusException(core_util_exception_1.DAPPID_IS_NOT_EXIST, {
                dappid,
                ...Function_Exception_Detail,
            });
        }
        if (dapp.type === core_model_1.DAPP_TYPE.PAID_APP) {
            // FIXME: 付费一次永久生效
            const isPurchase = await transactionGetterHelper.getPurchaseDApp(senderId, dappid);
            if (!isPurchase) {
                throw new ConsensusException(core_util_exception_1.NEED_PURCHASE_DAPPID_BEFORE_USE, {
                    dappid,
                    ...Function_Exception_Detail,
                });
            }
        }
        if (trs.type === this.transactionCore.transactionHelper.VOTE) {
            return;
        }
        // 获取dapp开发账户
        const accountInfo = await accountGetterHelper.getAccountInfo(dapp.possessorAddress);
        if (!accountInfo) {
            throw new ConsensusException(core_util_exception_1.NOT_FOUND, {
                porp: "Dapp possessor",
                ...Function_Exception_Detail,
            });
        }
        if (accountInfo.isAcceptVote) {
            const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
            // 判断当前账户是否给 dapp 开发者投过票
            const isVote = await accountGetterHelper.getVoteForDelegate(senderId, dapp.possessorAddress, dappid, curRound);
            if (!isVote) {
                throw new ConsensusException(core_util_exception_1.NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE, {
                    dappid,
                    errorId: core_model_1.NewTransactionRefuseReason.MUSET_VOTE_FOR_DAPP_POSSESSOR,
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 校验 location name
     *
     * @param tr
     * @param currentBlockHeight
     */
    async checkLocationName(tr, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "checkLocationName",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const lns = tr.lns;
        if (!lns) {
            return;
        }
        const memLns = await accountGetterHelper.getLocationName(this.configHelper.magic, lns, currentBlockHeight);
        if (!memLns) {
            throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                locationName: lns,
                errorId: core_model_1.NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 账户是否持有除链资产外其他资产
     *
     * @param assets
     */
    isPossessAssetExceptForChainAsset(assets) {
        for (const magic in assets) {
            const magicAssets = assets[magic];
            for (const assetType in magicAssets) {
                if (assetType !== this.configHelper.assetType) {
                    if (magicAssets[assetType].assetNumber > BigInt(0)) {
                        throw new ConsensusException(core_util_exception_1.POSSESS_ASSET_EXCEPT_CHAIN_ASSET, {
                            function: "isPossessAssetExceptForChainAsset",
                        });
                    }
                }
            }
        }
    }
    /**
     * 校验交易的手续费是否大于等于网络手续费
     *
     * @param transaction
     */
    checkTrsFeeAndWebFee(transaction, byteLength) {
        const { jsbiHelper, transactionCore, configHelper } = this;
        if (transaction.type === transactionCore.transactionHelper.GRAB_ASSET) {
            return transaction.fee;
        }
        const feePerByte = {
            numerator: BigInt(transaction.fee),
            denominator: byteLength,
        };
        const minTransactionFeePerByte = configHelper.minTransactionFeePerByte;
        const result = jsbiHelper.compareFraction(feePerByte, minTransactionFeePerByte);
        const minFee = jsbiHelper.multiplyCeilFraction(byteLength, minTransactionFeePerByte).toString();
        if (result < 0) {
            throw new ConsensusException(core_util_exception_1.TRANSACTION_FEE_NOT_ENOUGH, {
                errorId: core_model_1.NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
                minFee: minFee,
                function: "checkTrsFeeAndWebFee",
            });
        }
        return minFee;
    }
    /**
     * 检验交易的手续费是否大于等于矿机手续费
     *
     * @param transaction
     */
    checkTrsFeeAndMiningMachineFee(transaction, byteLength, minFeePerByte) {
        const { jsbiHelper, transactionCore } = this;
        if (transaction.type === transactionCore.transactionHelper.GRAB_ASSET) {
            return transaction.fee;
        }
        const feePerByte = {
            numerator: BigInt(transaction.fee),
            denominator: byteLength,
        };
        const result = jsbiHelper.compareFraction(feePerByte, minFeePerByte);
        const minFee = jsbiHelper.multiplyCeilFraction(byteLength, minFeePerByte).toString();
        if (result < 0) {
            throw new ConsensusException(core_util_exception_1.TRANSACTION_FEE_NOT_ENOUGH, {
                errorId: core_model_1.NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
                minFee: minFee,
                function: "checkTrsFeeAndMiningMachineFee",
            });
        }
        return minFee;
    }
    /**
     * 查询交易是否已经在未处理交易中
     *
     * @param senderId
     * @param id
     */
    async checkRepeatInUntreatedTransaction(senderId, id, transactionGetterHelper = this.transactionGetterHelper) {
        const Function_Exception_Detail = {
            function: "checkRepeatInUntreatedTransaction",
        };
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const result = await transactionGetterHelper.checkRepeatInUntreatedTransaction(senderId, id);
        if (result) {
            throw new ConsensusException(core_util_exception_1.ALREADY_EXIST, {
                prop: `Transaction with id ${id}`,
                target: "untreated transaction",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 查询交易是否已经在链上
     *
     * @param senderId
     * @param id
     */
    async checkRepeatInBlockChainTransaction(id, transactionGetterHelper = this.transactionGetterHelper) {
        const Function_Exception_Detail = {
            function: "checkRepeatInBlockChainTransaction",
        };
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const result = await transactionGetterHelper.checkRepeatInBlockChainTransaction(id);
        if (result) {
            throw new ConsensusException(core_util_exception_1.ALREADY_EXIST, {
                prop: `Transaction with id ${id}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 不能二次操作同一笔交易(红包/资产交换/委托资产)
     *
     * @param tr
     */
    async checkSecondaryTransaction(transaction, transactionGetterHelper = this.transactionGetterHelper) {
        return;
    }
}
__decorate([
    util_1.Inject(core_helper_1.ConfigHelper),
    __metadata("design:type", core_helper_1.ConfigHelper)
], TransactionLogicVerifier.prototype, "configHelper", void 0);
__decorate([
    util_1.Inject(core_helper_1.ChainTimeHelper),
    __metadata("design:type", core_helper_1.ChainTimeHelper)
], TransactionLogicVerifier.prototype, "timeHelper", void 0);
__decorate([
    util_1.Inject(core_helper_1.BlockHelper),
    __metadata("design:type", core_helper_1.BlockHelper)
], TransactionLogicVerifier.prototype, "blockHelper", void 0);
__decorate([
    util_1.Inject(core_helper_1.JSBIHelper),
    __metadata("design:type", core_helper_1.JSBIHelper)
], TransactionLogicVerifier.prototype, "jsbiHelper", void 0);
__decorate([
    util_1.Inject("bfchain-core:TransactionCore"),
    __metadata("design:type", Object)
], TransactionLogicVerifier.prototype, "transactionCore", void 0);
__decorate([
    util_1.Inject("transactionGetterHelper", { optional: true, dynamics: true }),
    __metadata("design:type", Object)
], TransactionLogicVerifier.prototype, "transactionGetterHelper", void 0);
__decorate([
    util_1.Inject("accountGetterHelper", { optional: true, dynamics: true }),
    __metadata("design:type", Object)
], TransactionLogicVerifier.prototype, "accountGetterHelper", void 0);
__decorate([
    util_1.Inject("customTransactionCenter", { optional: true, dynamics: true }),
    __metadata("design:type", Object)
], TransactionLogicVerifier.prototype, "customTransactionCenter", void 0);
exports.TransactionLogicVerifier = TransactionLogicVerifier;
//# sourceMappingURL=_txbaseLogicVerifier.js.map