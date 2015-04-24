
// function shallow (thing) {
// 	return Array.prototype.map(thing,function(v){
// 		return v;
// 	});
// }


function randomColor() {
	var colors = ['red','blue','purple', 'yellow', 'green']
	return colors[Math.floor(Math.random() * 5)]
}

function deepExtend(vals,name) {
	var output = [];
	for(var i=0; i<vals.length; i++) {
		var out = vals[i].map(function(v){
			return v;
		})
		output.push(out);
	}
	this[name] = output;
}

function extend(obj,extension) {
	for(var prop in extension) {
		if(extension.hasOwnProperty(prop)) {
			typeof extension[prop] === 'object' ? deepExtend.call(obj, extension[prop], prop) : obj[prop] = extension[prop];
		}
	}
	obj['color'] = randomColor();
	return obj;
}
function randomPiece () {
	var props = Object.getOwnPropertyNames(tetrinomes);
	// return _.clone(tetrinomes[props[Math.floor(Math.random() * props.length)]]);
	return extend({},tetrinomes[props[Math.floor(Math.random() * props.length)]]);
}
function elt(type,clas,props){
	var elt = document.createElement(type);
	if(props) {
		for(var prop in props) {
			elt.setAttribute(prop, props[prop]);
		}
	}
	return elt;
}

function shallow (thing) {
	return thing.map(function(v){
		return v;
	});
}
var boardProps = {
	boardHeight:16,
	boardWidth:8,
	height:'20px',
	width:'20px',
	startX:(function(){
		// return [((this.tileX / 2)-1),Number((this.tileX / 2))]
		return [3,4];
	}())
}



var keyCodes = {
	'38':'up',
	'39':'right',
	'40':'down',
	'37':'left',
	'32':'space'
}

var tetrinomes = {
	lambda: {
		coords: [[1,0,0],[1,0,0],[1,1,0]],
		color: 'blue',
		length:2
	},
	omega: {
		coords: [[1,1],[1,1]],
		color: 'red',
		length:2
	},
	zeta: { 
		coords: [[1,0,0],[1,1,0],[0,1,0]],
		color: 'green',
		length:2
	},
	beta: {
		coords: [[1,0,0],[1,1,0],[1,0,0]],
		color: 'yellow',
		length:2
	},
	iota: {
		coords: [[0,1,0],[0,1,0],[0,1,0]],
		color: 'purple',
		length:2
	}
};




function correspondingShiftPiece (cords, piece, center) {

	if(cords[0] === center[0] || cords[1] === center[1]) {
		console.log('centers');
		if(cords[0] !== center[0]) {
			console.log('x axis doesnt match');
			if(cords[0] < center[0]) {
				console.log('up -> right ',piece );
				return piece.parentElement.previousElementSibling.children[piece.cellIndex+1];
			} else {
				console.log('down -> left', piece);
				return piece.parentElement.nextElementSibling.children[piece.cellIndex-1];
			}
		} else if(cords[1] > center[1]) {
			console.log('left -> up ', piece);
			return piece.parentElement.previousElementSibling.children[piece.cellIndex-1];
		} else if(cords[1] < center[1]) {
			console.log('right -> down ', piece);
			return piece.parentElement.nextElementSibling.children[piece.cellIndex+1];
		} else {
			console.log('doesnt move ', piece);
			return piece;
		}
		
	} else if(cords[1] < center[1]) {
		if(cords[0] < center[0]) {			
			console.log('right -> right ', piece);
			return piece.nextElementSibling.nextElementSibling;
		} else {
			console.log('down -> down ', piece);
			return piece.parentElement.nextElementSibling.nextElementSibling.children[piece.cellIndex];
		}
	} else if(cords[1] > center[1]) {
		if(cords[0] < center[0]) {
			console.log('up -> up ', piece);
			return piece.parentElement.previousElementSibling.previousElementSibling.children[piece.cellIndex];
		} else {
			console.log('left -> left ', piece);
			return piece.previousElementSibling.previousElementSibling;
		}
	}
	// debugger;
}



function Piece(piece) {
	// array of table cells that makeup piece
	this.position = [];
	this.nextPostion = [];
	this.centerAxis = {};
	this.props = piece;
	if(this.props.color !== 'red') {
		this.centerAxis = gameBoard.gridCells[1][4];
	}
}

Piece.prototype.updateCenter = function() {
	if(this.props.color !== 'red') {
		return this.centerAxis = this.centerAxis.parentElement.nextElementSibling.children[this.centerAxis.cellIndex];
	}
}

Piece.prototype.drawNewPosition = function(newNodes, oldNodes) {
	var color = oldNodes[0].className;
	oldNodes.forEach(function(v){
		v.removeAttribute('class');
	});
	newNodes.forEach(function(v){
		v.setAttribute('class',color);
	});
	return;
};


