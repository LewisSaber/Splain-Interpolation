import MathNode from "./MathNode.js"
import OperatorRegistry from "./OperatorRegistry.js"

export default class ArrayNode extends MathNode {
  solve() {
    let newNode = OperatorRegistry.createNode("[")
    let i = 0
    for (const connection of this) {
      newNode.addConnectionAt(
        OperatorRegistry.createOrReturnNode(connection.solve()),
        i
      )
      i++
    }

    return this
  }
  copy() {
    return new ContantNode(this.getValue())
  }
  toString() {
    let result = "["
    let n = this.getConnectionsLength()
    if (n == 0) result += "]"
    for (let i = 0; i < n; i++) {
      result += this.at(i).toString()
      result += i == n - 1 ? "]" : " , "
    }
    return result
  }
  at(index) {
    if (this.connections[index] == undefined)
      this.addConnectionAt(OperatorRegistry.createNode(0), index)
    return this.getConnection(index)
  }

  getJS() {
    let newArr = []
    for (const connection of this) {
      let node = connection.solve()
      if (node instanceof MathNode) {
        newArr.push(node.toJS())
      } else newArr.push(node)
    }
    return newArr
  }
}
