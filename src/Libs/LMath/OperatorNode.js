import MathNode from "./MathNode.js"
import ContantNode from "./ConstantNode.js"
import OperatorRegistry from "./OperatorRegistry.js"
import Scope from "./Scope.js"

export default class OperatorNode extends MathNode {
  constructor(value, operator) {
    super(value)
    this.operator = operator
    this.scope = new Scope()
  }
  setScope(scope) {
    this.scope.parent = scope
  }

  isFunction() {
    return this.operator.isFunction()
  }
  getPriority() {
    return this.operator.getPriority()
  }
  isOperator() {
    return true
  }
  solve() {
    let operands = []
    if (this.operator.doSolving()) {
      let hasUnsolveds = false
      for (const connection of this) {
        let result = connection.solve()
        if (result instanceof MathNode) {
          if (result instanceof ContantNode) {
            result = result.solve()
          } else hasUnsolveds = true
        }

        operands.push(result)
      }
      if (hasUnsolveds) {
        let newNode = OperatorRegistry.createNode(this.getValue())
        newNode.setScope(this.scope.copy())
        for (const operand of operands) {
          newNode.addConnection(OperatorRegistry.createOrReturnNode(operand))
        }
        newNode.applyScope(newNode.scope)
        return newNode
      }
    } else operands = this.getConnections()

    return this.operator.solve(...operands)
  }

  toString() {
    if (!this.isFunction())
      return (
        "(" +
        this.getConnection(0).toString() +
        " " +
        this.value +
        " " +
        this.getConnection(1).toString() +
        ")"
      )
    let result = this.getValue() + "("
    let n = this.getConnectionsLength()
    for (let i = 0; i < n; i++) {
      result += this.getConnection(i).toString()
      result += i == n - 1 ? ")" : " , "
    }

    return result
  }
}
