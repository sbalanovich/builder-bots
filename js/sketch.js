/* TO DO
	- function for destroying truss, start over
	- boundaries
	- high scores
*/

var nodes = [];
var edges = [];
var agents = [];
var agentSprites;

var numAgents = 12;
var modo = 5;
var maxStress = 0.5;

var width = window.innerWidth;
var height = window.innerHeight;
var sl = Math.min(width,height) / 15;

var span = sl*5;
var startup = true, gameWon = false, gameLost = false;

var background, right, left;
var bot0, bot1, bot2;

var backgroundImg, rightImg, leftImg, bot0Img, bot1Img, bot2Img;
var button0, button1, button2;
var CB = 0;

var ground = (height/2) + span;
var pointA = [(width/2) - span, ground];
var pointB = [(width/2) + span, (height/2) - span];

// the preload function is prioritized by the p5 library, used for loading images
// used for icons, background imagery
function preload(){
  	loadImage("assets/background.png",
        function (pic) { print(backgroundImg = pic)/* redraw();*/ },
        loadImageErrorOverride);
  	rightImg = loadImage("assets/right.png",
        function (pic) { print(rightImg = pic) /*redraw();*/ },
        loadImageErrorOverride);
  	leftImg = loadImage("assets/left.png",
        function (pic) { print(leftImg = pic) /*redraw();*/ },
        loadImageErrorOverride);

	bot0Img = loadImage("assets/bot0.png",
    	function (pic) { /*print(bot0Img = pic),*/ /*redraw(); */},
    	loadImageErrorOverride);
	bot1Img = loadImage("assets/bot1.png",
        function (pic) { /*print(bot1Img = pic),*/ /*redraw();*/ },
        loadImageErrorOverride);
	bot2Img = loadImage("assets/bot2.png",
        function (pic) { /*print(bot2Img = pic),*/ /*redraw();*/ },
        loadImageErrorOverride);
}

function setup() {

	createCanvas(windowWidth, windowHeight);
	frameRate(30);

    updateSprites(false);
}


function draw() {

	if (startup) {
		noLoop();
		background(0);
		fill(100);
		inputAgents = createInput();
  		inputAgents.position(width/2 - 290, 150);
  		inputSpeed = createInput();
  		inputSpeed.position(width/2 - 90, 150);
  		inputStress = createInput();
  		inputStress.position(width/2 + 110, 150);

  		color(100);
		rect(width/2 - 40, height/2 -20, 80, 40);

  		fill(255);
	    textAlign(CENTER);
	    textSize(16);
	    text("BEGIN", width/2, height/2+5);

	    text("Number of bots:", width/2 - 235, 140);
	    text("Allowable force (0-1): ", width/2 - 10, 140);
	    text("Speed (1-10): ", width/2 + 162, 140);

	    text("Instructions:", width/2, height/2 + 50);
  		text("Set parameters and click begin. You will then see a swarm of builder bots begin", width/2, height/2 + 80); 
  		text("to emerge from the start point. The objective of the game is to get to the target point", width/2, height/2 + 110); 
  		text("before your structure collapses.", width/2, height/2 + 140);
		
	}
	else if (gameWon){
		background(0);
		fill(255);
	    textAlign(CENTER);
	    textSize(16);
	    text("YOU WIN!", width/2, height/2);
	}
	else if (gameLost){
		background(0);
		fill(255);
	    textAlign(CENTER);
	    textSize(16);
	    text("YOU LOSE!", width/2, height/2);
	}
	else{
		background(backgroundImg);
		image(leftImg, pointA[0]-span-sl*3, pointA[1]-sl*2);
		image(rightImg, pointB[0]-sl*5, pointB[1]-sl*3);

		var stop = 30000; 
		
		if (frameCount % modo == 0 && frameCount < stop) {
			tr.step();
			//console.log("step");
		} 

		if (frameCount < stop){
			tr.move();
		}

		// render the edges, nodes and agents, in order of render depth
		for (var i = 0, length = edges.length; i < length; i++) {
			edges[i].render();		
		}

		for (var i = 0, length = nodes.length; i < length; i++) {
			nodes[i].render();		
		}

		for (var i = 0, length = agents.length; i < length; i++) {
			agents[i].render();		
		}

		ellipse(pointA[0], pointA[1], 10, 10);
		ellipse(pointB[0], pointB[1], 10, 10);

		fill('rgba(100%,100%,100%,0.2)');
		strokeWeight(1);
		ellipse(mouseX, mouseY, 40, 40);

		color(0);
		rect(15, 20, 60, 20);
		rect(110, 20, 70, 20);
		rect(220, 20, 60, 20);

		textAlign(CENTER, TOP);
		text("BUILD", 45, 25);
		text("RETURN", 145, 25);
		text("INFILL", 250, 25);

		// draw the sprite objects last, so they're on top of edges and nodes
		drawSprites();
	}


}

