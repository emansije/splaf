var defaultFileName = 'file.splaf',
    userStorageDir = 'userfiles',
    initialWidth = 640,
    initialHeight = 480,
    width = initialWidth,
    height = initialHeight

Raphael.fn.connection = function (obj1, obj2, handle1, handle2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
      line = obj1
      obj1 = line.from
      obj2 = line.to
      if (line.handle1 && line.handle2) {
        handle1 = line.handle1
        handle2 = line.handle2
      }
    }
    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
             {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
             {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
             {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
             {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
             {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
             {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
             {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = []
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y)
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy)
                var h1 = handle1 ? handle1 : i,
                    h2 = handle2 ? handle2 : j
                d[dis[dis.length - 1]] = [h1, h2]
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4]
    } else {
        res = d[Math.min.apply(Math, dis)]
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y
    dx = Math.max(Math.abs(x1 - x4) / 2, 10)
    dy = Math.max(Math.abs(y1 - y4) / 2, 10)
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3)
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",")
    if (line && line.line) {
        line.bg && line.bg.attr({path: path})
        line.line.attr({path: path})
    } else {
        var color = typeof line == "string" ? line : "#fff"
        return {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none"}),
            from: obj1,
            to: obj2,
            handle1: handle1,
            handle2: handle2
        }
    }
}

function Node(paper, x, y, type) {
  var size = 20
  var params = {'start':   ['início', 20],  //TODO: localize
                'end':     ['fim', 20],     //TODO: localize
                undefined: ['', 5]}
  this.shape = paper.circle(x, y, params[type][1])
  this.shape.attr({fill: "#b20", stroke: "#b20"})
  this.shape.parent = this
  this.text = paper.text(x, y, params[type][0])
  this.freeze = function() {
    this.ox = this.shape.attr('cx')
    this.oy = this.shape.attr('cy')
  }
  this.displace = function(dx, dy) {
    x = this.ox + dx
    y = this.oy + dy
    this.shape.attr({cx: this.ox + dx, cy: this.oy + dy})
    this.text.attr({x: x, y: y})
    return [x + 20, y + 20]
  }
}

function InputOutput(paper, x, y, text) {
  this.path = "m-80,20 l20,-40 140,0 -20,40 z"
  this.shape = paper.path("M" + x + "," + y + this.path)
  this.shape.attr({fill: "#b82", stroke: "#b82"})
  this.shape.parent = this
  this.text = paper.text(x, y, text)
  this.freeze = function() {
    this.lastdx = 0
    this.lastdy = 0
  }
  this.displace = function(dx, dy) {
    x += dx - this.lastdx
    y += dy - this.lastdy
    this.shape.translate(dx - this.lastdx, dy - this.lastdy)
    this.text.translate(dx - this.lastdx, dy - this.lastdy)
    this.lastdx = dx
    this.lastdy = dy
    return [x + 80, y + 20]
  }
}

function Process(paper, x, y, text) {
  this.shape = paper.rect(x - 60, y - 20, 120, 40)
  this.shape.attr({fill: "#4fa", stroke: "#4fa"})
  this.shape.parent = this
  this.text = paper.text(x, y, text)
  this.freeze = function() {
    this.ox = x
    this.oy = y
  }
  this.displace = function(dx, dy) {
    x = this.ox + dx
    y = this.oy + dy
    this.shape.attr({x: x - 60, y: y - 20})
    this.text.attr({x: x, y: y})
    return [x + 60, y + 20]
  }
}

function Decision(paper, x, y, text) {
  this.path = "m-60,0 l60,-40 60,40 -60,40 z"
  this.shape = paper.path("M" + x + "," + y + this.path)
  this.shape.attr({fill: "#dd2", stroke: "#dd2"})
  this.shape.parent = this
  this.text = paper.text(x, y, text + "?")
  this.yes = paper.text(x + 60, y - 10, "N") // TODO: localise
  this.yes.attr({fill: "#fff"})
  this.no = paper.text(x + 10, y + 45, "S") // TODO: localise
  this.no.attr({fill: "#fff"})
  this.freeze = function() {
    this.lastdx = 0
    this.lastdy = 0
  }
  this.displace = function(dx, dy) {
    x += dx - this.lastdx
    y += dy - this.lastdy
    this.shape.translate(dx - this.lastdx, dy - this.lastdy)
    this.text.translate(dx - this.lastdx, dy - this.lastdy)
    this.yes.translate(dx - this.lastdx, dy - this.lastdy)
    this.no.translate(dx - this.lastdx, dy - this.lastdy)
    this.lastdx = dx
    this.lastdy = dy
    return [x + 60, y + 40]
  }
}

var dragger = function () {
                this.parent.freeze()
                this.animate({"fill-opacity": 1}, 200)
              },
    move =  function (dx, dy) {
              var boundary = this.parent.displace(dx, dy)
              for (var i = connections.length; i--;) {
                r.connection(connections[i])
              }
              r.safari()
              if (boundary[0] > width || boundary[1] > height) {
                if (boundary[0] > width)
                  width = boundary[0]
                if (boundary[1] > height)
                  height = boundary[1]
                r.setSize(width, height)
              }
            },
    up =  function () {
            this.animate({"fill-opacity": .8}, 500)
          }

$(document).ready(function () {
  // Define button's actions
  $("#newfile").click(newFile)
  $("#savefile").click(saveFile)
  $("#getfile").click(getFile)
  $("#submitfile").click(submitFile)
  $("#execute").click(execute)
  $("#buildflowchart").click(buildFlowchart)

  // Setup flowchart
  r = Raphael("holder", initialWidth, initialHeight)
  buildFlowchart()

  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
  } else {
    alert('The File APIs are not fully supported in this browser.')
  }

  $('#loadfile').change(loadFile)
})

