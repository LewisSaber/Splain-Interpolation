import ObjectHelper from "./Helpers/ObjectHelper.js"

export class NumberRange {
  constructor(start = 0, end = 0) {
    this.start = start
    this.end = end
  }
  isNumberIn_inclusive(number) {
    return number >= this.start && number <= this.end
  }
  isNumberIn_exclusive(number) {
    return number >= this.start && number < this.end
  }
  toString() {
    return `${this.start} - ${this.end}`
  }
  middle() {
    return (this.start + this.end) / 2
  }
  allValues(inclusive = false) {
    let result = []
    for (let i = this.start; i < this.end + inclusive; i++) {
      result.push(i)
    }
    return result
  }
  length(inclusive = false) {
    return this.end - this.start + inclusive
  }
}
let next_id = 0
export function getUniqueid() {
  next_id++
  return next_id
}

export function getImg(img, extension = "png") {
  return "./src/assets/" + img + "." + extension
}

export function functionMerger(...funcs) {
  let list = funcs
  for (let i = 0; i < list.length; i++) {
    if (!(list[i] instanceof Function)) {
      let ret_value = list[i]
      list[i] = () => ret_value
    }
  }
  let merger = (...args) => {
    let obj = {}
    for (const func of list) {
      obj = ObjectHelper.merge(obj, func(...args))
    }
    return obj
  }
  return merger
}

export class Node {
  constructor(value) {
    this.value = value
  }
  getValue() {
    return this.value
  }
  toString() {
    return this.value.toString()
  }
}

export class DoubleLinkedList {
  constructor() {
    this.length = 0
  }

  addValue(value) {
    if (this.head == undefined) {
      this.head = new Node(value)
      this.tail = this.head
    } else {
      let newNode = new Node(value)
      this.tail.next = newNode
      newNode.prev = this.tail
      this.tail = newNode
    }
    this.length += 1
  }
  removeNodeAt(index) {
    if (index >= this.length) {
      console.warn("cant remove node at index", index)
      return false
    }
    if (index == 0) {
      if (this.length == 1) {
        this.head = undefined
        this.tail = undefined
      } else {
        this.head = this.head.next
        this.head.prev = undefined
      }
    } else if (index == this.length - 1) {
      this.tail = this.tail.prev
      this.tail.next = undefined
    } else {
      let i = 0
      let node = this.head
      while (true) {
        if (i == index) {
          node.prev.next = node.next
          node.next.prev = node.prev
          break
        }
        i++
        node = node.next
      }
    }
    this.length -= 1
    return true
  }
  removeNode(node) {
    if (node == this.tail) {
      this.tail.prev.next = undefined
      this.tail = this.tail.prev
    } else if (node == this.head) {
      this.head.next.prev = undefined
      this.head = this.head.next
    } else {
      node.next.prev = node.prev
      node.prev.next = node.next
    }
    this.length--
  }
  addNodeAfter(node, value) {
    if (!(value instanceof Node)) {
      value = new Node(value)
    }

    value.prev = node
    value.next = node.next

    if (node == this.tail) {
      this.tail = value
    } else if (node.next) node.next.prev = value

    node.next = value

    this.length++
  }
  connect2Nodes(leftNode, rightNode) {
    let length = 0
    let node = leftNode.next
    while (node != rightNode) {
      if (node == undefined) {
        console.error(leftNode, "and", rightNode, "are not in order!")
        return false
      }
      length++
      node = node.next
    }
    this.length -= length
    leftNode.next = rightNode
    if (rightNode) rightNode.prev = leftNode
    return true
  }
  cutAt(endNode) {
    let node = endNode.next
    let length = 0
    while (node != undefined) {
      length++
      node = node.next
    }
    this.length -= length

    this.tail = endNode
    endNode.next = undefined
  }
  toString() {
    let result = ""
    let node = this.head
    while (node != undefined) {
      result += node.toString() + " -> "
      node = node.next
    }
    return result
  }
  *[Symbol.iterator]() {
    let node = this.head
    while (node != null) {
      yield node.value
      node = node.next
    }
  }

  toArray() {
    let result = []
    for (let value of this) result.push(value)
    return result
  }

  sort(comparator = (a, b) => a - b) {
    let array = this.toArray()
    array.sort(comparator)
    this.head = undefined
    this.tail = undefined
    this.length = 0
    for (const value of array) this.addValue(value)

    return this
  }
}