function mousePressed() {
	if (startup) {
		if (mouseX > width/2 - 40 && mouseX < width/2 + 40 && mouseY > height/2 - 20 && mouseY < height/2 + 20){ 
			startup = false;
			numAgents = parseInt(inputAgents.value());
			inputAgents.value('');
			inputAgents.remove();
			maxStress = parseFloat(inputStress.value());
			inputStress.value('');
			inputStress.remove();
			modo = 15 - parseInt(inputSpeed.value());
			inputSpeed.value('');
			inputSpeed.remove();
			
			// set default values if none provided
			if (isNaN(numAgents)) numAgents = 8;
			if (isNaN(maxStress)) maxStress = 0.2;
			if (isNaN(modo)) modo = 5;

			// create and initiate a new truss object 
			tr = new Truss();
    		tr.initiate();
			loop();
		}
	}
	else if (gameWon){
		gameWon = false;
		startup = true;
		for (var i = 0, length = agents.length; i < length; i++) {
			agents[i].bot.remove();
		}
		edges = [];
		nodes = [];
		agents = [];
	}
	else if (gameLost){
		gameLost = false;
		startup = true;
		for (var i = 0, length = agents.length; i < length; i++) {
			agents[i].bot.remove();
		}
		edges = [];
		nodes = [];
		agents = [];
	}
	else{
		// check for clicks on the buttons to change behavior
		for (var i = 0, length = agents.length; i < length; i++) {
			var dist = Math.sqrt((agents[i].currentNode.x - mouseX)*(agents[i].currentNode.x - mouseX) + (agents[i].currentNode.y - mouseY)*(agents[i].currentNode.y - mouseY));

			if (dist < sl){
				agents[i].PreviousBehavior = agents[i].CurrentBehavior;
				agents[i].CurrentBehavior = agents[i].behaviors[CB];
			}		
		}

		// manually checking for "click" events on the buttons. i wasn't able to get any
		// pre-made button functions to work.
		if (mouseX > 15 && mouseX < 85 && mouseY > 20 && mouseY < 40){ CB = 0;}
		if (mouseX > 110 && mouseX < 180 && mouseY > 20 && mouseY < 40){ CB = 1;}
		if (mouseX > 220 && mouseX < 280 && mouseY > 20 && mouseY < 40){ CB = 2;}
	}
	//return false;
}



function Node(id, xPos, yPos) {
	this.id = id;
	this.x = xPos;
	this.y = yPos;

    this.isOccupied = false;

    this.e = [];

    this.fixed = false;
    if (yPos > (pointA[1]-sl/2)) this.fixed = true;
    if (yPos < (pointB[1]-sl/2) && xPos < (pointB[0]-sl/2)) {
    	this.fixed = true;
    	gameWon = true;
	}
    
    this.mass = 5;
    this.fx = 0;
    this.fy = 0;
    this.ux = 0;
    this.uy = 0; 

    for (var i = 0; i < 6 ; i++){
    	this.e.push(undefined);
    }

    this.move = function (dt, damping){
    	if (this.fixed) return;

        this.ux *= damping;
        this.uy *= damping;
        this.ux += this.fx * (dt / this.mass);
        this.uy += this.fy * (dt / this.mass);
        
        this.x += this.ux * dt;
        this.y += this.uy * dt;

        /*if (this.y > height)
        {
            this.y = height;
            if (this.uy > height) this.uy = -this.uy; // this is wrong
        }*/


    }

	this.render = function() {
		//var color = Math.abs(this.fx) + Math.abs(this.fy);
		//fill(color * 100, 0, 0);
		stroke(0);
		ellipse(this.x, this.y, 10, 10);
	}

}

