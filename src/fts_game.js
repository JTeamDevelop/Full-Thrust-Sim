/*

    A Full Thust Simulator
    Copyright (C) 2015  JTeam

    This is free because the grace of God is free through His son Jesus. 

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

ftsData.ships.Scout = {id:"Scout", class:"Scout", image:"jet-fighter.png",
	thrust:4, fcs:1, 
	weapons:["B1All"],
	damage:[1,1]
};
ftsData.ships.Corvette = {id:"Corvette", class:"Corvette", image:"jet-fighter.png",
	thrust:6, armor:1, fcs:1, pds:1,
	weapons:["B1All","B1All"],
	damage:[1,1]
};
ftsData.ships.Destroyer = {id:"Destroyer", class:"Destroyer", image:"jet-fighter.png",
	thrust:6, fcs:1, pds:2,
	weapons:["B2165","B2123","B1All","B1All"],
	damage:[3,2,2,2]
};
ftsData.ships.EsCruiser = {id:"EsCruiser", class:"Escort Cruiser", image:"jet-fighter.png",
	thrust:4, screen:1, armor:3, fcs:2, pds:3, adfc: true, 
	weapons:["B31","B2165","B2123","B1All","PT1"],
	damage:[5,5,5,4]
};
ftsData.ships.MslCruiser = {id:"MslCruiser", class:"Missile Cruiser", image:"jet-fighter.png",
	thrust:4, screen:1, armor:3, fcs:2, pds:3, adfc: true,  
	weapons:["MTL3612","B2165","B2123","B1All","SML3612"],
	damage:[5,5,5,4]
};
ftsData.ships.LtCarrier = {id:"LtCarrier", class:"Light Carrier", image:"jet-fighter.png",
	thrust:4, screen:2, armor:9, fcs:2, pds:4,
	weapons:["B2All","B1All","B1All"],
	fighters:["FT","FT","FT","FT"],
	damage:[7,7,7,7]
};
ftsData.ships.Nashville = {id:"Nashville", name:"Nashville", template:"LtCarrier"};

ftsData.scenarios.Start = {id:"Start", players:{
	"One":{name:"One", opts:{}, 
		ships:["Nashville","EsCruiser","EsCruiser","Corvette","Corvette"],
		hostility:{"Two":1},
		start:["window",["left"]]
	},
	"Two":{name:"Two",opts:{}, 
		ships:["MslCruiser","EsCruiser","EsCruiser","Destroyer","Destroyer"],
		hostility:{"One":1},
		start:["window",["right"]]
	}
	}
};

$(window).load(function(){

    $("#mLeftContent").show();
    FTS.Scenario.Load("Start");

});
