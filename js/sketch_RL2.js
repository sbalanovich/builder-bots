/* TO DO

*/

var nodes = [];
var edges = [];
var agents = [];
var agentSprites;

var numAgents = 1;
var modo = 1;
var maxStress = 0.5;

var sl = 45; // Default length of 45 units
var wdth = 5; // 30 triangles on each side
var hght = 5;

// Assuming W = H = 30 and (0, 0) is at top left
var span = sl*5;
var ground = hght*sl - span;
var pointA = 20;
var pointB = 4;

var startup = true, gameWon = false, gameLost = false;

var bot0, bot1, bot2, bot3;

var bot0Img, bot1Img, bot2Img, bot3Img;
var CB = 0;

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
    //state = env.startState();
    spec = { alpha: 0.01 }
    //agent = new RL.TDAgent(env, spec);
    agent = new RL.DQNAgent(env, spec);

    updateSprites(false);
}


function draw() {


	background(255);

	var timeout = 30000; 
	
	// every N frames
	if (frameCount % modo == 0 /*&& frameCount < timeout*/) {
		tr.step();
	} 

	// every frame
	//if (frameCount < timeout){
		tr.move();
	//}

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

	ellipse(nodes[pointA].x, nodes[pointA].y, 10, 10);
	ellipse(nodes[pointB].x, nodes[pointB].y, 10, 10);

	// draw the sprite objects last, so they're on top of edges and nodes
	drawSprites();


}

function mousePressed() {
		
/*	// clear any existing truss 
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

	loop();
}*/


}


function keyPressed(){
	adjacency.update(edges, nodes, agents, wdth, hght);
	for (var i = 0; i < adjacency.adj.length; i++) {
		for (var j = 0; j < adjacency.adj[0].length; j++) {
			if (adjacency.adj[i][j] > 0) {
				console.log(i, j, adjacency.adj[i][j]);
			}
		}
	}
	// console.log(adjacency.adj);
	return false;
}



function Node(id, xPos, yPos) {
	this.id = id;
	this.x = xPos;
	this.y = yPos;
	this.stox = xPos;
	this.stoy = yPos;

    this.isOccupied = false;
    this.lastIndex = 0;

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

    	var color = (sl - dist) * 350;
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
    //this.behaviors.push(new Directional());
    this.behaviors.push(new WalkDown());
    //this.behaviors.push(new Reinforce());
    this.behaviors.push(new Traverse());

    // use the traverse behavior to execute learning actions
    this.CurrentBehavior = this.behaviors[1];
    this.PreviousBehavior = this.behaviors[1];


    this.currentNode = nodes[pointA];
    this.previousNode = nodes[pointA];

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
            this.addAgent(nodes[pointA]);
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
	
	var n = a.currentNode;
	a.previousNode = a.currentNode;

	var weights =  [30, 40, 40, 30, 30, 30];

	// check if the node has found the start 
	if ( n.id == pointA){
		//console.log(ground);
		a.CurrentBehavior = a.PreviousBehavior;
		a.PreviousBehavior = a.behaviors[1];
		return true;
	}

	var strutIndex = 6;

	// TRY TO MOVE
	for(var i = 0; i < 6; i++) {

		if(weights[i] == 0) continue;

		if(a.previousNode.id == n.neighbors[i]){
			console.log("herE")
			//weights[i] = 0;
			continue;
		}
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

		/*if (nextNode.isOccupied){
			weights[i] = 0;
			continue;
		}*/

		var nX = n.stox + tr.dirs[i][0];
		var nY = n.stoy + tr.dirs[i][1];

		pAx = nodes[pointA].stox;
		pAy = nodes[pointA].stoy;

		var preDist = sqrt((pAx - n.stox)*(pAx - n.stox) + (pAy - n.stoy)*(pAy - n.stoy));
		var newDist = sqrt((pAx - nX)*(pAx - nX) + (pAy - nY)*(pAy - nY));

		// if nextNode is closer to target, double probability
		if (newDist < preDist){
			weights[i] = weights[i] * 20;
			//strutIndex = i;
		}
	}

	//console.log(weights);
	var strutIndex = this.getRandom(weights);

	if (strutIndex < 6){
		var ee = n.e[strutIndex];

		if (ee != null){
			var N0 = ee.n0;
			var N1 = ee.n1;

			var nextNode = N0;
			if (nextNode.id == n.id) nextNode = N1;

			//console.log(n.lastIndex);

			//a.previousNode = a.currentNode;
			a.currentNode = nextNode;
			nextNode.isOccupied = true;
			n.isOccupied = false;
			n.lastIndex = strutIndex;
			return true;
		}
		else{
			console.log("fail");
		}
	}

	//console.log("fail");
	return false;

}


 var steps_per_tick = 1;
var sid = -1;
var action, state;
var smooth_reward_history = [];
var smooth_reward = null;
var flott = 0;
var nflot = 0;

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

