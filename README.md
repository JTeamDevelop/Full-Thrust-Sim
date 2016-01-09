# Full-Thrust-Sim
A JavaScript simulation of the Full Thrust tabletop spaceship war game. 

<em>This is free because the grace of God is free through His son Jesus.</em>

The Full Thrust Sim is a program meant to simulate the tabletop play of the Full Thrust spaceship wargame from Ground Zero Games. The rules used are based upon Full Thrust and we have tried to stay true the rules as outlined it the core book and two supplements.
If you like spaceships, lasers, swarms of fighters and space combat this could be for you!   

It is written solely in HTML and Javascript. For those of you who dabble it leverages JQuery and Raphael JS for graphics display. We believe the graphics are simple but effective. We could have used other graphics libraries, but our goal was to have players use FTS without having to run a personal server on their machine. Players can simply download the files, click on the HTML and play. 

Our goal was also to make it easily modified. We want players to be able to add their own ships, scenarios, etc. Currently this can be done by modifying JSON data – which can quickly be done with any text editor. Look at the roadmap for the plans for plans to improve this.

We recognize we need graphics – all off the ships currently use the same image. We are coders, not graphics artists. But we’re looking for more art. Optimally we’ll get generic images for every class of ship. The images will either be SVG or PNG (256x256) oriented with their noses pointed north.  

What works:
-	Hot seat play 
-	Defining ships via JSON
-	Defining simple scenarios via JSON
-	Ship movement – classic movement only (vector movement option to follow)
-	Basic weapon firing: Beams, Pulse Torpedoes, Needle Beams (damage only)
-	Ship damage – above weapons only 

Roadmap to 1.0:
-	Adding fighters
-	Adding missiles
-	Adding PDS capability
-	Adding scripted events: onDestroy, onEnter, onDamage, etc

Roadmap to 2.0:
-	Adding vector movement option
-	Adding AI for computer opponents

Roadmap to 3.0:
-	Adding network play
-	Adding easy GUI interface for building ships and scenarios

Full Thrust is owned by Ground Zero Games and the JTeam claims no rights to it. This is a fan made work designed to emulate tabletop play.  Please go to http://www.groundzerogames.co.uk/ for a pdf copy of the rules. 