Piece.prototype.getRotatedNodes = function() {
	var centerCords = [this.centerAxis.cellIndex, this.centerAxis.parentElement.rowIndex];
	var out = this.position.map(function(v){
		var curCord = [v.cellIndex,v.parentElement.rowIndex];
		// console.log('Piece Cordinate: ', curCord);
		return correspondingShiftPiece.call(this, curCord, v, centerCords);

	},this);
	// console.log('CENTER: ', centerCords);
	this.drawNewPosition(out,this.position);
	this.position = out;
};


Piece.prototype.rotate = function() {
	// console.log('%cBEGIN PIECE SHIFT', 'color:red');
	this.getRotatedNodes();
	// console.log('%cEND PIECE SHIFT', 'color:red');
};




// CONTROLLER

function GameController(model) {
	this.model = model;
	this.direction = 'down';
	this.canAdvance = true;
	document.onkeydown = function onkeydown(e){
		var code = keyCodes[e.keyCode.toString()];
		// console.log(code);
		if(code === 'up') {
			return this.model.currentPiece.rotate();
		}
		if(code == 'right' || code == 'left') {
			return this.model.shiftPiece(code);	
		}
		if(code === 'down') {
			console.log('%cPiece Advance x2','color:blue');
			if(this.canAdvance) {
				this.canAdvance = false;
				var nextNodesOrWall = this.model.validate(this.model.nextNodes(this.model.currentPiece.position));
				if(!nextNodesOrWall.length || this.model.pieceHit(nextNodesOrWall)) {
					return;
				}
				this.model.advanceNodes(this.model.currentPiece.position, this.model.nextNodes(this.model.currentPiece.position), this.model.currentPiece.props.color);
				return this.canAdvance = true;
			}

			// return this.model.update();
		}
		if(code === 'space') {
			this.model.dropPiece();
		}
	}.bind(this);
}



// VIEW

function Board(options) {
	this.options = options;
	this.gridCells = [];
	this.completedPieces = [];

	for(var i=0; i<this.options.boardHeight; i++) {
		var row = [];
		for(var c=0; c<this.options.boardWidth; c++) {
			row.push(elt('td', null,{
				height:this.options.height, 
				width: this.options.width
			}));
		}
		this.gridCells.push(row);
	}
}

Board.prototype.drawBoard = function() {
	var table = elt('table');
	var bod = elt('tbody');
	this.gridCells.forEach(function(row){
		var rowEl = elt('tr');
		row.forEach(function (cell) {
			rowEl.appendChild(cell);
		})
		bod.appendChild(rowEl);
	})
	table.appendChild(bod);
	document.body.appendChild(table);
};

function ScoreBoard() {
	var score;
	return {
		increaseScore:function() {
			
		}
	}
}





// MODEL

function Game(board) {
	this.board = board;
	this.startingCornerElt = this.board.gridCells[0][3];
	this.currentPiece = {};
	this.timer;
	this.bottomLayer = [null,null,null,null,null,null,null,null];

}


Game.prototype.mapPieceCellsToBoard = function(rowMap,cellElt,className) {
	if(rowMap.length > 1) {
		if(rowMap.shift() == 1) {
			cellElt.className = className;
			this.currentPiece.position.push(cellElt);
		}
		return this.mapPieceCellsToBoard(rowMap,cellElt.nextElementSibling,className);
	}
	if(rowMap.shift() == 1) {
		cellElt.className = className;
		this.currentPiece.position.push(cellElt);
	}
	return;
	// return rowMap.shift() == 1 ? cellElt.className = className : cellElt.className = '';
}

Game.prototype.decrementBottomLayer = function() {
	var bottom = this.bottomLayer;
	for(var i=0; i<bottom.length; i++) {
		if(bottom[i] && bottom[i].parentElement.nextElementSibling) {
			bottom[i] = bottom[i].parentElement.nextElementSibling.children[bottom[i].cellIndex];
		} else {
			bottom[i] = null;
		}
	}
}




Game.prototype.mapCompletedToBottomLayer = function(piece) {
	var bottom = [[],[],[],[],[],[],[],[]];
	// var bottom = [];
	piece.position.forEach(function(val,ind,arr){
		if(bottom[val.cellIndex].length === 0) {			
			bottom[val.cellIndex] = val;
		} else {
			if(bottom[val.cellIndex].parentElement.rowIndex > val.parentElement.rowIndex) {
				bottom[val.cellIndex] =  val;
			}
		}
	})
	bottom.forEach(function(val,i){
		if(val.length === 0) {
			return bottom[i] = null;
		} else {
			return bottom[i] = val;
		}
	})

	bottom.forEach(function(val){
		if(val && this.bottomLayer[val.cellIndex]) {
			if(this.bottomLayer[val.cellIndex].parentElement.rowIndex > val.parentElement.rowIndex) {
				this.bottomLayer[val.cellIndex] = val;
			}
		} else if(val) {
			this.bottomLayer[val.cellIndex] = val;
		}
	},this)

}




