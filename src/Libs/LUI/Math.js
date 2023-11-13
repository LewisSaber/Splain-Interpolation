export class Line {
  constructor(a = new Vector(), b = new Vector()) {
    this.start = a
    this.end = b
  }
  getLength() {
    return Math.sqrt(
      this.getHorizontalLength() ** 2 + this.getVerticalLength() ** 2
    )
  }

  getHorizontalLength() {
    return Math.abs(this.start.x - this.end.x)
  }
  getVerticalLength() {
    return Math.abs(this.start.y - this.end.y)
  }

  addVec(vec) {
    return new Line(this.start.add_vec(vec), this.end.add_vec(vec))
  }
  splitAtX(x) {
    let k = (this.start.y - this.end.y) / (this.start.x - this.end.x)
    let b = this.start.y - k * this.start.x
    let y = k * x + b
    if (this.start.x < this.end.x)
      return {
        left: new Line(
          new Vector(this.start.x, +this.start.y.toFixed(2)),
          new Vector(x, +y.toFixed(2))
        ),
        right: new Line(new Vector(x, y), new Vector(this.end.x, this.end.y)),
      }
    return {
      left: new Line(new Vector(this.end.x, this.end.y), new Vector(x, y)),
      right: new Line(new Vector(x, y), new Vector(this.start.x, this.start.y)),
    }
  }

  toString() {
    return `Line: ${this.start.toStringFixed(2)} -> ${this.end.toStringFixed(
      2
    )}`
  }
}

export class Vector {
  constructor(x = 0.0, y = 0.0) {
    this.x = x
    this.y = y
  }
  shiftInPlace() {
    this.x >>= 0
    this.y >>= 0
    return this
  }
  scale(factor) {
    let result = new Vector(this.x, this.y)
    result.x *= factor
    result.y *= factor
    return result
  }
  add_vec(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y)
  }
  sub_vec(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y)
  }
  div_vec(vector) {
    return new Vector(this.x / vector.x, this.y / vector.y)
  }
  vectorize() {
    let distance =
      this.x && this.y ? Math.abs(this.x / 2) + Math.abs(this.y / 2) : 0
    let hipon = (this.x ** 2 + this.y ** 2) ** 0.5
    let scale = distance / hipon || 1

    return new Vector(this.x * scale, this.y * scale)
  }
  multiply(vector) {
    return new Vector(this.x * vector.x, this.y * vector.y)
  }
  hasZeroAxis() {
    return this.x == 0 || this.y == 0
  }
  isZero() {
    return this.x == 0 && this.y == 0
  }
  toString() {
    return `(${this.x}, ${this.y})`
  }
  toStringFixed(fixed = 2) {
    return `(${+this.x.toFixed(fixed)}, ${+this.y.toFixed(fixed)})`
  }
  copy() {
    return new Vector(this.x, this.y)
  }
  min() {
    return this.x < this.y ? this.x : this.y
  }
  max() {
    return this.x > this.y ? this.x : this.y
  }
  has(number) {
    return this.x == number || this.y == number
  }
  static parseString(str, sep = ",") {
    let values = str
      .replaceAll("\n", sep)
      .split(sep)
      .map((value) => Number(value.trim()))
    return new Vector(values[0], values[1]).shiftInPlace()
  }

  reverse() {
    return new Vector(this.y, this.x)
  }
  average() {
    return (this.x + this.y) / 2
  }
}

export class Vector4d {
  constructor(x = 0.0, y = 0.0, z = 0.0, a = 0.0) {
    this.x = x
    this.y = y
    this.z = z
    this.a = a
  }
  shiftInPlace() {
    this.x >>= 0
    this.y >>= 0
    this.z >>= 0
    this.a >>= 0
    return this
  }
  scale(factor) {
    let result = this.copy()
    result.x *= factor
    result.y *= factor
    result.a *= factor
    result.z *= factor
    return result
  }
  add_vec(vector) {
    return new Vector4d(
      this.x + vector.x,
      this.y + vector.y,
      this.z + vector.z,
      this.a + vector.a
    )
  }
  sub_vec(vector) {
    return new Vector4d(
      this.y - vector.y,
      this.z - vector.z,
      this.x - vector.x,
      this.a - vector.a
    )
  }
  div_vec(vector) {
    return new Vector4d(
      this.x / vector.x,
      this.y / vector.y,
      this.z / vector.z,
      this.a / vector.a
    )
  }

