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


FTS.Missile = function (wid,player,ship,type) {
	this.uid = makeUID(24);
	this.wid=wid;
    this._player = player.uid;
    this._ship=ship.uid;
    this.selected = false;
    this.type = "Missile"; 

    if(type.test("MT")) { 
    	this.class = "MT"; 
    	this.endurance = 3;
    }
    if(type.test("SM")) { 
    	this.class = "SM"; 
    	this.endurance = 1;
    }
    
    this.active = 1;

    this.pendingMove = [0,0];
    this.moved=false;
    this.target={};
    
    //raphael coords
    p = FTS.relPosition(ship.x,ship.y);
   	this.x = p.x;
   	this.y = p.y;
   	this.bearing = ship.bearing; 
   	bearing = this.bearing*30;
   	
	this.image = "rocket.png"; 
	this.w = 15;
	this.h = 15;
	var dMax = 15;

	//sets up raphael display of ship
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
	//3 Circle - to be replaced range arcs
	this.rSet.push(rSVG.circle(p.x, p.y, dMax*1.3));
	this.rSet[3].hide();
	//4 target circle - red
	this.rSet.push(rSVG.circle(p.x, p.y, dMax*1.3).attr({"stroke":"red"}));
	this.rSet[4].hide();
	
	this.rSet.transform("...r"+bearing);

	this.rSet.click(FTS.selectMissile);
       
    ftsDB[this.uid]=this;

    this.pendingMove = [0,1];
    this.Move();
    this.moved = false;
}
FTS.Missile.prototype.Destroy = function () {
	this.active = -1;
	this.rSet.empty();
	//TODO this.onDestroy
	this.player().destroyUnit(this);
	delete ftsDB[this.uid];
}
FTS.Missile.prototype.moveSalvo = function (x,y) {
	var dx= x - this.x, dy = y - this.y;
	this.rSet.transform("...T0,"+dy+"T"+dx+",0");
	this.x = x;
	this.y = y;
}
FTS.Missile.prototype.Move = function () {
    var R=this.pendingMove[0], T=this.pendingMove[1];
    
    var RA=0, RB=0, TA=0, TB=0, msl=this, rSet=this.rSet;
    if(Math.abs(R)>0) {
        RA=0;
        RB=R;

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
	if(RB!=0) { 
		tstring+="r"+RB*30+"t0,-"+TB*ftsData.inch; 
		Move(RB,TB); 
	}
	this.rSet.animate({transform:tstring},750,"linear");
	this.pendingMove = [0,0];
    
    //remove extra information and GUIs that shouldn't be used any more
	this.removeArc();
	$("#uActive").empty();
	$("#pOptions").empty();
    
    this.moved = true;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Arc Display

FTS.Missile.prototype.makeArc = function (id) {
	var adj=90-this.bearing*30;
	var arcs=rSVG.set(), msl=this;
	
	function arcConstruct(r) {
		arcs.push(rSVG.path(genWedgeString(msl.x,msl.y,-60-adj,60-adj,r)).attr({fill:"green","fill-opacity":"0.3"})); 
	}

	if(this.class=="MT") { 
		this.rSet[3].remove(); 
		arcConstruct(18*ftsData.inch); 

		this.rSet[3] = arcs;
		this.rSet[3].toBack();	
	}
	else {
		var ship=ftsDB[this._ship];
		ship.removeArc();
		ship.makeArc(this.wid);
		ship.rSet[3].click(FTS.moveSalvo);
	}
	
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Remove arc display
FTS.Missile.prototype.removeArc = function () { 
	this.rSet[3].remove(); 
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


