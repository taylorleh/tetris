
/*
*	
*	helper utility methods
*/

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

function randomPiece () {
	var props = Object.getOwnPropertyNames(tetrinomes);
	return extend({},tetrinomes[props[Math.floor(Math.random() * props.length)]]);
}
function play() {
	GameBoard.setCurrent(new Piece(randomPiece()));
	requestAnimationFrame(frame);
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
		coords: [0x44C0,0x8E00,0x6440,0x0E20],
		color:'red',
		height:3
	},
	t: {
		coords:[0x4640,0x0E40,0x2620,0x2700],
		color:'green',
		height:3
	}
}

function Piece(piece) {
	this.positionX = 3;
	this.positionY = 0;
	this.pieceHeight = piece.height;
	this.color = piece.color;
	this.coords = piece.coords;
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
		eachblock(current, current.positionX, current.positionY, 0, function(x,y){
			drawBlock(can.getContext('2d'), x * boardProps.width, y * boardProps.height, current.color);
		})
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

function Game() {
	this.current;
	this.timeNow;

}

Game.prototype.dropPiece = function() {
	var piece = GameBoard.getCurrent();
	eachblock(piece, piece.positionX, piece.positionY, 0, function(x,y){

	})
}

function drawBlock(ctx, x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x,y,boardProps.width, boardProps.height);
	ctx.strokeRect(x,y, boardProps.width, boardProps.height);
}

function handleKeys(e) {
	if(Controller.playing) {
		switch(keyCodes[e.keyCode.toString()]) {
			case 'space':
				console.log('space');
				break;
			case 'right':
				console.log('right');
				break;
			default:
				console.log('key not recognized');
		}
	}
	if(!Controller.playing) {
		Controller.playing = true;
		play();
	}

}


var Controller = (function() {
	var current;
	document.addEventListener('keydown', handleKeys.bind(this), false);
	return {
		playing:false,
		getCurrent: function() {
			return current;
		},
		setCurrent:function() {

		}
	}
})()




function frame() {
	var now = new Date();
	if(!GameBoard.current()) {
		simpleGame.dropPiece();
	}
	// if(GameBoard.current().hit()) {
	// 	console.log('contact');
	// 	return;
	// }
	// return window.requestAnimationFrame(frame);
	advance(now - simpleGame.timeNow);
	requestAnimationFrame(frame);
}





var simpleGame = new Game();
































