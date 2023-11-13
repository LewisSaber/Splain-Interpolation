import ArrayNode from "./ArrayNode.js"
import ContantNode from "./ConstantNode.js"
import MathNode from "./MathNode.js"
import Operator from "./Operator.js"
import OperatorNode from "./OperatorNode.js"
import ScopeNode from "./ScopeNode.js"
import VariableNode from "./VariableNode.js"

let OperatorRegistry = {
  operators: {},
  registerOperator(
    name,
    priority,
    job,
    isFunction = true,
    solve_before_entry = true
  ) {
    this.operators[name] = new Operator(
      priority,
      job,
      isFunction,
      solve_before_entry
    )
  },
  createNode(element) {
    if (OperatorRegistry.isOperator(element)) {
      return new OperatorNode(element, this.getOperator(element))
    }
    if (element == "[") return new ArrayNode(element)
    if (element == "{") return new ScopeNode(element)
    if (isNaN(element)) {
      return new VariableNode(element)
    }
    return new ContantNode(element)
  },
  createOrReturnNode(node) {
    if (node instanceof MathNode) return node
    return this.createNode(node)
  },

  isOperator(element) {
    return this.operators[element] instanceof Operator
  },
  isFunction(element) {
    let s = this.operators[element]
    if (s instanceof Operator) return s.isFunction()
    return false
  },
  getOperator(string) {
    return this.operators[string]
  },
}

const OPERATOR_PRIORITIES = {
  // =
  ASSIGNMENT: 100,
  //rounding
  ROUNDING: 200,
  //logical
  LOGICAL: 300,
  //+ -
  ADD_SUB: 500,
  //* /
  MULT_DIV: 1000,
  // ^
  EXPONENT: 1500,
  // function
  FUNCTION: 2000,
  // get element
  GET_ELEMENT: 5000,
}