function Edge(n0, n1){
    this.n0 = n0;
    this.n1 = n1;

    var springConstant = 0.95; 

	this.applySpringForce = function () {

	    var dx = this.n1.x - this.n0.x;
	    var dy = this.n1.y - this.n0.y;
	    
	    var dist = Math.sqrt((dx*dx)+(dy*dy));

	    this.stress = Math.abs(1 - (dist/sl));

	    dx = dx / dist;
	    dy = dy / dist;

	    n0.fx += dx * (dist - sl) * springConstant; 
	    n0.fy += dy * (dist - sl) * springConstant; 

	    n1.fx -= dx * (dist - sl) * springConstant; 
	    n1.fy -= dy * (dist - sl) * springConstant; 

	}

    this.render = function() {
    	var dx = this.n1.x - this.n0.x;
	    var dy = this.n1.y - this.n0.y;
	    
	    var dist = Math.sqrt((dx*dx)+(dy*dy));

    	var color = (sl - dist) * 150;
    	if (color > 0) {
    		stroke((color), 0, 0);
    	} else {
    		stroke(0, 0, (-color));
    	}
    	strokeWeight(3);
		line(this.n0.x, this.n0.y, this.n1.x, this.n1.y);
	}
}


function Agent(tr, n){

	this.bot = createSprite(0, height);
    this.bot.rotateToDirection = true;
    this.bot.addImage("bot0", bot0Img);
    this.bot.addImage("bot1", bot1Img);
    this.bot.addImage("bot2", bot2Img);
    
    this.behaviors = [];
    this.behaviors.push(new Directional());
    this.behaviors.push(new WalkDown());
    this.behaviors.push(new Reinforce());

    this.CurrentBehavior = this.behaviors[0];
    this.PreviousBehavior = this.behaviors[0];

    this.currentNode = n;
    this.previousNode = n;
    //this.n = n;

    this.update = function(tr){
		if (this.CurrentBehavior.name == "Directional"){
    		this.bot.changeImage("bot0");
    	}
    	if (this.CurrentBehavior.name == "WalkDown"){
    		this.bot.changeImage("bot1");
    	}
    	if (this.CurrentBehavior.name == "Reinforce"){
    		this.bot.changeImage("bot2");
    	}
        this.CurrentBehavior.step(this, tr);
        this.rot = Math.atan2(this.currentNode.y - this.previousNode.y, this.currentNode.x - this.previousNode.x) * 180 / Math.PI + 90;
    }

    this.render = function() {
    	this.bot.position.x = this.previousNode.x + (this.currentNode.x - this.previousNode.x)/(modo - (frameCount%modo));
    	this.bot.position.y = this.previousNode.y + (this.currentNode.y - this.previousNode.y)/(modo - (frameCount%modo));
    	//console.log(this.bot.rotation);

    	this.bot.rotation = this.rot;
	}
}


// ████████╗██████╗ ██╗   ██╗███████╗███████╗
// ╚══██╔══╝██╔══██╗██║   ██║██╔════╝██╔════╝
//    ██║   ██████╔╝██║   ██║███████╗███████╗
//    ██║   ██╔══██╗██║   ██║╚════██║╚════██║
//    ██║   ██║  ██║╚██████╔╝███████║███████║
//    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝


