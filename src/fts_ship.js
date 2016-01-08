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
		this.arc = wp.slice(4);
		this.maxRange = 24;
		this.ammo=Number(wp[3]);
	}
	else if (wp.test("SUB")) { 
		this.name= "Submuition Pack";
		this.type="SUB";
		this.arc = wp.slice(3);
		this.maxRange = 18;
		this.ammo=1;
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
    	this.x = typeof opts.x === "undefined" ? cpxRNG.rndInt(400,600) : opts.x;
    	this.y = typeof opts.y === "undefined" ? cpxRNG.rndInt(250,450) : opts.y;
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
	this.rSet= rSVG.set();
	//0 Ship selected circle
	this.rSet.push(rSVG.circle(this.x, this.y, dMax*1.3));
	//1 Ship player marker - circle
	this.rSet.push(rSVG.circle(this.x, this.y+dMax, 4));
	//2 Ship image
	this.rSet.push(rSVG.image("images/"+this.image, this.x-this.w/2, this.y-this.h/2, this.w, this.h));
	//3 Circle - to be replaced weapon arcs
	this.rSet.push(rSVG.circle(this.x, this.y, dMax*1.3));
	//4 target circle - red
	this.rSet.push(rSVG.circle(this.x, this.y, dMax*1.3).attr({"stroke":"red"}));
	//5 damage token
	this.rSet.push(rSVG.path(regularPolygon(this.x, this.y-dMax, 5, 3).path).attr({"fill":"green"}));
	
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
			p = WithinCircle(900,350,100);
			this.x=p[0];
			this.y=p[1];
			this.bearing = cpxRNG.rndInt(8,10);
		}
		else if(start[1][0]=="left") {
			p = WithinCircle(100,350,100);
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Arc Display

FTS.Ship.prototype.makeArc = function (id) {
	this.rSet[3].remove(); 
	
	var wp=this.weapons[id], p = [this.x,this.y];
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Remove arc display
FTS.Ship.prototype.removeArc = function () { 
	this.rSet[3].remove(); 
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Fire weapons
FTS.Ship.prototype.Fire = function (id) {
	if(this.usedFCS == this.fcs) { 
		var n = noty({type:'error', text: "You have used all of your shots!"});
		return; 
	}
	//Update that this ship has used its FCS and tell the player it has acted
	this.usedFCS++;
	this.player().act=this.uid;
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

	if(this.FCSShots()==0) { this.player().nextPlayer(); }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Misisle functions

// Fire missiles
FTS.Ship.prototype.fireMissile = function (id) {
	var wp=this.weapons[id];
	
	//Update tell the player the ship has it has acted
	this.player().act=this.uid;

	//update ammo amount and display info
	wp.ammo--;
	$(".weapon[data-id='"+id+"']").children(".mslShots").html(wp.ammo);
	
	var nM=new FTS.Missile(id,this.player(),this,wp.type);
	this.player().units.push(nM.uid);
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Left Hand Display 

FTS.Ship.prototype.combatData = function () {
	var html = '<h4 class="center fts">'+this.name+"</h4><div class='shipClass center shipInfo'>"+this.class+"</div>";
	html+="<div id=shipFCS class='center shipInfo'>FCS Shots: <span id=nFCS>"+this.FCSShots()+"</span></div>";

	var i=0, wp="weapon", msl="";
	html+="<div class=shipInfo>"
	for (i=0;i<this.weapons.length;i++) {
		if(!this.weapons[i].visisble) {continue;}
		if(!this.weapons[i].weapon) {wp="defense";}
		
		if(ftsData.missiles.test(this.weapons[i].type)) {msl=", Shots: <span class=mslShots>"+this.weapons[i].ammo+"</span>";}
		else { msl=""; }
		
		html+= '<div class='+wp+' arc='+this.weapons[i].arc+' type='+this.weapons[i].type+' data-id='+i+'>'+this.weapons[i].name + msl+'</div>';	
	}
	html+='</div>';
	
	if(this.pds>0) {
		html+="<div id=shipPDS class='center shipInfo'>"; 
		if(this.adfc) {html+= "<div>ADFC</div>";}
		html+="<div>PDS Shots: <span id=nPDS>"+this.PDSShots()+"</span></div></div>"; 
	}
	
	return html;

}


