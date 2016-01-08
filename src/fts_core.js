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
ftsPhases=["Movement Orders","Move Fighters","Launch Missiles","Move Ships","Allocate Missile & Fighter Attack","Point Defense Fire","Missile & Fighter Attack","Ships Fire"];//ftsPhases=["Movement Orders","Move Fighters","Launch Missiles","Move Ships","Allocate Missile & Fighter Attack","Point Defense Fire","Missile & Fighter Attack","Ships Fire"]
ftsData.weaponUse=["Movement Orders","Launch Missiles","Ships Fire"];

ftsData.missiles=["SML","MTL","MTR","SMR"];

ftsTurn = 0;
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
FTS.relPosition = function (x,y) {
	var cx=ftsData.w/2, cy=ftsData.h/2;
	
	return {x:cx+x,y:cy-y}
}

FTS.thrustCheck = function (ship,R,T,M) {
    if(M == "R-") { R--; }
    else if(M == "R+") { R++; }
    else if(M == "T+") { T++; }
    else if(M == "T-") { T--; }

    if(ship.type=="Missile") {
    	if(Math.abs(R) > 2) {
	        var n = noty({type:'warning', text: "You cannot change a missile's bearing by more than 2."});
        	return false;
    	}
    	if(T>18) {
			var n = noty({type:'warning', text: "A missile's maximum thrust is 18."});
        	return false;
    	}	
    }
    else {
     
    	if(Math.abs(R) > Math.floor(ship.thrust/2)) {
        	var n = noty({type:'warning', text: "You cannot change your bearing by more than half the ship's Thrust."});
        	return false;
    	}

    	if( Math.abs(R)+Math.abs(T) > ship.thrust ) {
        	var n = noty({type:'warning', text: "You have already alloted all of the ship's Thrust."});
        	return false;
    	}
    }

    return true;
}

FTS.removeArcs = function () {
   for(var x in ftsDB) {
   		if(ftsDB[x].type == "Ship" || ftsDB[x].type == "Missile") { ftsDB[x].removeArc(); }			
	}
}

