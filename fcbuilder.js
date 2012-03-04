// Adapted from <divergent>coder's toy language interpreter
// http://divergentcoder.com/javascript/playing-with-peg-js/

if (typeof Splaf === "undefined") {
  Splaf = {}
}

Splaf.FlowchartBuilder = (function() {

  var nextHandles = [1, 4]

  var toText = function(structure) {
    var elements = []
    if (structure.type == 'binaryop') {
      elements.push(toText(structure.args[0]))
      elements.push(structure.operator)
      elements.push(toText(structure.args[1]))
    }
    if (structure.type == 'literal')
      elements.push(structure.value)
    if (structure.type == 'variable')
      elements.push('(' + structure.name + ')')
    return elements.join(' ')
  }

  var wrap = function(text) {
    var maxLength = 25
    if (text.length > maxLength) {
      for (var i = Math.floor(text.length / 2); i > 0 && text[i] != ' '; i--) {
      }
      if (text[i] == ' ')
        text = text.substr(0, i) + '\n' + text.substr(i + 1)
    }
    return text
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
      y += 30
      var text = node.name + " = " + toText(node.value)
      shapes.push(new Process(r, x, y, wrap(text)))
      y += 30
      currentShape = shapes[shapes.length - 1]
      connections.push(r.connection(lastShape.shape,
                                    currentShape.shape,
                                    nextHandles[0],
                                    nextHandles[1]))
      lastShape = currentShape
      nextHandles = [1, 4]
    },

    "prompt": function(node) {
      y += 30
      shapes.push(new InputOutput(r, x, y, "pede " + node.name))
      y += 30
      currentShape = shapes[shapes.length - 1]
      connections.push(r.connection(lastShape.shape,
                                    currentShape.shape,
                                    nextHandles[0],
                                    nextHandles[1]))
      lastShape = currentShape
      nextHandles = [1, 4]
    },

    "print": function(node) {
      y += 30
      var textElements = []
      for (var i=0; i<node.arguments.length; i++)
        textElements.push(toText(node.arguments[i]))
      var text = "diz: " + textElements.join(' ')
      shapes.push(new InputOutput(r, x, y, wrap(text)))
      y += 30
      currentShape = shapes[shapes.length - 1]
      connections.push(r.connection(lastShape.shape,
                                    currentShape.shape,
                                    nextHandles[0],
                                    nextHandles[1]))
      lastShape = currentShape
      nextHandles = [1, 4]
    },

    "if": function(node) {
      var yElse = y
      y += 50
      var conditionShape = new Decision(r, x, y, wrap(toText(node.condition)))
      shapes.push(conditionShape)
      y += 50
      connections.push(r.connection(lastShape.shape,
                                    conditionShape.shape,
                                    nextHandles[0],
                                    nextHandles[1]))
      lastShape = conditionShape
      nextHandles = [1, 4]
      EvalNode[node.value.type](node.value)
      y += 10
      var nodeShape = new Node(r, x, y)
      shapes.push(nodeShape)
      y += 10
      yEndif = y
      connections.push(r.connection(lastShape.shape, nodeShape.shape))
      if (node.elsevalue != null) {
        x += 260
        y = yElse
        lastShape = conditionShape
        nextHandles = [3, 6]
        EvalNode[node.elsevalue.type](node.elsevalue)
        x -= 260
        connections.push(r.connection(lastShape.shape, nodeShape.shape, 1, 7))
      } else {
        connections.push(r.connection(conditionShape.shape, nodeShape.shape, 3, 7))
      }
      lastShape = nodeShape
      nextHandles = [1, 4]
      if (y < yEndif)
        y = yEndif
    },

    "while": function(node) {
      y += 50
      var conditionShape = new Decision(r, x, y, wrap(toText(node.condition)))
      shapes.push(conditionShape)
      y += 50
      connections.push(r.connection(lastShape.shape,
                                    conditionShape.shape,
                                    nextHandles[0],
                                    nextHandles[1]))
      lastShape = conditionShape
      nextHandles = [1, 4]
      EvalNode[node.value.type](node.value)
      y += 10
      var nodeShape = new Node(r, x, y)
      shapes.push(nodeShape)
      y += 10
      connections.push(r.connection(lastShape.shape, conditionShape.shape, 2, 6))
      connections.push(r.connection(conditionShape.shape, nodeShape.shape, 3, 7))
      lastShape = nodeShape
      nextHandles = [1, 4]
    }
  }

  return Evaluate
})()
