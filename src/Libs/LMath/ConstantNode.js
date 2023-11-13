import MathNode from "./MathNode.js"

export default class ContantNode extends MathNode {
  solve() {
    return +this.value
  }
  copy() {
    return new ContantNode(this.getValue())
  }
  toString() {
    return this.value.toString()
  }
  toJS() {
    return this.value()
  }
}
