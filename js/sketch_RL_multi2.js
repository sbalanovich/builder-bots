/* TO DO

*/

var nodes = [];
var edges = [];
var agents = [];
var agentSprites;

var numAgents = 1;
var modo = 1;
var maxStress = 0.5;

// var width = window.innerWidth;
// var height = window.innerHeight;
// var sl = Math.min(width,height) / 15;

var sl = 45; // Default length of 10 units
var wdth = 5; // 30 triangles on each side
var hght = 5;

// This should set ground to be 5 from bottom
// Point A at (10, 5)
// Point B at (25, 25)
// Assuming W = H = 30 and (0, 0) is at top left
var span = sl*5;
var ground = hght*sl - span;
var pointA = 20;
var pointB = 4;

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

var state, spec;
var agent, env;
var rlAgents = [];
var totalRLAgents = 0;
function setup() {

	createCanvas(windowWidth, windowHeight);
	frameRate(30);

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

	adjacency = new Adjacency();
	adjacency.init(edges, nodes, agents, wdth, hght);


	// RL Setup 
	env = new Gridworld(); // create environment
    state = env.startState();
    spec = { alpha: 0.01 }
    for (var i = 0; i < totalRLAgents; i++) {
    	rlAgent = new RL.TDAgent(env, spec);
    	rlAgents.push(rlAgent);
    }

    updateSprites(false);
}


function draw() {


	background(255);

	var timeout = 30000; 
	// if (gameWon) {
	// 	for (var i = 0, length = agents.length; i < length; i++) {
	// 		agents[i].bot.remove();
	// 	}
	// 	edges = [];
	// 	nodes = [];
	// 	agents = [];

	// 	// create and initiate a new truss object 
	// 	tr = new Truss();
	// 	tr.initiate();

	// 	adjacency = new Adjacency();
	// 	adjacency.init(edges, nodes, agents, wdth, hght);
	// }
	
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
		
	// // clear any existing truss 
	// for (var i = 0, length = agents.length; i < length; i++) {
	// 	agents[i].bot.remove();
	// }
	// edges = [];
	// nodes = [];
	// agents = [];

	// // create and initiate a new truss object 
	// tr = new Truss();
	// tr.initiate();

	// adjacency = new Adjacency();
	// adjacency.init(edges, nodes, agents, wdth, hght);

	// loop();
	if (modo > 1) {
		modo--;
	}
	console.log(modo);
}



function keyPressed(){
	// adjacency.update(edges, nodes, agents, wdth, hght);
	// for (var i = 0; i < adjacency.adj.length; i++) {
	// 	for (var j = 0; j < adjacency.adj[0].length; j++) {
	// 		if (adjacency.adj[i][j] > 0) {
	// 			console.log(i, j, adjacency.adj[i][j]);
	// 		}
	// 	}
	// }
	// // console.log(adjacency.adj);
	// return false;
	if (modo < 51) {
		modo++;
	}
	console.log(modo);
}



function Node(id, xPos, yPos) {
	this.id = id;
	this.x = xPos;
	this.y = yPos;
	this.stox = xPos;
	this.stoy = yPos;

    this.isOccupied = false;

    this.e = [];
    this.neighbors = [];

    this.fixed = true;

    this.mass = .2;
    this.fx = 0;
    this.fy = 0;
    this.ux = 0;
    this.uy = 0; 

    for (var i = 0; i < 6 ; i++){
    	this.e.push(undefined);
    	this.neighbors.push(undefined);
    }

    this.move = function (dt, damping){
    	if (this.fixed) return;

        this.ux *= damping;
        this.uy *= damping;
        this.ux += this.fx * (dt / this.mass);
        this.uy += this.fy * (dt / this.mass);
        
        this.x += this.ux * dt;
        this.y += this.uy * dt;

	}

	this.render = function() {
		stroke(0);
		strokeWeight(1);
		ellipse(this.x, this.y, 4, 4);

		textSize(10);
		text(this.id, this.x, this.y+10);
	}

}

