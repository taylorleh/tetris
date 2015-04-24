

function extend(obj,extension) {
	for(var prop in extension) {
		if(extension.hasOwnProperty(prop)) {
			// typeof extension[prop] === 'object' ? deepExtend.call(obj, extension[prop], prop) : obj[prop] = extension[prop];
			obj[prop] = extension[prop];
		}
	}
	return obj;
}

function deepExtend(vals,name) {
	var output = [];
	for(var i=0; i<vals.length; i++) {
		var out = vals.map(function(v){
			return v;
		})
		output.push(out);
	}
	this[name] = output;
}
function get(id) {
	return document.getElementById(id);
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
var boardProps = {
	boardHeight:16,
	boardWidth:8,
	height:'40',
	width:'40',
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
	j:{
		coords: [0x44C0,0x08E0,0x6440,0x0E20],
		color:'red',
		height:3
	},
	t: {
		coords:[0x4640,0x0720,0x2620,0x0270],
		color:'green',
		height:3
	},
	l: {
		coords:[0x4460,0x0740,0x6220,0x02E0],
		color:'yellow',
		height:3
	}
}

function randomPiece () {
	var props = Object.getOwnPropertyNames(tetrinomes);
	// return _.clone(tetrinomes[props[Math.floor(Math.random() * props.length)]]);
	return extend({},tetrinomes[props[Math.floor(Math.random() * props.length)]]);
}

function clearBoard() {
	get('can').getContext('2d').clearRect(0,0,boardProps.width * boardProps.boardWidth, boardProps.height * boardProps.boardHeight)
	
}


//	This method should be PRIVATE
//	Do NOT call directly
function drawBlock(ctx, x, y, color) {
	ctx.save();
	ctx.fillStyle = color;
	ctx.fillRect(x,y,boardProps.width, boardProps.height);
	ctx.strokeRect(x,y, boardProps.width, boardProps.height);
	ctx.restore();
}

function Piece(piece) {
	this.positionX = 3;
	this.positionY = 0;
	this.direction = 0;
	this.pieceHeight = piece.height;
	this.color = piece.color;
	this.coords = piece.coords;
}

Piece.prototype.hit = function() {
	console.log('checking wall collision', 'position Y : ', this.positionY);
	if(this.positionY > 15 - this.pieceHeight) {
		return true;
	}
	return false;
}

Piece.prototype.rotate = function() {
	this.direction == 3 ? this.direction = 0 : this.direction++;
	var color = this.color;
	clearBoard();
	draw(this);
	// return eachblock(this, this.positionX, this.positionY, this.direction, function(x,y){
	// 	drawBlock(get('can').getContext('2d'), x * boardProps.width, y * boardProps.height, color);
	// })
	// drawCompleted();
}
Piece.prototype.advance = function() {
	this.positionY++;
	var color = this.color;
	clearBoard();
	draw(this);
	// return eachblock(this, this.positionX, this.positionY, this.direction, function(x,y){
	// 	drawBlock(get('can').getContext('2d'), x * boardProps.width, y * boardProps.height, color);
	// })
	// drawCompleted();
}


function eachblock(type, x, y, dir, fn) {
  var bit, result, row = 0, col = 0, blocks = type.coords[dir];
  for(bit = 0x8000 ; bit > 0 ; bit = bit >> 1) {
    if (blocks & bit) {
      fn(x + col, y + row);
    }
    if (++col === 4) {
      col = 0;
      ++row;
    }
  }
};





function Model() {
	this.completedPieces = [];
}


var GameBoard = (function(options){
	var current;
	var options = options;
	var can = elt('canvas', null, {
		id:'can',
		width:options.boardWidth * options.width,
		height: options.boardHeight * options.height,
		style:'border: 1px solid black'
	})
	function getCurrent() {
		return current;
	}
	function setCurrent(piece) {
		current = piece;
	}
	function shift(amt) {
		var posx = current.positionX;
		current.positionX = current.positionX + amt;
		clearBoard();
		// eachblock(current, current.positionX, current.positionY, current.direction, function(x,y){
		// 	drawBlock(can.getContext('2d'), x * boardProps.width, y * boardProps.height, current.color);
		// })
		draw(current);
		// drawCompleted();
	}
	return {
		current:function(){
			return getCurrent();
		},
		setCurrent:function(piece) {
			current = piece;
		},
		init: function() {
			document.body.appendChild(can);
		},
		shiftCurrent: function(amt) {
			return shift(amt)
		}
	}
	
})(boardProps);

function drawCompleted() {
	var blocks = simpleGame.completedPieces;
	for(var i=0; i < blocks.length; i++) {
		var b = blocks[i];
		eachblock(b, b.positionX, b.positionY, b.direction, function(x,y){
			drawBlock(get('can').getContext('2d'), x * boardProps.width, y * boardProps.height, b.color);
		})
	}
}

function drop() {
	drawCompleted();
}


function collision() {
	
}



// var GameBoard = new Function() {
// 	this.someprop = 10;
// }

var playing = false;
function setplaying() {
		this.playing = true;
}
function stop() {
	cancelAnimationFrame(frame);
}


Model.prototype.dropPiece = function() {
	var newPiece = new Piece(randomPiece());
	GameBoard.setCurrent(newPiece);
	eachblock(newPiece, newPiece.positionX, newPiece.positionY, 0, function(x,y){
		drawBlock(get('can').getContext('2d'), x * boardProps.width, y * boardProps.height, newPiece.color)
	});
// draw(newPiece);
}

function handleKeys(e) {
	var code = keyCodes[e.keyCode.toString()];
	if(playing) {
		switch(code) {			
			case 'space':
				// stop();
				break;
			case 'left':
				// GameBoard.shiftCurrent(-1);
				this.actionqueue.push(GameBoard.shiftCurrent.bind(null,-1));
				break;
			case 'right':
				this.actionqueue.push(GameBoard.shiftCurrent.bind(null,1));
				break;
			case 'up':
				this.actionqueue.push(GameBoard.current().rotate.bind(GameBoard.current()));
				break;
			case 'down':
				this.actionqueue.push(GameBoard.current().advance.bind(GameBoard.current()));
				break;
			default:
				console.log('not detected');
		}
		
	}
	if(!playing && code === 'space') {
		setplaying();
		play();
	}
}


function Controller(model) {
	this.model = model;
	this.actionqueue = [];
	this.timeNow;

	document.addEventListener('keydown',handleKeys.bind(this),false);
	// document.addEventListener.bind('keydown',this.action,false);
}




function drawCurrent(piece) {
	eachblock(piece, piece.positionX, piece.positionY, piece.direction, function(x,y){
		drawBlock(get('can').getContext('2d'), x * boardProps.width, y * boardProps.height, piece.color)
	})
}


function draw(current) {
	drawCurrent(current);
	drawCompleted();
}

function blockCollision() {
	var completed = simpleGame.completedPieces;
	completed.forEach(function(v){

	})
}


function update(deltaTime) {
	var cur = GameBoard.current();
	if(playing) {
		if(gameController.actionqueue.length) {
			gameController.actionqueue.shift()();
			// drawCompleted();
			draw(cur);
		}
		if(deltaTime > 700) {
			simpleGame.timeNow = new Date();
			clearBoard();
			cur.positionY++;
			// eachblock(cur, cur.positionX, cur.positionY, cur.direction, function(x,y){
			// 	drawBlock(get('can').getContext('2d'), x * boardProps.width, y * boardProps.height, cur.color)
			// })
			draw(cur);
			// drawCompleted();		
		}
	}
}


function getBlock(x,y) {
	var completed = simpleGame.completedPieces;
	console.log(completed);
	Array.prototype.forEach.call(completed, function(v){
		console.log(v);
	})
}

function frame() {
	var now = new Date();
	if(!GameBoard.current()) {
		simpleGame.dropPiece();
	}
	// calling this on every frame is causing the next piece to be drawn slightly
	// before the preceding piece has hit the ground
	if(GameBoard.current().hit()) {
		console.log('contact');
		simpleGame.completedPieces.push(GameBoard.current());
		getBlock();
		drop();
		simpleGame.dropPiece();
		// return;
	}
	// return window.requestAnimationFrame(frame);
	update(now - simpleGame.timeNow);
	requestAnimationFrame(frame);
}



function play() {
	// window.requestAnimationFrame(frame);
	simpleGame.dropPiece();
	simpleGame.timeNow = new Date();
	requestAnimationFrame(frame);
	// setTimeout(frame,800);
}



// var gameBoard = new View(boardProps);
GameBoard.init();
var simpleGame = new Model();
var gameController = new Controller(simpleGame);




