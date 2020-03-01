# 交易可定义的事件及参数说明

## "setSecondPublicKey"

    设置二次密码

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更账户公钥，string
    - secondPublicKey：新的二次密码公钥，string

- 范例

  ```
    {
        type: "setSecondPublicKey",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227"
            secondPublicKey: "5fff2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c228"
        }
    }
  ```

## "setUsername"

    设置二次密码

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更账户的公钥，string
    - alias：新的用户名，string

- 范例

  ```
    {
        type: "setUsername",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            alias: "a_long_lose_father"
        }
    }
  ```

## "registerToDelegate"

    注册成为受托人

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string

- 范例

  ```
    {
        type: "registerToDelegate",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227"
        }
    }
  ```

## "acceptVote"

    开启接收投票

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string

- 范例

  ```
    {
        type: "acceptVote",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227"
        }
    }
  ```

## "rejectVote"

    关闭接收投票

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string

- 范例

  ```
    {
        type: "rejectVote",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227"
        }
    }
  ```

## "voteEquity"

    设置二次密码

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更账户的公钥，string
    - equity：投出的权益数，string
    - recipientId：投给的账户地址，string

- 范例

  ```
    {
        type: "voteEquity",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            equity: "10086",
            recipientId: "cLwXBhfqd6PR2R6JdjkGc3LSwMPjsK1gKF"
        }
    }
  ```

## "asset"

    资产变动事件，包含资产的扣除、累加

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string | undefined
    - magic：变更的资产所属链网络标识符，string
    - assetType：变更的资产类型，string
    - amount：变更的资产数量，string
    - action：操作类型，string，+/-

- 范例

  ```
    {
        type: "asset",
        transaction: Transaction<customAsset>
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            magic: "5F720C81E82CFC99",
            assetType: "BFT",
            amount: "1000",
            action: "+"
        }
    }
  ```

## "destoryAsset"

    销毁数字资产

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - magic: 变更的资产所属链网络标识符，string
    - assetType：变更的资产名，string
    - amount：变更的资产数量，string

- 范例

  ```
    {
        type: "destoryAsset",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            magic: "5F720C81E82CFC99",
            assetType: "QAQ",
            amount: "10000"
        }
    }
  ```

## "frozenAsset"

    冻结数字资产

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - magic: 变更的资产所属链网络标识符，string
    - assetType：变更的资产名，string
    - amount：变更的资产数量，string
    - minEffectiveHeight：最小有效期，number
    - maxEffectiveHeight： 最大有效期，number
    - totalUnfrozenTimes?：总可解冻次数，number

- 范例

  ```
    {
        type: "frozenAsset",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            magic: "5F720C81E82CFC99",
            assetType: "QAQ",
            amount: "10000",
            minEffectiveHeight: 20,
            maxEffectiveHeight: 100,
            totalUnfrozenTimes: 10
        }
    }
  ```

## "unfrozenAsset"

    冻结数字资产

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - magic: 变更的资产所属链网络标识符，string
    - assetType：变更的资产名，string
    - amount：变更的资产数量，string
    - frozenId：冻结交易的 id，string
    - recipientId：交易的接收者账户地址，string

- 范例

  ```
    {
        type: "unfrozenAsset",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            magic: "5F720C81E82CFC99",
            assetType: "QAQ",
            amount: "10000",
            frozenId:"82d14d7e24add13773c0f9cb7de6e8dde69a3f07661f1ad471b5071f416e32f379b432ad6e7312827bf512b69f8c52f271de9e39af24b84b84a8523350ffec0d",
            recipientId: "cLwXBhfqd6PR2R6JdjkGc3LSwMPjsK1gKF"
        }
    }
  ```

## "frozenAccount"

    冻结账户

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - accountStatus: 变冻结状态，ACCOUNT_STATUS

- 范例

  ```
    {
        type: "frozenAccount",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            accountStatus: ACCOUNT_STATUS.FROZEN_IN_AND_OUT
        }
    }
  ```

## "issueDAppid"

    发行 dappid

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - sourceChainName：所属链名，string
    - sourceChainMagic：所属链网络标识符，string
    - dappid：申请的 dappid，string
    - type：dappid 类型，DAPP_TYPE
    - purchaseAsset：购买信息，BFChainCore.DAppPurchaseAssetJSON | undefined

- 范例

  ```
    {
        type: "issueDAppid",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            dappid: "CAPCOM123456789QWQQAQ",
            sourceChainName: bfchainCore.config.chainName,
            sourceChainMagic: bfchainCore.config.magic,
            type: DAPP_TYPE.PAID_APP,
            purchaseAsset: {
                sourceChainName: bfchainCore.config.chainName,
                sourceChainMagic: bfchainCore.config.magic,
                assetType: "QAQ",
                amount: "1000",
            },
        }
    }
  ```

