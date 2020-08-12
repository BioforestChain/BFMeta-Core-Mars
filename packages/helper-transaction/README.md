## 关于 TPOW 难度曲线

###　推导过程

以此为基准,我们对用户进行了分级,初步分为 5 级别进行展示, 更多等级可以同理推导:
其中:`Tpow participation = accBalance * accTxCount`

|       LEVEL        |    1    |     2     |     3     |     4     |     5     |
| :----------------: | :-----: | :-------: | :-------: | :-------: | :-------: |
|  Need Online Time  | 1 Round | 1/2 Round | 1/3 Round | 1/4 Round | 1/5 Round |
| Tpow participation |  0~500  |   7,000   |  20,000   |  45,000   |  100,000  |

### 最终得到拟合曲线

基于`Need Online Time`和`Tpow participation`,使用**逻辑斯蒂曲线**进行拟合:

```
x : Tpow participation
y : Need Online Time
y = 0.238536212611 / (1-0.7936005508148 * e ^ (-0.0847138128036 * x / 1000))
```

### 将需要在线时间转化为难度

已知我们有难度基数:

```
diffBase: 难度基数
growthFactor: 难度增长率
diffBase = (growthFactor ^ N) * N
```

列出图表:

| TIB Count |  1  |  2  |  3  |  4  |  5  |  6  |
| :-------: | :-: | :-: | :-: | :-: | :-: | :-: |
| Diff Base |  0  |  2  | 14  | 60  | 216 | 740 |

我们假设最基础的节点算力,是 `5w(Work)/s(Second)`.
那么一个区块内能提供的算力是 `128*5w = 640w`.
又因为一轮的最后一个区块不支持交易,所以需要将一轮的算力分摊在`一轮-1`的区块量内: `640w*57/56≈651.428`.
为此,我们定义`Easy Tpow`为`<640w`.

|       LEVEL        |      1       |      2       |      3       |       4       |      5       |
| :----------------: | :----------: | :----------: | :----------: | :-----------: | :----------: |
|  Need Online Time  |   1 Round    |  1/2 Round   |  1/3 Round   |   1/4 Round   |  1/5 Round   |
| Easy Trs Per Block |    1 Trs     |    2 Trs     |    3 Trs     |     4 Trs     |    5 Trs     |
| No Easy Tpow Diff  | T2 >= 651.43 | T3 >= 651.43 | T4 >= 651.43 | T5 >= 651.43  | T6 >= 651.43 |
|  Need Work Times   | ÷ 2 ≈ 325.71 | ÷ 14 ≈ 46.53 | ÷ 60 ≈ 10.86 | ÷ 216 ≈ 3.016 | ÷ 740 ≈ 0.88 |

为此,最终难度为:

```
Diff = diffBase * needWorkTimes
```
