/*

<one line to give the program's name and a brief idea of what it does.>
    Copyright (C) <year>  <name of author>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>



*/

///////////////////////////////////////////////////////////////////////////////////////////////////////

var CPX={};

var cpxRealms ={};
var cpxVar={};
cpxVar.abilities = {};

cpxVar.Tag = {};
cpxVar.Gear = {};

cpxTeams = {};

cpxActiveCombat = [];

cpxLoad = {o:[],f:function(){},opts:{}};

///////////////////////////////////////////////////////////////////////////////////////////////////////

cpxSaveIDB = function (uid,sdoc) {

	cpxDB.put(sdoc).then(function () {
    	return cpxDB.get(uid);
  	}).then(function (doc) {
    	console.log('We stored a ' + doc.type);
  	}).catch(function (err) {
  		console.log(err);
	});

}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

cpxVar.objectSave = ["_realm","_parent","children","visible"];
CPX.Object=function () {
	this._realm="";
	this._parent = "";
	this.children=[];

	this.visible=true;
}
CPX.Object.prototype.initialize = function () {



}

CPX.Object.prototype.save = function () {

}
CPX.Object.prototype.load = function () {

}
CPX.Object.prototype.setOptions = function (opts) {
	opts = typeof opts === "undefined" ? {} : opts;
	for (var x in opts) {
		this[x]=opts[x];
	}
}
CPX.Object.prototype.lookup = function (uid) {
	return cpxRealms[this._realm].db[uid];
}
CPX.Object.prototype.realm = function () {
	return cpxRealms[this._realm];
}
CPX.Object.prototype.parent = function () {
	if(this._parent == this._realm) { return cpxRealms[this._realm]; }
	return this.lookup(this._parent);
}
CPX.Object.prototype.child = function (i) {
	return this.lookup(this.children[i]);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

CPX.RNG = function(seed){
	this.seedrnd = typeof seed === "undefined" ? Math.random : new xor4096(seed);
	this.RND=this.seedrnd;

};
CPX.RNG.prototype.rndInt = function (min, max) {
    return Number(Math.floor(this.seedrnd() * (max - min + 1)) + min);
}
//Random int exclude
CPX.RNG.prototype.rndIntEx = function (min, max, exc) {
	var n=exc;
	do {
		n=this.rndInt(min,max);
	}
	while (n==exc);

    return n;
}
//Roll some dice of the same type passed a nested dice array in the following format:
// [n=number, d= dice type, b=bonus]
CPX.RNG.prototype.Dice = function (darray) {
	var x=0, T=this;

	//for each dice set provided
	darray.forEach(function(cd){
		//0=n so it loops through the number of dice
		for(var i=0; i < cd[0] ; i++){
			//1 = dice type
			x+=T.rndInt(1, cd[1]);
		}
		//2 if there is the bonus
		if (cd.length==3) { x+= cd[2]; }
	});

    return x;
}
CPX.RNG.prototype.multiRoll = function (min, max, num) {
    var x=0;
	for(var i=0;i<num;i++){
		x+=this.rndInt(min, max);
	}
    return x;
}
CPX.RNG.prototype.FateRoll = function (){ return this.multiRoll (1, 3, 4)-8; }
CPX.RNG.prototype.DWRoll = function  () {return this.multiRoll (1, 6, 2);}
CPX.RNG.prototype.EvenRoll = function () {return (this.rndInt(1,6)-this.rndInt(1,6));}
// @returns {any} Randomly picked item, null when length=0
CPX.RNG.prototype.rndArray = function (array) {
	if (!array.length) { return null; }
	return array[Math.floor(this.RND() * array.length)];
}
// @returns {any} Randomly picked item from an object holding objects, null when length=0
CPX.RNG.prototype.rndObj = function (obj) {
	var oa=[], i=0;
	for (var ox in obj) {
		i++;
		oa.push(ox);
	}
	if (!oa.length) { return null; }
	return obj[this.rndArray(oa)];
}
// @returns {array} New array with randomized items
CPX.RNG.prototype.shuffleAr = function (array) {
  	var currentIndex = array.length, temporaryValue, randomIndex ;

  	// While there remain elements to shuffle...
  	while (0 !== currentIndex) {

    	// Pick a remaining element...
    	randomIndex = Math.floor(this.seedrnd() * currentIndex);
    	currentIndex -= 1;

    	// And swap it with the current element.
    	temporaryValue = array[currentIndex];
    	array[currentIndex] = array[randomIndex];
    	array[randomIndex] = temporaryValue;
  	}

  	return array;
}
CPX.RNG.prototype.makeLinks = function (area) {
	var i = 0, j = 1, links=[];
	var nc= area.nchild-area.children.length, nz = area.nzones-Object.keys(area.zones).length;

	for (var x in area.links) {
		area.links[x].forEach(function(l){
			links.push([x,l]);
		});
	}
	
	//random	
	if(type == "random") {
		for (i = 0 ; i < n-2 ; i++ ) {
			links.push(RN.rndInt(0,n-1)); 
		}
	}
	//tower
	else if(type == "tower") {
		while (i< n-2) {
			if( RN.RND() < 0.5 ) { links.push(j); i++; }
			else {
				links.push(j);
				links.push(j);
				i+=2;
			}
			j++;		
		}
	}
	//wide
	else if(type == "wide") {
		var ncore=[2,3,3,4,4,5,5,6], m=-1, k=0, picked=[];
		while (i< n-2) {
			m = RN.rndArray(ncore);
			if ( i+m > n-2 ) { m = n-2 - i; }
		
			j = RN.rndInt(0,n-1);
			while ( picked.test(j) ) { j = RN.rndInt(0,n-1); }
			picked.push(j);
	
			for(k=0 ; k < m ; k++) {
				links.push(j);
			}			
			
			i+= m;		
		}
	}

	var linkPrufer = Prufer(links);
	
	var r=[], innerLinks = {};
	linkPrufer.forEach(function(l) {
		if( !r.test(l[0]) ) {  
			r.push(l[0]);
			innerLinks[l[0]]=[l[1]];		
		}
		else {
			innerLinks[l[0]].push(l[1]);
		}
		if( !r.test(l[1]) ) {  
			r.push(l[1]);
			innerLinks[l[1]]=[l[0]];		
		}
		else {
			innerLinks[l[1]].push(l[0]);
		}
	});

	return innerLinks;
}

cpxRNG = new CPX.RNG();
cpxRNDName = NameGenerator(cpxRNG.rndInt(1,9999999));

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