function getShiftPiece (piece, direction) {
	switch (direction) {
		case 'right':
			return piece.nextElementSibling;
		case 'left':
			return piece.previousElementSibling;
		default:
			throw new Error('wrong direction');
	}
}





Game.prototype.shiftPiece = function(direction) {
	console.time('Shift Piece');
	// var shiftPiece = getShiftPiece(this.currentPiece.position[0], direction);
	var color = this.currentPiece.props.color;
	var newPosition = [];
	this.currentPiece.position.forEach(function(v){
		v.removeAttribute('class'); 
	})
	this.currentPiece.position.forEach(function(v){
		var s = getShiftPiece(v,direction);
		s.className = color;
		newPosition.push(s);
	},this)
	this.currentPiece.position = newPosition;
	if(this.currentPiece.centerAxis)
		this.currentPiece.centerAxis = getShiftPiece(this.currentPiece.centerAxis, direction);
	console.timeEnd('Shift Piece');
}



Game.prototype.advanceNodes = function(aOld, aNew, color) {
	aOld.forEach(function(v){
		v.removeAttribute('class');
	})
	aNew.forEach(function(v){
		v.setAttribute('class', color);
	})
	this.currentPiece.position = aNew;
	this.currentPiece.updateCenter();
	return;
}


Game.prototype.shiftBoardDown = function(aRowsArray) {
	// var row = aRowsArray.pop();
	for(var i=0, r=aRowsArray.pop(); i<r.length; i++) {
		r[i].parentElement.nextElementSibling.children[r[i].cellIndex].className = r[i].className || '';
		r[i].removeAttribute('class');
	}
	if(aRowsArray.length) {
		return this.shiftBoardDown(aRowsArray);
	}
	return;
}


Game.prototype.clearLayer = function(layerNodeArr) {
	layerNodeArr.forEach(function(v){
		v.removeAttribute('class');
	})
}


Game.prototype.searchForCompletedLayers = function() {
	for(var i=0, c=this.board.gridCells; i<c.length; i++) {
		var hasHole = c[i].some(function(v){
			if(!v.hasAttribute('class') || v.className == '') {
				return true;
			}
		})
		if(!hasHole) {
			// debugger;
			this.clearLayer(c[i]);
			this.shiftBoardDown(this.board.gridCells.slice(0,i));
			this.decrementBottomLayer();
		}
	}
}


Game.prototype.checkGroundCollision = function(piece) {
	if(piece.pop().parentElement.nextElementSibling) {
		return piece.length ? this.checkGroundCollision(piece) : false;
	} else {
		return true;
	}
}



Game.prototype.nextNodes = function(nodes) {
	return nodes.map(function(node){
		return node.parentElement.nextElementSibling ? node.parentElement.nextElementSibling.children[node.cellIndex] : null;
	});
}

Game.prototype.validate = function(nodes) {
	var pass = nodes.some(function(node){
		return node == null;
	})
	return pass == false ? nodes : false;
}

Game.prototype.pieceHit = function(piece) {
	return piece.some(function(v){
		if(this.bottomLayer[v.cellIndex]) {
			return this.bottomLayer[v.cellIndex].parentElement.rowIndex === v.parentElement.rowIndex
		}
	},this)
}

Game.prototype.dropPiece = function() {
	// var newPiece = new Piece(randomPiece());
	// this.currentPiece = newPiece;
	this.currentPiece = new Piece(randomPiece());
	this.startingCornerElt = this.board.gridCells[0][3];
	while(this.currentPiece.props.coords.length) {
		this.mapPieceCellsToBoard(this.currentPiece.props.coords.shift(), this.startingCornerElt, this.currentPiece.props.color);
		this.startingCornerElt = this.startingCornerElt.parentElement.nextElementSibling.children[3];
	}
	controller.canAdvance = true;
	this.timer = setTimeout(this.update.bind(this),1000);
}


Game.prototype.update = function() {
	console.log('%cUpdate', 'color: black');
	var nextNodesOrWall = this.validate(this.nextNodes(this.currentPiece.position));
	// console.log(nextNodesOrWall);
	if(!nextNodesOrWall.length || this.pieceHit(nextNodesOrWall)) {
		// this.board.completedPieces.push(this.currentPiece);
		this.mapCompletedToBottomLayer(this.currentPiece);
		this.currentPiece = null;
		this.searchForCompletedLayers();
		return this.dropPiece();
	}

	this.advanceNodes(this.currentPiece.position, nextNodesOrWall, this.currentPiece.props.color);
	this.currentPiece.nextPostion = [];
	return this.timeout = setTimeout(this.update.bind(this),700);
}


// Game.prototype.




var gameBoard = new Board(boardProps);

gameBoard.drawBoard();


var simpleGame = new Game(gameBoard);

var controller = new GameController(simpleGame);





