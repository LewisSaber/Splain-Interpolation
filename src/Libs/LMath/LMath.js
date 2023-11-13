import EquationTree from "./EquationTree.js"

let LMath = {
  solve(Equation, scope) {
    let tree = new EquationTree().build(Equation)
    return tree.solve(scope)
  },
}

export default LMath