  multiply(vector) {
    return new Vector4d(
      this.x * vector.x,
      this.y * vector.y,
      this.z * vector.z,
      this.a * vector.a
    )
  }
  hasZeroAxis() {
    return this.x == 0 || this.y == 0 || (this.a == 0) | (this.z == 0)
  }
  isZero() {
    return this.x == 0 && this.y == 0 && this.a == 0 && this.z == 0
  }
  toString() {
    return `(${this.x}, ${this.y}, ${this.z}, ${this.a})`
  }
  toStringFixed(fixed = 2) {
    return `(${+this.x.toFixed(fixed)}, ${+this.y.toFixed(
      fixed
    )}), ${+this.z.toFixed(fixed)}), ${+this.a.toFixed(fixed)})`
  }
  copy() {
    return new Vector4d(this.x, this.y, this.z, this.a)
  }
  min() {
    let min = this.x < this.y ? this.x : this.y
    min = min < this.z ? min : this.z
    min = min < this.a ? min : this.a
    return min
  }
  max() {
    let max = this.x > this.y ? this.x : this.y
    max = max > this.z ? max : this.z
    max = max > this.a ? max : this.a
    return max
  }
  has(number) {
    return (
      this.x == number ||
      this.y == number ||
      this.z == number ||
      this.a == number
    )
  }
}

export class M3x3 {
  constructor() {
    this.matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
  }
  multiply(m) {
    var output = new M3x3()
    output.matrix = [
      this.matrix[M3x3.M00] * m.matrix[M3x3.M00] +
        this.matrix[M3x3.M10] * m.matrix[M3x3.M01] +
        this.matrix[M3x3.M20] * m.matrix[M3x3.M02],
      this.matrix[M3x3.M01] * m.matrix[M3x3.M00] +
        this.matrix[M3x3.M11] * m.matrix[M3x3.M01] +
        this.matrix[M3x3.M21] * m.matrix[M3x3.M02],
      this.matrix[M3x3.M02] * m.matrix[M3x3.M00] +
        this.matrix[M3x3.M12] * m.matrix[M3x3.M01] +
        this.matrix[M3x3.M22] * m.matrix[M3x3.M02],

      this.matrix[M3x3.M00] * m.matrix[M3x3.M10] +
        this.matrix[M3x3.M10] * m.matrix[M3x3.M11] +
        this.matrix[M3x3.M20] * m.matrix[M3x3.M12],
      this.matrix[M3x3.M01] * m.matrix[M3x3.M10] +
        this.matrix[M3x3.M11] * m.matrix[M3x3.M11] +
        this.matrix[M3x3.M21] * m.matrix[M3x3.M12],
      this.matrix[M3x3.M02] * m.matrix[M3x3.M10] +
        this.matrix[M3x3.M12] * m.matrix[M3x3.M11] +
        this.matrix[M3x3.M22] * m.matrix[M3x3.M12],

      this.matrix[M3x3.M00] * m.matrix[M3x3.M20] +
        this.matrix[M3x3.M10] * m.matrix[M3x3.M21] +
        this.matrix[M3x3.M20] * m.matrix[M3x3.M22],
      this.matrix[M3x3.M01] * m.matrix[M3x3.M20] +
        this.matrix[M3x3.M11] * m.matrix[M3x3.M21] +
        this.matrix[M3x3.M21] * m.matrix[M3x3.M22],
      this.matrix[M3x3.M02] * m.matrix[M3x3.M20] +
        this.matrix[M3x3.M12] * m.matrix[M3x3.M21] +
        this.matrix[M3x3.M22] * m.matrix[M3x3.M22],
    ]
    return output
  }
  transition(x, y) {
    var output = new M3x3()
    output.matrix = [
      this.matrix[M3x3.M00],
      this.matrix[M3x3.M01],
      this.matrix[M3x3.M02],

      this.matrix[M3x3.M10],
      this.matrix[M3x3.M11],
      this.matrix[M3x3.M12],

      x * this.matrix[M3x3.M00] +
        y * this.matrix[M3x3.M10] +
        this.matrix[M3x3.M20],
      x * this.matrix[M3x3.M01] +
        y * this.matrix[M3x3.M11] +
        this.matrix[M3x3.M21],
      x * this.matrix[M3x3.M02] +
        y * this.matrix[M3x3.M12] +
        this.matrix[M3x3.M22],
    ]
    return output
  }
  scale(x, y) {
    var output = new M3x3()
    output.matrix = [
      this.matrix[M3x3.M00] * x,
      this.matrix[M3x3.M01] * x,
      this.matrix[M3x3.M02] * x,

      this.matrix[M3x3.M10] * y,
      this.matrix[M3x3.M11] * y,
      this.matrix[M3x3.M12] * y,

      this.matrix[M3x3.M20],
      this.matrix[M3x3.M21],
      this.matrix[M3x3.M22],
    ]
    return output
  }
  getFloatArray() {
    return new Float32Array(this.matrix)
  }
}
M3x3.M00 = 0
M3x3.M01 = 1
M3x3.M02 = 2
M3x3.M10 = 3
M3x3.M11 = 4
M3x3.M12 = 5
M3x3.M20 = 6
M3x3.M21 = 7
M3x3.M22 = 8
