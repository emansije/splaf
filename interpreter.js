// Adapted from <divergent>coder's toy language interpreter
// http://divergentcoder.com/javascript/playing-with-peg-js/

if (typeof Splaf === "undefined") {
  Splaf = {}
}

Splaf.Interpreter = (function() {
  var vars = {}

  var lookup = function(name) {
    if (!vars.hasOwnProperty(name))
      vars[name] = ""
    return vars[name]
  }

  var Evaluate = function(program) {
    var last = null
    for (var i=0; i<program.length; i++)
      last = EvalNode[program[i].type](program[i])
    return last
  }

  var EvalNode = {
    "block": function(node) {
      var last = null
      for (var i=0; i<node.code.length; i++)
        last = EvalNode[node.code[i].type](node.code[i])
      return last
    },

    "attribution": function(node) {
      vars[node.name] = EvalNode[node.value.type](node.value)
      return vars[node.name]
    },

    "unaryop": function(node) {
      var arg = EvalNode[node.arg.type](node.arg)
      if (node.operator === "não é verdade que"
          || node.operator === "não for verdade que"
          || node.operator === "não") {
        return !arg
      }
      else if (node.operator === "-") {
        return -arg
      }
      else if (node.operator === "raiz_quadrada") {
        return Math.sqrt(arg)
      }
    },

    "binaryop": function(node) {
      var left = EvalNode[node.args[0].type](node.args[0])
      var right = EvalNode[node.args[1].type](node.args[1])
      if (node.operator === "+") {
        return left + right
      }
      else if (node.operator === "-") {
        return left - right
      }
      else if (node.operator === "*") {
        return left * right
      }
      else if (node.operator === "/") {
        return left / right
      }
      else if (node.operator === "^") {
        return left ^ right
      }
      else if (node.operator === "%") {
        return left % right
      }
      else if (node.operator === "<="
               || node.operator === "for menor ou igual a"
               || node.operator === "é menor ou igual a") {
        return left <= right
      }
      else if (node.operator === ">="
               || node.operator === "for maior ou igual a"
               || node.operator === "é maior ou igual a") {
        return left >= right
      }
      else if (node.operator === "<"
               || node.operator === "for menor que"
               || node.operator === "é menor que") {
        return left < right
      }
      else if (node.operator === ">"
               || node.operator === "for maior que"
               || node.operator === "é maior que") {
        return left > right
      }
      else if (node.operator === "=="
               || node.operator === "for igual a"
               || node.operator === "é igual a"
               || node.operator === "igual a"
               || node.operator === "for"
               || node.operator === "é") {
        return left == right
      }
      else if (node.operator === "!="
               || node.operator === "for diferente de"
               || node.operator === "é diferente de"
               || node.operator === "diferente de"
               || node.operator === "não for"
               || node.operator === "não é") {
        return left != right
      }
      else if (node.operator === "e") {
        return left && right
      }
      else if (node.operator === "ou") {
        return left || right
      }
    },

    "variable": function(node) {
      return lookup(node.name)
    },

    "literal": function(node) {
      return node.value
    },

    "prompt": function(node) {
      var varid = lookup(node.name),
          output = $('#inout').val(),
          lines = output.split('\n'),
          lastLine = lines[lines.length - 2]
      if (lastLine === undefined)
        lastLine = "Escreva um valor:"
      input = prompt(lastLine, "")
      vars[node.name] = isNaN(input) ? input : parseFloat(input)
      output += vars[node.name] + '\n'
      $('#inout').val(output)
      return vars[node.name]
    },

    "print": function(node) {
      var output = $('#inout').val()
      for (var i=0; node.arguments && i<node.arguments.length; i++) {
        var val = EvalNode[node.arguments[i].type](node.arguments[i])
        output += val
      }
      output += '\n'
      $('#inout').val(output)
    },

    "if": function(node) {
      if (EvalNode[node.condition.type](node.condition))
        return EvalNode[node.value.type](node.value)
      else if (node.elsevalue != null)
        return EvalNode[node.elsevalue.type](node.elsevalue)
    },

    "while": function(node) {
      var last
      while (EvalNode[node.condition.type](node.condition))
        last = EvalNode[node.value.type](node.value)
      return last
    }
  }

  return Evaluate
})()
