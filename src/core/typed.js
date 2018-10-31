'use strict'
import {
  isAccessorNode,
  isArray,
  isArrayNode,
  isAssignmentNode,
  isBlockNode,
  isChain,
  isComplex,
  isConditionalNode,
  isConstantNode,
  isDate,
  isDenseMatrix,
  isFraction,
  isFunction,
  isFunctionAssignmentNode,
  isFunctionNode,
  isHelp,
  isIndex,
  isIndexNode,
  isMatrix,
  isNode,
  isNull,
  isNumber,
  isObject,
  isObjectNode,
  isOperatorNode,
  isParenthesisNode,
  isRange,
  isRangeNode,
  isRegExp,
  isResultSet,
  isSparseMatrix,
  isString,
  isSymbolNode,
  isUndefined,
  isUnit
} from '../utils/is'
import { isBoolean } from '../utils/boolean'

const typedFunction = require('typed-function')
const digits = require('./../utils/number').digits
const {
  isBigNumber
} = require('./../utils/is')

// returns a new instance of typed-function
let createTyped = function () {
  // initially, return the original instance of typed-function
  // consecutively, return a new instance from typed.create.
  createTyped = typedFunction.create
  return typedFunction
}

/**
 * Factory function for creating a new typed instance
 * @param {Object} type   Object with data types like Complex and BigNumber
 * @returns {Function}
 */
