$.noty.defaults = {
    layout: 'center',
    theme: 'defaultTheme', // or 'relax'
    type: 'alert',
    text: '', // can be html or string
    dismissQueue: true, // If you want to use queue feature set this true
    template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
    animation: {
        open: {height: 'toggle'}, // or Animate.css class names like: 'animated bounceInLeft'
        close: {height: 'toggle'}, // or Animate.css class names like: 'animated bounceOutLeft'
        easing: 'swing',
        speed: 500 // opening & closing animation speed
    },
    timeout: 2500, // delay for closing event. Set false for sticky notifications
    force: false, // adds notification to the beginning of queue when set to true
    modal: false,
    maxVisible: 5, // you can set max visible notification for dismissQueue true option,
    killer: false, // for close all notifications before show
    closeWith: ['click'], // ['click', 'button', 'hover', 'backdrop'] // backdrop click will close all notifications
    callback: {
        onShow: function() {},
        afterShow: function() {},
        onClose: function() {},
        afterClose: function() {},
        onCloseClick: function() {},
    },
    buttons: false // an array of buttons
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
/* Crockford's inherit function */
Function.prototype.inherits = function(Parent) {
        var d = {}, p = (this.prototype = new Parent());
        this.prototype.uber = function(name) {
            if (!(name in d)) d[name] = 0;
            var f, r, t = d[name], v = Parent.prototype;
            if (t) {
                while (t) {
                    v = v.constructor.prototype;
                    t -= 1;
                }
                f = v[name];
            } else {
                f = p[name];
                if (f == this[name]) {
                    f = v[name];
                }
            }
            d[name] += 1;
            r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
            d[name] -= 1;
            return r;
        };
        return this;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Sets prototype of this function to an instance of parent function
 * @param {function} parent
 */
Function.prototype.extend = Function.prototype.extend || function(parent) {
	this.prototype = Object.create(parent.prototype);
	this.prototype.constructor = this;
	return this;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
//Returns true if the string has the item
String.prototype.test = function(item) {
	if( this.indexOf(item) > -1 ) { return true; }
	
	return false;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

//Array Extensions and Functions

//Returns a readable text string separated by commas with the last given and and
Array.prototype.readable = function() {
	if (this.length<2) {return this;}
	var ar=this;
	var r=[ar.slice(0, -1).join(', '), this.slice(-1)[0]].join(' and ');
	return r;
}
//Returns true if the array has the item
Array.prototype.test = function(item) {
	if( this.indexOf(item) > -1 ) { return true; }
	
	return false;
}
//Returns the last item in an array
Array.prototype.last = function() {
	return this[this.length-1];
}
//Returns the index and object of an array given object propery value
Array.prototype.objSearch = function(prop,val) {
	var i=-1, o={}, j=0;

	for(j=0;j<this.length;j++) {
		if(this[j][prop]==val) { 
			i=j; 
			o=this[j];
		}
	}

	return [i,o];
}

//Finds the maximum value of a provided array
function ArrayMax (arr) {
	var max = arr[0];
	var maxIndex = 0;

	for (var i = 1; i < arr.length; i++) {
		if (arr[i] > max) {
			maxIndex = i;
			max = arr[i];
		}
	}
	return [maxIndex,max];
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
function regularPolygon(x, y, radius, sides) {
	var crd = [], pts="", nx=0, ny=0;

	/* 1 SIDE CASE */
	if (sides == 1)
	return [[x, y]];

	/* > 1 SIDE CASEs */
	for (var i = 0; i < sides; i++) {
		nx = (x + (Math.sin(2 * Math.PI * i / sides) * radius));
		ny = (y - (Math.cos(2 * Math.PI * i / sides) * radius));
		pts+=nx+","+ny+" ";
		crd.push([nx,ny]);
	}

	var pathString = "M"+ crd[0][0] + " " + crd[0][1];
	for(i=1 ; i<crd.length; i++) {
		pathString+=" L" + crd[i][0] + " " + crd[i][1];
	}
	pathString+= " z";
	
	return {array:crd,path:pathString,text:pts};
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

//SVG Tools
function genWedgeString (startX, startY, startAngle, endAngle, radius){
        var x1 = startX + radius * Math.cos(Math.PI * startAngle/180);
        var y1 = startY + radius * Math.sin(Math.PI * startAngle/180);
        var x2 = startX + radius * Math.cos(Math.PI * endAngle/180);
        var y2 = startY + radius * Math.sin(Math.PI * endAngle/180);

        var pathString = "M"+ startX + " " + startY + " L" + x1 + " " + y1 + " A" + radius + " " + radius + " 0 0 1 " + x2 + " " + y2 + " z";

        return pathString;

}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Area & Distance calculations

//calculates a random x,y point within a circle
function WithinCircle(cx,cy,r,rng){
	rng = typeof rng === "undefined" ? Math.random : rng;
	//insures the points fall within a circle 
	var angle = rng()*Math.PI*2;
	var x = Math.cos(angle)*rng()*r;
	var y = Math.sin(angle)*rng()*r;
	
	//adjusts center point of the circle
	x+=cx;
	y+=cy;

	return [x,y];
}
//Checks whether a point is within a circle
function CheckWithinCircle (px,py,cx,cy,r){
	var d=Math.sqrt(Math.pow(px-cx,2)+Math.pow(py-cy,2));
	if (d<r){return true;}
	return false;
}

//Returns the distance between two points
function Distance (loca,locb){
	if(loca.length==2) {loca[2]=0;}
	if(locb.length==2) {locb[2]=0;}
	var d=Math.sqrt(Math.pow(loca[0]-locb[0],2)+Math.pow(loca[1]-locb[1],2)+Math.pow(loca[2]-locb[2],2));
	return d;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

function fiftyFifty() {
	if (Math.random()>0.5) { return true;}
	return false;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Hex and RGB functions

function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
 n = parseInt(n,10);
 if (isNaN(n)) return "00";
 n = Math.max(0,Math.min(n,255));
 return "0123456789ABCDEF".charAt((n-n%16)/16)
      + "0123456789ABCDEF".charAt(n%16);
}

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

//makes a unique id for various objects that is n characters long
makeUID = function (n) {
	n = typeof n === "undefined" ? 12 : n;
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	for( var i=0; i < n; i++ ){
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	
   	return text;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
function Prufer(a) {
  var tree = [];
  var T = Array.apply(null, Array(a.length + 2)).map(function(_, i) { return i; });
  var deg = Array.apply(null, Array(1*T.length)).map(function() { return 1; });
  a.map(function(i) { deg[i]++; });
  
  for(var i = 0; i < a.length; i++) {
    for(var j = 0; j < T.length; j++) {
      if(deg[T[j]] === 1) {
        tree.push([a[i], T[j]]);
        deg[a[i]]--;
        deg[T[j]]--;
        break;
      }
    }
  }
  
  var last = T.filter(function(x) { return deg[x] === 1; });
  tree.push(last);
  
  return tree;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

//Random name generator inspired from the game Elite
NameGenerator = function (state) {
 
    // Syllables shamelessly stolen from elite
    var syllables = 'folexegezacebisousesarmaindirea.eratenberalavetiedorquanteisrion',
        vocals = 'aeiou';
 
    // Some improvements
    var vocalMustFollow = 'tdbr',
        notFollowdBySelf = 'rstie',
        onlyAtStart = 'xyz',
        badSoundStart = ['xc', 'rc', 'bf', 'qc', 'fc', 'vr', 'vc'],
        badSoundMiddle = ['eo', 'ou', 'ae', 'ea', 'sr', 'sg', 'sc', 'nv', 'ng', 'sb', 'sv'];
 
    function isValid(previous, next) {
 
        var pa = previous[0],
            pb = previous[1],
            na = next[0];
 
        if (
            // Block out eveything that's too similar by comparing the initial
            // characters
               (Math.abs(pa.charCodeAt(0) - na.charCodeAt(0)) === 1)
 
            // Prevent specific letter doubles in the middle of the "word"
            || (notFollowdBySelf.indexOf(pb) !== -1 && pb === na)
 
            // A vocal must follow the last character of the previous syllable
            || (vocalMustFollow.indexOf(pb) !== -1 && vocals.indexOf(na) === -1)
 
            // Block the second syllable in case it's initial character can only
            // occur at the start
            || (onlyAtStart.indexOf(na) !== -1)
 
            // Block other combinations which simply do not sound very well
            || (badSoundStart.indexOf(pa + na) !== -1)
 
            // Block other combinations which simply do not sound very well
            || (badSoundMiddle.indexOf(pb + na) !== -1)
 
            // Block double syllable pairs
            || (previous === next)) {
 
            return false;
 
        } else {
            return true;
        }
 
    }
 
    // LCG
    state = state || 0;
    function nextInt() {
        state = (214013 * state + 2531011) % 0x80000; // Loops after 262144
        return state;
    }
 
    // Name generator
    return function() {
 
        var bitIndex = 0;
        while(true) {
 
            bitIndex = 0;
 
            // We have 18 bits of "randomness"
            var seed = nextInt(),
                l = (seed >> 15);
 
            // take the last 3 bytes for the length of the name
            // 0123456
            // 2223213
            l = (l <= 2 || l === 4) ? 2 : (l === 5 && (seed & 0xfff) < 100 ? 1 : 3);
 
            var str = '',
                previous = null,
                next,
                syllableIndex = 0,
                split = l === 2 && (seed & 0x7fff) > 32000,
                i = 0;
 
            while(i < l) {
 
                syllableIndex = (seed >> bitIndex) & 0x1f;
                next = syllables.substr(syllableIndex * 2, 2);
 
                if (!previous || isValid(previous, next)) {
                    str += next;
                    previous = next;
                    i++;
 
                } else {
                    break;
                }
 
                if (split && bitIndex === 5) {
                    previous = '.';
                    str += previous;
                }
 
                bitIndex += 5;
 
            }
 
            if (bitIndex === 5 * l) {
                break;
            }
 
        }
 
        return str.replace(/\.+/g, '.').replace(/^.|\../g, function(c) {
            return c.toUpperCase();
 
        }).replace(/\./g, ' ');
 
    };

};

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

//Three JS utility
function makeTextSprite ( message, parameters )
{

	// function for drawing rounded rectangles
	function roundRect(ctx, x, y, w, h, r) 
	{
    	ctx.beginPath();
    	ctx.moveTo(x+r, y);
    	ctx.lineTo(x+w-r, y);
    	ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    	ctx.lineTo(x+w, y+h-r);
    	ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    	ctx.lineTo(x+r, y+h);
    	ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    	ctx.lineTo(x, y+r);
    	ctx.quadraticCurveTo(x, y, x+r, y);
    	ctx.closePath();
    	ctx.fill();
		ctx.stroke();   
	}

	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 4;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
		
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(100,50,1.0);
	return sprite;	
}





/*
	//returns a random game object based upon the given object text name - may be based on tag lookup
	RNDGobj: function(objtxt,tags,andor,unique) {
		tags = typeof tags === "undefined" ? [] : tags;
		andor = typeof andor === "undefined" ? "or" : andor;
		unique = typeof unique === "undefined" ? "true" : andor;

		var goa=[], gox={}, regex="", re={}, l=tags.length, i=0;
		//have to create a regular expression because we are passing a variable (tag) to search
		//http://stackoverflow.com/questions/3172985/javascript-use-variable-in-string-match
		if(l>0) {
			if (andor == "or")  {
				for (i;i<l;i++) { 
					regex += tags[i]; 
					if(i!=l-1) {regex+="|";}
				}
			}
			else {
				for (i;i<l;i++) { 
					regex += "(?=.*"+tags[i]+")"; 
				}
			}
			re= new RegExp(regex,'g');
		}

		for (var x in CP.game[objtxt]) {
			gox=CP.game[objtxt][x];
			// if it is private it cannot be returned in a random search
			private = typeof gox.private === "undefined" ? false : gox.private;
			if (private) continue;
			
			//if it doesn't have tags, give it a zero length string
			gox.tags = typeof gox.tags === "undefined" ? "" : gox.tags;

			if(regex.length>0) {
				if (re.test(gox.subtype)) {goa.push(gox);}
				else if (re.test(gox.tags)) {goa.push(gox);} 
			}
			else {goa.push(gox);}
		}
		return goa.random();
	},

*/


