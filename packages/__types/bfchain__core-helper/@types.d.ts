declare namespace BFChainCore {
    interface TxBodyJSON {
        version: number;
        type?: string;
        senderId: string;
        senderPublicKey: string;
        senderSecondPublicKey?: string;
        recipientId?: string;
        rangeType: RANGE_TYPE;
        range: string[];
        fee: string;
        timestamp: number;
        dappid?: string;
        lns?: string;
        sourceIP?: string;
        fromMagic: string;
        toMagic: string;
        applyBlockHeight: number;
        numberOfEffectiveBlocks: number;
        nonce?: number;
        remark: {
            [key: string]: string;
        };
        storage?: BFChainCore.TransactionStorageJSON;
    }
    type MachineStatusJSON = {
        loadingModules: number;
        rebuilding: number;
        peerScan: number;
        checkisync: number;
        peerConsensus: number;
        unBanSetInterval: number;
        syncing: number;
        looping: number;
        receivedBlock: number;
        verifyBlock: number;
        dealTransaction: number;
        createBlock: number;
        sendingBlock: number;
        insufficientDiskSpace: number;
    };
    type DefaultConstantsJSON = {
        maxBatchSizeBytes: number;
        genesisAmount: string;
        miniUnit: string;
        fixedPoint: number;
        machineStatus: MachineStatusJSON;
        disableAssetType: string[];
        preRegisteredLNSName: string[];
        disableLNSName: string[];
    };
}
