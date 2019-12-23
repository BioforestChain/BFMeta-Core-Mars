import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  NewTransactionRefuseReason,
  SetLnsManagerTransaction,
  LOCATION_NAME_LEVEL,
  ASSET_STATUS,
} from "../../model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  LOCATION_NAME_IS_NOT_EXIST,
  SET_LOCATION_NAME_MANAGER_FIELD,
} from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "SetLnsManagerLogicVerifier",
);

@Injectable()
export class SetLnsManagerLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: SetLnsManagerTransaction,
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
    const lnsManager = transaction.asset.lnsManager;
    const sourceChainMagic = lnsManager.sourceChainMagic;
    const name = lnsManager.name;
    // 不能将冻结账户设置为管理员
    const newManager = await accountGetterHelper.getAccountInfo(lnsManager.manager);
    if (newManager) {
      this.checkSenderAccountStatus(newManager);
    }

    // 链域名不存在不能设置管理员
    const memLocation = (await accountGetterHelper.getLocationName(
      sourceChainMagic,
      name,
      currentBlockHeight,
    )) as BFChainCore.LocationNameInfo | undefined;
    if (!memLocation) {
      throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
        locationName: name,
        ...Function_Exception_Detail,
      });
    }

    // 处于冻结状态的链域名不能设置管理员
    if (memLocation.status === ASSET_STATUS.FROZEN) {
      throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
        locationName: name,
        reason: "Frozen location name can not set manager",
        ...Function_Exception_Detail,
      });
    }

    // 不能将原来的管理员设置为管理员
    if (lnsManager.manager === memLocation.manager) {
      throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
        locationName: name,
        reason: "Can not set the same account as manager",
        errorId: NewTransactionRefuseReason.CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER,
        ...Function_Exception_Detail,
      });
    }

    const { senderId } = transaction;
    if (memLocation.level === LOCATION_NAME_LEVEL.MULTI_LEVEL) {
      const names = name.split(".");
      const index = names[0].length + 1;
      const lastLocationName = name.substr(index);
      const lastMemLocation = (await accountGetterHelper.getLocationName(
        sourceChainMagic,
        lastLocationName,
        currentBlockHeight,
      )) as BFChainCore.LocationNameInfo | undefined;
      // 上级域名不存在
      if (!lastMemLocation) {
        throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
          locationName: lastLocationName,
          reason: "Last location name is not exists",
          ...Function_Exception_Detail,
        });
      }
      // 多级域名只有域名的拥有者或者上级域名的管理员可以设置管理员
      if (!(senderId === memLocation.possessorAddress || senderId === lastMemLocation.manager)) {
        throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
          locationName: lastLocationName,
          reason:
            "Only the location name possessor or upper level location name manager can set manager of multi level location name",
          ...Function_Exception_Detail,
        });
      }
    } else {
      // 顶级域名只有域名的拥有者可以设置管理员
      if (senderId !== memLocation.possessorAddress) {
        throw new ConsensusException(SET_LOCATION_NAME_MANAGER_FIELD, {
          locationName: name,
          reason: "Only the location name possessor can set manager of top level location name",
          ...Function_Exception_Detail,
        });
      }
    }

    return true;
  }
}
