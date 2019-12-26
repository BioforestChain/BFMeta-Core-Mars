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
const util_1 = require("@bfchain/util");
const core_helper_config_1 = require("@bfchain/core-helper-config");
const core_helper_type_1 = require("@bfchain/core-helper-type");
const core_util_exception_errorcode_1 = require("@bfchain/core-util-exception-errorcode");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const core_model_block_1 = require("@bfchain/core-model-block");
const core_helper_account_1 = require("@bfchain/core-helper-account");
const { ArgumentFormatException, NoFoundException, ArgumentIllegalException, OutOfRangeException, } = core_util_exception_1.CoreExceptionGenerator("HELPER", "blockHelper");
console.log([
    [util_1.Injectable, util_1.Inject, util_1.getHexFromArrayBuffer],
    [core_helper_config_1.ConfigHelper],
    [core_helper_type_1.BaseHelper],
    [core_util_exception_errorcode_1.PROP_SHOULD_LTE_FIELD, core_util_exception_errorcode_1.OUT_OF_RANGE],
    [core_util_exception_1.CoreExceptionGenerator, core_util_exception_1.NOT_EXIST],
    [core_model_block_1.BLOCK_TYPES_BASE],
    [core_helper_account_1.AccountBaseHelper],
]);
let BlockHelper = class BlockHelper {
    constructor(config, baseHelper, accountBaseHelper, cryptoHelper, keypairHelper, Buffer) {
        this.config = config;
        this.baseHelper = baseHelper;
        this.accountBaseHelper = accountBaseHelper;
        this.cryptoHelper = cryptoHelper;
        this.keypairHelper = keypairHelper;
        this.Buffer = Buffer;
        this._BTC_BLOCK_WM = new WeakMap();
        this._BLOCK_BTC_WM = new WeakMap();
    }
    /**
     * 获取交易 id
     *
     * @param block
     */
    generateId(block) {
        return this.cryptoHelper
            .sha256()
            .update(block.getBytes(true, true))
            .digest("hex");
    }
    /**是否是合法的区块 ID */
    isValidId(id) {
        return this.baseHelper.isValidSignature(id);
    }
    /**
     * 校验区块的签名是否合法
     */
    verifyBlockSignature(block, opts) {
        const taskLabel = (opts && opts.taskLabel) || "Block";
        const { Buffer } = this;
        const { generatorPublicKeyBuffer, blockSignatureBuffer } = block;
        // 验证 signature 与 publicKey
        const hash = this.cryptoHelper
            .sha256()
            .update(block.getBytes(true, true))
            .digest();
        if (!this.keypairHelper.detached_verify(hash, Buffer.from(blockSignatureBuffer), Buffer.from(generatorPublicKeyBuffer))) {
            throw new ArgumentFormatException(`Invalid ${taskLabel} signature`);
        }
    }
    /**
     * 校验区块的 remark 大小
     *
     * @param block
     */
    verifyBlockRemarkSize(block) {
        const remarkSize = this.Buffer.from(block.remark.getBytes()).length;
        const { maxBlockRemarkSize } = this.config;
        if (remarkSize > maxBlockRemarkSize) {
            throw new ArgumentIllegalException(core_util_exception_errorcode_1.PROP_SHOULD_LTE_FIELD, {
                prop: "remark",
                target: "block",
                field: maxBlockRemarkSize,
            });
        }
    }
    /**
     * 根据区块高度获取区块类型
     *
     * @param height
     */
    parseTypeByHeight(height) {
        if (height === 1) {
            return core_model_block_1.BLOCK_TYPES_BASE.GENESIS;
        }
        if (height % this.config.blockPerRound === 0) {
            return core_model_block_1.BLOCK_TYPES_BASE.ROUNDEND;
        }
        return core_model_block_1.BLOCK_TYPES_BASE.COMMON;
    }
    /**获取高度对应的轮次 */
    calcRoundByHeight(height) {
        return Math.ceil(height / this.config.blockPerRound);
    }
    /**计算离轮末还有多少个区块数
     * `0 ~ blockPerRound-1`
     */
    calcBlockNumberToRoundEnd(cur_height) {
        return (this.config.blockPerRound -
            (cur_height % this.config.blockPerRound || this.config.blockPerRound));
    }
    /**计算一轮的开始的区块高度 */
    calcRoundStartHeight(round_num) {
        return (round_num - 1) * this.config.blockPerRound + 1;
    }
    /**计算一轮的结束的区块高度 */
    calcRoundEndHeight(round_num) {
        return round_num * this.config.blockPerRound;
    }
    //#region block getter
    async forceGetBlockByHeight(height, blockGetterHelper = this.blockGetterHelper) {
        if (!blockGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "blockGetterHelper",
                target: "moduleStroge",
                function: "BlockGetterHelper.forceGetBlockByHeight",
            });
        }
        const block = await blockGetterHelper.getBlockByHeight(height);
        if (!block) {
            throw new ArgumentFormatException(core_util_exception_1.NOT_EXIST, {
                prop: `height:${height}`,
                target: "blocks",
                function: "BlockGetterHelper.forceGetBlockByHeight",
            });
        }
        return block;
    }
    async forceGetBlockById(id, blockGetterHelper = this.blockGetterHelper) {
        if (!blockGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "blockGetterHelper",
                target: "moduleStroge",
                function: "BlockGetterHelper.forceGetBlockById",
            });
        }
        const block = await blockGetterHelper.getBlockById(id);
        if (!block) {
            throw new ArgumentFormatException(core_util_exception_1.NOT_EXIST, {
                prop: `id:${id}`,
                target: "blocks",
                function: "BlockGetterHelper.forceGetBlockById",
            });
        }
        return block;
    }
    async forceGetBlockListByHeightRange(min, max, blockGetterHelper = this.blockGetterHelper) {
        const result = [];
        if (min > max) {
            throw new OutOfRangeException(core_util_exception_errorcode_1.OUT_OF_RANGE, {
                variable: "min and max",
                message: `min: ${min} max: ${max}`,
            });
        }
        for (let i = min; i <= max; i++) {
            result[result.length] = await this.forceGetBlockByHeight(i, blockGetterHelper);
        }
        return result;
    }
    async forceGetBlockGeneratorAddressByHeight(height, blockGetterHelper = this.blockGetterHelper) {
        if (!blockGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "blockGetterHelper",
                target: "moduleStroge",
                function: "BlockGetterHelper.forceGetBlockGeneratorAddressByHeight",
            });
        }
        const publicKeyBuffer = typeof blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight === "function"
            ? await blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight(height)
            : (await this.forceGetBlockByHeight(height, blockGetterHelper)).generatorPublicKeyBuffer;
        if (!publicKeyBuffer) {
            throw new ArgumentFormatException(core_util_exception_1.NOT_EXIST, {
                prop: `height:${height}`,
                target: "generatorPublicKey",
                function: "BlockGetterHelper.forceGetBlockGeneratorAddressByHeight",
            });
        }
        return this.accountBaseHelper.getAddressFromPublicKey(publicKeyBuffer);
    }
    async forceGetBlockSignatureByHeight(height, blockGetterHelper = this.blockGetterHelper) {
        if (!blockGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "blockGetterHelper",
                target: "moduleStroge",
                function: "BlockGetterHelper.forceGetBlockSignatureByHeight",
            });
        }
        const signatureBuffer = typeof blockGetterHelper.getBlockSignatureByHeight === "function"
            ? await blockGetterHelper.getBlockSignatureByHeight(height)
            : (await this.forceGetBlockByHeight(height, blockGetterHelper)).blockSignatureBuffer;
        if (!signatureBuffer) {
            throw new ArgumentFormatException(core_util_exception_1.NOT_EXIST, {
                prop: `height:${height}`,
                target: "generatorPublicKey",
                function: "BlockGetterHelper.forceGetBlockSignatureByHeight",
            });
        }
        return signatureBuffer;
    }
    async forceGetBlockIdByHeight(height, blockGetterHelper = this.blockGetterHelper) {
        return util_1.getHexFromArrayBuffer(await this.forceGetBlockSignatureByHeight(height, blockGetterHelper));
    }
    async getLastBlock(blockGetterHelper = this.blockGetterHelper) {
        if (!blockGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "blockGetterHelper",
                target: "moduleStroge",
                function: "BlockGetterHelper.getLastBlock",
            });
        }
        return blockGetterHelper.getLastBlock();
    }
    async getCurrentGenerateBlock(blockGetterHelper = this.blockGetterHelper) {
        if (blockGetterHelper && blockGetterHelper.getCurrentGenerateBlock) {
            return blockGetterHelper.getCurrentGenerateBlock();
        }
    }
    async getCurrentSyncBlockInfo(blockGetterHelper = this.blockGetterHelper) {
        if (blockGetterHelper && blockGetterHelper.getCurrentSyncBlockInfo) {
            return blockGetterHelper.getCurrentSyncBlockInfo();
        }
    }
    //#endregion
    /**
     * 当前正在处理中的区块
     * 可以是锻造中的,也可以是同步中的
     */
    async getCurrentProcessingBlockPlotChecker(blockGetterHelper = this.blockGetterHelper) {
        const generattingBlock = await this.getCurrentGenerateBlock();
        if (generattingBlock) {
            return this.parseNewBlockToPlotChecker(generattingBlock);
        }
        const syncingBlock = await this.getCurrentSyncBlockInfo(blockGetterHelper);
        if (syncingBlock) {
            return this.parseBlockToPlotChecker(syncingBlock.block);
        }
    }
    parseBlockToPlotChecker(block) {
        let blockPlotChecker = this._BLOCK_BTC_WM.get(block);
        if (!blockPlotChecker) {
            blockPlotChecker = {
                height: block.height,
                timestamp: block.timestamp,
                /**参与度 */
                get blockParticipation() {
                    Object.defineProperty(this, "blockParticipation", {
                        value: BigInt(block.remark.blockParticipation),
                    });
                    return this.blockParticipation;
                },
                /**交易量 */
                numberOfTransactions: block.numberOfTransactions,
                /**手续费 */
                get totalFee() {
                    Object.defineProperty(this, "totalFee", {
                        value: BigInt(block.totalFee),
                    });
                    return this.totalFee;
                },
                /**区块id,如果没有id,就用`ff*128` */
                blockId: block.id,
                previousBlockId: block.previousBlock,
            };
            this._BLOCK_BTC_WM.set(block, blockPlotChecker);
            this._BTC_BLOCK_WM.set(blockPlotChecker, block);
        }
        return blockPlotChecker;
    }
    getBlockFromPlotChecker(blockPlotChecker) {
        return this._BTC_BLOCK_WM.get(blockPlotChecker);
    }
    parseNewBlockToPlotChecker(newBlock) {
        return {
            height: newBlock.height,
            timestamp: newBlock.timestamp,
            /**参与度 */
            get blockParticipation() {
                Object.defineProperty(this, "blockParticipation", {
                    value: BigInt(newBlock.blockParticipation),
                });
                return this.blockParticipation;
            },
            /**交易量 */
            numberOfTransactions: newBlock.numberOfTransactions,
            /**手续费 */
            get totalFee() {
                Object.defineProperty(this, "totalFee", {
                    value: BigInt(newBlock.totalFee),
                });
                return this.totalFee;
            },
            /**区块id,如果没有id,就用`ff*128` */
            blockId: "blockId" in newBlock ? newBlock.blockId : "ff".repeat(64),
            previousBlockId: newBlock.previousBlockId,
        };
    }
    parseBlockPlotCheckerListToPlotChecker(list) {
        const first = list[0];
        const last = list[list.length - 1];
        const blockPlotChecker = {
            height: last.height,
            timestamp: last.timestamp,
            /**参与度 */
            get blockParticipation() {
                Object.defineProperty(this, "blockParticipation", {
                    value: list.reduce((p, pc1) => p + pc1.blockParticipation, BigInt(0)),
                });
                return this.blockParticipation;
            },
            /**交易量 */
            get numberOfTransactions() {
                Object.defineProperty(this, "numberOfTransactions", {
                    value: list.reduce((p, pc1) => p + pc1.numberOfTransactions, 0),
                });
                return this.numberOfTransactions;
            },
            /**手续费 */
            get totalFee() {
                Object.defineProperty(this, "totalFee", {
                    value: list.reduce((p, pc1) => p + pc1.totalFee, BigInt(0)),
                });
                return this.totalFee;
            },
            /**区块id,如果没有id,就用`ff*128` */
            get blockId() {
                Object.defineProperty(this, "blockId", {
                    value: list.reduce((p, pc1) => p + pc1.blockId, ""),
                });
                return this.blockId;
            },
            previousBlockId: first.previousBlockId,
        };
        return blockPlotChecker;
    }
    /**计算账户一轮下来对应的权益 */
    calcAccountRoundEquity(accTxCount, accBalance, roundLastBlock) {
        const { numberOfTransactionRewardWeight, chainAssetRewardWeight, } = this.config.genesisBlock.remark;
        const tradingEquity = BigInt(accTxCount) *
            BigInt(numberOfTransactionRewardWeight) *
            BigInt(roundLastBlock.remark.rate);
        const equity = BigInt(accBalance) * BigInt(chainAssetRewardWeight) + tradingEquity;
        return equity.toString();
    }
    /**计算区块的参与度 */
    calcBlockParticipation(args) {
        const { totalAccount, totalFee, totalChainAsset, numberOfTransactions } = args;
        const { participationTotalChainAsset, participationNumberOfTransaction, participationNumberOfAccount, participationTotalFee, } = this.config.blockParticipationWeight;
        const jsbiX = BigInt(totalChainAsset) * BigInt(participationTotalChainAsset) +
            BigInt(totalAccount) * BigInt(participationNumberOfAccount);
        const jsbiY = BigInt(totalFee) * BigInt(participationTotalFee) +
            BigInt(numberOfTransactions) * BigInt(participationNumberOfTransaction);
        return (jsbiX + jsbiY).toString();
    }
    async forceGetBlockGeneratorAddressByRound(round, blockGetterHelper = this.blockGetterHelper) {
        if (!blockGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "blockGetterHelper",
                target: "moduleStroge",
                function: "BlockGetterHelper.forceGetBlockGeneratorAddressByHeight",
            });
        }
        const startHeight = (round - 1) * this.config.blockPerRound + 1;
        const endHeight = round * this.config.blockPerRound;
        const resultArr = [];
        for (let height = startHeight; height <= endHeight; height++) {
            const publicKeyBuffer = typeof blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight === "function"
                ? await blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight(height)
                : (await this.forceGetBlockByHeight(height, blockGetterHelper)).generatorPublicKeyBuffer;
            if (!publicKeyBuffer) {
                throw new ArgumentFormatException(core_util_exception_1.NOT_EXIST, {
                    prop: `height:${height}`,
                    target: "generatorPublicKey",
                    function: "BlockGetterHelper.forceGetBlockGeneratorAddressByHeight",
                });
            }
            const address = this.accountBaseHelper.getAddressFromPublicKey(publicKeyBuffer);
            if (!resultArr.includes(address)) {
                resultArr.push(address);
            }
        }
        return resultArr;
    }
    /**
     * 计算链上链的hash
     * @param currentHeight
     * @param blockGetterHelper
     */
    async calcRoundLastBlockRemarkHash(currentHeight, blockGetterHelper) {
        let lastRoundLastBlockHeight = (this.calcRoundByHeight(currentHeight) - 1) * this.config.blockPerRound;
        lastRoundLastBlockHeight = lastRoundLastBlockHeight === 0 ? 1 : lastRoundLastBlockHeight;
        const payloadHash = this.cryptoHelper.sha256();
        if (lastRoundLastBlockHeight !== 1) {
            const block = await this.forceGetBlockByHeight(lastRoundLastBlockHeight, blockGetterHelper);
            payloadHash.update(block.remark.hashBuffer);
        }
        for (let height = lastRoundLastBlockHeight; height < currentHeight; height++) {
            const blockSignatureBuffer = await this.forceGetBlockSignatureByHeight(height, blockGetterHelper);
            payloadHash.update(blockSignatureBuffer);
        }
        const hashString = payloadHash.digest("hex");
        return hashString;
    }
    /**
     * 对比两个受托人的优先级
     * 可以用于sort函数
     * @param itemA
     * @param itemB
     */
    nextRoundDelegatesCompareFn(itemA, itemB) {
        /**
         * 因为要从大到小排序，所以这里使用`b-a`
         */
        if (itemB.vote > itemA.vote) {
            return 1;
        }
        else if (itemB.vote < itemA.vote) {
            return -1;
        }
        /// (b === a)
        if (itemB.productivity > itemA.productivity) {
            return 1;
        }
        else if (itemB.productivity < itemA.productivity) {
            return -1;
        }
        /// itemB.productivity === itemA.productivity
        /**
         * 因为pk是等长的字符串，所以这里不需要使用`String.localCompare`
         */
        return itemA.publicKey > itemB.publicKey ? 1 : itemA.publicKey === itemB.publicKey ? 0 : -1;
    }
    /**
     * 对受托人进行排序
     * @param accountInfoList
     */
    sortInRankAccountInfoList(accountInfoList) {
        return accountInfoList.sort(this.nextRoundDelegatesCompareFn);
    }
};
__decorate([
    util_1.Inject("blockGetterHelper", { optional: true }),
    __metadata("design:type", Object)
], BlockHelper.prototype, "blockGetterHelper", void 0);
BlockHelper = __decorate([
    util_1.Injectable(),
    __param(3, util_1.Inject("cryptoHelper")),
    __param(4, util_1.Inject("keypairHelper")),
    __param(5, util_1.Inject("Buffer")),
    __metadata("design:paramtypes", [core_helper_config_1.ConfigHelper,
        core_helper_type_1.BaseHelper,
        core_helper_account_1.AccountBaseHelper, Object, Object, Object])
], BlockHelper);
exports.BlockHelper = BlockHelper;
//# sourceMappingURL=blockHelper.js.map