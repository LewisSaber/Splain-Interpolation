import Scope from "./Scope.js"

let id = 0
class MathNode {
  constructor(value = "") {
    this.setValue(value)
    this.connections = []
    this.id = id
    id++
  }
  is(value) {
    return this.value == value
  }
  at() {
    return this
  }
  setScope(scope) {
    this.scope = scope
  }
  addToScope(object) {
    if (object) {
      if (this.scope == undefined) this.scope = new Scope()
      this.scope.addObject(object)
    }
    return this
  }
  applyScope(scope) {
    this.setScope(scope)
    for (const connection of this) connection.applyScope(this.scope)
  }

  addConnection(node) {
    if (node != undefined) {
      this.connections.push(node)
      node.parent = this
      node.setScope(this.scope)
    }
  }
  popConnection() {
    let node = this.connections.pop()
    node.parent = undefined
    return node
  }
  replaceConnection(node, newNode) {
    let i = 0
    for (const connection of this) {
      if (connection == node) {
        this.addConnectionAt(newNode, i)
      }
      i++
    }
  }
  removeConnection(node) {
    let result = []
    for (const connection of this) {
      if (connection != node) {
        result.push(result)
      }
    }
    this.connections = result
  }
  addConnectionAt(node, index) {
    if (node != undefined) {
      this.connections[index] = node
      node.parent = this
      node.setScope(this.scope)
    }
  }
  getConnection(i) {
    return this.connections[i]
  }

  filterConnections(filter) {
    for (const connection of this.connections) {
      if (!filter(connection)) return false
    }
    return true
  }

  getConnectionsLength() {
    return this.connections.length
  }

  setValue(value) {
    this.value = value
  }
  isFunction() {
    return false
  }
  isOperator() {
    return false
  }

  getValueFromScope(variable, indexes) {
    if (this.scope) {
      return this.scope.getValue(variable, indexes)
    }

    return undefined
  }

  getConnections() {
    return this.connections
  }
  getValue() {
    return this.value
  }
  *[Symbol.iterator]() {
    for (let connection of this.connections) {
      if (connection) yield connection
      else yield new MathNode()
    }
  }
  copy() {}
  copyNested() {}
  toString() {
    return this.value
  }
  getJS() {}
}

export default MathNode