// Load a local file into the editor
function loadFile(evt) {
  var file = evt.target.files[0],
      reader = new FileReader()

  if (!file.name.match(/\.splaf$/)) {
    alert('Please select a .splaf file');
    return;
  }

  reader.onload = function() {
    if (!reader.error) {
      $('#sourcecode').val(reader.result)
      $('#inout').val('')
      buildFlowchart()
    }
  }

  reader.onerror = function() {
    alert('File reading failed: ' + reader.error)
  }

  reader.readAsText(file)
}

// Clean the editor
function newFile() {
  $('#sourcecode').val('')
  $('#inout').val('')
  buildFlowchart()
}

// Save the editor contents into a local file
function saveFile(evt) {
  with(document) {
    sc = $('#sourcecode').val()
    ir = createElement('iframe')
    ir.id = 'ifr'
    ir.location = 'about:blank'
    ir.style.display = 'none'
    body.appendChild(ir)
      with(getElementById('ifr').contentWindow.document) {
        open()
        write(sc)
        close()
        if (document.compatMode && document.all) {
          execCommand('SaveAs', false, '.splaf')
        } else {
          location = 'data:application/octet-stream,' + encodeURIComponent(sc)
        }
      }
      setTimeout(function() {
        body.removeChild(ir)
        }, 1000)
  }
}

// Get the contents of the editor from a server
function getFile() {
  $.get("listfiles", function(fileList) {
    promptText = "Please choose a file from the server:\n" + fileList
    fileName = prompt(promptText)
    if (fileName != null) {
      $.get("getfile", {name: fileName}, function(fileData) {
        if (fileData.substring(0, 6) == 'Error!') {
          alert(fileData)
        } else {
          $("#sourcecode").val(fileData)
          $('#inout').val('')
          buildFlowchart()
        }
      })
    }
  })
}

// Send the contents of the editor to a server
function submitFile() {
  $.get("listfiles", function(fileList) {
    promptText = "Files on server:\n" + fileList + "\n\nFile name for this file:"
    fileName = prompt(promptText, defaultFileName)
    if (fileName != null) {
      $.get("submitfile", {name: fileName, data: $('#sourcecode').val()},
        function(data) {
          alert(data)
          defaultFileName = fileName
        }
      )
    }
  })
}

// Execute the code in the editor
function execute() {
  buildFlowchart()
  $('#inout').val('')
  code = $('#sourcecode').val()
  try {
    var ast = Splaf.Parser.parse(code)
    Splaf.Interpreter(ast)
  } catch(exception) {
    alert(exception)
  }
}

// Build the flowchart from the code
function buildFlowchart() {
  r.clear()
  connections = []
  x = 100
  y = 20
  shapes =  [ new Node(r, x, y, 'start') ]
  y += 20
  lastShape = shapes[0]
  code = $('#sourcecode').val()
  try {
    var ast = Splaf.Parser.parse(code)
    Splaf.FlowchartBuilder(ast)
    y += 20
    shapes.push(new Node(r, x, y, 'end'))
    y += 20
    currentShape = shapes[shapes.length - 1]
    connections.push(r.connection(lastShape.shape, currentShape.shape))
    for (var i = 0, numshapes = shapes.length; i < numshapes; i++) {
      shapes[i].shape.attr({"fill-opacity": .8, "stroke-width": 2, cursor: "move"})
      shapes[i].shape.drag(move, dragger, up)
    }
  } catch(exception) {
    alert(exception)
  }
  width = initialWidth
  height = initialHeight
  if (x > width)
    width = x
  if (y > height)
    height = y
  r.setSize(width, height)
}