Traverse.prototype.step = function ( aa, tr){

	Behavior.prototype.step.call(this);
	// find the node that the agent is sitting on
	
	//console.log("new traverse");
	//console.log(aa.previousNode.id, aa.currentNode.id);
	//aa.previousNode = aa.currentNode;
	

	
    state = env.getState();
    action = agent.act(state);

    var neighbor = nodes[state[0]].neighbors[action];

    if(neighbor) {
    	aa.previousNode = aa.currentNode;
	    var obs = env.sampleNextState(action);
	    agent.learn(obs.r);
	 

	    var pn = aa.previousNode;
	  	var n = nodes[state[0]];

	    //var sns = aa.currentNode.neighbors[i]; // next state sample is the index of the node at neighbors

	    // check if strut exists, if not, add it
	  	if ( pn.e[action] == undefined){	
	  		// add strut 
	  		var ed = tr.addEdge(pn, n);

	  		// tell nodes.e[] about it
	  		pn.e[action] = ed;
			n.e[tr.pairs[action]] = ed;

	  		// unfreeze node
	  		if (n.id !== pointA  &&  n.id !== pointA+1){ // if not start pt
	  			n.fixed = false;
	  		}

	  		
	  	}

	  	// update adjacency matrix
	  	adjacency.update(edges, nodes, agents, wdth, hght);

		aa.currentNode = nodes[state[0]];
		console.log(state);
		//console.log(aa.previousNode.id, aa.currentNode.id);
		//aa.previousNode = aa.currentNode;
	}
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
/*  this.Rarr = null; // reward array
  this.T = null; // node types 0 = inactive, 1 = active
  this.s = pointA;
  this.ns = pointA;*/
  this.reset()
}
Gridworld.prototype = {
  reset: function() {

    // hardcoding one gridworld for now
    this.gw = wdth;
    this.gh = hght;
    //this.gs = this.gh * this.gw; // number of states
    this.gs = 8; // number of states

    // define parameters of state space
    this.id = pointA;
    this.px = nodes[pointA].x;
    this.py = nodes[pointA].y;
    this.f0 = 0;
    this.f1 = 0;
    this.f2 = 0;
    this.f3 = 0;
    this.f4 = 0;
    this.f5 = 0;


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
  getState: function() {
        var s = [this.id, this.id, this.f0, this.f1, this.f2, this.f3, this.f4, this.f5];
        return s;
  },
  sampleNextState: function(a) {
    
    var r = -0.01 * adjacency.maxDisplacement(); // observe the raw reward of being in s, taking a, and ending up in ns
    r -= 0.001 * edges.length; // every step takes a bit of negative reward times num edges
   
   	


   	var neighbor = nodes[state[0]].neighbors[a];

    if(neighbor) {	// if this exists as a possible move

    	adjacency.update(edges, nodes, agents, width, height);

    	
    	this.id = neighbor;

    	// update current forces
    	this.f0 = adjacency.adj[neighbor][0];
    	this.f1 = adjacency.adj[neighbor][1];
    	this.f2 = adjacency.adj[neighbor][2];
    	this.f3 = adjacency.adj[neighbor][3];
    	this.f4 = adjacency.adj[neighbor][4];
    	this.f5 = adjacency.adj[neighbor][5];


    	if(neighbor === pointB) {
		      // episode is over
		      //out.reset_episode = true;
		      console.log("over");

		      r += 1; // assign a reward for success

		      //this.reset();
		}

    }
    else {
    	// return null
    	//this.id = 
    }

    // evolve state in time
    var ns = this.getState();
    var out = {'ns':ns, 'r':r};
    return out;
  },
  getNumStates: function() { return 8; },
  getMaxNumActions: function() { return 6; },

  // private functions
  stox: function(s) { return Math.floor(s/this.gh); },
  stoy: function(s) { return s % this.gh; },
  xytos: function(x,y) { return x*this.gh + y; },
}


// below not yet used, could be helpful for loading successful agents
function saveAgent() {
      $("#mysterybox").fadeIn();
      $("#mysterybox").val(JSON.stringify(agent.toJSON()));
    }

function loadAgent() {
  $.getJSON( "agentzoo/puckagent.json", function( data ) {
    agent.fromJSON(data); // corss your fingers...
    // set epsilon to be much lower for more optimal behavior
    agent.epsilon = 0.05;
    $("#slider").slider('value', agent.epsilon);
    $("#eps").html(agent.epsilon.toFixed(2));
    // kill learning rate to not learn
    agent.alpha = 0;
  });
}

function resetAgent() {
  eval($("#agentspec").val())
  agent = new RL.DQNAgent(env, spec);
}




// this function is a workaround provided by user "GoToLoop" on the Processing forum
// https://forum.processing.org/two/discussion/11608/i-can-t-display-images-dynamically-loaded-from-web-with-p5-js-always-a-cross-domain-issue
function loadImageErrorOverride(errEvt) {
  const pic = errEvt.target;
 
  if (!pic.crossOrigin)  return print('Failed to reload ' + pic.src + '!');
 
  print('Attempting to reload it as a tainted image now...');
  pic.crossOrigin = null, pic.src = pic.src;
}