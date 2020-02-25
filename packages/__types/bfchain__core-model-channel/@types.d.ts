/// <reference lib="dom" />
declare namespace BFChainCore {
    type RESPONSE_STATUS = import("./").RESPONSE_STATUS;
    type BLOCKCHAIN_STATUS = import("./").BLOCKCHAIN_STATUS;
    type NewTransactionStatus = import("./").NewTransactionStatus;
    interface ErrorMessageJSON {
        message: string;
        detailJSON: string;
        PLATFORM?: string;
        CHANNEL?: string;
        BUSINESS?: string;
        MODULE?: string;
        FILE?: string;
        CODE?: string;
    }
    interface CommonResponseJSON {
        status: RESPONSE_STATUS;
        error?: ErrorMessageJSON;
    }
    type TransactionQueryOptionsJSON = {
        type?: string;
        signature?: string;
        senderId?: string;
        recipientId?: string;
        minHeight?: number;
        blockSignature?: string;
        maxHeight?: number;
        storage?: TransactionStorageJSON;
        trusteeId?: string;
        purchaseDAppid?: string;
        dappid?: string;
        lns?: string;
        offset: number;
        limit?: number;
    };
    type TransactionSortOptionsJSON = {
        index?: -1 | 1;
        height?: -1 | 1;
    };
    type QueryTransactionArgJSON = {
        query: TransactionQueryOptionsJSON;
        sort: TransactionSortOptionsJSON;
    };
    interface QueryTransactionReturnJSON extends CommonResponseJSON, QueryTransactionReturnParams {
    }
    interface QueryTransactionReturnParams {
        transactions: TransactionInBlockJSON[];
    }
    type NewTransactionArgJSON = {
        grabSecret?: string;
        transaction: TransactionJSON<any> | Transaction;
    };
    interface NewTransactionReturnJSON extends CommonResponseJSON, NewTransactionReturnParams {
    }
    interface NewTransactionReturnParams {
        newTrsStatus: NewTransactionStatus;
        minFee: string;
        refuseReason?: import("./").NewTransactionRefuseReason;
    }
    type BlockQueryOptionsJSON = {
        signature?: string;
        height?: number;
    };
    type QueryBlockArgJSON = {
        query: BlockQueryOptionsJSON;
    };
    interface QueryBlockReturnJSON<B extends BlockJSON = BlockJSON> extends CommonResponseJSON {
        someBlock?: SomeBlockJSON<B>;
    }
    interface QueryBlockReturnParams {
        block?: BlockJSON;
    }
    type NewBlockArgJSON = {
        height: number;
        signature: string;
        previousBlockSignature: string;
        timestamp: number;
        totalFee: string;
        numberOfTransactions: number;
        generatorPublicKey: string;
        blockParticipation: string;
    };
    interface NewBlockReturnJSON extends CommonResponseJSON, NewBlockReturnParams {
    }
    interface NewBlockReturnParams {
    }
    interface WebRTCPeerConnectionReturnJSON extends CommonResponseJSON, WebRTCPeerConnectionReturnParams {
    }
    interface WebRTCPeerConnectionReturnParams {
        answerSdp: string;
        rtcUid: number;
    }
    type WebRTCIceCandidateArgJSON = {
        rtcUid: number;
        ice?: RTCIceCandidateInit;
    };
    interface WebRTCIceCandidateReturnJSON extends CommonResponseJSON, WebRTCIceCandidateReturnParams {
    }
    interface WebRTCIceCandidateReturnParams {
    }
    type serviceI18nBaseModel = {
        [langusage: string]: string;
    };
    type serviceI18nScreenModel = {
        [langusage: string]: {
            small: string;
            large: string;
        };
    };
    type serviceI18nRemarkModel = {
        [langusage: string]: {
            online: number;
            title: string;
            subTitle: string;
            description: string;
        };
    };
    type ServiceInfoJSON = {
        id: string;
        dappid: string;
        version: string;
        name: string;
        category?: string[];
        defaultLanguage: string;
        tags: string[];
        icon: string;
        i18n: {
            name: serviceI18nBaseModel[];
            screen: serviceI18nScreenModel[];
            slider: serviceI18nScreenModel[];
            shortDescription: serviceI18nBaseModel[];
            description: serviceI18nBaseModel[];
            remark: serviceI18nRemarkModel[];
        };
        needVote: boolean;
        userUI: {
            fileName: string;
            md5: string;
        };
        adminUI: {
            fileName: string;
            md5: string;
        };
    };
    type ServicePeerInfoJSON = {
        peerInfoDelay: number;
        onlineUser: number;
        productivity: number;
        paidSourceChainMagic: string;
        paidsourceChainName: string;
        paidAssetType: string;
        paidAmount: string;
        paidType: string;
        serviceNotesName: string;
        noteIP: string;
        delegateAddress: string;
        developerVote: boolean;
        systemDelegateVote: boolean;
        dappOnChainBuy: boolean;
    };
    type PeerConsensusJSON = {
        peerTime: number;
    };
    type GetPeerInfoArgJSON = {
        uid?: number;
    };
    interface BlockchainStatusJSON<S extends BLOCKCHAIN_STATUS = any> {
        status: S;
        progressEvent?: BlockchainStatus.StatusProgressEventMap<S>;
    }
    namespace BlockchainStatus {
        type OFFLINE = import("./").BLOCKCHAIN_STATUS.OFFLINE;
        type FREE = import("./").BLOCKCHAIN_STATUS.FREE;
        type REBUIDING = import("./").BLOCKCHAIN_STATUS.REBUIDING;
        type PEER_SCANNING = import("./").BLOCKCHAIN_STATUS.PEER_SCANNING;
        type REPLAY_BLOCK = import("./").BLOCKCHAIN_STATUS.REPLAY_BLOCK;
        type GENERATING = import("./").BLOCKCHAIN_STATUS.GENERATING;
        type ROLLBACK = import("./").BLOCKCHAIN_STATUS.ROLLBACK;
        type StatusProgressEventMap<S extends BLOCKCHAIN_STATUS> = S extends OFFLINE ? undefined : S extends FREE ? undefined : S extends REBUIDING ? BlockchainRebuildingProgressEventJSON : S extends PEER_SCANNING ? BlockchainPeerScanningProgressEventJSON : S extends REPLAY_BLOCK ? BlockchainReplayBlockProgressEventJSON : S extends GENERATING ? BlockchainGeneratingProgressEventJSON : S extends ROLLBACK ? BlockchainRollbackProgressEventJSON : never;
    }
    type PeerInfoJSON = {
        uid: number;
        height: number;
        blockchainStatus: BlockchainStatusJSON;
        serviceInfo?: ServiceInfoJSON[];
        servicePeerInfo?: ServicePeerInfoJSON[];
        peerConsensus: PeerConsensusJSON;
        peerLinkCount: number;
    };
    interface GetPeerInfoReturnParams {
        peerInfo?: BFChainCore.PeerInfoJSON;
    }
    interface GetPeerInfoReturnJSON extends CommonResponseJSON, GetPeerInfoReturnParams {
    }
}
