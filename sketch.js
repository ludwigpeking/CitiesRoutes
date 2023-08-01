class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.neighbours = [];
    }
} 

class City extends Node {
    constructor(x, y, weight) {
        super(x, y);
        this.weight = weight;
        this.diameter = Math.sqrt(weight);
        this.neighbours = [];
    }
}


class Road {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
        this.active = false;
        this.distance = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
    }
}

let cities = [];
let intermediates = [];
let nodes=[];
let triangles = [];
let points = [];
let genePool=[];
let delaunay;
let sizeOfInitialGenePool = 100;
const numberOfCities = 10;
const numberOfIntermediates = 10;

function setup() {
  randomSeed(18);
  createCanvas(720, 400);
    
  points = []; //points array for Delaunator
  genePool = [];

  // generate random cities
  for (let i = 0; i < numberOfCities; i++) {
    cities.push(new City(random(width - 50) + 25, random(height - 50) + 25, 2 ** random(8)));
    nodes.push(cities[i]);
    points.push([cities[i].x, cities[i].y, cities[i].diameter]);    
  }
  //generate random intermediate nodes
  for (let j = 0; j < numberOfIntermediates; j++) {
    intermediates.push(new Node(random(width - 50) + 25, random(height - 50) + 25));
    nodes.push(intermediates[j]);
    points.push([nodes[j + numberOfCities].x, nodes[j + numberOfCities].y, 1]);
  }

  delaunay = Delaunator.from(points);
  updateNeighbours(delaunay);
  // generate sizeOfInitialGenePool number of random routes. Each route starts from point 0, next point is randomly chosen from the neighbours of current point. If there is untravelled city  in the neighbors, this untravelled city point is chosen. otherwise, random point is chosen. This is repeated until all cities are visited. need to keep count of visited cities. backward move is allowed.
  //note there are cities and intermediates in the nodes array. cities are the first numberOfCities elements, intermediates are the last numberOfIntermediates elements.
  for (let i = 0; i < sizeOfInitialGenePool; i++) {
    let route = [];
    let visited = [];
    let current = 0;
    let next = 0;
    let unvisitedCities = [];
    for (let j = 0; j < numberOfCities; j++) {
      unvisitedCities.push(j);
    }
 
    while (unvisitedCities > 0) {
      route.push(current);
      visited.push(current);
      let neighbours = nodes[current].neighbours;
      let unvisitedNeighbours = [];
      for (let j = 0; j < neighbours.length; j++) {
        if (!visited.includes(neighbours[j].node)) {
          unvisitedNeighbours.push(neighbours[j]);
        }
      }
      if (unvisitedNeighbours.length > 0) {
        next = unvisitedNeighbours[Math.floor(Math.random() * unvisitedNeighbours.length)].node;
      }
      else {
        next = nodes[Math.floor(Math.random() * nodes.length)];
      }
      current = next;
      unvisitedCities--;
      
 
    }



    
  // run fitness function on each set of intermediate nodes
  for (let i = 0; i < sizeOfInitialGenePool; i++) {
          genePool[i].fitness = fitness(genePool[i]);
    }
  // sort the gene pool by fitness value descending
  genePool.sort(function(a, b) {
    return b.fitness - a.fitness;
  }
  );
  // take the highest fitness value set of intermediate nodes and add them to the nodes array
  for (let i = 0; i < numberOfIntermediates; i++) {
      nodes.push(genePool[0][i]);
  }

}

function draw() {
  background(200);

  //draw the solution of the highest fitness value set of intermediate nodes, with the cities. active roads are drawn in red



}

function fitness(set){
  let paths = [];
  let pathsCost = 0; //path length * weight of city1 * weight of city2
  delaunay = Delaunator.from(set);
  updateNeighbours(delaunay);
  pathfinding(delaunay);
    
  return roadCost(delaunay) + pathCost;
}

function updateNeighbours(delaunay){
  //first clear the neighbours array
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].neighbours = [];
  }
  //then update the neighbours array
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    let node1 = nodes[delaunay.triangles[i]];
    let node2 = nodes[delaunay.triangles[i + 1]];
    let node3 = nodes[delaunay.triangles[i + 2]];
    let dist12 = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
    let dist13 = Math.sqrt((node1.x - node3.x) ** 2 + (node1.y - node3.y) ** 2);
    let dist23 = Math.sqrt((node2.x - node3.x) ** 2 + (node2.y - node3.y) ** 2);
    node1.neighbours.push({node: node2, distance: dist12});
    node1.neighbours.push({node: node3, distance: dist13});
    node2.neighbours.push({node: node1, distance: dist12});
    node2.neighbours.push({node: node3, distance: dist23});
    node3.neighbours.push({node: node1, distance: dist13});
    node3.neighbours.push({node: node2, distance: dist23});

}




function roadCost(set){
  let cost = 0;
  for (let i = 0; i < activeRoads.length; i++) {
      cost += activeRoads[i].distance;
  }
  return cost;
}

function pathCost(set){
  let cost = 0;
  for (let i = 0; i < numberOfCities; i++) {
      for (let j = 0; j < numberOfCities; j++) {
          if (i != j) {
              cost += pathfinding(i, j) * cities[i].weight * cities[j].weight;
          }
      }
  }
  return cost;
}
//pathfinding delaunay should 
function pathfinding(delaunay){
  paths = [];
  pathCost = 0;

  return paths
}

