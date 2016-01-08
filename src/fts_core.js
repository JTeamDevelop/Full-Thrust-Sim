/*

    A Full Thust Simulator

    This is free because the grace of God is free through His son Jesus. 

	The code is Copyright (C) 2015 JTeam

	Full Thrust is owned by Ground Zero Games and the JTeam claims no rights to it. 

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

var FTS = {}, ftsData = {}, ftsDB={};
ftsData.ships = {};
ftsData.scenarios = {};

ftsData.w=1000;
ftsData.h=750;
ftsData.inch = ftsData.w/48;
ftsData.colors = ["0000FF","00CCFF","00FFFF","00CCCC","009900","00FF00","660066","663300","669900","996699","996600","999933","993399","CC6600","FF00FF","FF0000","FF6600","FFFF00","FFCC00"]
ftsActiveColors = [];
ftsOptions = [];

ftsSelected = null;
ftsTarget = null;

ftsCPhase = "move";
//ftsPhases=["Movement Orders","Move Fighters","Launch Missiles","Move Ships","Allocate Missile & Fighter Attack","Point Defense Fire","Missile & Fighter Attack","Ships Fire"];//ftsPhases=["Movement Orders","Move Fighters","Launch Missiles","Move Ships","Allocate Missile & Fighter Attack","Point Defense Fire","Missile & Fighter Attack","Ships Fire"]
ftsPhases=["Movement Orders","Launch Missiles","Move Ships","Ships Fire"];

ftsActivePlayers = [];
ftsAP = -1;

var rSVG = Raphael("ftscanvas", ftsData.w, ftsData.h);
var set = rSVG.set();
$("#mLeft").show();


//https://en.wikipedia.org/wiki/File:Unit_circle_angles_color.svg
ftsBearings = [];
ftsBearings[0] = {r:0, x:0, y:1};
ftsBearings[1] = {r:30, x:0.5, y:Math.sqrt(3)/2};
ftsBearings[2] = {r:60, x:Math.sqrt(3)/2, y:0.5};
ftsBearings[3] = {r:90, x:1, y:0};
ftsBearings[4] = {r:120, x:Math.sqrt(3)/2, y:-0.5};
ftsBearings[5] = {r:150, x:0.5, y:-Math.sqrt(3)/2};
ftsBearings[6] = {r:180, x:0, y:-1};
ftsBearings[7] = {r:210, x:-0.5, y:-Math.sqrt(3)/2};
ftsBearings[8] = {r:240, x:-Math.sqrt(3)/2, y:-0.5};
ftsBearings[9] = {r:270, x:-1, y:0};
ftsBearings[10] = {r:300, x:-Math.sqrt(3)/2, y:0.5};
ftsBearings[11] = {r:330, x:-0.5, y:Math.sqrt(3)/2};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
ftsWindow = function () {
    var w=$("#ftscanvas").width(), h=$("#ftscanvas").height();
    var cx=w/2, cy=h/2;
    
    return {w:w,h:h,cx:cx,cy:cy}
}

ftsAppend = function(ship) {
    $("#ftscanvas").append(ship);
}

FTS.relPosition = function (x,y) {
	var cx=ftsData.w/2, cy=ftsData.h/2;
	
	return {x:cx+x,y:cy-y}
}

FTS.thrustCheck = function (ship,R,T,M) {
    if(M == "R-") { R--; }
    else if(M == "R+") { R++; }
    else if(M == "T+") { T++; }
    else if(M == "T-") { T--; }
     
    if(Math.abs(R) > Math.floor(ship.thrust/2)) {
        var n = noty({type:'warning', text: "You cannot change your bearing by more than half the ship's Thrust."});
        return false;
    }

    if( Math.abs(R)+Math.abs(T) > ship.thrust ) {
        var n = noty({type:'warning', text: "You have already alloted all of the ship's Thrust."});
        return false;
    }

    return true;
}

FTS.removeArcs = function () {
   for(var x in ftsDB) {
   		if(ftsDB[x].type == "Ship") { ftsDB[x].rSet[3].remove(); }			
	}
}

FTS.selectShip = function () {
   var AP = ftsActivePlayers[ftsAP], ship = this.data("o");	
   console.log(ship);
   if(ship.active <0) {return;}	

	FTS.removeArcs();

	function selectedUpdate () {
		$("#uActive").empty();
		$("#pOptions").empty();
		
		for(var x in ftsDB) {
			if(ftsDB[x].type == "Ship") {
				ftsDB[x].rSet[0].hide();
				ftsDB[x].rSet[4].hide();
				ftsDB[x].selected = false;
			}			
		}

		if(ftsSelected != null) { 
			if(ftsSelected.uid == ship.uid) { 
				ftsSelected = null;
				return; 
			}
		}

		ftsSelected = ship;
		ship.selected = true;		
		ship.rSet[0].show();
		
		$("#pOptions").attr("data-uid",ship.uid);
		
		if(ftsCPhase == 0) { FTS.displayMoveOptions(ship); }
		$("#uActive").append(ship.combatData()); 					
	}
	
	//if the ship's player is the Active Player
	if (ship._player==AP.uid)	{
		//if the phase is currently the firing phase - you can't change ships once one has fired  
		if(ftsPhases[ftsCPhase] == "Ships Fire" && ftsSelected != null) {  //
			//if the ship has fired all of its shots (previously) you can select it (can't fire from it) otherwise can't change ships
			if(ftsSelected.usedFCS > 0) {
				if(ftsSelected.usedFCS != ftsSelected.fcs) { var n = noty({type:'warning', text: "During firing you must fire all the weapons on one ship."}); }
				else { selectedUpdate(); }
			}
			//change ships if the ship hasn't fired or has and fired last turn
			else { selectedUpdate(); }
		}
		//if it isn't firing phase select the player ship
		else { selectedUpdate(); }
	}
	//if not the activePlayer target the ship
	else { 
		if(ftsSelected != null) { ftsSelected.playerTarget(ship); }
	}
	
}

FTS.displayMoveOptions = function (ship) {
     $("#pOptions").empty();
     
    var html = '<div class=center><h4 class=fts>Movement Orders</h4><img class="bMove" src="images/anticlockwise-rotation.png" data-M="R-"/>';
    html+='<img class="bMove" src="images/clockwise-rotation.png" data-M="R+"/><img class="bMove" src="images/thrust.png" data-M="T+"/>';
    html+='<img class="bMove" src="images/reverse.png" data-M="T-"/>'
    html+='<div id=cOrders data-R=0 data-T=0 /></div>';

    $("#pOptions").append(html);
    $("#cOrders").append('V: '+ship.velocity+' R: '+ship.pendingMove[0]+' T: '+ship.pendingMove[1]);
}

FTS.conductMoves = function () {
	var i = 0, j=0, P = ftsActivePlayers;
	for(i=0;i<P.length;i++) {
		for(j=0;j<P[i].units.length;j++) {
			P[i].unit(j).Move();
		}
	}
}

FTS.missileCheck = function () {
	var i = 0, j=0, P = ftsActivePlayers, p=[], ships=0;
	for(i=0;i<P.length;i++) {
		for(j=0;j<P[i].units.length;j++) {
			if(P[i].unit(j).missileCheck()) { p.push(i); ships++; }
		}
	}
	
	if(ships>0) {return p[0];}
	else { return -1; }
}

FTS.newRound = function () {
	ftsCPhase=0;
	for(var x in ftsDB) {
   		if(ftsDB[x].type == "Ship") { ftsDB[x].usedFCS = 0; }			
	}
	FTS.Initiative();
}

FTS.Initiative = function () {
	var p =[];
	p=p.concat(ftsActivePlayers);
	var l = p.length, init=[], i=0;
	for (i=0;i<l;i++) {
		init.push([cpxRNG.rndInt(1,100),i]);
	}

	init.sort(function(a, b){ return b[0]-a[0]; });

	for(i=0;i<init.length;i++) {
		ftsActivePlayers[i] = p[init[i][1]];	
	}

	ftsAP = 0;
	ftsActivePlayers[0].activePlayer();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FTS.Scenario = {}
FTS.Scenario.Load = function (id) {
	var S= ftsData.scenarios[id], nP={}, opts={};

	for(var x in S.players) {
		opts = typeof S.players[x].opts === "undefined" ? {} : S.players[x].opts;
		nP=new FTS.Player(S.players[x].name,opts);
		ftsActivePlayers.push(nP);
		
		S.players[x].ships.forEach(function (ps) {
			opts = typeof S.players[x].start === "undefined" ? {} : {start:S.players[x].start};
			nP.addUnit(ps,opts);		
		});		
	}
	
    ftsCPhase = 0;
    FTS.Initiative();

};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

FTS.Player = function (name,opts) {
    this.name = typeof name === "undefined" ? "" : name;
    
    this.uid = makeUID(24);
    this.type = "Player";
    this.ai = false;
    var color = "#"+cpxRNG.rndArray(ftsData.colors);
    while (ftsActiveColors.test(color) ) {
    	color = "#"+cpxRNG.rndArray(ftsData.colors);
    }
    ftsActiveColors.push(color)
    this.color = color;

    this.units = [];
    this.phaseComplete = false;

    ftsDB[this.uid]=this;
}
FTS.Player.prototype.activePlayer = function () {
	for(var x in ftsDB) {
		if(ftsDB[x].type == "Ship") {
			ftsDB[x].rSet[0].hide();
			ftsDB[x].rSet[4].hide();
			ftsDB[x].selected = false;
		}			
	}
	
	ftsSelected = null;
	ftsTarget = null;

    $("#rTimer").empty();
    $("#rTimer").append('<h4 id=cPhase class=fts>Phase: '+ftsPhases[ftsCPhase]+'</h4>');

    $("#mLeftContent").empty();
    $("#pOptions").empty();
    $("#uActive").empty();
    
    $("#mLeftContent").append('<h3 class="center playerHeader fts">Player '+this.name+'</h3>');
//    $(".playerHeader").css('border-bottom','3px solid '+this.color);
    $("#mLeftContent").css('border','3px solid '+this.color);
    $("#mLeftContent").css('border-top','3px solid '+this.color);

	if(ftsPhases[ftsCPhase] != "Ships Fire") {
    	$("#mLeftContent").append('<div class="center buttons fts"><button id=bFinishTurn>Finish Turn</button></div>');
	}
}
FTS.Player.prototype.nextCombatant = function () {
	ftsAP++; 

	for(var x in ftsDB) {
   		if(ftsDB[x].type == "Ship") { 
   			ftsDB[x].rSet[3].remove(); 
   		}			
	}

	if(ftsAP == ftsActivePlayers.length) { ftsAP = 0; }	
	
	var nships = [], nt=0;
	for(var i=0;i<ftsActivePlayers.length;i++) {
		nships.push(0);
		var nAP=ftsActivePlayers[i];
		for(var j=0;j<nAP.units.length;j++) {
			if(nAP.unit(j).FCSShots()>0) { nships[i]++; nt++;}
		}
	}

	if(nt==0) {
		ftsAP = 0; 
		ftsCPhase++;
		if (ftsCPhase>=ftsPhases.length) { FTS.newRound(); }
	}
	else {
		while(nships[ftsAP]==0) { ftsAP++; }
	}
	
	ftsActivePlayers[ftsAP].activePlayer();

}
FTS.Player.prototype.nextPlayer = function () {
	//advance the player number 
	ftsAP++; 

	//go through the ships and remove the displayed arcs
	for(var x in ftsDB) {
   		if(ftsDB[x].type == "Ship") { 
   			ftsDB[x].rSet[3].remove(); 
   			//ftsDB[x].usedFCS = 0;
   		}			
	}

	//if the ap is the #of players change the phase
	if(ftsAP == ftsActivePlayers.length) {
		//reset the current player to 0 in initiative
		ftsAP = 0; 

		//advance the phase
		ftsCPhase++;
		//if the phase is greater than the last phase, start a new round
		if (ftsCPhase>=ftsPhases.length) { FTS.newRound(); }
		
		//if the phase is move automatically conduct moves and then advance the phase
		if(ftsPhases[ftsCPhase] == "Move Ships") { 
			FTS.conductMoves(); 
			ftsCPhase++;
		}

		//check if there are missiles to be launched
		if(ftsPhases[ftsCPhase] == "Launch Missiles") { 
			var mP = FTS.missileCheck();
			if(mP>-1) { ftsAP = mP; }
			else { ftsCPhase++; }
		}
	}	
	
	//activate the player
	ftsActivePlayers[ftsAP].activePlayer();
}
FTS.Player.prototype.unit = function (i) {
    return ftsDB[this.units[i]];
}
FTS.Player.prototype.addUnit = function (template,opts) {
    opts = typeof opts === "undefined" ? {} : opts;
    opts.player = this.uid;
    
    var nS = new FTS.Ship(template,opts);
    this.units.push(nS.uid);

    return ftsDB[nS.uid];
}
FTS.Player.prototype.destroyUnit = function (unit) {
    var i = this.units.indexOf(unit.uid);
    this.units.splice(i,1);
}
FTS.Player.prototype.checkMove = function () {
    var i=0, done=true;
    for (i=0; i<this.units.length; i++) {
        if(!this.unit(i).moved) { done = false; }
    }
    if (done) { this.moved = true; }
    return done;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

FTS.Missile = function (player,ship,bearing) {
	this.uid = makeUID(24);
    this._player = typeof opts.player === "undefined" ? "" : opts.player.uid;
    this.selected = false;
    this.type = "Missile"; 
    this.class = "MT";

    this.active = 1;

    this.pendingMove = [0,0];
    this.target={};
    
   	this.x = ship.x;
   	this.y = ship.y;
   	if(typeof bearing === "undefined") { this.bearing = ship.bearing; }
   	else {this.bearing = bearing;}

	this.image = "rocket.png"; 
	this.w = 15;
	this.h = 15;
	var dMax = 15;

	//sets up raphael display of ship
	p = FTS.relPosition(this.x,this.y);
	this.rSet= rSVG.set();
	//0 Missile selected circle
	this.rSet.push(rSVG.circle(p.x, p.y, dMax*1.3));
	this.rSet[0].hide();
	//1 Missile player marker - circle
	this.rSet.push(rSVG.circle(p.x, p.y+dMax, 3).attr({fill:player.color}));
	this.rSet[1].data("o",this);
	//2 Missile image
	this.rSet.push(rSVG.image("images/"+this.image, p.x-this.w/2, p.y-this.h/2, this.w, this.h));
	this.rSet[2].data("o",this);
	//3 Circle - to be replaced weapon arcs
	this.rSet.push(rSVG.circle(p.x, p.y, dMax*1.3));
	this.rSet[3].hide();
	//4 target circle - red
	this.rSet.push(rSVG.circle(p.x, p.y, dMax*1.3).attr({"stroke":"red"}));
	this.rSet[4].hide();
	
	this.rSet.transform("...r"+bearing);

	this.rSet.click(FTS.selectMissile);
       
    ftsDB[this.uid]=this;

    this.pendingMove = [0,0.3];
    this.Move();
}
FTS.Missile.prototype.Destroy = function () {
	this.active = -1;
	this.rSet.empty();
	//TODO this.onDestroy
	this.player().destroyUnit(this);
	delete ftsDB[this.uid];
}
FTS.Missile.prototype.Move = function () {
    var R=this.pendingMove[0], T=this.pendingMove[1];
    
    var RA=0, RB=0, TA=0, TB=0, msl=this, rSet=this.rSet;
    if(Math.abs(R)>0) {
        RA=Math.floor(R/2);
        RB=R-RA;

        TA=T/2;
        TB=T-TA;
    }
    else {
        RA=R;
        TA=T;
    }
    
	function Move(nR,nT) {
        msl.bearing += nR;
        if(msl.bearing<0) {msl.bearing+=12;}
        if(msl.bearing>11) {msl.bearing-=12;}
   
        var nx=Math.floor(ftsBearings[msl.bearing].x*nT*ftsData.inch), ny=Math.floor(ftsBearings[msl.bearing].y*nT*ftsData.inch); 
        msl.x+=nx;
        msl.y+=ny;
    }

	var tstring="...r"+RA*30+"t0,-"+TA*ftsData.inch;
	Move(RA,TA);
	if(RB!=0) { tstring+="r"+RB*30+"t0,-"+TB*ftsData.inch; Move(RB,TB); }
	this.rSet.animate({transform:tstring},750,"linear");
	this.pendingMove = [0,0];
    
    this.moved = true;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

FTS.Weapon = function (wp) {
//		weapons:["B312","B316","B2A","B1A","B1A","SML612","SMMag3","PDS","PDS","PDS"],

	this.weapon = true;
	this.visisble = true;
	this.ammo=-1;

	if (wp[0]=="B") {
		this.name = "Beam Class" + wp[1];
		this.type="Beam";
		this.class=wp[1];
		this.maxRange = 12*this.class;

		if(wp.test("All")) { this.arc = "123456"; }
		else { this.arc = wp.slice(2); }
	}
	else if (wp.test("NB")) { 
		this.name= "Needle Beam";
		this.type="Needle";
		this.arc = wp.slice(2);
		this.maxRange = 12;
	}
	else if (wp.test("PT")) { 
		this.name= "Pulse Torpedo";
		this.type="PT";
		this.arc = wp.slice(2);
		this.maxRange = 30;
	}
	else if (wp.test("MTL")) { 
		this.name= "Missile Launcher";
		this.type="MTL";
		this.arc = wp.slice(4);
		this.maxRange = 18;
		this.ammo=Number(wp[3]);
	}
	else if (wp.test("SML")) { 
		this.name= "Salvo Missile Launcher";
		this.type="SML";
		this.arc = wp.slice(3);
		this.maxRange = 24;
		this.ammo=Number(wp[3]);
	}
	else if (wp.test("SUB")) { 
		this.name= "Submuition Pack";
		this.type="SUB";
		this.arc = wp.slice(3);
		this.maxRange = 18;
	}
	else if (wp.test("PDS")) { 
		this.name= "Point Defense System";
		this.type="PDS";
		this.arc = "123456";
		this.weapon=false;
		this.maxRange = 6;
	}
	else { this.name = wp; this.arc = "123456"; this.visisble=false; this.maxRange = 12; }	
	
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

FTS.Ship = function (template,opts) {
    opts = typeof opts === "undefined" ? {} : opts;

    this.uid = makeUID(24);
    this._player = typeof opts.player === "undefined" ? "" : opts.player;
    this.selected = false;
    this.type = "Ship"; 

    this.moved = false;
    this.acted= false;
    this.active = 1;

	this.velocity = 0;
    this.pendingMove = [0,0];

    this.usedFCS=0;
    this.usedPDS=0;

    this.target={};
    
    if(opts.start !== "undefined"){ this.startPosition(opts.start); }
    else {
    	this.x = typeof opts.x === "undefined" ? cpxRNG.rndInt(-100,100) : opts.x;
    	this.y = typeof opts.y === "undefined" ? cpxRNG.rndInt(-100,100) : opts.y;
    	this.bearing = typeof opts.r === "undefined" ? cpxRNG.rndInt(0,11) : opts.r;
    }
    var bearing= this.bearing*30;   

	//defaults often overridden by templates below
    this.image = "jet-fighter.png";
    this.w = 25;
    this.h = 25;

    this.name = cpxRNDName();
    this.template = "None";
    this.class = "None";

    this.thrust = 2;
    
    this.fcs = 1;
    this.pds = 0;
    this.adfc = false;
    this.weapons=[];    
    this.screen = 0;
    this.maxArmor = 0;
    this.armor = this.maxArmor;
    this.maxDamage = [1,1,1,1];
    this.damage = this.maxDamage;
    //end of defaults
    
    //first template loaded - may be a basic ship
    var tmp = JSON.stringify(ftsData.ships[template]);
    tmp = JSON.parse(tmp);

	//If ship is unique, may use a secondary ship as a template and overrwite
	if(typeof tmp.template !== "undefined") { 
    	var tmptwo = JSON.stringify(ftsData.ships[tmp.template]);
    	tmptwo = JSON.parse(tmptwo);
    	this.loadTemplate(tmptwo);
	}

	//overrwite with maine tmeplate info
	this.loadTemplate(tmp);

	//determines maximum size of display 
	var dMax = this.w;
	if(this.h > dMax) { dMax = this.h; } 

	//sets up raphael display of ship
	p = FTS.relPosition(this.x,this.y);
	this.rSet= rSVG.set();
	//0 Ship selected circle
	this.rSet.push(rSVG.circle(p.x, p.y, dMax*1.3));
	//1 Ship player marker - circle
	this.rSet.push(rSVG.circle(p.x, p.y+dMax, 4));
	//2 Ship image
	this.rSet.push(rSVG.image("images/"+this.image, p.x-this.w/2, p.y-this.h/2, this.w, this.h));
	//3 Circle - to be replaced weapon arcs
	this.rSet.push(rSVG.circle(p.x, p.y, dMax*1.3));
	//4 target circle - red
	this.rSet.push(rSVG.circle(p.x, p.y, dMax*1.3).attr({"stroke":"red"}));
	//5 damage token
	this.rSet.push(rSVG.path(regularPolygon(p.x, p.y-dMax, 5, 3).path).attr({"fill":"green"}));
	
	this.rSet[0].hide();
	this.rSet[3].hide();
	this.rSet[4].hide();
	this.rSet[5].hide();
	this.rSet[2].data("o",this);
	this.rSet[1].data("o",this);
	this.rSet[5].data("o",this);
	this.rSet[1].attr({fill:this.player().color});	
	this.rSet.transform("...r"+bearing);
	
	this.rSet.click(FTS.selectShip);
       
    ftsDB[this.uid]=this;
    
}
FTS.Ship.prototype.startPosition = function (start) {
	if(start[0]=="window"){
		var p = [];
		if(start[1][0]=="right") {
			p = WithinCircle(400,0,100);
			this.x=p[0];
			this.y=p[1];
			this.bearing = cpxRNG.rndInt(8,10);
		}
		else if(start[1][0]=="left") {
			p = WithinCircle(-400,0,100);
			this.x=p[0];
			this.y=p[1];
			this.bearing = cpxRNG.rndInt(2,4);
		}
		else {
			this.x = cpxRNG.rndInt(opts.start[1][0],opts.start[1][2]);
			this.y = cpxRNG.rndInt(opts.start[1][1],opts.start[1][3]);
		}
	}    
}
FTS.Ship.prototype.loadTemplate = function (tmp) {
	if( typeof tmp.image !== "undefined" ) { this.image = tmp.image; }
	if( typeof tmp.w !== "undefined" ) { this.w = tmp.w; }
	if( typeof tmp.h !== "undefined" ) { this.h = tmp.h; }

	if( typeof tmp.name !== "undefined" ) { this.name = tmp.name; }
    this.template = tmp.id;
    if( typeof tmp.class !== "undefined" ) { this.class = tmp.class; }

    if( typeof tmp.thrust !== "undefined" ) { this.thrust = tmp.thrust; }
    
    if( typeof tmp.fcs !== "undefined" ) { this.fcs = tmp.fcs; }
    if( typeof tmp.pds !== "undefined" ) { this.pds = tmp.pds; }
    if( typeof tmp.adfc !== "undefined" ) { this.adfc = tmp.adfc; }
    var wp = typeof tmp.weapons === "undefined" ? [] : tmp.weapons;
    var i = 0;
    for (i=0; i<wp.length;i++) {
    	this.weapons.push(new FTS.Weapon(wp[i]));    	
    }

    if( typeof tmp.screen !== "undefined" ) { this.screen = tmp.screen; }
    if( typeof tmp.armor !== "undefined" ) { this.maxArmor = tmp.armor; }
    this.armor = this.maxArmor;
    if( typeof tmp.damage !== "undefined" ) { this.maxDamage = tmp.damage; }
    this.damage = this.maxDamage;

    //onEnter Function name
    if( typeof tmp.onEnter !== "undefined" ) { this.onEnter = tmp.onEnter; }
    //onDestroy Function name
    if( typeof tmp.onDestroy !== "undefined" ) { this.onDestroy = tmp.onDestroy; }
    //onDamage Function name
    if( typeof tmp.onDamage !== "undefined" ) { this.onDamage = tmp.onDamage; }
    //onFlee Function name
    if( typeof tmp.onFlee !== "undefined" ) { this.onEnter = tmp.onFlee; }
}

FTS.Ship.prototype.player = function () {
    return ftsDB[this._player];
}
FTS.Ship.prototype.FCSShots = function () {
	return this.fcs - this.usedFCS;
}
FTS.Ship.prototype.PDSShots = function () {
	return this.pds - this.usedPDS;
}

FTS.Ship.prototype.takeDamage = function (n) {
	if(this.armor>0) {
		if(this.armor>n) { this.armor-=n; n=0; }
		else { n-=this.armor; this.armor=0; }
	}
	if(this.damage[0]>0 && n>0) {
		this.rSet[5].show();
		if(this.damage[0]>n) { this.damage[0]-=n; n=0; }
		else { n-=this.damage[0]; this.damage[0]=0; }
	}
	if(this.damage[1]>0 && n>0) {
		this.rSet[5].attr({fill:"yellow"});
		if(this.damage[1]>n) { this.damage[1]-=n; n=0; }
		else { n-=this.damage[0]; this.damage[1]=0; }
	}
	if(this.damage[2]>0 && n>0) {
		this.rSet[5].attr({fill:"orange"});
		if(this.damage[2]>n) { this.damage[2]-=n; n=0; }
		else { n-=this.damage[2]; this.damage[2]=0; }
	}
	if(this.damage[3]>0 && n>0) {
		this.rSet[5].attr({fill:"red"});
		if(this.damage[3]>n) { this.damage[3]-=n; n=0; }
		else { n-=this.damage[3]; this.damage[3]=0; this.destroy(); }
	}

}

FTS.Ship.prototype.destroy = function () {
	this.active = -1;
	this.rSet[5].attr({fill:"black"});
	this.rSet[4].hide();
	if(ftsTarget != null) { if(ftsTarget.uid == this.uid ) { ftsTarget=null; } }
	//TODO this.onDestroy
	this.player().destroyUnit(this);
}

FTS.Ship.prototype.fled = function () {}

FTS.Ship.prototype.makeArc = function (id) {
	this.rSet[3].remove(); 
	
	var wp=this.weapons[id], p = FTS.relPosition(this.x,this.y);
	var adj=90-this.bearing*30;

	var arcs=rSVG.set();

	function arcConstruct(r) {
		if(wp.arc.test("1")) { arcs.push(rSVG.path(genWedgeString(p.x,p.y,-30-adj,30-adj,r)).attr({fill:"green","fill-opacity":"0.3"})); }
		if(wp.arc.test("2")) { arcs.push(rSVG.path(genWedgeString(p.x,p.y,30-adj,90-adj,r)).attr({fill:"green","fill-opacity":"0.3"})); }
		if(wp.arc.test("3")) { arcs.push(rSVG.path(genWedgeString(p.x,p.y,90-adj,150-adj,r)).attr({fill:"green","fill-opacity":"0.3"})); }
		if(wp.arc.test("4")) { arcs.push(rSVG.path(genWedgeString(p.x,p.y,150-adj,210-adj,r)).attr({fill:"green","fill-opacity":"0.3"})); }
		if(wp.arc.test("5")) { arcs.push(rSVG.path(genWedgeString(p.x,p.y,210-adj,270-adj,r)).attr({fill:"green","fill-opacity":"0.3"})); }
		if(wp.arc.test("6")) { arcs.push(rSVG.path(genWedgeString(p.x,p.y,270-adj,330-adj,r)).attr({fill:"green","fill-opacity":"0.3"})); }
	}

	if(wp.type=="Beam") {
		for(var i=0;i<wp.class;i++) {
			arcConstruct(12*(i+1)*ftsData.inch);
		}
	}
	else if(wp.type=="PT") { arcConstruct(30*ftsData.inch); }
	else if(wp.type=="Needle") { arcConstruct(12*ftsData.inch); }
	else if(wp.type=="SML") { arcConstruct(24*ftsData.inch); }
	else if(wp.type=="MTL") { arcConstruct(18*ftsData.inch); }
	else { arcConstruct(12*ftsData.inch); }

	this.rSet[3] = arcs;
	this.rSet[3].toBack();	
		
}

FTS.Ship.prototype.Move = function () {
    var R=this.pendingMove[0], T=this.pendingMove[1];
    this.velocity+=T;
    if(this.velocity<0) { this.velocity=0; }
    
    var RA=0, RB=0, TA=0, TB=0, ship=this, rSet=this.rSet;
    if(Math.abs(R)>1) {
        RA=Math.floor(R/2);
        RB=R-RA;

        TA=Math.floor(this.velocity/2);
        TB=this.velocity-TA;
    }
    else {
        RA=R;
        TA=this.velocity;
    }
    
	function Move(nR,nT) {
        ship.bearing += nR;
        if(ship.bearing<0) {ship.bearing+=12;}
        if(ship.bearing>11) {ship.bearing-=12;}
   
        var nx=Math.floor(ftsBearings[ship.bearing].x*nT*ftsData.inch), ny=Math.floor(ftsBearings[ship.bearing].y*nT*ftsData.inch); 
        ship.x+=nx;
        ship.y+=ny;
    }

	var tstring="...r"+RA*30+"t0,-"+TA*ftsData.inch;
	Move(RA,TA);
	if(RB!=0) { tstring+="r"+RB*30+"t0,-"+TB*ftsData.inch; Move(RB,TB); }
	this.rSet.animate({transform:tstring},750,"linear");
	ship.pendingMove = [0,0];
    
    this.moved = true;
}
FTS.Ship.prototype.playerTarget = function (ship) {
	$("#ftsTarget").remove();
	for(var x in ftsDB) {
		if(x==this.uid) { continue; }
   		if(ftsDB[x].type == "Ship") { ftsDB[x].rSet[4].hide(); }			
	}
	if(ftsTarget != null) {
		if(ftsTarget.uid==ship.uid) {
			ftsTarget = null;
			$(".available").removeClass("available");
			$(".selected").removeClass("selected");
			return;
		}
	}
	ship.rSet[4].show();

	var theta = Math.atan2(ship.y - this.y, ship.x - this.x) * 180 / Math.PI;
	var adjt = 90-theta;
	if(adjt<0) { adjt+=360; }
	var adjb = adjt-this.bearing*30;
	if (adjb<0) { adjb+=360; }

	console.log(this);
	console.log(ship);
//	console.log(theta);
//	console.log(adjt);
	console.log(adjb);

	//determine the arc the target is in
	var arc="", arcn=-1;
	if(adjb>= 330 || adjb<= 30) { arc = "F"; arcn=1; }
	else if(adjb< 90) { arc = "FS"; arcn=2; }
	else if(adjb< 150) { arc = "AS"; arcn=3; }
	else if(adjb< 210) { arc = "A"; arcn=4; }
	else if(adjb< 270) { arc = "AP"; arcn=5; }
	else if(adjb< 330) { arc = "FP"; arcn=6; }
	console.log(arc);
	
	//remove all available weapons, the list is built below
	$(".available").removeClass("available");

	var T=ship, D=Distance([this.x,this.y],[T.x,T.y]);
	D=D/ftsData.inch;
	for(var i=0;i<this.weapons.length;i++) {
		if(this.weapons[i].arc.test(arcn) && D<this.weapons[i].maxRange) {
			$(".weapon[data-id='"+i+"']").addClass("available");
		}
	}

	//update the ftsTarget global
	ftsTarget=ship;
	//provide minimal target information
	$("#pOptions").append('<div id=ftsTarget><h4 class="center fts">Target</h4><div class="target center">Player '+ship.player().name+' '+ship.class+'</div></div>');
	//if it is the fire phase add the button
	if(ftsPhases[ftsCPhase] == "Ships Fire") {
		$("#ftsTarget").append('<div class="buttons center"><button id=bFire disabled>Fire</button></div>');
	}

}
FTS.Ship.prototype.Fire = function (id) {
	if(this.usedFCS == this.fcs) { 
		var n = noty({type:'error', text: "You have used all of your shots!"});
		return; 
	}
	this.usedFCS++;
	$("#shipFCS").html("FCS Shots: "+this.FCSShots());

	var T=ftsTarget, wp=this.weapons[id], N=0, dmg=0, i=0;
	var D=Distance([this.x,this.y],[T.x,T.y]);
	D=D/ftsData.inch;

	function beamDamage(screen) {
		var R=cpxRNG.rndInt(1,6);
		if(screen == 0) {
			if(R==6) { dmg+=2; beamDamage(0); }
			else if(R>=4) { dmg++; }
		}
		else if (screen == 1) {
			if(R==6) { dmg+=2; beamDamage(0); }
			else if(R==5) { dmg++; }
		}
		else {
			if(R==6) { dmg++; beamDamage(0); }
			else if(R==5) { dmg++; }
		}
	}

	function pulseTDamage(range) {
		var n=0, R= cpxRNG.rndInt(1,6);
		if(range <= 6) { if(R>=2){n++;} }
		else if(range <= 12) { if(R>=3){n++;} }
		else if(range <= 18) { if(R>=4){n++;} }
		else if(range <= 24) { if(R>=5){n++;} }
		else if(range <= 30) { if(R>=6){n++;} }

		if(n==1) { dmg = cpxRNG.rndInt(1,6); }
	}

	function needleDamage() {
		var R= cpxRNG.rndInt(1,6);
		if(R == 5) { dmg = 1; return false; }
		else if(R == 6) { dmg = 1; return true; }
	}

	function salvoDamage(n) {
		dmg = cpxRNG.multiRoll(1,6,n);
	}

	function submunitionDamage() {
		var R=cpxRNG.rndInt(1,6);
		if(R==6) { dmg+=2; submunitionDamage(); }
		else if(R>=4) { dmg++; }
	}

	function missileDamage(n) {
		dmg = cpxRNG.multiRoll(1,6,n);
	}

	function pointDefense() {
		var R=cpxRNG.rndInt(1,6);
		if(R==6) { kill+=2; pointDefense(); }
		else if(R>=4) { kill++; }
	}

	if (wp.type=="Beam") {
		var bD= D/12;
		N=Math.ceil(wp.class-bD);
		for (i=0;i<N;i++) { beamDamage(T.screen); }
	}
	else if (wp.type=="Needle") { needleDamage(); }
	else if (wp.type=="PT") { pulseTDamage(D); }
	else if (wp.type=="SUB") {}
	else if (wp.type=="SML") {}
	else if (wp.type=="MT") {}

	console.log(dmg);
	if(dmg > 0){ 
		var n = noty({type:'success', text: "Success! You hit!"});
		T.takeDamage(dmg);
	}

	if(this.FCSShots()==0) { this.player().nextCombatant(); }

}
FTS.Ship.prototype.missileCheck = function () {
	var m=false;
	for(var i =0;i<this.weapons.length;i++) {
		if(this.weapons[i].type == "SML" || this.weapons[i].type == "MTL") {
			if(this.weapons[i].ammo>0) {m=true;}
		}
	}
	return m;
}
FTS.Ship.prototype.fireMissile = function (id) {
	var wp=this.weapons[id];
	wp.ammo--;
	var nM=new FTS.Missile(this.player(),this);
	this.parent().units.push(nM.uid);
}
FTS.Ship.prototype.combatData = function () {
	var html = '<h4 class="center fts">'+this.name+"</h4><div class='shipClass center shipInfo'>"+this.class+"</div>";
	html+="<div id=shipFCS class='center shipInfo'>FCS Shots: <span id=nFCS>"+this.FCSShots()+"</span></div>";

	var i=0, wp="weapon";
	html+="<div class=shipInfo>"
	for (i=0;i<this.weapons.length;i++) {
		if(!this.weapons[i].visisble) {continue;}
		if(!this.weapons[i].weapon) {wp="defense";}
		html+= '<div class='+wp+' arc='+this.weapons[i].arc+' type='+this.weapons[i].type+' data-id='+i+'>'+this.weapons[i].name + '</div>';	
	}
	html+='</div>';
	
	if(this.pds>0) {
		html+="<div id=shipPDS class='center shipInfo'>"; 
		if(this.adfc) {html+= "<div>ADFC</div>";}
		html+="<div>PDS Shots: <span id=nPDS>"+this.PDSShots()+"</span></div></div>"; 
	}
	
	return html;

}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


$(document).on("click", "#bFinishTurn", function(){
    ftsActivePlayers[ftsAP].nextPlayer();
});

$(document).on("click", "#bFire", function(){
	ftsSelected.Fire($(".weapon.selected").attr("data-id"));
});

$(document).on("click", ".weapon", function(){
	if($(this).hasClass("selected")) {
		$(".selected").removeClass("selected");	
		FTS.removeArcs();
	}
	else {
		$(".selected").removeClass("selected");
		$(this).toggleClass("selected");	
		var id = $(this).attr("data-id");
		ftsSelected.makeArc(id);
		$("#bFire").prop('disabled', false);
	}
    

	

/*	//check if is the missile launch phase and if the ship has missiles if so add button
	if(ftsPhases[ftsCPhase] == "Launch Missiles" && ftsSelected.missileCheck()) {
		$("#ftsTarget").append('<div class="buttons center"><button id=bFire disabled>Fire</button></div>');
	}
	*/
});

$(document).on("click", ".bMove", function(){
    var ship=ftsSelected;
    if(!ship) { return; }
    var R=ship.pendingMove[0], T=ship.pendingMove[1];

    var M=$(this).attr("data-M");
    if(!FTS.thrustCheck(ship,R,T,M)) { return; }

    if(M == "R-") { ship.pendingMove[0]--; }
    else if(M == "R+") { ship.pendingMove[0]++; }
    else if(M == "T+") { ship.pendingMove[1]++; }
    else if(M == "T-") { ship.pendingMove[1]--; }
    
    $("#cOrders").empty();
    $("#cOrders").append('V: '+ship.velocity+' R: '+ship.pendingMove[0]+' T: '+ship.pendingMove[1]);
});
