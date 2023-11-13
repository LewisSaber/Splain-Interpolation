import MathNode from "./MathNode.js"
let id = 0
export default class Scope {
  constructor() {
    this.variables = {}

    this.id = id
    id++
  }
  clear() {
    this.variables = {}
  }
  addValue(key, value) {
    // if (value instanceof MathNode) this.scope.functions[key] = value
    // else
    if (value instanceof MathNode) value.setScope(this)
    this.variables[key] = value
  }
  addObject(object) {
    for (const key in object) {
      this.addValue(key, object[key])
    }
  }
  getValue(variable, indexes) {
    let result = this.variables[variable]
    if (result != undefined) {
      if (indexes && indexes.length > 0) {
        for (const index of indexes) {
          result = result.at(index)
          if (result == undefined) return result
        }
      }

      return result
    } else if (this.parent) return this.parent.getValue(variable, indexes)
    return undefined
  }
  copy() {
    let newScope = new Scope()
    newScope.parent = this.parent
    for (const key in this.variables) {
      newScope.variables[key] = this.variables[key]
    }
    return newScope
  }
}