function Edge(n0, n1){
    this.n0 = n0;
    this.n1 = n1;

    var springConstant = 0.95; 

	this.applySpringForce = function () {

	    vals = this.updateStress();
	    dx = vals[0];
	    dy = vals[1];
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


function Agent(tr, n, rl=0){

	this.bot = createSprite(0, height);
    this.bot.rotateToDirection = true;
    this.bot.addImage("bot0", bot0Img);
    this.bot.addImage("bot1", bot1Img);
    this.bot.addImage("bot2", bot2Img);
    this.bot.addImage("bot3", bot3Img);
    
    this.behaviors = [];
    if (rl == 1) {
    	this.behaviors.push(new TraverseRL());
    	this.behaviors.push(new WalkDown());
    	console.log("Added RL");
  		totalRLAgents++;
    }
    else {
    	this.behaviors.push(new Directional());
	    // this.behaviors.push(new WalkDown());
	    this.behaviors.push(new Reinforce());
	    this.behaviors.push(new Traverse());
    }

    // initiate all bots with Traverse behavior
    this.CurrentBehavior = this.behaviors[0]
    this.PreviousBehavior = this.behaviors[0]

    this.currentNode = nodes[pointA];
    this.previousNode = nodes[pointA];
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

    	for (var h = 0; h < hght; h++ ){
    		for (var w = 0; w < wdth; w++ ){
    		
    			var off = 0;
    			if (h%2 == 1) {off = 0.5}
		        var n = new Node(nodeId, ((w+off)*sl) + 50, (h*(sl*0.866)) + 50);
		        nodes.push(n);
		        nodeId++;
	    	}
    	}

        for(var i = 0; i < numAgents; i++){
            this.addAgent(nodes[pointA], 0);
        }
        this.addAgent(nodes[pointA], 1);
    }

    this.step = function () {
        for (var i = 0; i < agents.length; ++i){
            agents[i].update(this);
        }
    }     

    this.move = function (){

		var damping = 0.95;
		var g = 1.0;
		var dt = 0.1;

		for (var j = 0; j < 1; j++){

			for (var i = 0, length = nodes.length; i < length; i++) {
		        nodes[i].fy = 0.1 * g;	
		        nodes[i].fx = 0;
			}

			for (var i = 0, length = edges.length; i < length; i++) {
			    //console.log("move edge");
				edges[i].applySpringForce();
				
			}

			for (var i = 0, length = nodes.length; i < length; i++) {
				nodes[i].move(dt, damping);			
			}
		}
    }   

    // Add and remove elements on the truss object
    this.addAgent = function (n, rl=0){
        var a = new Agent(this, n, rl);
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

		if(!nodes[n.neighbors[i]]) {
			weights[i] = 0;
			//console.log("didnt have strut");
			continue;
		}
		// if the node doesn't have that edge, the probability is 0
		/*if(!n.e[i]){
			weights[i] = 0;
			console.log("here");
			continue;
		}*/

		// if the edge is under too much stress, the probability is 0
		/*var ee = n.e[i];

		// if the node is occupied, the probability is 0
		var N0 = ee.n0;
		var N1 = ee.n1;

		var nextNode = N0;
		if (nextNode.id == n.id) nextNode = N1;

		if (nextNode.isOccupied){
			weights[i] = 0;
			continue;
		}*/
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

	//console.log(choices);

	var strutIndex = this.getRandom(weights);

	if (strutIndex < 6){
		var ee = n.e[strutIndex];
		//console.log(ee);
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
			//console.log("fail");
		}
	}

	// TRY TO BUILD
	weights = StoreWeights;

	for(var i = 0; i < 6; i++) {
		if(weights[i] == 0) continue;
		
		if(!nodes[n.neighbors[i]]){
			weights[i] = 0;
			continue;
		} 

		if(n.e[i]){ // if strut already exists
			weights[i] = 0;
		}

		//console.log(n);
        var nX = nodes[n.neighbors[i]].stox;
		var nY = nodes[n.neighbors[i]].stoy;

		var preDist = sqrt((nodes[pointB].stox - n.stox)*(nodes[pointB].stox - n.stox) + (nodes[pointB].stoy - n.stoy)*(nodes[pointB].stoy - n.stoy))
		var newDist = sqrt((nodes[pointB].stox - nX)*(nodes[pointB].stox - nX) + (nodes[pointB].stoy - nY)*(nodes[pointB].stoy - nY))

		// if nextNode is closer to target, increase probability
		if (newDist < preDist){
			weights[i] = weights[i] * 20;
		}
	}

	strutIndex = this.getRandom(weights);

	if (strutIndex < 6){
		var newID = n.neighbors[strutIndex];
		//console.log(newID);
		var ed = tr.addEdge(n, nodes[newID]);
		if (newID != pointA && newID != pointA+1 && newID != pointB ){
			nodes[newID].fixed = false;
		}
		
		//console.log(ed);

		//if (ed == null) return null;

		n.e[strutIndex] = ed;
		nodes[n.neighbors[strutIndex]].e[tr.pairs[strutIndex]] = ed;

		if (ed){
			//console.log(ed);
			a.CurrentBehavior = a.behaviors[0];
			a.PreviousBehavior = a.behaviors[0];

			// stop condition
			if ( newID == pointB){
				gameWon = true;
			}
		}
		else{
			console.log("fail");
			//a.CurrentBehavior = a.behaviors[1];
			///a.PreviousBehavior = a.behaviors[0];
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

	var weights =  [10, 10, 10, 10, 40, 40];

	// check the height of that node
	if ( n.id == pointA){
		//console.log(ground);
		a.CurrentBehavior = a.behaviors[0];
		a.PreviousBehavior = a.behaviors[1];
		return true;
	}

	

	// TRY TO MOVE
	for(var i = 0; i < 6; i++) {

		if(weights[i] == 0) continue;
		if(!nodes[n.neighbors[i]]) continue;

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

		if(weights[i] == 0) continue;

        var nX = nodes[n.neighbors[i]].stox;
		var nY = nodes[n.neighbors[i]].stoy;

		var preDist = sqrt((nodes[pointA].stox - n.stox)*(nodes[pointA].stox - n.stox) + (nodes[pointA].stoy - n.y)*(nodes[pointA].stoy - n.stoy))
		var newDist = sqrt((nodes[pointA].stox - nX)*(nodes[pointA].stox - nX) + (nodes[pointA].stoy - nY)*(nodes[pointA].stoy - nY))

		// if nextNode is closer to target, increase probability
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

        if(weights[i] == 0) continue;
        if(!nodes[n.neighbors[i]]) continue;

        var nX = nodes[n.neighbors[i]].stox;
		var nY = nodes[n.neighbors[i]].stoy;

		var n1 = undefined; 

		for (var j = 0, length = nodes.length; j < length; j++){
			if ((Math.abs(nodes[j].stox - nX) < sl/2) && (Math.abs(nodes[j].stoy - nY) < sl/2)){
				n1 = nodes[j];
			}
		}

		if (n1 !== undefined){
			var ed = tr.addEdge(n, nodes[n.neighbors[i]]);

			if (ed == null) return null;

			n.e[i] = ed;
			n1.e[tr.pairs[i]] = ed;

			if (ed != null){
				a.PreviousBehavior = a.behaviors[2];
				a.CurrentBehavior = a.behaviors[1];
			}
			else{
				console.log("fail");
			}
		}

	}
	//a.CurrentBehavior = a.behaviors[1];
	//a.PreviousBehavior = a.behaviors[2];

	return false;
//}
}

var steps_per_tick = 1;
var sid = -1;
var nsteps_history = [];
var nsteps_counter = 0;
var nflot = 1000;

// ████████╗██████╗  █████╗ ██╗   ██╗███████╗██████╗ ███████╗███████╗
// ╚══██╔══╝██╔══██╗██╔══██╗██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
//    ██║   ██████╔╝███████║██║   ██║█████╗  ██████╔╝███████╗█████╗  
//    ██║   ██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
//    ██║   ██║  ██║██║  ██║ ╚████╔╝ ███████╗██║  ██║███████║███████╗                                                                                                                                                                   

function TraverseRL (a, tr){
	Behavior.call(this, a, tr);
	this.name = "TraverseRL";
}

// Define the prototype as inherited from Behavior
TraverseRL.prototype = Object.create(Behavior.prototype);
// Set the "constructor" property to refer to Behavior
TraverseRL.prototype.constructor = Behavior;

TraverseRL.prototype.step = function ( aa, tr){

	Behavior.prototype.step.call(this);
	// find the node that the agent is sitting on
	aa.previousNode = aa.currentNode;
	var n = aa.currentNode;

	for (var agentIter = 0; agentIter < rlAgents.length; agentIter++) {
		// console.log(rlAgents);
		agent1 = rlAgents[agentIter];
	    var a = agent1.act(state); // ask agent for an action
	    var obs = env.sampleNextState(state, a); // run it through environment dynamics
	    agent1.learn(obs.r); // allow opportunity for the agent to learn
	    state = obs.ns; // evolve environment to next state
	    nsteps_counter += 1;
	    if(typeof obs.reset_episode !== 'undefined') {
	      agent1.resetEpisode();
	      // record the reward achieved
	      if(nsteps_history.length >= nflot) {
	        nsteps_history = nsteps_history.slice(1);
	      }
	      nsteps_history.push(nsteps_counter);
	      nsteps_counter = 0;
	    }
	}

	aa.currentNode = nodes[state%100];
	aa.previousNode = aa.currentNode;
}

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

	var eps1 = 0.05;
	var StoreWeights = [20, 20, 20, 20, 10, 10];
	var weights =  [20, 20, 20, 20, 10, 10];

	// TRY TO MOVE
	for(var i = 0; i < 6; i++) {
		if(weights[i] == 0) continue;

		/*if(!nodes[n.neighbors[i]]) {
			weights[i] = 0;
			console.log("didnt have strut");
			continue;
		}*/
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
	
	console.log("choices", choices);

	// Determine angle between target and current agent's location
	var dy = -1*(nodes[pointB].stoy - n.stoy);
	var dx = nodes[pointB].stox - n.stox;
	var angle = Math.atan(dy/dx)*(180/Math.PI);
	// console.log(angle);

	// Set strut angles for comparison
	var strut_angles = [0, 60, 120, 180, 240, 300];

	if (Math.random() < eps1){
		strutIndex = this.getRandom(weights)
    }
    else{
    	var nearest = Math.floor(angle/60);
    	var near_left = (nearest)%6;
    	var near_right = (nearest + 1)%6;
    	// console.log("the struts are:")
    	// console.log(near_left);
    	// console.log(near_right);

    	if (weights[near_left] == 0 || weights[near_right] == 0){
    		strutIndex = this.getRandom(weights);
    	}
    	else{
    		// Assign probabilities proportional to the difference
    		// between the other option and the strut
    		prob_left = Math.abs(angle-strut_angles[near_right]);
    		prob_right = Math.abs(angle-strut_angles[near_left]);
    		normalize = prob_left + prob_right;
    		prob_left = float(prob_left)/normalize;
    		prob_right = float(prob_right)/normalize;

    		if (Math.random() < prob_left){
    			strutIndex = near_left;
    		}
    		else{
    			strutIndex = near_right;
    		}
    		console.log("Strut Index::::::::::::")
    		console.log(strutIndex);
    	}
    }


	var strutIndex = this.getRandom(weights);

	if (strutIndex < 6){
		var ee = n.e[strutIndex];
		//console.log(ee);
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

	if (Math.random() > 0.95){
		console.log("about to switch to reinforce")
    	a.CurrentBehavior = a.behaviors[2];
	  	a.PreviousBehavior = a.behaviors[3];
    }
    else{
    	console.log("about to switch to directional")
		// Switch to Directional behavior
		a.CurrentBehavior = a.behaviors[0]
		a.PreviousBehavior = a.behaviors[3]	
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
	this.init = function (egdes, nodes, agents, width, height) {
		this.update(edges, nodes, agents, width, height);
		this.resetAdj();

		// define neighbors for each node
		for (var i = 0; i < this.nodes.length; i++){
			for (var e = 0; e < 6; e++){
				var testX = this.nodes[i].x + tr.dirs[e][0];
				var testY = this.nodes[i].y + tr.dirs[e][1];

				for (var j = 0; j < this.nodes.length; j++){
					if ((Math.abs(this.nodes[j].x - testX) < sl/2) && (Math.abs(this.nodes[j].y - testY) < sl/2)){
						nodes[i].neighbors[e] = this.nodes[j].id;
					}
				}
			}
		}
	}

	// Updates class
	this.update = function (edges, nodes, agents, width, height) {
		this.edges = edges;
		this.nodes = nodes;
		this.agents = agents;
		this.h = hght;
		this.w = wdth;
		//console.log(this.maxStress());
		//console.log(this.edges);
		this.construct();
	}

	// Constructs adjacency matrix
	this.construct = function () {
		/* 
			We define an adjacency matrix adj such that adj[n0][n1] represents the 
			edge where edge.n0 = n0 and edge.n1 = n1
		*/ 
		this.max = 0;
		this.resetAdj();

		for (e = 0; e < this.edges.length; e++) {
			edge = this.edges[e];
			n0 = edge.n0;
			n0_id = int(n0.stox/sl) + int(n0.stoy/sl)*this.w;
			n1 = edge.n1;
			/*
			  4   5
			   \ /
			3 - x - 0
			   / \
			  2   1
			*/
			n1_id = -1;
			if (n1.x > n0.x) {
				// RHS
				if (n1.y > n0.y)
					n1_id = 5;
				if (n1.y < n0.y)
					n1_id = 1;
				else
					n1_id = 0;
			}
			else {
				// LHS
				if (n1.y > n0.y)
					n1_id = 4;
				if (n1.y < n0.y)
					n1_id = 2;
				else
					n1_id = 3;
			}
			edge.updateStress();
			//console.log(n0_id);
			this.adj[n0_id][n1_id] = edge.stress;
			if (edge.stress > this.max) {
				this.max = edge.stress;
			}
		}
	}

	this.avgStress = function () {
		sum(this.adj)/(this.edges.length);
	}

	this.maxStress = function () {
		if (this.max == 0) {
			//this.update();
		}
		return this.max;
	}

	this.maxDisplacement = function () {
		var md = 0;

		for(var i = 0; i < this.nodes.length; i++){
			var cd = sqrt((this.nodes[i].x - this.nodes[i].stox)*(this.nodes[i].x - this.nodes[i].stox) + (this.nodes[i].y - this.nodes[i].stoy)*(this.nodes[i].y - this.nodes[i].stoy))
			if (cd > md) { md = cd; }
		}
		return md;
	}

	// Returns True if a call to init is needed to update vals
	this.needsUpdate = function (edges) {
		return this.edges == edges;
	}

	this.showAdj = function() {
		console.log(this.adj);
	}

	this.resetAdj = function() {
		this.adj = [];
		// for (i = 0; i < this.h+1; i++) {
		// 	this.adj.push([]);
		// 	for (j = 0; j < this.w+1; j++) {
		// 		this.adj[i].push(0);
		// 	}
		// }
		for (i = 0; i < this.h*this.w+1; i++) {
			this.adj.push([]);
			for (j = 0; j < 6; j++) {
				this.adj[i].push(undefined);
			}
		}
	}
}

// Gridworld
var Gridworld = function(){
  this.Rarr = null; // reward array
  this.T = null; // node types 0 = inactive, 1 = active
  this.s = pointA;
  this.ns = pointA;

  // console.log("Point A:::")
  // console.log(pointA)

  this.state = 0;
  for (i = 0; i < 6; i++) {
  	if(nodes[this.s].e[i] != undefined) {
  		this.state += Math.pow(2,i);
  		}
  	}
  // append the node's state
  this.state = this.state*100 + this.s
  
  this.s = this.state;
  this.ns = this.state;

  this.reset()
}
Gridworld.prototype = {
  reset: function() {

    // hardcoding one gridworld for now
    this.gw = wdth;
    this.gh = hght;

    this.struts = 6;
    // total # of strut possibilities
    this.sp = Math.pow(2, this.struts);
    this.gs = this.gh * this.gw * this.sp; // number of states
    
    // specify some rewards
    var Rarr = R.zeros(this.gs);
    var T = R.zeros(this.gs);
    
    // get a reward for any of the possible endings
    // we don't know a priori how many struts will connect to pointB
    for (k = 0; k < this.sp; k++) {
    	possible_final = k * 100 + pointB;
    	Rarr[possible_final] = 1;
    }

    // Rarr[pointB] = 1; // end node gets a reward

    this.sA = 0;
  	for (i = 0; i < 6; i++) {
  		if(nodes[pointA].e[i] != undefined) {
  			this.sA += Math.pow(2,i);
  		}
  	}
  	// append the node's state
  	this.sA = this.sA*100 + pointA

    T[this.sA] = 1; // start node is active

    this.Rarr = Rarr;
    this.T = T;

    //tr.initiate();
    //adjacency.resetAdj();
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

	adjacency = new Adjacency();
	adjacency.init(edges, nodes, agents, wdth, hght);

  },
  reward: function(s,a,ns) {
    // reward of being in s, taking action a, and ending up in ns
    return this.Rarr[s];
  },
  nextStateDistribution: function(s,a) {
    // given (s,a) return distribution over s' (in sparse form)

    if(s%100 === pointB || gameWon) {
      // agent wins! teleport to start
      gameWon = false;
      var ns = this.startState();
      this.reset();
    } else {
      // ordinary space
	  	for ( var i = 0; i < 6; i++){
	      if(a === i) {

	      	var ns_ = nodes[s%100].neighbors[i]; // next state is the index of the node at neighbors
	      	if (ns_ > 24){
	      		break;
	      	}
	      	// transform to new state form
	      	ns = 0;

  			for (j = 0; j < 6; j++) {
  				// console.log(nodes[ns_].e[i])
  				if(nodes[ns_].e[j] != undefined) {
  					ns += Math.pow(2,j);
  				}
  			}
  			// append the node's state
  			ns = ns*100 + ns_;
  			// console.log(ns)

	      	// check if strut exists, if not, add it and switch to move down
	      	//if (/*adjacency.adj[ns][i] == undefined ||*/ adjacency.adj[s][i] == undefined){
	      	if ( nodes[s%100].e[i] == undefined){	
	      		// add strut 
	      		var ed = tr.addEdge(nodes[s%100], nodes[ns%100]);

	      		// tell nodes.e[] about it
	      		nodes[s%100].e[i] = ed;
				nodes[ns%100].e[tr.pairs[i]] = ed;

	      		// unfreeze node
	      		if (ns%100 != pointA  &&  ns%100 != pointA+1){ // if not start pt
	      			nodes[ns%100].fixed = false;
	      		}

	      		// update adjacency matrix
	      		adjacency.update(edges, nodes, agents, width, height);

	      		
	    		// switch to walk down
	      		//agents[0].CurrentBehavior = agents[0].PreviousBehavior;
	    		//agents[0].PreviousBehavior = agents[0].behaviors[0]; 

	      		break; // exit after the first success (should only be one?)
	      	}
	      	// else{
	      	// 	// console.log(ns, s, nodes[s%100].e[i]);
	      	// }
	     
	      	
	      }
		}


    }
    // gridworld is deterministic, so return only a single next state
    return ns;
  },
  sampleNextState: function(s,a) {
    // gridworld is deterministic, so this is easy
    var ns = this.nextStateDistribution(s,a);
    var r = this.Rarr[s]; // observe the raw reward of being in s, taking a, and ending up in ns
    //console.log(" ");
    //console.log(r);
    r -= 0.01 * adjacency.maxDisplacement();
    r -= 0.001 * edges.length; // every step takes a bit of negative reward times num edges
    // console.log(r);
    var out = {'ns':ns, 'r':r};
    if(s%100 === pointB && ns%100 === (this.startState())%100) {
	      // episode is over
	      out.reset_episode = true;
	      // console.log("over");

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

		adjacency = new Adjacency();
		adjacency.init(edges, nodes, agents, wdth, hght);

    }
    return out;
  },
  allowedActions: function(s) {
  	// here we need to check which nodes have (possible) adjacency
  	//console.log(s);
    /*var x = this.stox(s);
    var y = this.stoy(s);*/
    var as = [];

    if (s%100 > 24){
    	return as
    }
    for (var e = 0; e < 6; e++){
	    if(nodes[s%100].neighbors[e]) {	as.push(e); }
	}
	/*if(x > 0) { as.push(0); }
    if(y > 0) { as.push(1); }
    if(y < this.gh-1) { as.push(2); }
    if(x < this.gw-1) { as.push(3); }*/
    return as;
  },
  randomState: function() { return Math.floor(Math.random()*this.gs); },
  startState: function() { 
  	this.state = 0;
  	for (i = 0; i < 6; i++) {
  		if(nodes[pointA].e[i] != undefined) {
  			this.state += Math.pow(2,i);
  		}
  	}
  	// append the node's state
  	this.state = this.state*100 + pointA
  	return this.state; 
  },
  getNumStates: function() { return this.gs; },
  getMaxNumActions: function() { return 6; },

  // private functions
  stox: function(s) { return Math.floor(s/this.gh); },
  stoy: function(s) { return s % this.gh; },
  xytos: function(x,y) { return x*this.gh + y; },
}



// this function is a workaround provided by user "GoToLoop" on the Processing forum
// https://forum.processing.org/two/discussion/11608/i-can-t-display-images-dynamically-loaded-from-web-with-p5-js-always-a-cross-domain-issue
function loadImageErrorOverride(errEvt) {
  const pic = errEvt.target;
 
  if (!pic.crossOrigin)  return print('Failed to reload ' + pic.src + '!');
 
  print('Attempting to reload it as a tainted image now...');
  pic.crossOrigin = null, pic.src = pic.src;
}