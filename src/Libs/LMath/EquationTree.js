import MathNode from "./MathNode.js"
import OperatorRegistry from "./OperatorRegistry.js"
import Tokenizer from "./Tokenizer.js"
import VariableNode from "./VariableNode.js"

class EquationTree {
  constructor() {}
  build(Equation) {
    Equation = this.nodify(Tokenizer.normalizeString(Equation).split(" "))
    let pointer = { value: 0 }
    let result = new MathNode()
    this.buildEquation(Equation, result, pointer)

    if (result.getValue() == "") result = result.popConnection()
    this.head = result

    return this
  }
  nodify(Equation_array) {
    let result = []
    for (const symbol of Equation_array) {
      result.push(OperatorRegistry.createNode(symbol))
    }
    return result
  }
  solve(scope) {
    if (this.head) {
      this.head
      this.head.applyScope(scope)
      return this.head.solve()
    }
  }

  buildEquation(Equation, resultNode, pointer) {
    let topNode
    let currentNode
    let trailing_operand
    while (
      !(
        Equation[pointer.value] == undefined ||
        Equation[pointer.value].is(")") ||
        Equation[pointer.value].is("]") ||
        Equation[pointer.value].is("}")
      )
    ) {
      let element = Equation[pointer.value]

      if (element.is("(")) {
        pointer.value++
        let node

        if (currentNode && currentNode.isFunction()) {
          node = currentNode
        }
        // else if (
        //   pointer.value > 1 ||
        //   Equation[pointer.value - 1] instanceof VariableNode
        // ) {
        //   node = Equation[pointer.value - 1]
        // }
        else node = new MathNode()
        this.buildEquation(Equation, node, pointer)
        if (node.getValue() == "") {
          if (currentNode) currentNode.addConnection(node.getConnection(0))
          else trailing_operand = node.getConnection(0)
        }
      } else if (element.is("[") || element.is("{")) {
        pointer.value++
        let newNode = OperatorRegistry.createNode(element.getValue())
        this.buildEquation(Equation, newNode, pointer)
        if (currentNode) currentNode.addConnection(newNode)
        else trailing_operand = newNode
      } else if (element.is(",")) {
        if (topNode) resultNode.addConnection(topNode)
        if (trailing_operand) resultNode.addConnection(trailing_operand)
        if (topNode == undefined && trailing_operand == undefined) {
          resultNode.addConnection(OperatorRegistry.createNode(0))
        }
        topNode = undefined
        currentNode = undefined
        trailing_operand = undefined
      } else if (element.isOperator()) {
        if (topNode == undefined) {
          topNode = element
          currentNode = element
          topNode.addConnection(trailing_operand)
          trailing_operand = undefined
        } else if (element.getPriority() <= currentNode.getPriority()) {
          let node = currentNode

          while (node && element.getPriority() <= node.getPriority()) {
            node = node.parent
          }

          if (node == undefined) {
            element.addConnection(topNode)
            topNode = element
            currentNode = element
          } else {
            let prevnode = node.popConnection()

            element.addConnection(prevnode)
            node.addConnection(element)
            currentNode = element
          }
        } else {
          if (!element.isFunction())
            element.addConnection(currentNode.popConnection())
          currentNode.addConnection(element)
          currentNode = element
        }
      } else {
        if (currentNode == undefined) {
          trailing_operand = element
        } else {
          currentNode.addConnection(element)
        }
      }

      pointer.value++
    }
    if (topNode) resultNode.addConnection(topNode)
    if (trailing_operand) resultNode.addConnection(trailing_operand)
  }
}

export default EquationTree
