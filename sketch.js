var happyDog, sadDog, database, foodS, foodStock;
var dogImg, happyDogImg;
var feedPet, addFood;
var fedTime, lastFed;
var foodObj;

var currentTime;

var gameState;

var bedroomImg, gardenImg, washroomImg;

function preload(){
  dogImg = loadImage("images/dogImg.png");
  happyDogImg = loadImage("images/dogImg1.png");
  bedroomImg = loadImage("images/Bed Room.png");
  washroomImg = loadImage("images/Wash Room.png");
  gardenImg = loadImage("images/Garden.png");

}

function setup() {
	createCanvas(1000, 700);
  
  database = firebase.database();

  foodObj = new FoodClass();

  foodStock = database.ref("food");
  foodStock.on("value", readStock);

  happyDog = createDog(happyDogImg);
  sadDog = createDog(dogImg);

  happyDog.visible = false;
  sadDog.visible = true;

  feedPet = createButton("Feed the dog");
  feedPet.position(700,95);
  feedPet.mousePressed(feedDog);

  addFood = createButton("Add food");
  addFood.position(800,95);
  addFood.mousePressed(addFoods);
  
  var gsRef = database.ref("gameState");
  gsRef.on("value",readGS);
}


function draw() {  
  background(46, 139, 87);
 
  foodObj.display();

  fedTime = database.ref("FeedTime");
  fedTime.on("value", function(data){
    lastFed = data.val();
  });

  textSize(20);
  fill(255);

  if(lastFed >= 12){
    text("Last feed: " + lastFed%12 + " PM", 350, 30);
  }
  else if(lastFed === 0){
    text("Last feed: 12 AM", 350, 30);
  }
  else{
    text("Last feed: " + lastFed + " PM", 350, 30);
  }
  
  if(gameState === "hungry"){
    addFood.show();
    feedPet.show();
  }
  else{
    addFood.hide();
    feedPet.hide();
  }

  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  currentTime = h

  if(currentTime === lastFed + 1){
    foodObj.garden();
    gameState = "playing";
    updateGS(gameState);
  }

  else if(currentTime === lastFed + 2){
    foodObj.bedroom();
    gameState = "sleeping";
    updateGS(gameState);
  }

  else if(currentTime > lastFed + 2 && currentTime <= lastFed + 4){
    foodObj.washroom();
    gameState = "bathing";
    updateGS(gameState);
  }

  else{
    gameState = "hungry";
    updateGS(gameState);
  }
  drawSprites();

}

function readStock(data){
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
}

function readGS(data){
  gameState = data.val();
}

function updateGS(state){
  database.ref("/").update({
    gameState: state
  });
}

function feedDog(){
  happyDog.visible = true;
  sadDog.visible = false;

  if(foodS >= 1){
    var d = new Date();
    var h = d.getHours();
    foodObj.updateFoodStock(foodObj.getFoodStock()-1);
    database.ref('/').update({
    FeedTime: h,
    food:foodObj.getFoodStock()
  });
  }
  
}

function addFoods(){
  happyDog.visible = false;
  sadDog.visible = true;

  foodS++;
  database.ref("/").update({
    food:foodS
  });
}

function createDog(img){
  var dog = createSprite(250, 250, 20, 20);
  dog.addImage(img);
  dog.scale = 0.2;
  return dog;
}