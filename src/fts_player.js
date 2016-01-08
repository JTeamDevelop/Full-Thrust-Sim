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
    this.act="";

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

	$("#mLeftContent").append('<div class="center buttons fts"><button id=bNextPlayer>Next Player</button></div>');
    $("#mLeftContent").append('<div class="center buttons fts"><button id=bFinishPhase>Finish Phase</button></div>');
}
FTS.Player.prototype.nextPlayer = function () {
	//advance the player number 
	ftsAP++; 

	//go through the ships and remove the displayed arcs
	FTS.removeArcs();

	//continue to switch back and forth between players until the finish phase is selected
	if(ftsAP == ftsActivePlayers.length) { ftsAP = 0; }	
	
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