function Truss() {


    this.dirs = [];
    
    var nodeId = 0;

    for (var i = 0; i < 6; ++i){
        var a = i * 2.0 * Math.PI / 6.0;
        this.dirs[i] = [sl * Math.cos(a), -sl * Math.sin(a)];
    }

    this.pairs = [3, 4, 5, 0, 1, 2];

    this.initiate = function () {
    	//console.log(pointA);
        var n = new Node(nodeId, pointA[0], pointA[1]);
        nodes.push(n);
        nodeId++;
        for(var i = 0; i < numAgents; i++){
            this.addAgent(n);
        }
    }

    this.step = function () {
        for (var i = 0; i < agents.length; ++i){
            agents[i].update(this);
        }
    }     

    this.move = function (){

		var damping = 0.95;
		var g = 1.0;
		var dt = 0.3;

		for (var i = 0, length = nodes.length; i < length; i++) {
	        nodes[i].fy = 0.1 * g;	
	        nodes[i].fx = 0;
		}

		for (var i = 0, length = edges.length; i < length; i++) {
			//console.log("move edge");
			edges[i].applySpringForce();
			
		}

		for (var i = 0;  i < edges.length; i++) {
			if (edges[i].stress > maxStress){
				console.log("stressed");
				gameLost = true;
			}				
		}

		for (var i = 0, length = nodes.length; i < length; i++) {
			nodes[i].move(dt, damping);			
		}
    }   

    // Add and remove elements on the truss object
    this.addAgent = function (n){
        var a = new Agent(this, n);
        agents.push(a);
    }

    this.addNode = function (xPos, yPos) {

        var n = new Node(nodeId, xPos, yPos);

        nodes.push(n);

        nodeId++;
        return n;
    };

	this.extendNode = function(n0, i) {

		if (n0.e[i] !== undefined){  	
			return true;
		} 

		var nX = n0.x + this.dirs[i][0];
		var nY = n0.y + this.dirs[i][1];

		var n1 = undefined; 

		for (var j = 0, length = nodes.length; j < length; j++){
			if ((Math.abs(nodes[j].x - nX) < sl/2) && (Math.abs(nodes[j].y - nY) < sl/2)){
				n1 = nodes[j];
			}
		}

		if (n1 == undefined) n1 = this.addNode(nX, nY);

		var ed = this.addEdge(n0, n1);

		if (ed == null) return null;

		n0.e[i] = ed;
		n1.e[this.pairs[i]] = ed;

		return true;
	}

	this.addEdge = function(n0, n1) {

		var e = new Edge(n0, n1);
		edges.push(e);
		return e;
	}

	this.removeEdge = function(id) {
		
		console.log(edges[id].n0.e);
		for (var i = 0; i < 6; i++){
			if(edges[id].n0.e[i] != undefined){
				if(edges[id].n0.e[i].n1 == edges[id].n1){
					//console.log("match");
					edges[id].n0.e[i] = undefined;
					edges[id].n1.e[this.pairs[i]] = undefined;
				}
			}
		}

		for (var i = 0; i < nodes.length; i++) {
			var count = 0;
			for (var j = 0; j < 6; j++){
				if (nodes[i].e[j] != undefined) count++;
			}
			
			if (count == 0) nodes.splice(i, 1);
			
		}

		edges.splice(id, 1);
	}


	this.containsNode = function (n0, i){
		var nX = n0.x + this.dirs[i][0];
		var nY = n0.y + this.dirs[i][1];

		if (nX > width || nX < 0) return false;
		if (nY > width || nY < 0) return false;

		return true;
	}

}

function Behavior (a, tr){
	this.name = undefined;
}

Behavior.prototype.step = function (a, tr)  {
	return true;
}

Behavior.prototype.getRandom = function (weights)  {
	// find cumulative weights
	var total = 0;
	for(var i = 0; i < 6; i++) {
		total += weights[i];
	}

	var count = 0;
	for(var i = 0; i < 6; i++) {
		weights[i] = (weights[i] / total) * 100 + count;
		count = weights[i];
	}

	// choose random remaining value
	var rr = Math.random() * 100;
	var strutIndex = 6;

	for(var i = 0; i < 6; i++) {
		if(rr < weights[i]){
			strutIndex = i;
		  	return strutIndex;
		}
	}
	return strutIndex;
}



// ██████╗ ██╗██████╗ ███████╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗ █████╗ ██╗     
// ██╔══██╗██║██╔══██╗██╔════╝██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔══██╗██║     
// ██║  ██║██║██████╔╝█████╗  ██║        ██║   ██║██║   ██║██╔██╗ ██║███████║██║     
// ██║  ██║██║██╔══██╗██╔══╝  ██║        ██║   ██║██║   ██║██║╚██╗██║██╔══██║██║     
// ██████╔╝██║██║  ██║███████╗╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║██║  ██║███████╗
// ╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
                                                                                  

function Directional (a, tr){
	Behavior.call(this, a, tr);
	this.name = "Directional";
}

// Define the prototype as inherited from Behavior
Directional.prototype = Object.create(Behavior.prototype);
// Set the "constructor" property to refer to Behavior
Directional.prototype.constructor = Behavior;

