import loadComponents from "./GUI/Loader.js"
import SimpleDataFrame from "./Libs/LUI/SimpleDataFrame.js"
import Component from "./Libs/LUI/Component.js"
import DataFrameRegistry from "./Libs/LUI/DataFrameRegistry.js"
import MainComponent from "./Libs/LUI/MainComponent.js"
import Button from "./Libs/LUI/Button.js"
import MathInstance from "./Libs/LMath/MathInstance.js"
import LMath from "./Libs/LMath/LMath.js"
import Tokenizer from "./Libs/LMath/Tokenizer.js"
import VariableNode from "./Libs/LMath/VariableNode.js"
import EquationTree from "./Libs/LMath/EquationTree.js"

function Initialize() {
  loadComponents()
  createDataFrames()
  createGraph()
  addDoItInteraction()

  MainComponent.getComponentByName("Input").fill({
    Formula: "x^2",
    n: 3,
    a: 0,
    b: 3,
  })
}

function getSimpleSplinePoint(point, { n, l1, h, a, y }) {
  let res = 0
  for (let i = -1 * l1 + 1; i <= n + l1 - 1; i++) {
    let argument = (point - (a + i * h)) / h
    res += y[i] * B1(argument)
  }
  return res
}

function getCubicSplinePoint(point, { n, l3, h, a, alphas }) {
  let y = 0
  for (let i = -1 * l3 + 1; i <= n + l3 - 1; i++) {
    let argument = (point - (a + i * h)) / h
    y += alphas[i] * B3(argument)
  }
  return y
}
function B1(x) {
  x = Math.abs(x)
  if (x >= 1) return 0
  return 1 - x
}

function B3(x) {
  x = Math.abs(x)
  if (x >= 2) return 0
  if (x <= 1) return (1 / 6) * ((2 - x) ** 3 - 4 * (1 - x) ** 3)
  return (1 / 6) * (2 - x) ** 3
}

function doWork(mathData) {
  console.log({ mathData })
  if (!validateData(mathData)) return

  clearGraph()

  const instance = new MathInstance()
  mathData.l1 = 1
  mathData.l3 = 2
  mathData.h = (mathData.b - mathData.a) / mathData.n

  mathData / instance.execute("a = " + mathData.a)
  instance.execute("b = " + mathData.b)
  instance.execute("n = " + mathData.n)
  instance.execute("f = " + mathData.Formula)
  instance.execute(`
  prec = 4
  x = []
  y = []
for(i:=0,i <= n,i = i+1, {x_i =a + (b - a) / n * i  # prec})
for(i:=0,i <= n,i = i+1, {x= x_i, y_i = f # prec})
  `)
  mathData.y = instance.getVariable("y")
  //generating interpolation table
  let pointsDf = DataFrameRegistry.getDataFrame("points")
  pointsDf.clearAll()
  pointsDf.addColumn("x", instance.getVariable("x"))
  pointsDf.addColumn("y", instance.getVariable("y"))
  pointsDf.refreshTable()

  mathData.alphas = getUnknownCoeficients(mathData)

  let points = 100
  drawFormulaGraph(mathData, points)
  drawQubicSplain(mathData, points)
  drawSimpleSplain(mathData, points)
  drawPoints(pointsDf.getColumn("x"), pointsDf.getColumn("y"), "Вузли")
}

function drawFormulaGraph({ a, b, Formula }, points) {
  let graphX = []
  let graphY = []
  for (let i = 0; i <= points; i++) {
    graphX[i] = a + ((b - a) / points) * i
    graphY[i] = solveFormula({ x: graphX[i] }, Formula, "y", true)
  }
  drawGraph(graphX, graphY, "Формула")
}

function drawQubicSplain(mathData, points) {
  let graphX = []
  let graphY = []
  let { a, b } = mathData
  for (let i = 0; i < points; i++) {
    graphX[i] = a + ((b - a) / points) * i
    graphY[i] = getCubicSplinePoint(graphX[i], mathData)
  }
  drawGraph(graphX, graphY, "Сплайн 3")
}

function drawSimpleSplain(mathData, points) {
  let graphX = []
  let graphY = []
  let { a, b } = mathData
  for (let i = 0; i < points; i++) {
    graphX[i] = a + ((b - a) / points) * i
    graphY[i] = getSimpleSplinePoint(graphX[i], mathData)
  }
  drawGraph(graphX, graphY, "Сплайн 1")
}
function validateData(mathData) {
  if (mathData.n < 1) return false
  return true
}

function solveFormula(variables, formula, result = "y", prepend = false) {
  let instance = new MathInstance()
  for (const variable in variables) {
    instance.execute(`${variable} = ${variables[variable]}`)
  }
  if (prepend) {
    instance.execute(result + " = " + formula)
  } else instance.execute(formula)
  return instance.getVariable(result)
}

