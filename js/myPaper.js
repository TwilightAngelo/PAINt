paper.install(window);

//colors
var Purple = "#cb3594";
var Green = "#659b41";
var Yellow = "#ffcf33";
var Brown = "#986928";
var Black = "#000000";
var currentColor = "#000000";
var currentWidth = 1;

/*
Todo:

+eraser
+pencil
+text
+rectangle(-bug)
+circle
+line

+color
+size

-backend
*/

//tools and params

var pencil, square, text, eraser, circle, brush, line;

var outText;

var setColor = function(value) {
  currentColor = value;
};

var setWidth = function(value) {
  currentWidth = value;
};

var setSquare = function() {
  square.activate();
};

var setText = function() {
  text.activate();
};

var setPencil = function() {
  pencil.activate();
};

var setEraser = function() {
  eraser.activate();
};

var setLine = function() {
  line.activate();
};

var setCircle = function() {
  circle.activate();
};

var sendText = function() {
  outText = document.getElementById('text').value;
};

var socket = io();

window.onload = function() {

  socket.on('update', function(msg){
    var otherPath = new Path();
    console.log(msg);
    otherPath.importJSON(msg);
    layer.addChild(otherPath);
    console.log(otherPath);
    view.draw();
  });

  socket.on('new', function(msg){

    var previous = msg;

    previous.forEach(function(item, i, previous){
      var otherPath = new Path();
      otherPath.importJSON(item);
      layer.addChild(otherPath);
      console.log(otherPath);
      view.draw();
    });

  });

  paper.setup('myCanvas');

  var path;
  var layer = new Layer();

  //pencil just pencil
  pencil = new Tool();
  pencil.onMouseDown = function(event) {
    path = new Path();
    path.strokeColor = currentColor;
    path.strokeWidth = currentWidth;
    path.add(event.point);
    layer.addChild(path);
  };
  pencil.onMouseDrag = function(event) {
    path.add(event.point);
    layer.addChild(path);
  }
  pencil.onMouseUp = function(event) {
    var clone = path.clone();
    var data = clone.exportJSON();
    clone.remove();
    socket.emit('send', clone);
  }

  //square
  square = new Tool();
  square.onMouseDown = function(event) {
    
    path = new Path.Rectangle(
      event.point,
      event.downPoint
    );
    //console.log('square DOW');
    path.strokeWidth = currentWidth;
    path.strokeColor = currentColor;
    path.add(event.point);
    layer.addChild(path);
  }
  square.onMouseDrag = function(event) {
    
    var sq = (event.downPoint.y >= event.point.y) ? function() { path = new Path.Rectangle(
                                                                              event.downPoint,
                                                                              event.point
                                                                             ); console.log(event);}:
                                                    function() { path = new Path.Rectangle(
                                                                              event.point,
                                                                              event.downPoint
                                                                             ); console.log(event);};
    sq();
    path.strokeColor = currentColor;
    path.strokeWidth = currentWidth;
    //console.log('square dragging');
    path.add(event.point);
    path.removeOnDrag();
    layer.addChild(path);
  }
  //in each mouse up event we need to convert our path to json and send to server
  square.onMouseUp = function(event) {
    var clone = path.clone();
    var data = clone.exportJSON();
    clone.remove();
    socket.emit('send', clone);
  }

  //eraser
  eraser = new Tool();
  eraser.onMouseDown = function(event) {
    path = new Path();
    path.strokeColor = "#ffffff";
    path.add(event.point);
    path.strokeWidth = currentWidth;
    layer.addChild(path);
  };
  eraser.onMouseDrag = function(event) {
    path.add(event.point);
    layer.addChild(path);
  }
  eraser.onMouseUp = function(event) {
    var clone = path.clone();
    var data = clone.exportJSON();
    clone.remove();
    socket.emit('send', clone);
  }

  //line
  line = new Tool();
  line.onMouseDown = function(event) {

    path = new Path.Line({
      from: event.downPoint,
      to: event.point
    });
    path.strokeColor = currentColor;
    path.strokeWidth = currentWidth;
    path.add(event.point);
    layer.addChild(path);
  }
  line.onMouseDrag = function(event) {
    path = new Path.Line({
      from: event.downPoint,
      to: event.point,
      strokeColor: currentColor,
      strokeWidth: currentWidth
    });
    path.add(event.point);
    path.removeOnDrag();
  }
  line.onMouseUp = function(event) {
    var clone = path.clone();
    var data = clone.exportJSON();
    clone.remove();
    socket.emit('send', clone);
  }

  //circle
  circle = new Tool();
  var radius = 0;
  var lastPoint = 0;
  var a, b, c;
  var angle;
  //circle.onMouseDown = function(event) {
  //  path = new Path.Circle({
  //    center: event.downPoint,
  //    radius: radius
  //  });
  //  path.strokeWidth = currentWidth;
  //  path.strokeColor = currentColor;
  //}
  circle.onMouseDrag = function(event) {

    a = {x: event.downPoint.x, y: event.downPoint.x};
    b = {x: event.point.x, y: event.point.y};
    c = {x: event.point.x, y: event.downPoint.y};

    angle = Math.atan((b.y - c.y)/(c.x - a.x)); 
    //THIS IS MY MASTERPIECE!!
    radius = (((event.downPoint.x - event.point.x)) < ((event.downPoint.x - lastPoint.x)) ) ? 
                                                    radius - ((event.delta.length / 2)*Math.cos(angle)) :
                                                    radius + ((event.delta.length / 2)*Math.cos(angle));

    radius = ((event.downPoint.y - event.point.y) < (event.downPoint.y - lastPoint.y) ) ?
                                                    radius - ((event.delta.length / 2)*Math.sin(angle)) :
                                                    radius + ((event.delta.length / 2)*Math.sin(angle));

    path = new Path.Circle({
      center: event.downPoint,
      radius: radius
    });
    console.log(event);
    lastPoint = event.point;
    path.strokeWidth = currentWidth;
    path.strokeColor = currentColor;
    path.removeOnDrag();
  }

  circle.onMouseUp = function(event) {
    radius = 0;
    lastDelta = 0;
    var clone = path.clone();
    var data = clone.exportJSON();
    clone.remove();
    socket.emit('send', clone);
  }

  //text
  text = new Tool();
  text.onMouseDown = function(event) {
    var text1 = new PointText({
      point: event.downPoint,
      content: outText,
      justification: 'center',
      fontSize: 15
    });
  }
  text.onMouseUp = function(event) {
    var clone = path.clone();
    var data = clone.exportJSON();
    clone.remove();
    socket.emit('send', clone);
  }

  layer.activate();
  view.draw();

  //drawing the view on canvas

}