Directional.prototype.step = function ( a, tr){

	Behavior.prototype.step.call(this);
	// find the node that the agent is sitting on
	a.previousNode = a.currentNode;
	var n = a.currentNode;

	var StoreWeights = [20, 20, 20, 20, 10, 10];
	var weights =  [20, 20, 20, 20, 10, 10];

	// TRY TO MOVE
	for(var i = 0; i < 6; i++) {
		if(weights[i] == 0) continue;

		// if the node doesn't have that edge, the probability is 0
		if(!n.e[i]){
			weights[i] = 0;
			continue;
		}

		// if the edge is under too much stress, the probability is 0
		var ee = n.e[i];

		// if the node is occupied, the probability is 0
		var N0 = ee.n0;
		var N1 = ee.n1;

		var nextNode = N0;
		if (nextNode.id == n.id) nextNode = N1;

		if (nextNode.isOccupied){
			weights[i] = 0;
			continue;
		}
	}

	// if there is only one move choice, switch to build instead
	var choices = 0;
	for(var i = 0; i < 6; i++) {
		if (weights[i] != 0) choices++;
	}
	if (choices < 2){
		for(var i = 0; i < 6; i++) {
			weights[i] = 0;
		}
	}

	var strutIndex = this.getRandom(weights);

	if (strutIndex < 6){
		var ee = n.e[strutIndex];

		if (ee != null){
			var N0 = ee.n0;
			var N1 = ee.n1;

			var nextNode = N0;
			if (nextNode.id == n.id) nextNode = N1;

			a.previousNode = a.currentNode;
			a.currentNode = nextNode;
			nextNode.isOccupied = true;
			n.isOccupied = false;
			return true;
		}
		else{
			console.log("fail");
		}
	}

	// TRY TO BUILD
	weights = StoreWeights;

	for(var i = 0; i < 6; i++) {
		if(weights[i] == 0) continue;

		var inWorkSpace = tr.containsNode(n, i);

        if(!inWorkSpace){
          weights[i] = 0;
          continue;
        }

        var nX = n.x + tr.dirs[i][0];
		var nY = n.y + tr.dirs[i][1];

		var preDist = sqrt((pointB[0] - n.x)*(pointB[0] - n.x) + (pointB[1] - n.y)*(pointB[1] - n.y))
		var newDist = sqrt((pointB[0] - nX)*(pointB[0] - nX) + (pointB[1] - nY)*(pointB[1] - nY))

		// if nextNode is closer to target, increase probability
		if (newDist < preDist){
			weights[i] = weights[i] * 10;
		}
	}

	strutIndex = this.getRandom(weights);

	if (strutIndex < 6){
		var ee = tr.extendNode(n, strutIndex);

		if (ee == true){
			a.CurrentBehavior = a.behaviors[1];
			a.PreviousBehavior = a.behaviors[0];
		}
		else{
			console.log("fail");
		}
	}

	return false;
//}
}


//  ██╗    ██╗ █████╗ ██╗     ██╗  ██╗    ██████╗  ██████╗ ██╗    ██╗███╗   ██╗
//  ██║    ██║██╔══██╗██║     ██║ ██╔╝    ██╔══██╗██╔═══██╗██║    ██║████╗  ██║
//  ██║ █╗ ██║███████║██║     █████╔╝     ██║  ██║██║   ██║██║ █╗ ██║██╔██╗ ██║
//  ██║███╗██║██╔══██║██║     ██╔═██╗     ██║  ██║██║   ██║██║███╗██║██║╚██╗██║
//  ╚███╔███╔╝██║  ██║███████╗██║  ██╗    ██████╔╝╚██████╔╝╚███╔███╔╝██║ ╚████║
//   ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═══╝

function WalkDown (a, tr){

	Behavior.call(this, a, tr);
	this.name = "WalkDown";

}

// Define the prototype as inherited from Behavior
WalkDown.prototype = Object.create(Behavior.prototype);
// Set the "constructor" property to refer to Behavior
WalkDown.prototype.constructor = Behavior;

WalkDown.prototype.step = function ( a, tr){

	Behavior.prototype.step.call(this);
	// find the node that the agent is sitting on
	a.previousNode = a.currentNode;
	var n = a.currentNode;

	var weights =  [10, 0, 0, 10, 40, 40];

	// check the height of that node
	if ( n.y > ground - (sl/2)){
		//console.log(ground);
		a.CurrentBehavior = a.PreviousBehavior;
		a.PreviousBehavior = a.behaviors[1];
		return true;
	}

	// TRY TO MOVE
	for(var i = 0; i < 6; i++) {

		if(weights[i] == 0) continue;

		// if the node doesn't have that edge, the probability is 0
		if(!n.e[i]){
			weights[i] = 0;
			continue;
		}

		// if the node is occupied, the probability is 0
		var ee = n.e[i];

		var N0 = ee.n0;
		var N1 = ee.n1;

		var nextNode = N0;
		if (nextNode.id == n.id) nextNode = N1;

		if (nextNode.isOccupied){
			weights[i] = 0;
			continue;
		}

		var nX = n.x + tr.dirs[i][0];
		var nY = n.y + tr.dirs[i][1];

		var preDist = sqrt((pointA[0] - n.x)*(pointA[0] - n.x) + (pointA[1] - n.y)*(pointA[1] - n.y))
		var newDist = sqrt((pointA[0] - nX)*(pointA[0] - nX) + (pointA[1] - nY)*(pointA[1] - nY))

		// if nextNode is closer to target, double probability
		if (newDist < preDist){
			weights[i] = weights[i] * 10;
		}
	}

	var strutIndex = this.getRandom(weights);

	if (strutIndex < 6){
		var ee = n.e[strutIndex];

		if (ee != null){
			var N0 = ee.n0;
			var N1 = ee.n1;

			var nextNode = N0;
			if (nextNode.id == n.id) nextNode = N1;

			//a.previousNode = a.currentNode;
			a.currentNode = nextNode;
			nextNode.isOccupied = true;
			n.isOccupied = false;
			return true;
		}
		else{
			console.log("fail");
		}
	}

	//console.log("fail");
	return false;

}

