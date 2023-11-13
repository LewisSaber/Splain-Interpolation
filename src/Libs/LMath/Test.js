import EquationTree from "./EquationTree.js"
import LMath from "./LMath.js"
import MathInstance from "./MathInstance.js"
import Tokenizer from "./Tokenizer.js"
// console.log(new EquationTree().build("define f[n,x]{return n + x}"))
// console.log(new EquationTree().build("out((y+1)(y+1))"))
let instance = new MathInstance()
let instance2 = new MathInstance()
instance2.execute(`
f = e ^ (sin(x) + cos(x) #2)
e = 2.71828182846
pi = 3.14
x=[]
y=[]
n = 6
m = 2n + 1
for(i:=0,i < m,i = i+1, {x_i = 2 * pi /(m-1) * i,out(x_i),out(2 * pi /(m-1)*i)})
for(i:=0,i < m,i = i+1, {x= x_i, y_i = f})
out(x)
out(y)
;p =if(m%2 == 1,{
;   a = 2/m * sum(j,0,2n,y_j*cos(k*x_j))
;   b = 2/m * sum(j,0,2n,y_j*sin(k*x_j))
;   k = 0
;   p = a/2 + sum(k,1,n,a* cos(k*v)) + sum(k,1,n,b* sin(k*v))
;   return p
;},{})
out p
`)
console.log(instance2.getVariable("x"))

// instance.execute(`
// x = []
// x_0=2
// out x
// `)

//instance.execute("y = x+2")
console.log(instance)
