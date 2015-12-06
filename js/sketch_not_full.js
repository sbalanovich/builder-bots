/* TO DO
	- implement behaviors
		- buildDirectional, reinforce, walk on ground, balance, recycle? 
		- allow bD to reach target point
	- limited number of struts?
	- give mass to agents
	- add rainbow gradient
	- debug forces 
	- function for destroying truss, start over
	- update imagery, background, rocks, 
	- html game instructions
	- high scores

*/
var nodes = [];
var edges = [];
var agents = [];
var sl = 30;
var width = 600;
var height = 400;
var startup = true;

var background;
var bot0, bot1, bot2;

var backgroundImg, bot0Img, bot1Img, bot2Img;
var button0, button1, button2;
var CB = 0;

var pointA = [60, height - 20]
var pointB = [width - 60, 60]

function setup() {

	createCanvas(600, 400);
	frameRate(30);

	tr = new Truss();
    tr.initiate();
 
  	loadImage("assets/background.png",
            function (pic) { print(backgroundImg = pic), redraw(); },
            loadImageErrorOverride);

  	button0 = createButton('BUILD');
  	button0.position(20, 20);
  	button0.mousePressed(function changeBuild(){ CB = 0;});
  	
  	button1 = createButton('RETURN');
  	button1.position(100, 20);
  	button1.mousePressed(function changeReturn(){ CB = 1;});

  	button1 = createButton('REINFORCE');
  	button1.position(200, 20);
  	button1.mousePressed(function changeReinforce(){ CB = 2;});

    updateSprites(false);
}


function draw() {

	if (startup) {
		background(0);
		fill(255);
	    textAlign(CENTER);
	    textSize(16);
	    text("instructions", width/2, height/2);
	}
	else{
		background(backgroundImg);

		var stop = 3000; 
		if (frameCount % 5 == 0 && frameCount < stop) {
			tr.step();
			//console.log("step");
		} 

		if (frameCount < stop){
			tr.move();
		}

		for (var i = 0, length = edges.length; i < length; i++) {
			edges[i].render();		
		}

		for (var i = 0, length = nodes.length; i < length; i++) {
			nodes[i].render();		
		}

		for (var i = 0, length = agents.length; i < length; i++) {
			agents[i].render();		
		}

		
		drawSprites();
	}

	ellipse(pointA[0], pointA[1], 10, 10);
	ellipse(pointB[0], pointB[1], 10, 10);

	fill('rgba(100%,100%,100%,0.2)');
	strokeWeight(1);
	ellipse(mouseX, mouseY, 40, 40);
}

function mousePressed() {
	if (startup) startup = false;
	//var n = new Node(mouseX, mouseY);
	//nodes.push(n);
	for (var i = 0, length = agents.length; i < length; i++) {
		var dist = Math.sqrt((agents[i].n.x - mouseX)*(agents[i].n.x - mouseX) + (agents[i].n.y - mouseY)*(agents[i].n.y - mouseY));

		if (dist < sl){
			agents[i].CurrentBehavior = agents[i].behaviors[CB];
			console.log("changed to " + CB);
		}

			
	}

	return false;
}



function Node(id, xPos, yPos) {
	this.id = id;
	this.x = xPos;
	this.y = yPos;

    this.isOccupied = false;

    this.e = [];

    this.fixed = false;
    if (yPos > (height - sl)) this.fixed = true; 

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

    this.enableEdge = function (i, edge) {
		this.e[i] = edge;
		return true;
    }

    this.disableEdge = function(i) {
		this.e[i] = undefined;
		return true;
    }
	
	this.render = function() {
		//var color = Math.abs(this.fx) + Math.abs(this.fy);
		//fill(color * 100, 0, 0);
		stroke(0);
		ellipse(this.x, this.y, 10, 10);

		//text(Math.round(this.fy*10), this.x, this.y);
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

    	var color = (sl - dist) * 100;
    	if (color > 0) {
    		stroke((color * 100), 0, 0);
    	} else {
    		stroke(0, 0, (-color * 100));
    	}
    	strokeWeight(3);
		line(this.n0.x, this.n0.y, this.n1.x, this.n1.y);
	}
}


function Agent(tr, n){

	this.bot0Img = loadImage("assets/bot0.png",
            function (pic) { print(bot0Img = pic), redraw(); },
            loadImageErrorOverride);
	this.bot1Img = loadImage("assets/bot1.png",
            function (pic) { print(bot1Img = pic), redraw(); },
            loadImageErrorOverride);
	this.bot2Img = loadImage("assets/bot2.png",
            function (pic) { print(bot1Img = pic), redraw(); },
            loadImageErrorOverride);

	this.bot = createSprite(0, height);
    this.bot.rotateToDirection = true;
    this.bot.addImage("bot0", this.bot0Img);
    this.bot.addImage("bot1", this.bot1Img);
    this.bot.addImage("bot2", this.bot2Img);

    this.behaviors = [];// = new Behaviors();

    this.behaviors.push(new Directional());
    this.behaviors.push(new WalkDown());
    this.behaviors.push(new Reinforce());

    this.CurrentBehavior = this.behaviors[0];
    this.PreviousBehavior = this.behaviors[0];

    this.n = n;

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
        //BuildUp(this, tr);
    }

    this.render = function() {
    	this.bot.position.x = this.n.x;
    	this.bot.position.y = this.n.y;
	}
}


// ████████╗██████╗ ██╗   ██╗███████╗███████╗
// ╚══██╔══╝██╔══██╗██║   ██║██╔════╝██╔════╝
//    ██║   ██████╔╝██║   ██║███████╗███████╗
//    ██║   ██╔══██╗██║   ██║╚════██║╚════██║
//    ██║   ██║  ██║╚██████╔╝███████║███████║
//    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝


function Truss() {

    this.numAgents = 4;
    this.dirs = [];
    
    var nodeId = 0;

    for (var i = 0; i < 6; ++i){
        var a = i * 2.0 * Math.PI / 6.0;
        this.dirs[i] = [sl * Math.cos(a), -sl * Math.sin(a)];
    }

    this.pairs = [3, 4, 5, 0, 1, 2];

    this.initiate = function () {
        var n = new Node(nodeId, pointA[0], pointA[1]);
        nodes.push(n);
        nodeId++;
        for(var i = 0; i < this.numAgents; i++){
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

		for (var i = 0, length = nodes.length; i < length; i++) {
			nodes[i].move(dt, damping);	
			//console.log(nodes[i].fx + ", " + nodes[i].fy);
			
		}

		for (var i = 0, length = agents.length; i < length; i++) {
			
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
	var n = a.n;

	var StoreWeights = [20, 30, 30, 20, 0, 0];
	var weights =  [20, 30, 30, 20, 0, 0];

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

			a.n = nextNode;
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

		if (ee != null){
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
//  ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═══╝

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
	var n = a.n;

	var weights =  [10, 0, 0, 10, 40, 40];

	// check the height of that node
	if ( n.y > height - 30 /*&& n.x < 30*/){

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

			a.n = nextNode;
			nextNode.isOccupied = true;
			n.isOccupied = false;
			return true;
		}
		else{
			console.log("fail");
		}
	}

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
	var n = a.n;

	var weights =  [20, 30, 30, 20, 20, 20];

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

			a.n = nextNode;
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