exports.create = function create (type) {
  // TODO: typed-function must be able to silently ignore signatures with unknown data types

  // type checks for all known types
  // only here for backward compatibility for legacy factory functions
  // FIXME: move this to the legacy import
  type.isNumber = isNumber
  type.isComplex = isComplex
  type.isBigNumber = isBigNumber
  type.isFraction = isFraction
  type.isUnit = isUnit
  type.isString = isString
  type.isArray = isArray
  type.isMatrix = isMatrix
  type.isDenseMatrix = isDenseMatrix
  type.isSparseMatrix = isSparseMatrix
  type.isRange = isRange
  type.isIndex = isIndex
  type.isBoolean = isBoolean
  type.isResultSet = isResultSet
  type.isHelp = isHelp
  type.isFunction = isFunction
  type.isDate = isDate
  type.isRegExp = isRegExp
  type.isObject = isObject
  type.isNull = isNull
  type.isUndefined = isUndefined

  type.isAccessorNode = isAccessorNode
  type.isArrayNode = isArrayNode
  type.isAssignmentNode = isAssignmentNode
  type.isBlockNode = isBlockNode
  type.isConditionalNode = isConditionalNode
  type.isConstantNode = isConstantNode
  type.isFunctionAssignmentNode = isFunctionAssignmentNode
  type.isFunctionNode = isFunctionNode
  type.isIndexNode = isIndexNode
  type.isNode = isNode
  type.isObjectNode = isObjectNode
  type.isOperatorNode = isOperatorNode
  type.isParenthesisNode = isParenthesisNode
  type.isRangeNode = isRangeNode
  type.isSymbolNode = isSymbolNode

  type.isChain = isChain

  // get a new instance of typed-function
  const typed = createTyped()

  // define all types. The order of the types determines in which order function
  // arguments are type-checked (so for performance it's important to put the
  // most used types first).
  typed.types = [
    { name: 'number', test: isNumber },
    { name: 'Complex', test: isComplex },
    { name: 'BigNumber', test: isBigNumber },
    { name: 'Fraction', test: isFraction },
    { name: 'Unit', test: isUnit },
    { name: 'string', test: isString },
    { name: 'Array', test: isArray },
    { name: 'Matrix', test: isMatrix },
    { name: 'DenseMatrix', test: isDenseMatrix },
    { name: 'SparseMatrix', test: isSparseMatrix },
    { name: 'Range', test: isRange },
    { name: 'Index', test: isIndex },
    { name: 'boolean', test: isBoolean },
    { name: 'ResultSet', test: isResultSet },
    { name: 'Help', test: isHelp },
    { name: 'function', test: isFunction },
    { name: 'Date', test: isDate },
    { name: 'RegExp', test: isRegExp },
    { name: 'null', test: isNull },
    { name: 'undefined', test: isUndefined },

    { name: 'OperatorNode', test: isOperatorNode },
    { name: 'ConstantNode', test: isConstantNode },
    { name: 'SymbolNode', test: isSymbolNode },
    { name: 'ParenthesisNode', test: isParenthesisNode },
    { name: 'FunctionNode', test: isFunctionNode },
    { name: 'FunctionAssignmentNode', test: isFunctionAssignmentNode },
    { name: 'ArrayNode', test: isArrayNode },
    { name: 'AssignmentNode', test: isAssignmentNode },
    { name: 'BlockNode', test: isBlockNode },
    { name: 'ConditionalNode', test: isConditionalNode },
    { name: 'IndexNode', test: isIndexNode },
    { name: 'RangeNode', test: isRangeNode },
    { name: 'Node', test: isNode },

    { name: 'Object', test: isObject } // order 'Object' last, it matches on other classes too
  ]

  // TODO: add conversion from BigNumber to number?
  typed.conversions = [
    {
      from: 'number',
      to: 'BigNumber',
      convert: function (x) {
        // note: conversion from number to BigNumber can fail if x has >15 digits
        if (digits(x) > 15) {
          throw new TypeError('Cannot implicitly convert a number with >15 significant digits to BigNumber ' +
          '(value: ' + x + '). ' +
          'Use function bignumber(x) to convert to BigNumber.')
        }
        return new type.BigNumber(x)
      }
    }, {
      from: 'number',
      to: 'Complex',
      convert: function (x) {
        return new type.Complex(x, 0)
      }
    }, {
      from: 'number',
      to: 'string',
      convert: function (x) {
        return x + ''
      }
    }, {
      from: 'BigNumber',
      to: 'Complex',
      convert: function (x) {
        return new type.Complex(x.toNumber(), 0)
      }
    }, {
      from: 'Fraction',
      to: 'BigNumber',
      convert: function (x) {
        throw new TypeError('Cannot implicitly convert a Fraction to BigNumber or vice versa. ' +
            'Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction.')
      }
    }, {
      from: 'Fraction',
      to: 'Complex',
      convert: function (x) {
        return new type.Complex(x.valueOf(), 0)
      }
    }, {
      from: 'number',
      to: 'Fraction',
      convert: function (x) {
        const f = new type.Fraction(x)
        if (f.valueOf() !== x) {
          throw new TypeError('Cannot implicitly convert a number to a Fraction when there will be a loss of precision ' +
              '(value: ' + x + '). ' +
              'Use function fraction(x) to convert to Fraction.')
        }
        return new type.Fraction(x)
      }
    }, {
    // FIXME: add conversion from Fraction to number, for example for `sqrt(fraction(1,3))`
    //  from: 'Fraction',
    //  to: 'number',
    //  convert: function (x) {
    //    return x.valueOf()
    //  }
    // }, {
      from: 'string',
      to: 'number',
      convert: function (x) {
        const n = Number(x)
        if (isNaN(n)) {
          throw new Error('Cannot convert "' + x + '" to a number')
        }
        return n
      }
    }, {
      from: 'string',
      to: 'BigNumber',
      convert: function (x) {
        try {
          return new type.BigNumber(x)
        } catch (err) {
          throw new Error('Cannot convert "' + x + '" to BigNumber')
        }
      }
    }, {
      from: 'string',
      to: 'Fraction',
      convert: function (x) {
        try {
          return new type.Fraction(x)
        } catch (err) {
          throw new Error('Cannot convert "' + x + '" to Fraction')
        }
      }
    }, {
      from: 'string',
      to: 'Complex',
      convert: function (x) {
        try {
          return new type.Complex(x)
        } catch (err) {
          throw new Error('Cannot convert "' + x + '" to Complex')
        }
      }
    }, {
      from: 'boolean',
      to: 'number',
      convert: function (x) {
        return +x
      }
    }, {
      from: 'boolean',
      to: 'BigNumber',
      convert: function (x) {
        return new type.BigNumber(+x)
      }
    }, {
      from: 'boolean',
      to: 'Fraction',
      convert: function (x) {
        return new type.Fraction(+x)
      }
    }, {
      from: 'boolean',
      to: 'string',
      convert: function (x) {
        return +x
      }
    }, {
      from: 'Array',
      to: 'Matrix',
      convert: function (array) {
        return new type.DenseMatrix(array)
      }
    }, {
      from: 'Matrix',
      to: 'Array',
      convert: function (matrix) {
        return matrix.valueOf()
      }
    }
  ]

  return typed
}