function registerCommonOperators() {
  OperatorRegistry.registerOperator(
    "_",
    OPERATOR_PRIORITIES.GET_ELEMENT,
    (a, b) => {
      a = a.solve()
      b = b.solve()
      if (a instanceof ArrayNode) {
        return a.at(b)
      } else return a
    },
    false,
    false
  )
  OperatorRegistry.registerOperator(
    "define",
    OPERATOR_PRIORITIES.FUNCTION,
    (fucntion_name, variables) => 0,
    true,
    false
  )
  OperatorRegistry.registerOperator(
    "return",
    OPERATOR_PRIORITIES.FUNCTION,
    (a) => {
      let node = a
      while (node) {
        if (node instanceof ScopeNode) {
          if (node.return == undefined) node.return = a.solve()
        }
        node = node.parent
      }
    },
    true,
    false
  )
  OperatorRegistry.registerOperator(
    ":=",
    OPERATOR_PRIORITIES.ASSIGNMENT,
    (a, b) => {
      let scope = {}
      scope[a.toString()] = b
      a.scope.parent.addObject(scope)

      return b
    },
    false,
    false
  )
  OperatorRegistry.registerOperator(
    "=",
    OPERATOR_PRIORITIES.ASSIGNMENT,
    (a, b) => {
      if (a.getValue() == "_") {
        a = a.solve()
      }

      if (a.parent instanceof ArrayNode) {
        a.parent.replaceConnection(
          a,
          OperatorRegistry.createOrReturnNode(b.solve())
        )
      } else {
        let scope = {}
        scope[a.toString()] = b.solve()
        a.scope.parent.addObject(scope)
      }

      return b.solve()
    },
    false,
    false
  )
  OperatorRegistry.registerOperator(
    "^",
    OPERATOR_PRIORITIES.EXPONENT,
    (a, b) => a ** b,
    false
  )
  OperatorRegistry.registerOperator(
    "+",
    OPERATOR_PRIORITIES.ADD_SUB,
    (a, b) => a + b,
    false
  )
  OperatorRegistry.registerOperator(
    "-",
    OPERATOR_PRIORITIES.ADD_SUB,
    (a, b) => a - b,
    false
  )
  OperatorRegistry.registerOperator(
    "*",
    OPERATOR_PRIORITIES.MULT_DIV,
    (a, b) => a * b,
    false
  )
  OperatorRegistry.registerOperator(
    "/",
    OPERATOR_PRIORITIES.MULT_DIV,
    (a, b) => a / b,
    false
  )
  OperatorRegistry.registerOperator(
    "%",
    OPERATOR_PRIORITIES.MULT_DIV,
    (a, b) => a % b,
    false
  )
  OperatorRegistry.registerOperator(
    "#",
    OPERATOR_PRIORITIES.ROUNDING,
    (a, b) => +a.toFixed(b),
    false
  )
  OperatorRegistry.registerOperator(
    "&&",
    OPERATOR_PRIORITIES.LOGICAL,
    (a, b) => a && b,
    false
  )
  OperatorRegistry.registerOperator(
    "||",
    OPERATOR_PRIORITIES.LOGICAL,
    (a, b) => a && b,
    false
  )
  OperatorRegistry.registerOperator(
    ">",
    OPERATOR_PRIORITIES.LOGICAL,
    (a, b) => a > b,
    false
  )
  OperatorRegistry.registerOperator(
    ">=",
    OPERATOR_PRIORITIES.LOGICAL,
    (a, b) => a >= b,
    false
  )
  OperatorRegistry.registerOperator(
    "<=",
    OPERATOR_PRIORITIES.LOGICAL,
    (a, b) => a <= b,
    false
  )
  OperatorRegistry.registerOperator(
    "<",
    OPERATOR_PRIORITIES.LOGICAL,
    (a, b) => a < b,
    false
  )
  OperatorRegistry.registerOperator(
    "==",
    OPERATOR_PRIORITIES.LOGICAL,
    (a, b) => a == b,
    false
  )
  OperatorRegistry.registerOperator(
    "!=",
    OPERATOR_PRIORITIES.LOGICAL,
    (a, b) => a != b,
    false
  )
  OperatorRegistry.registerOperator(
    "for",
    OPERATOR_PRIORITIES.FUNCTION,
    (start, condition, step, job) => {
      start.solve()
      for (; condition.solve(); step.solve()) {
        job.solve()
      }
      return 0
    },

    true,
    false
  )
  OperatorRegistry.registerOperator(
    "sum",
    OPERATOR_PRIORITIES.FUNCTION,

    (index_variable, index_start, index_end, to_solve) => {
      let i = index_start.solve()
      let n = index_end.solve()

      if (i instanceof MathNode || n instanceof MathNode) {
        let result = OperatorRegistry.createNode("sum")
        result.scope = index_variable.parent.scope.copy()
        result.addConnection(
          OperatorRegistry.createOrReturnNode(index_variable)
        )
        result.addConnection(OperatorRegistry.createOrReturnNode(i))
        result.addConnection(OperatorRegistry.createOrReturnNode(n))
        result.addConnection(
          OperatorRegistry.createOrReturnNode(to_solve.solve())
        )
        return result
      }
      let result = new ContantNode(0)
      for (; i <= n; i++) {
        let scope = {}
        scope[index_variable.getValue()] = i
        to_solve.addToScope(scope)
        let node = OperatorRegistry.createNode("+")
        node.addConnection(result)
        node.addConnection(
          OperatorRegistry.createOrReturnNode(to_solve.solve())
        )

        result = OperatorRegistry.createOrReturnNode(node.solve())
      }
      if (result instanceof ContantNode) return result.solve()
      return result
    },
    true,
    false
  )
  OperatorRegistry.registerOperator(
    "mul",
    OPERATOR_PRIORITIES.FUNCTION,

    (index_variable, index_start, index_end, to_solve) => {
      let i = index_start.solve()
      let n = index_end.solve()

      if (i instanceof MathNode || n instanceof MathNode) {
        let result = OperatorRegistry.createNode("mul")
        result.scope = index_variable.parent.scope.copy()
        result.addConnection(
          OperatorRegistry.createOrReturnNode(index_variable)
        )
        result.addConnection(OperatorRegistry.createOrReturnNode(i))
        result.addConnection(OperatorRegistry.createOrReturnNode(n))
        result.addConnection(
          OperatorRegistry.createOrReturnNode(to_solve.solve())
        )

        return result
      }
      let result = new ContantNode(1)

      for (; i <= n; i++) {
        let scope = {}
        scope[index_variable.getValue()] = i
        to_solve.addToScope(scope)
        let node = OperatorRegistry.createNode("*")
        node.addConnection(result)
        node.addConnection(
          OperatorRegistry.createOrReturnNode(to_solve.solve())
        )

        result = OperatorRegistry.createOrReturnNode(node.solve())
      }
      if (result instanceof ContantNode) return result.solve()
      return result
    },
    true,
    false
  )
  OperatorRegistry.registerOperator(
    "sin",
    OPERATOR_PRIORITIES.FUNCTION,
    Math.sin
  )
  OperatorRegistry.registerOperator(
    "cos",
    OPERATOR_PRIORITIES.FUNCTION,
    Math.cos
  )
  OperatorRegistry.registerOperator(
    "abs",
    OPERATOR_PRIORITIES.FUNCTION,
    Math.abs
  )

  OperatorRegistry.registerOperator(
    "out",
    OPERATOR_PRIORITIES.FUNCTION,
    (a) => {
      console.log(OperatorRegistry.createOrReturnNode(a).solve().toString())
    },
    true,
    false
  )
  OperatorRegistry.registerOperator(
    "if",
    OPERATOR_PRIORITIES.FUNCTION,
    (condition, iftrue = new MathNode(0), iffalse = new MathNode(0)) => {
      let solved = condition.solve()
      if (solved instanceof MathNode) {
        let newif = OperatorRegistry.createOrReturnNode("if")
        newif.addConnection(solved)
        newif.addConnection(OperatorRegistry.createOrReturnNode(iftrue.solve()))
        newif.addConnection(
          OperatorRegistry.createOrReturnNode(iffalse.solve())
        )
        return newif
      } else return solved ? iftrue.solve() : iffalse.solve()
    },
    true,
    false
  )
  OperatorRegistry.registerOperator(
    "len",
    OPERATOR_PRIORITIES.FUNCTION,
    (a) =>
      OperatorRegistry.createOrReturnNode(a.solve()).getConnectionsLength(),
    true,
    false
  )
}
registerCommonOperators()
export default OperatorRegistry
