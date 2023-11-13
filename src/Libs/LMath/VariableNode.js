import ObjectHelper from "./Helper.js"
import MathNode from "./MathNode.js"

export default class VariableNode extends MathNode {
  solve() {
    let result = this.getValueFromScope(this.value)
    if (result != undefined)
      if (result instanceof MathNode) {
        result.applyScope(this.scope)
        return result.solve()
      } else return result
    else return this.copy()
  }
  copy() {
    let result = new VariableNode(this.value)
    result.setScope(this.scope)
    return result
  }
  toString() {
    return this.value
  }
  toJS() {
    let variable = this.solve()
    if (variable instanceof MathNode) {
      return variable.toJS()
    }
    return variable
  }
}
