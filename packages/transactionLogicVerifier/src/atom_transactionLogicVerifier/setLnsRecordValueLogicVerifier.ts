import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  NewTransactionRefuseReason,
  RECORD_OPERATION_TYPE,
  SetLnsRecordValueTransaction,
  ASSET_STATUS,
} from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  LOCATION_NAME_IS_NOT_EXIST,
  SET_LOCATION_NAME_RECORD_VALUE_FIELD,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "SetLnsRecordValueLogicVerifier",
);

@Injectable()
export class SetLnsRecordValueLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  addRecord(
    locationName: string,
    addRecord: BFChainCore.LocationNameRecordJSON,
    records: BFChainCore.LocationNameRecordInfo,
  ) {
    const { recordType, recordValue } = addRecord;
    if (records && records[recordType] && records[recordType][recordValue]) {
      throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
        locationName,
        reason: "New location name record value already exist",
        function: "addRecord",
      });
    }
  }

  deleteRecord(
    locationName: string,
    deleteRecord: BFChainCore.LocationNameRecordJSON,
    records: BFChainCore.LocationNameRecordInfo,
  ) {
    const { recordType, recordValue } = deleteRecord;
    if (!(records[recordType] && records[recordType][recordValue])) {
      throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
        locationName,
        reason: "Delete location name record value not exist",
        function: "deleteRecord",
      });
    }
  }

  async verify(
    transaction: SetLnsRecordValueTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    const lnsRecordValue = transaction.asset.lnsRecordValue;
    const sourceChainMagic = lnsRecordValue.sourceChainMagic;
    const { name, operationType, addRecord, deleteRecord } = lnsRecordValue;
    // 校验当前域名是否存存在
    const memLocation = (await accountGetterHelper.getLocationName(
      sourceChainMagic,
      name.toLowerCase(),
      currentBlockHeight,
    )) as BFChainCore.LocationNameInfo | undefined;
    if (!memLocation) {
      throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
        locationName: name,
        errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
        ...Function_Exception_Detail,
      });
    }

    const { records, status } = memLocation;
    // 处于冻结状态的链域名不能设置解析值
    if (status === ASSET_STATUS.FROZEN) {
      throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
        locationName: name,
        reason: "Frozen location name can not set record value",
        ...Function_Exception_Detail,
      });
    }

    // 只有域名的拥有者或者管理员可以设置域名的解析值
    const address = transaction.senderId;
    if (!(address === memLocation.possessorAddress || address === memLocation.manager)) {
      throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
        locationName: name,
        reason: "Only the location name possessor or manager can set record value",
        ...Function_Exception_Detail,
      });
    }

    if (operationType === RECORD_OPERATION_TYPE.ADD) {
      if (!addRecord) {
        throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
          locationName: name,
          reason: "New location name record value lose",
          ...Function_Exception_Detail,
        });
      }
      this.addRecord(name, addRecord, records);
    } else if (operationType === RECORD_OPERATION_TYPE.DELETE) {
      if (!deleteRecord) {
        throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
          locationName: name,
          reason: "Delete location name record value lose",
          ...Function_Exception_Detail,
        });
      }
      this.deleteRecord(name, deleteRecord, records);
    } else if (operationType === RECORD_OPERATION_TYPE.UPDATE) {
      if (!(addRecord && deleteRecord)) {
        throw new ConsensusException(SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
          locationName: name,
          reason: "New location name record value and delete location name record value lose",
          ...Function_Exception_Detail,
        });
      }
      this.deleteRecord(name, deleteRecord, records);
      this.addRecord(name, addRecord, records);
    }

    return true;
  }
}