function getUnknownCoeficients(mathData) {
  let { y } = mathData
  let h = (mathData.b - mathData.a) / mathData.n

  let A = Array(mathData.n + 1).fill(1 / 6)
  let B = Array(mathData.n + 1).fill(2 / 3)
  let C = Array(mathData.n + 1).fill(1 / 6)

  let ha1 =
    h *
    solveFormula(
      { x: mathData.a },
      getDerivative(mathData.Formula, "x"),
      "y",
      true
    )
  let hb1 =
    h *
    solveFormula(
      { x: mathData.b },
      getDerivative(mathData.Formula, "x"),
      "y",
      true
    )
  let f = [...y]
  f[0] = y[0] + (1 / 3) * ha1
  f[mathData.n] = y[mathData.n] - (1 / 3) * hb1

  A[A.length - 1] = 1 / 3
  C[0] = 1 / 3

  let coefficients = progonka(A, B, C, [...f])
  coefficients.push(2 * hb1 + coefficients.at(-2))
  coefficients[-1] = -2 * ha1 + coefficients[1]
  return coefficients
}

function progonka(a, b, c, d) {
  let x = []
  let q, i
  let n = b.length - 1
  for (i = 1; i <= n; i++) {
    q = a[i] / b[i - 1]
    b[i] = b[i] - c[i - 1] * q
    d[i] = d[i] - d[i - 1] * q
  }
  q = d[n] / b[n]
  x[n] = q
  for (i = n - 1; i >= 0; i--) {
    q = (d[i] - c[i] * q) / b[i]
    x[i] = q
  }
  return x
}

function getDerivative(formula, variable) {
  return math.derivative(formula, variable).toString()
}

function createGraph() {
  let graphContainer = MainComponent.getComponentByName("grapthDisplay")
  let graphDiv = graphContainer.getContainer()
  Plotly.newPlot(graphDiv, [], {
    tickmode: "array",
    paper_bgcolor: "rgba(0,0,0,0)",
    connectgaps: true,
    bargap: 0,
    showlegend: false,
  })
  Plotly.addTraces(graphDiv, [])
  graphContainer.addEventListener(Component.events.resizeEnd, () => {
    let size_ = graphContainer.getSizeInPixels()
    let m_mult = 0.09
    Plotly.update(
      graphContainer.getContainer(),
      {},
      {
        plot_bgcolor: "rgba(0,0,0,0)",
        width: size_.x,
        height: size_.y,
        margin: {
          l: size_.x * m_mult,
          r: size_.x * m_mult,
          t: size_.y * m_mult,
          b: size_.y * m_mult * 1.2,
        },
        xaxis: {
          tickfont: {
            color: "black",
            size: size_.x * 0.03,
          },
          linecolor: "black",
          tickcolor: "black",
        },
        yaxis: {
          tickfont: {
            color: "black",
            size: size_.x * 0.03,
          },
          linecolor: "black",
          tickcolor: "black",
        },
      }
    )
  })

  graphContainer.resize()
}

function drawGraph(x, y, name) {
  const trace = {
    x,
    y,
    name,
  }
  Plotly.addTraces(
    MainComponent.getComponentByName("grapthDisplay").getContainer(),
    [trace]
  )
}
function drawPoints(x, y, name) {
  const trace = {
    x,
    y,
    name,
    mode: "markers",
  }
  Plotly.addTraces(
    MainComponent.getComponentByName("grapthDisplay").getContainer(),
    [trace]
  )
}

function clearGraph() {
  let graphContainer = MainComponent.getComponentByName("grapthDisplay")
  let graphDiv = graphContainer.getContainer()
  while (graphDiv.data.length > 0) {
    Plotly.deleteTraces(graphDiv, [0])
  }
}

function addDoItInteraction() {
  let button = MainComponent.getComponentByName("DO IT")
  let form = MainComponent.getComponentByName("Input")
  button.addEventListener(Button.events.mousedown, () => {
    let data = form.getData()
    if (data) doWork(data)
  })
}

function createDataFrames() {
  let pointsTable = new SimpleDataFrame(["x", "y"])
    .setName("points")
    .setFontSize(0.8)
    .setCellDecoration({
      color: "black",
      border: "black 1px solid",
      "box-sizing": "border-box",
    })
    .loadOptions({ allowEditing: true })
    .getTable()
    .setSize("80%", 3)
    .setPosition("10%", 1.1)
  MainComponent.getComponentByName("PointsDisplay").addComponent(pointsTable)
}

Initialize()
