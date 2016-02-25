var CELLS_IN_ROW = 10;
var model = {
    init: function (){
	var cells = [
	    "           ",
	    "           ",
	    "           ",
	    "           ",
	    "     x     ",
	    "    xxx    ",
	    "           ",
	    "           ",
	    "           ",
	    "           ",
	];
	this.cells = {};
	for (var y = 0; y < CELLS_IN_ROW; y++){
	    var row = cells[y];
	    for (var x = 0; x < CELLS_IN_ROW; x++){
		var cell = row[x];
		this.cells[[x,y]] = ({y : y, x : x, isAlive: cell == 'x'});
	    }
	}
    },
    getCells: function (){
	var cells = [];
	for (cell in this.cells){
	    cells.push(this.cells[cell]);
	}
	return cells;
    },
    getAliveCells: function (){
	var cells = this.getCells();
	return cells.filter(function (cell) {
	    return cell.isAlive;
	});
    },
    countLiveNeighbors: function (cell){
	/* Count live neighbors of cell */
	var pos = [
	    [-1,-1], [0, -1], [1, -1],
	    [-1, 0],          [1,  0],
	    [-1, 1], [0,  1], [1,  1],
	];
	var numLiveNeighbors = 0;
	var x = cell.x;
	var y = cell.y;
	var validLocation = this.validLocation;
	var cells = this.cells;
	pos.forEach(function (coord) {
	    var dy = coord[0];
	    var dx = coord[1];
	    var newX = x + dx;
	    var newY = y + dy;
	    if (validLocation(newX, newY) && cells[[newX, newY]].isAlive){
		numLiveNeighbors++;
	    }
	});
	return numLiveNeighbors;
    },
    update: function (){
	var cells = this.getCells();
	var model = this;
	var changes = [];
	cells.forEach(function (cell) {
	    var numLiveNeighbors = model.countLiveNeighbors(cell);
	    if (cell.isAlive) {
		if (numLiveNeighbors != 2 && numLiveNeighbors != 3){
		    changes.push({cell: cell, isAlive: false});
		}
	    } else {
		if (numLiveNeighbors == 3) {
		    changes.push({cell: cell, isAlive: true});
		}
	    }
	});
	// apply changes at the same time
	changes.forEach(function (change) {
	    var cell = change.cell;
	    cell.isAlive = change.isAlive;
	});

	return changes;
    },
    validLocation: function (x,y){
	return (x >= 0 && x < CELLS_IN_ROW &&
		y >= 0 && y < CELLS_IN_ROW);
    },
};

var view = {
    init: function (){
	var canvas = document.createElement('canvas');
	this.width = 500;
	this.height = 500;
	this.cell_width = this.width / CELLS_IN_ROW;
	canvas.width = this.width;
	canvas.height = this.height;
	document.body.appendChild(canvas);
	this.context = canvas.getContext('2d');
    },
    renderCell: function (cell){
	var context = this.context;
	var cell_width = this.cell_width;
	context.beginPath();
	context.arc(cell.x * cell_width + cell_width / 2, 
		    cell.y * cell_width + cell_width / 2,
		    cell_width / 2,
		    0, 2 * Math.PI, false);
	context.fill();
    },
    clearCell: function (cell){
	var cell_width = this.cell_width;
	this.context.clearRect(cell.x * cell_width, 
			  cell.y * cell_width,
			  cell_width,
			  cell_width);
    },
    render: function (){
	var context = this.context;
	context.clearRect(0,0, this.width, this.height);
	var cell_width = this.cell_width;
	var cells = controller.getAliveCells();
	var view = this;
	cells.forEach(function (cell) {
	    view.renderCell(cell);
	});
    },
    renderChanges: function (changes) {
	/* Instead of clearing the whole canvas only 
	   change the parts that need to be change. */
	var view = this;
	changes.forEach(function (change){
	    var cell = change.cell;
	    if (change.isAlive){
		view.renderCell(cell);
	    } else {
		view.clearCell(cell);
	    }
	});
    },
};

var controller = {
    init: function (){
	model.init();
	view.init();
	view.render();
	this.run();
    },
    update: function (){
	view.renderChanges(model.update());
    },
    run: function (){
	controller = this;
	window.setInterval(function (){
	    controller.update();
	}, 1000);
    },
    getAliveCells: function (){
	return model.getAliveCells();
    },
};

controller.init();
