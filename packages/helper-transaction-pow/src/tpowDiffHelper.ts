import { Injectable } from "@bfchain/util";
import { ConfigHelper } from "@bfchain/core-helper-config";
import {
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  SHOULD_BE,
  PROP_LENGTH_SHOULD_EQ_FIELD,
} from "@bfchain/core-util-exception-errorcode";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import {
  TPOW_PARAMETER_LIST,
  TPOW_OPERATOR,
  TPOW_OPERATOR_LIST,
  TPOW_AUXILIARY_SYMBOL,
  TPOW_AUXILIARY_SYMBOL_LIST,
} from "@bfchain/core-model-constants";
import { TPOWStackHelper } from "./tpowStackHelper";

const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "jsbiHelper");

@Injectable()
export class TPOWDiffHelper {
  constructor(public config: ConfigHelper) {}

  private getOperatorPatternString(operators: string[]) {
    let operatorString = "";
    const numberOfOperator = operators.length;
    for (let i = 0; i < numberOfOperator; i++) {
      const operator = operators[i];
      operators[operators.length] = operator;
      if (operator === "+" || operator === "*" || operator === "/" || operator === "%") {
        operatorString += `\\${operator}`;
      } else if (operator === "**") {
        let tempStr = "";
        for (let i = 0; i < 2; i++) {
          tempStr += `\\${operator[i]}`;
        }
        operatorString += tempStr;
      } else {
        operatorString += operator;
      }
      if (i !== numberOfOperator - 1) {
        operatorString += "|";
      }
    }
    return operatorString;
  }

  private isStringNumber(str: string) {
    const allowSymbols = /^[0-9]+$/;
    return allowSymbols.test(str);
  }

  /**
   * 获取计算规则列表
   *
   * @param tpowDiffFormula
   */
  private getFormulaList(tpowDiffFormula: string) {
    const formulas = tpowDiffFormula.trim().replace(/\s+/gi, " ").split(" ");
    const formatFormulas: string[] = [];
    // 去除空格
    for (const formula of formulas) {
      if (formula) {
        formatFormulas[formatFormulas.length] = formula;
      }
    }
    return formatFormulas;
  }

  /**
   * 分离参数和辅助运算符
   *
   * @param param
   */
  private separateParamAndBracket(param: string) {
    let realParam = "";
    let brackets = "";
    let direction = 0;
    if (param.includes(TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET)) {
      realParam = param.slice(param.lastIndexOf(TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) + 1);
      brackets = param.slice(0, param.lastIndexOf(TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) + 1);
    }

    if (param.includes(TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET)) {
      realParam = param.slice(0, param.indexOf(TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET));
      brackets = param.slice(param.indexOf(TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET));
      direction = 1;
    }
    return {
      realParam,
      brackets,
      direction,
    };
  }

