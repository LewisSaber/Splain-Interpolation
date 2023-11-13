import MathNode from "./MathNode.js"
import Scope from "./Scope.js"

export default class ScopeNode extends MathNode {
  constructor(value) {
    super(value)
    this.scope = new Scope()
  }
  setScope(scope) {
    this.scope.parent = scope
  }
  solve() {
    for (const connection of this.connections) {
      connection.solve()
      if (this.return) {
        let ret = this.return
        this.return = undefined
        this.scope.clear()
        return ret
      }
    }
    this.scope.clear()
    return this
  }
}
