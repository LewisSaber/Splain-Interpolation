class Operator {
  constructor(priority, solving, isFunction = true, solve_before_entry = true) {
    this.priority = priority
    this.solving = solving
    this.isFunctionVar = isFunction
    this.solve_before_entry = solve_before_entry
  }
  getPriority() {
    return this.priority
  }
  getOperands() {
    return this.solving.length
  }
  solve(...args) {
    return this.solving(...args)
  }
  isFunction() {
    return this.isFunctionVar
  }
  doSolving() {
    return this.solve_before_entry
  }
}

export default Operator