## "saleDAppid"

    出售 dappid

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - dappid：出售的 dappid，string
    - sourceChainMagic：所属链网络标识符，string
    - minEffectiveHeight：最小生效期，number（目前默认 applyBlockHeight）
    - maxEffectiveHeight：最大生效期，number）

- 范例

  ```
    {
        type: "saleDAppid",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            dappid: "CAPCOM123456789QWQQAQ",
            sourceChainMagic: bfchainCore.config.magic,
            minEffectiveHeight: 10,
            maxEffectiveHeight: 1000,
        }
    }
  ```

## "purchaseDAppid"

    购买 dappid

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - dappid：出售的 dappid，string
    - sourceChainMagic：所属链网络标识符，string
    - possessorAddress：新的持有人地址

- 范例

  ```
    {
        type: "purchaseDAppid",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            dappid: "CAPCOM123456789QWQQAQ",
            sourceChainMagic: bfchainCore.config.magic,
            possessorAddress: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Mb",
        }
    }
  ```

## "issueAsset"

    发行数字资产

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - sourceChainName：所属链名，string
    - sourceChainMagic：所属链网络标识符，string
    - assetType：发行的数字资产名称，string
    - genesisAddress：创世账户地址，string
    - expectedIssuedAssets：总发行的资产数量，string

- 范例

  ```
    {
        type: "issueAsset",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            sourcChainName: bfchainCore.config.chainName,
            sourceChainMagic: bfchainCore.config.magic,
            assetType: "QAQ",
            genesisAddress: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Mb",
            expectedIssuedAssets: "888888888888888888888888888",
        }
    }
  ```

## "registerChain"

    发行注册链

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - genesisBlock：创世块，BlockJSON

- 范例

  ```
    {
        type: "registerChain",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            genesisBlock: {
                ...
            }
        }
    }
  ```

## "registerLocationName"

    注册链域名

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - sourceChainName：所属链名，string
    - sourceChainMagic：所属链网络标识符，string
    - name：申请的链域名，string

- 范例

  ```
    {
        type: "registerLocationName",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            chainName: "skyrim",
            sourceChainMagic: "123456789A",
            name: "qwq.skyrim",
        }
    }
  ```

## "cancelLocationName"

    注销链域名

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - sourceChainMagic：所属链网络标识符，string
    - name：申请的链域名，string

- 范例

  ```
    {
        type: "cancelLocationName",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            sourceChainMagic: "123456789A",
            name: "qwq.skyrim",
        }
    }
  ```

## "setLnsManager"

    注销链域名

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - sourceChainMagic：所属链网络标识符，string
    - name：申请的链域名，string
    - manager：新的管理员地址，string

- 范例

  ```
    {
        type: "setLnsManager",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            sourceChainMagic: "123456789A",
            name: "qwq.skyrim",
            manager: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma"
        }
    }
  ```

## "setLnsRecordValue"

    注销链域名

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - sourceChainMagic：所属链网络标识符，string
    - name：申请的链域名，string
    - operationType：操作类型，RECORD_OPERATION_TYPE
    - addRecord：新增的记录值，BFChainCore.LocationNameRecordJSON | undefined
    - deleteRecord：删除的记录值，BFChainCore.LocationNameRecordJSON | undefined

- 范例

  ```
    {
        type: "setLnsRecordValue",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            sourceChainMagic: "123456789A",
            name: "qwq.skyrim",
            operationType: RECORD_OPERATION_TYPE.UPDATE,
            addRecord: {
                recordType: RECORD_TYPE.IPV4,
                recordValue: "127.0.0.1",
            },
            deleteRecord: {
                recordType: RECORD_TYPE.IPV6,
                recordValue: "21DA:00D3:0000:2F3B:02AA:00FF:FE28:9C5A",
            };
        }
    }
  ```

## "saleLocationName"

    出售链域名

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - sourceChainMagic：所属链网络标识符，string
    - name：出售的链域名，string
    - minEffectiveHeight：最小生效期，number（目前默认 applyBlockHeight）
    - maxEffectiveHeight：最大生效期，number）

- 范例

  ```
    {
        type: "saleLocationName",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            sourceChainMagic: "123456789A",
            name: "qwq.skyrim",
            minEffectiveHeight: 10000,
            maxEffectiveHeight: 100000,
        }
    }
  ```

## "purchaseLocationName"

    购买链域名

- 参数

  - type：事件名，string
  - transaction：交易本体，Transaction\<customAsset>
  - applyInfo：变更明细，object
    - address：变更账户地址，string
    - publicKey：变更的账户公钥，string
    - sourceChainMagic：所属链网络标识符，string
    - name：出售的链域名，string
    - possessorAddress：新的持有人地址

- 范例

  ```
    {
        type: "purchaseLocationName",
        transaction: Transaction<customAsset>,
        applyInfo: {
            address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
            publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
            sourceChainMagic: "123456789A",
            name: "qwq.skyrim",
            possessorAddress: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Mb",
        }
    }
  ```
