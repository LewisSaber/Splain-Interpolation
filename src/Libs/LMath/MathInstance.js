import LMath from "./LMath.js"
import MathNode from "./MathNode.js"
import Scope from "./Scope.js"

export default class MathInstance {
  constructor() {
    this.scope = new Scope()
    this.options = {
      connectLinesWithComma: true,
    }
    this.leftoverline = ""
  }
  execute(string) {
    let execution = string.split("\n")
    for (const line of execution) {
      this.executeLine(line)
    }
    this.endExecution()
  }
  executeLine(line) {
    if (line != "" && line[0] != "-") {
      if (line[0] == ";") {
        if (this.leftoverline != "" && this.options.connectLinesWithComma) {
          this.leftoverline += ","
        }
        this.leftoverline += line.slice(1)
      } else {
        if (this.leftoverline != "") {
          LMath.solve(this.leftoverline, this.scope)
          this.leftoverline = ""
        }
        LMath.solve(line, this.scope)
      }
    }
  }
  endExecution() {
    if (this.leftoverline != "") {
      LMath.solve(this.leftoverline, this.scope)
      this.leftoverline = ""
    }
  }

  getVariable(variableName) {
    let variable = this.scope.getValue(variableName)
    if (variable instanceof MathNode) return variable.getJS()
    return variable
  }
}
