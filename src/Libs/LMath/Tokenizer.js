let Tokenizer = {
  normalizeString: (expr) => {
    expr = expr
      .replaceAll(/(\d) *([a-zA-Z]+)/g, "$1 * $2")
      .replaceAll(/\/ *-/g, "* -1 / ")
      .replaceAll(/-(\(|[a-zA-Z])/g, " -1 * $1")
      .replaceAll(/\*\*/g, " ^ ")
      .replaceAll(/\)\(/g, ") * (")
      .replaceAll(/(\(|\[|\{|\}|\)|\])/g, " $1 ")
      .replaceAll(/(\d|[a-zA-Z])([\+\/\*\-^,$#|&:=_]+)/g, "$1 $2")
      .replaceAll(/([\+\/\*^,#$|&:=_]+)(\d|[a-zA-Z])/g, "$1 $2")
      .replaceAll(/([\+\/\-\*^,#$|&:=_]+)(\-)/g, "$1 $2")
      .replaceAll(/(\(|^) *- {1}(\d|[a-zA-Z])/g, "$1 -$2")
      .replaceAll(/(\d|[a-zA-Z]) \+-(\d)/g, "$1 - $2")
      .replaceAll(/(\d|[a-zA-Z]) *- *(\d|[a-zA-Z])/g, "$1 - $2")
      .replaceAll(/ {2,}/g, " ")
      .replaceAll(/ $/g, "")
      .replaceAll(/^ /g, "")
      .replace(/^\+ */, "")

    return expr
  },
}

export default Tokenizer