// ██████╗ ███████╗██╗███╗   ██╗███████╗ ██████╗ ██████╗  ██████╗███████╗
// ██╔══██╗██╔════╝██║████╗  ██║██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝
// ██████╔╝█████╗  ██║██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║     █████╗  
// ██╔══██╗██╔══╝  ██║██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║     ██╔══╝  
// ██║  ██║███████╗██║██║ ╚████║██║     ╚██████╔╝██║  ██║╚██████╗███████╗
// ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝

function Reinforce (a, tr){
	Behavior.call(this, a, tr);
	this.name = "Reinforce";
}

// Define the prototype as inherited from Behavior
Reinforce.prototype = Object.create(Behavior.prototype);
// Set the "constructor" property to refer to Behavior
Reinforce.prototype.constructor = Behavior;

Reinforce.prototype.step = function ( a, tr){

	Behavior.prototype.step.call(this);
	// find the node that the agent is sitting on
	a.previousNode = a.currentNode;
	var n = a.currentNode;

	var weights =  [20, 20, 20, 20, 20, 20];

	// TRY TO BUILD
	for(var i = 0; i < 6; i++) {
		
		if(n.e[i]){
			continue;
		}

        var nX = n.x + tr.dirs[i][0];
		var nY = n.y + tr.dirs[i][1];

		var n1 = undefined; 

		for (var j = 0, length = nodes.length; j < length; j++){
			if ((Math.abs(nodes[j].x - nX) < sl/2) && (Math.abs(nodes[j].y - nY) < sl/2)){
				n1 = nodes[j];
			}
		}

		if (n1 !== undefined){
			var ee = tr.extendNode(n, i);

			if (ee != null){
				a.CurrentBehavior = a.behaviors[1];
				a.PreviousBehavior = a.behaviors[2];
			}
			else{
				console.log("fail");
			}
		}

	}

	
	// TRY TO MOVE
	for(var i = 0; i < 6; i++) {
		if(weights[i] == 0) continue;

		// if the node doesn't have that edge, the probability is 0
		if(!n.e[i]){
			weights[i] = 0;
			continue;
		}

		// if the edge is under too much stress, the probability is 0
		var ee = n.e[i];

		// if the node is occupied, the probability is 0
		var N0 = ee.n0;
		var N1 = ee.n1;

		var nextNode = N0;
		if (nextNode.id == n.id) nextNode = N1;

		if (nextNode.isOccupied){
			weights[i] = 0;
			continue;
		}
	}


	var strutIndex = this.getRandom(weights);

	if (strutIndex < 6){
		var ee = n.e[strutIndex];

		if (ee != null){
			var N0 = ee.n0;
			var N1 = ee.n1;

			var nextNode = N0;
			if (nextNode.id == n.id) nextNode = N1;

			a.previousNode = a.currentNode;
			a.currentNode = nextNode;
			nextNode.isOccupied = true;
			n.isOccupied = false;
			return true;
		}
		else{
			console.log("fail");
		}
	}



	return false;
//}
}



// this function is a workaround provided by user "GoToLoop" on the Processing forum
// https://forum.processing.org/two/discussion/11608/i-can-t-display-images-dynamically-loaded-from-web-with-p5-js-always-a-cross-domain-issue
function loadImageErrorOverride(errEvt) {
  const pic = errEvt.target;
 
  if (!pic.crossOrigin)  return print('Failed to reload ' + pic.src + '!');
 
  print('Attempting to reload it as a tainted image now...');
  pic.crossOrigin = null, pic.src = pic.src;
}