FTS.removeSelectionIcon = function () {
	for(var x in ftsDB) {
		if(ftsDB[x].type == "Ship" || ftsDB[x].type == "Missile") {
			ftsDB[x].rSet[0].hide();
			ftsDB[x].rSet[4].hide();
			ftsDB[x].selected = false;
		}			
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FTS.selectShip = function () {
   var AP = ftsActivePlayers[ftsAP], ship = this.data("o");	
   console.log(ship);
   if(ship.active <0) {return;}	

	FTS.removeArcs();

	function selectedUpdate () {
		$("#uActive").empty();
		$("#pOptions").empty();
		
		FTS.removeSelectionIcon();

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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

FTS.selectMissile = function () {
   var AP = ftsActivePlayers[ftsAP], msl = this.data("o");	
   FTS.removeArcs();
   FTS.removeSelectionIcon();
   	$("#uActive").empty();
	$("#pOptions").empty();

	if(ftsSelected == null) {
		console.log(msl);
		msl.rSet[0].show();
		if(!msl.moved){
			msl.makeArc();
		}

		ftsSelected = msl

		if(ftsPhases[ftsCPhase] == "Launch Missiles") { 
			if(!msl.moved && msl.class=="MT") { FTS.displayMoveOptions(msl); }
		}
	}
	else {
		msl.rSet[0].hide();
		ftsSelected = null;
	}
   

}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FTS.moveSalvo = function (e) {
	var posx = e.pageX - $(document).scrollLeft() - $('#ftscanvas').offset().left;
	var posy = e.pageY - $(document).scrollTop() - $('#ftscanvas').offset().top;
//	var nx= posx-ftsData.w/2, ny=ftsData.h/2-posy;
	ftsSelected.moveSalvo(posx,posy);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

FTS.displayMoveOptions = function (ship) {
     $("#pOptions").empty();
     
    var html = '<div class=center><h4 class=fts>Movement Orders</h4><img class="bMove" src="images/anticlockwise-rotation.png" data-M="R-"/>';
    html+='<img class="bMove" src="images/clockwise-rotation.png" data-M="R+"/><img class="bMove" src="images/thrust.png" data-M="T+"/>';
    html+='<img class="bMove" src="images/reverse.png" data-M="T-"/>'
    html+='<div id=cOrders data-R=0 data-T=0 /></div>';

	var vel ="";
	if(ship.type == "Ship") { vel= 'V: '+ship.velocity;}
    $("#pOptions").append(html);
    $("#cOrders").append(vel+' R: '+ship.pendingMove[0]+' T: '+ship.pendingMove[1]);

	if(ship.type == "Missile") {
    	$("#pOptions").append('<div class="center buttons fts"><button id=bMoveMissile>Move Missile</button></div>');
	}
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

//change the phase - no matter if players are finished or not
FTS.nextPhase = function () { 
	//reset the current player to 0 in initiative
	ftsAP = 0; 

	//advance the phase
	ftsCPhase++;
		
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

	//if the phase is greater than the last phase, start a new round
	if (ftsCPhase>=ftsPhases.length) { 
		FTS.newRound(); 
	}
	else { 
		ftsActivePlayers[ftsAP].activePlayer();
	}
}

FTS.newRound = function () {
	ftsTurn++;
	ftsCPhase=0;
	for(var x in ftsDB) {
   		if(ftsDB[x].type == "Ship") { 
   			ftsDB[x].usedFCS = 0; 
   			ftsDB[x].usedPDS = 0; 
   		}			
   		if(ftsDB[x].type == "Missile") { 
   			ftsDB[x].endurance--; 
   			if( ftsDB[x].endurance == 0 ) { ftsDB[x].Destroy(); }
   		}
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


$(document).on("click", "#bFinishPhase", function(){
	FTS.nextPhase();
});
$(document).on("click", "#bNextPlayer", function(){
	ftsActivePlayers[ftsAP].nextPlayer();
});

$(document).on("click", "#bFire", function(){
	if(ftsPhases[ftsCPhase]=="Launch Missiles") { 
		ftsSelected.fireMissile($(".weapon.selected").attr("data-id")); 
	}
	else { 
		ftsSelected.Fire($(".weapon.selected").attr("data-id")); 
	}
});

$(document).on("click", "#bMoveMissile", function(){
	var T=ftsSelected.pendingMove[1];
	if(T<1) { 
		var n = noty({type:'warning', text: "A missile must move during the missile phase."});
	}
	else { ftsSelected.Move(); }
});

$(document).on("click", ".weapon", function(){
	//if it isn't a phase where the weapon arcs will be useful don't do anything
	if(!ftsData.weaponUse.test(ftsPhases[ftsCPhase])) { return; }

	if($(this).hasClass("selected")) {
		$(".selected").removeClass("selected");	
		ftsSelected.removeArc();
		$("#bFire").parent().remove();
	}
	else {
		var type = $(this).attr("type");
		$(".selected").removeClass("selected");
		
		if(ftsPhases[ftsCPhase]=="Launch Missiles") {
			$(".available").removeClass("available");
			//only select missiles during missile phase
			if(ftsData.missiles.test(type)) { 
				$(this).toggleClass("selected");
				$(this).addClass("available");	
				var id = $(this).attr("data-id");
				ftsSelected.makeArc(id);

				if(ftsSelected.missileCheck()) { 
					$("#pOptions").empty();
					$("#pOptions").append('<div class="buttons center"><button id=bFire>Fire Missile</button></div>');
				}
			}
			else { 
				//if it isn't a missile remove the arc and clear the button
				ftsSelected.removeArc(); 
				$("#pOptions").empty();
			}	
		}
		else if (ftsPhases[ftsCPhase]=="Movement Orders") {
			//see everything during movment to give  a clear idea 
			$(this).toggleClass("selected");	
			var id = $(this).attr("data-id");
			ftsSelected.makeArc(id);
		}
		else {
			//only select non-missiles during other phases
			if(!ftsData.missiles.test(type)) { 
				$(this).toggleClass("selected");	
				var id = $(this).attr("data-id");
				ftsSelected.makeArc(id);
			}
		}	
	}
    
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
    
	var vel ="";
	if(ship.type == "Ship") { vel= 'V: '+ship.velocity;}
	$("#cOrders").empty();
    $("#cOrders").append(vel+' R: '+ship.pendingMove[0]+' T: '+ship.pendingMove[1]);
});