  /**
   * tpow 难度计算公式是否合法
   *
   * @param tpowDiffFormula
   */
  isValidTpowDiffFormula(tpowDiffFormula: string) {
    if (!tpowDiffFormula) {
      return false;
    }
    // 去除多余的空格
    const paramList = this.getFormulaList(tpowDiffFormula);
    // 必须包含至少 3 项
    if (paramList.length < 3) {
      return false;
    }
    let numberOfLeftBracket = 0;
    let numberOfRightBracket = 0;

    for (const param of paramList) {
      // 参数包含 "("
      if (param.includes(TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET)) {
        const { realParam, brackets } = this.separateParamAndBracket(param);
        numberOfLeftBracket += brackets.length;
        if (realParam && !TPOW_PARAMETER_LIST.includes(realParam as any)) {
          if (!this.isStringNumber(realParam)) {
            return false;
          }
        }
        continue;
      }
      // 参数包含 ")"
      if (param.includes(TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET)) {
        const { realParam, brackets } = this.separateParamAndBracket(param);
        numberOfRightBracket += brackets.length;
        if (realParam && !TPOW_PARAMETER_LIST.includes(realParam as any)) {
          if (!this.isStringNumber(realParam)) {
            return false;
          }
        }
        continue;
      }
      // 只能包含给定的值或数字
      if (
        !(
          TPOW_PARAMETER_LIST.includes(param as any) ||
          TPOW_OPERATOR_LIST.includes(param as any) ||
          TPOW_AUXILIARY_SYMBOL_LIST.includes(param as any)
        )
      ) {
        if (!this.isStringNumber(param)) {
          return false;
        }
        continue;
      }
      if (param === TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) {
        numberOfLeftBracket++;
      }
      if (param === TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET) {
        numberOfRightBracket++;
      }
    }
    // 小括号必须完全匹配
    if (numberOfLeftBracket !== numberOfRightBracket) {
      return false;
    }

    const operatorString = this.getOperatorPatternString(TPOW_OPERATOR_LIST);
    const startPattern = new RegExp(`^(\\)|${operatorString}).*`, "i");
    const endPattern = new RegExp(`.(${operatorString}|\\()$`, "i");
    // 不能以运算符开头或结尾，不能以 ")" 开头，以 "(" 结尾
    if (startPattern.test(tpowDiffFormula) || endPattern.test(tpowDiffFormula)) {
      return false;
    }
    // "(" 后面不能跟运算符，")" 前面不能跟运算符
    for (let i = 0; i < paramList.length; i++) {
      const param = paramList[i];
      if (param === TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) {
        if (TPOW_OPERATOR_LIST.includes(paramList[i + 1] as any)) {
          return false;
        }
      }
      if (param === TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET) {
        if (TPOW_OPERATOR_LIST.includes(paramList[i - 1] as any)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 检查参数并解析表达式
   *
   * @param params
   */
  private checkAndGetCalcTpowDiffParam(params: BFChainCore.TPOWDiffCalculateOptions) {
    const paramList = this.getFormulaList(this.config.tpowDiffFormula);
    const formulas: string[] = [];
    for (const param of paramList) {
      // 运算符
      if (TPOW_OPERATOR_LIST.includes(param as any)) {
        formulas[formulas.length] = param;
        continue;
      }
      // 辅助运算符
      if (TPOW_AUXILIARY_SYMBOL_LIST.includes(param as any)) {
        formulas[formulas.length] = param;
        continue;
      }
      // 实数
      if (this.isStringNumber(param)) {
        formulas[formulas.length] = param;
        continue;
      }
      // 参数
      if (TPOW_PARAMETER_LIST.includes(param as any)) {
        // 必须提供相应的参数实值
        if ((params as any)[param] === undefined) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: param,
            target: "params",
            function: "checkCalcTpowDiffParam",
          });
        }
        formulas[formulas.length] = param;
        continue;
      }
      // 复合参数
      if (
        param.includes(TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) ||
        param.includes(TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET)
      ) {
        const { realParam, brackets, direction } = this.separateParamAndBracket(param);
        if (realParam && TPOW_PARAMETER_LIST.includes(realParam as any)) {
          if ((params as any)[realParam] === undefined) {
            throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
              prop: realParam,
              target: "params",
              function: "checkCalcTpowDiffParam",
            });
          }
        }
        if (direction) {
          if (realParam) {
            formulas[formulas.length] = realParam;
          }
          for (const bracket of brackets) {
            formulas[formulas.length] = bracket;
          }
        } else {
          for (const bracket of brackets) {
            formulas[formulas.length] = bracket;
          }
          if (realParam) {
            formulas[formulas.length] = realParam;
          }
        }
      }
    }
    return formulas;
  }

  /**
   * 获取计算结果
   *
   * @param prevItem
   * @param operator
   * @param nextItem
   */
  private calcResult(prevItem: bigint, operator: BFChainCore.TPOW_OPERATOR, nextItem: bigint) {
    // 除法和取余时如果第二个参数为 0，则统一使用 1 QWQ
    const realNextItem = nextItem === BigInt(0) ? BigInt(1) : nextItem;
    switch (operator) {
      case TPOW_OPERATOR.ADD:
        return prevItem + nextItem;
      case TPOW_OPERATOR.SUBTRACT:
        return prevItem - nextItem;
      case TPOW_OPERATOR.MULTIPLY:
        return prevItem * nextItem;
      case TPOW_OPERATOR.DIVIDE:
        return prevItem / realNextItem;
      case TPOW_OPERATOR.POWER:
        return prevItem ** nextItem;
      case TPOW_OPERATOR.MODULAR:
        return prevItem % realNextItem;
    }
  }

  /**
   * 获取操作符优先级，值越大优先级越高
   *
   * @param operator
   */
  private getOperatorPriority(operator: string) {
    switch (operator) {
      case TPOW_OPERATOR.ADD:
        return 1;
      case TPOW_OPERATOR.SUBTRACT:
        return 1;
      case TPOW_OPERATOR.MULTIPLY:
        return 2;
      case TPOW_OPERATOR.DIVIDE:
        return 2;
      case TPOW_OPERATOR.POWER:
        return 3;
      case TPOW_OPERATOR.MODULAR:
        return 2;
      default:
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `operator ${operator}`,
          target: "tpowDiffFormula",
          function: "getOperatorPriority",
        });
    }
  }

  /**
   * 比较两个操作符的优先级
   *
   * @param prevOperator
   * @param nextOperator
   */
  private calcOperatorPriority(prevOperator: string, nextOperator: string) {
    const prevPriority = this.getOperatorPriority(prevOperator);
    const nextPriority = this.getOperatorPriority(nextOperator);
    return prevPriority >= nextPriority ? true : false;
  }

  calcDiffOfTransactionProfOfWork(tpowDiffOptions: BFChainCore.TPOWDiffCalculateOptions) {
    const formula = this.checkAndGetCalcTpowDiffParam(tpowDiffOptions);
    const dataStack = new TPOWStackHelper<bigint>();
    const operatorStack = new TPOWStackHelper<string>();

    // 运算数和操作符入栈
    const pushStack = (item: string | number) => {
      // 当前元素是运算参数，则参数值直接入栈
      if (TPOW_PARAMETER_LIST.includes(item as any)) {
        const nextItem = (tpowDiffOptions as any)[item];
        dataStack.push(BigInt(nextItem));
        return;
      }
      // 当前参数是实数，直接入栈
      if (this.isStringNumber(item as string)) {
        dataStack.push(BigInt(item));
        return;
      }
      // 当前元素是操作符，比较其与操作符栈顶元素的优先级
      if (TPOW_OPERATOR_LIST.includes(item as any)) {
        while (true) {
          let operator = operatorStack.peek();
          // 没有更前面的操作符，直接入操作符栈
          if (!operator) {
            operatorStack.push(item as any);
            break;
          }
          // 操作符栈顶的操作符是 "(" 直接入操作符栈
          if (operator === TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) {
            operatorStack.push(item as any);
            break;
          }
          let prevOperator = operatorStack.peek();
          // 判断操作符与操作符栈顶的操作符的优先级
          if (this.calcOperatorPriority(prevOperator, item as string)) {
            // 操作符栈顶的操作符优先级高，进行运算
            prevOperator = operatorStack.pop() as string;
            // 操作符栈不为空却没有足够的运算数
            const nextItem = dataStack.pop();
            if (nextItem === undefined) {
              throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
                prop: "nextIntem",
                target: "dataStack",
                function: "pushStack",
              });
            }
            const prevItem = dataStack.pop();
            if (prevItem === undefined) {
              throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
                prop: "prevItem",
                target: "dataStack",
                function: "pushStack",
              });
            }
            // 进行计算并且将结果入栈
            dataStack.push(this.calcResult(prevItem, prevOperator as any, nextItem));
          } else {
            // 当前操作符优先级高，直接入操作符栈
            operatorStack.push(item as any);
            break;
          }
        }
        return;
      }
      // 当前元素元素是 "("
      if (item === TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) {
        operatorStack.push(item);
        return;
      }
      // 当前元素是 ")"，循环计算，直到找到第一个 "("，没有则出错了
      if (item === TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET) {
        while (true) {
          const operator = operatorStack.pop();
          if (!operator) {
            throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
              prop: "operator",
              target: "operatorStack",
              function: "pushStack",
            });
          }
          // 当前操作符是 "(" 计算结束
          if (operator === TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) {
            break;
          }
          const nextItem = dataStack.pop();
          if (nextItem === undefined) {
            throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
              prop: "nextIntem",
              target: "dataStack",
              function: "pushStack",
            });
          }
          const prevItem = dataStack.pop();
          if (prevItem === undefined) {
            // 已经没有下一个运算数了
            const nextOperator = operatorStack.pop();
            // 如果操作符栈顶元素不是 ")"，则肯定出错了
            if (nextOperator !== TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET) {
              throw new ArgumentIllegalException(SHOULD_BE, {
                to_compare_prop: "nextOperator",
                to_target: "operatorStack",
                be_compare_prop: TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET,
                function: "pushStack",
              });
            }
            // 没有运算数却还有操作符
            if (operatorStack.size() > 0) {
              throw new ArgumentIllegalException(PROP_LENGTH_SHOULD_EQ_FIELD, {
                prop: "size",
                target: "operatorStack",
                field: 0,
                function: "pushStack",
              });
            }
            // 将最终结果入栈，并且结束计算
            dataStack.push(nextItem);
            continue;
          }
          // 进行计算并且将结果入栈
          dataStack.push(this.calcResult(prevItem, operator as any, nextItem));
        }
      }
    };

    // 循环计算，直到完成
    const cycleCalculate = () => {
      while (true) {
        // 操作符栈为空，表示计算已经完成
        if (operatorStack.size() === 0) {
          break;
        }
        const operator = operatorStack.pop();
        if (!operator) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "operator",
            target: "operatorStack",
            function: "pushStack",
          });
        }
        const nextItem = dataStack.pop();
        if (nextItem === undefined) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "nextIntem",
            target: "dataStack",
            function: "pushStack",
          });
        }
        const prevItem = dataStack.pop();
        if (prevItem === undefined) {
          throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
            prop: "prevItem",
            target: "dataStack",
            function: "pushStack",
          });
        }
        // 进行计算并且将结果入栈
        dataStack.push(this.calcResult(prevItem, operator as any, nextItem));
      }
    };

    for (const item of formula) {
      pushStack(item);
    }
    cycleCalculate();
    return dataStack.peek();
  }
}
