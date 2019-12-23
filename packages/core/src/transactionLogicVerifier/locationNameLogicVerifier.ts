import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  NewTransactionRefuseReason,
  LocationNameTransaction,
  LOCATION_NAME_OPERATION_TYPE,
  ASSET_STATUS,
} from "../../model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  LOCATION_NAME_ALREADY_FROZEN,
  LOCATION_NAME_IS_NOT_EXIST,
  CAN_NOT_DELETE_LOCATION_NAME,
  ALREADY_EXIST,
  FORBIDDEN,
} from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "LocationNameLogicVerifier",
);

@Injectable()
export class LocationNameLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: LocationNameTransaction,
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
    const locationName = transaction.asset.locationName;
    const { sourceChainMagic, name, operationType } = locationName;
    const names = name.split(".");

    // 校验当前域名是否存存在
    const memLocation = (await accountGetterHelper.getLocationName(
      sourceChainMagic,
      name,
      currentBlockHeight,
    )) as BFChainCore.LocationNameInfo | undefined;

    if (operationType === LOCATION_NAME_OPERATION_TYPE.REGISTRATION) {
      // 已存在的域名不能重复添加
      if (memLocation) {
        throw new ConsensusException(ALREADY_EXIST, {
          prop: name,
          target: "blockChain",
          errorId: NewTransactionRefuseReason.LOCATION_NAME_ALREADY_EXIST,
          ...Function_Exception_Detail,
        });
      }
      // 链域名是否被禁用
      const result = await accountGetterHelper.isLocationNameForbidden(name);
      if (result) {
        throw new ConsensusException(FORBIDDEN, {
          prop: `Location name ${name}`,
          target: "blockChain",
          ...Function_Exception_Detail,
        });
      }
      if (names.length > 2) {
        // 不能越级添加域名，即上级域名不存在则添加失败
        const index = name.indexOf(".") + 1;
        const lastLocationName = name.substr(index);
        const lastMemLocation = await accountGetterHelper.getLocationName(
          locationName.sourceChainMagic,
          lastLocationName,
          currentBlockHeight,
        );
        if (!lastMemLocation) {
          throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
            locationName: lastLocationName,
            ...Function_Exception_Detail,
          });
        }
      }
    } else if (operationType === LOCATION_NAME_OPERATION_TYPE.CANCELLATION) {
      // 顶级域名不能删除
      if (names.length === 2) {
        throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
          locationName: name,
          reason: "Top level location name can not be delete",
          ...Function_Exception_Detail,
        });
      }
      // 不存在的域名不能删除
      if (!memLocation) {
        throw new ConsensusException(LOCATION_NAME_IS_NOT_EXIST, {
          locationName: name,
          errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
          ...Function_Exception_Detail,
        });
      }
      // 冻结状态的域名不能删除
      if (memLocation.status === ASSET_STATUS.FROZEN) {
        throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
          locationName: name,
          reason: "Frozen location name can not be delete",
          ...Function_Exception_Detail,
        });
      }
      // 只有域名的拥有者才能删除域名
      if (memLocation.possessorAddress !== transaction.senderId) {
        throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
          locationName: name,
          reason: "Only location name possessor can delete location name",
          ...Function_Exception_Detail,
        });
      }
      // 不能越级删除域名，即有子域名的域名不能删除
      const exist = await accountGetterHelper.getLocationName(
        locationName.sourceChainMagic,
        name,
        currentBlockHeight,
        {
          endsWith: name,
        },
      );
      if (exist) {
        throw new ConsensusException(CAN_NOT_DELETE_LOCATION_NAME, {
          locationName: name,
          reason: "Location name have child location name, please delete it at first",
          ...Function_Exception_Detail,
        });
      }
    }

    return true;
  }
}
