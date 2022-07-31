export const sortNums = (a, b) => a - b
export const isObject = obj => obj && typeof obj === 'object'
export const isUndefined = a => (typeof a == 'undefined')

export const clone = (obj, skipLst: string[] = null) => {
  let copy = null
  // Handle the 3 simple types, and null or undefined
  if (!isObject(obj)) return obj
  // Handle Date
  if (obj instanceof Date) {
    copy = new Date()
    copy.setTime(obj.getTime())
    return copy
  }
  // Handle Array
  if (obj instanceof Array) {
    copy = []
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i])
    }
    return copy
  }
  // Handle Object
  if (obj instanceof Object) {
    copy = {}
    let keys = Object.keys(obj)
    if (skipLst) {
      keys = keys.filter(key => !skipLst.includes(key))
    }
    keys.forEach(key => {
      copy[key] = clone(obj[key])
    })
    return copy
  }
  throw new Error("Unable to copy obj! Its type isn't supported.")
}

export function objFilter (obj, fields, value = undefined) {
  let newObj = {}
  let isNewValue = !isUndefined(value)
  fields.forEach((field) => {
    let _value = null
    if (isNewValue) {
      _value = value
    } else {
      _value = field in obj ? obj[field] : null
    }
    newObj[field] = _value
  })
  return newObj
}