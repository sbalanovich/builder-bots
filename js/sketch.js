/* TO DO

*/

var nodes = [];
var edges = [];
var agents = [];
var agentSprites;

var numAgents = 12;
var modo = 5;
var maxStress = 0.5;

// var width = window.innerWidth;
// var height = window.innerHeight;
// var sl = Math.min(width,height) / 15;

var sl = 10; // Default length of 10 units
var width, height = 30*sl; // 30 triangles on each side

// This should set ground to be 5 from bottom
// Point A at (10, 5)
// Point B at (25, 25)
// Assuming W = H = 30 and (0, 0) is at top left
var span = sl*5;
var ground = height - span;
var pointA = [span*2, ground];
var pointB = [width-span, span];

var startup = true, gameWon = false, gameLost = false;

//var background, right, left;
var bot0, bot1, bot2, bot3;

var bot0Img, bot1Img, bot2Img, bot3Img;
//var button0, button1, button2;
var CB = 0;

// var ground = (height/2) + span;
// var pointA = [(width/2) - span, ground];
// var pointB = [(width/2) + span, (height/2) - span];

// the preload function is prioritized by the p5 library, used for loading images
// used for icons, background imagery
function preload(){

	bot0Img = loadImage("assets/bot0.png",
    	function (pic) { /*print(bot0Img = pic),*/ /*redraw(); */},
    	loadImageErrorOverride);
	bot1Img = loadImage("assets/bot1.png",
        function (pic) { /*print(bot1Img = pic),*/ /*redraw();*/ },
        loadImageErrorOverride);
	bot2Img = loadImage("assets/bot2.png",
        function (pic) { /*print(bot2Img = pic),*/ /*redraw();*/ },
        loadImageErrorOverride);
	bot3Img = loadImage("assets/bot3.png",
        function (pic) { /*print(bot3Img = pic),*/ /*redraw();*/ },
        loadImageErrorOverride);
}

function setup() {

	createCanvas(windowWidth, windowHeight);
	frameRate(30);

    updateSprites(false);
}


function draw() {


	background(100);

	var timeout = 30000; 
	
	if (frameCount % modo == 0 && frameCount < timeout) {
		tr.step();
		//console.log("step");
	} 

	if (frameCount < timeout){
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

	// draw the sprite objects last, so they're on top of edges and nodes
	drawSprites();


}

function mousePressed() {
		
	// clear any existing truss 
	for (var i = 0, length = agents.length; i < length; i++) {
		agents[i].bot.remove();
	}
	edges = [];
	nodes = [];
	agents = [];

	// create and initiate a new truss object 
	tr = new Truss();
	tr.initiate();
	loop();
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

	    vals = updateStress();
	    dx = vals[0];
	    dy = vlas[1];
	    dist = vals[2];

	    dx = dx / dist;
	    dy = dy / dist;

	    n0.fx += dx * (dist - sl) * springConstant; 
	    n0.fy += dy * (dist - sl) * springConstant; 

	    n1.fx -= dx * (dist - sl) * springConstant; 
	    n1.fy -= dy * (dist - sl) * springConstant; 

	}

	this.updateStress = function() {
	    var dx = this.n1.x - this.n0.x;
	    var dy = this.n1.y - this.n0.y;
	    
	    var dist = Math.sqrt((dx*dx)+(dy*dy));

	    this.stress = Math.abs(1 - (dist/sl));

	    return [dx, dy, dist];
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
    this.bot.addImage("bot3", bot3Img);
    
    this.behaviors = [];
    this.behaviors.push(new Directional());
    this.behaviors.push(new WalkDown());
    this.behaviors.push(new Reinforce());
    this.behaviors.push(new Traverse());

    // for now, randomly initiate bots as either Directional or Reinforce builders
    this.CurrentBehavior = this.behaviors[0];
    this.PreviousBehavior = this.behaviors[0];

    if (Math.random() > 0.5){
    	this.CurrentBehavior = this.behaviors[2];
	    this.PreviousBehavior = this.behaviors[2];
    }

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
    	if (this.CurrentBehavior.name == "Traverse"){
    		this.bot.changeImage("bot3");
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
    	nodeId = 0;
    	nodes = [];
    	edges = [];
    	agents = [];

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

		var stressed = 0;
		for (var i = 0;  i < edges.length; i++) {
			if (edges[i].stress > maxStress){
				console.log(stressed);
				stressed++;
			}				
		}

		if(stressed > 3)  gameLost = true;

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
			weights[i] = weights[i] * 20;
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
			weights[i] = weights[i] * 20;
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

	var weights =  [20, 20, 20, 20, 10, 10];

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


// ████████╗██████╗  █████╗ ██╗   ██╗███████╗██████╗ ███████╗███████╗
// ╚══██╔══╝██╔══██╗██╔══██╗██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
//    ██║   ██████╔╝███████║██║   ██║█████╗  ██████╔╝███████╗█████╗  
//    ██║   ██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
//    ██║   ██║  ██║██║  ██║ ╚████╔╝ ███████╗██║  ██║███████║███████╗                                                                                  

function Traverse (a, tr){
	Behavior.call(this, a, tr);
	this.name = "Traverse";
}

// Define the prototype as inherited from Behavior
Traverse.prototype = Object.create(Behavior.prototype);
// Set the "constructor" property to refer to Behavior
Traverse.prototype.constructor = Behavior;

Traverse.prototype.step = function ( a, tr){

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

	return false;
//}
}


// Adjacency class
function Adjacency() {
	this.adj = [];
	this.w = 0;
	this.h = 0;
	this.edges = [];
	this.nodes = [];
	this.agents = [];
	this.max = 0;

	// Initializes class
	this.init = function (egdes, nodes, agents) {
		this.update(edges, nodes, agents);
		this.adj = [[0 for i in range(this.w+1)] for j in range(this.h+1)];
	}

	// Updates class
	this.update = function (edges, nodes, agents) {
		this.edges = edges;
		this.nodes = nodes;
		this.agents = agents;
		this.h = int(height/sl);
		this.w = int(width/sl);
		this.construct();
	}

	// Constructs adjacency matrix
	this.construct = function () {
		/* Every node has 3 potential edges connected to it:

		o--a
		|\
		c b

		We have a 31x31 node graph (I think)
		We define an adjacency matrix adj such that adj[x][y] represents the 
		edge where edge.n0 = x and edge.n1 = y
		*/ 
		this.max = 0;
		for edge in this.edges:
			x = edge.n0;
			y = edge.n1;
			edge.updateStress();
			this.adj[int(x.x/sl)][int(y.y/sl)] = edge.stress;
			if edge.stress > this.max:
				this.max = edge.stress;
	}

	this.avgStress = function () {
		sum(this.adj)/(len(adj)*len(adj[0]));
	}

	this.maxStress = function () {
		if this.max == 0:
			this.update();
		return this.max;
	}

	// Returns True if a call to init is needed to update vals
	this.needsUpdate = function (edges) {
		return this.edges == edges;
	}
}


// this function is a workaround provided by user "GoToLoop" on the Processing forum
// https://forum.processing.org/two/discussion/11608/i-can-t-display-images-dynamically-loaded-from-web-with-p5-js-always-a-cross-domain-issue
function loadImageErrorOverride(errEvt) {
  const pic = errEvt.target;
 
  if (!pic.crossOrigin)  return print('Failed to reload ' + pic.src + '!');
 
  print('Attempting to reload it as a tainted image now...');
  pic.crossOrigin = null, pic.src = pic.src;
}