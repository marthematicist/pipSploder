// pipSploder
// marthematicist - 2016
var vers = '0.07';
console.log( 'pipSploder - version ' + vers );

// GLOBAL VARIABLES /////////////////////////////////////////
function setupGlobalVariables() {
  // DISPLAY WINDOW VARIABLES
  {
    // window resolution (pixels)
    xRes = windowWidth;
    yRes = windowHeight;
    minRes = min( xRes , yRes );
    maxRes = max( xRes , yRes );
    winArea = xRes*yRes;
    // gamefield upper-left corner screen coordinates and gamefield extent
    // (depends on screen orientation)
    if( xRes > yRes ) {
      ulx = 0.5*(xRes - yRes);
      uly = 0;
      winExt = yRes;
    } else {
      uly = 0.5*(yRes - xRes);
      ulx = 0;
      winExt = xRes;
    }
  }
  
  // GAME FIELD VARIABLES
  {
    // number of Pips
    numPips = 80;
    // extent of game field
    gfExt = 10;
    // border edges
    xMin = -0.5*gfExt;
    yMin = -0.5*gfExt;
    xMax = 0.5*gfExt;
    yMax = 0.5*gfExt;
    // conversion factors gamefield <-> window
    gf2winFactor = winExt / gfExt;
    win2gfFactor = gfExt / winExt;
    // number of levels
    numLevels = 7;
    // level radii
    radLevel = [ 4.5 , 4 , 3.5 , 3 , 2.5 , 2 , 1.5 ];
  }
  
  // PIP VARIABLES
  {
    // random color parameters
    minc = 150;
    maxc = 255;
    minColorDev = 20;
    // speed values
    minDPA = 0.0003;
    maxDPA = 0.0004;
    // wiggle values
    minWR = 0.02;
    maxWR = 0.03;
    minDWA = 0.010;
    maxDWA = 0.020;
    // transition time (ms)
    transTime = 1500;
    // min/max time per level (ms)
    minTimeAtLevel = [ 0 , 10000 , 10000 , 10000 , 10000 , 10000 , 9999999999999 ];
    maxTimeAtLevel = [ 40000 , 15000 , 15000 , 15000 , 15000 , 15000 , 99999999999999 ];
  }
  
  
  // DRAW VARIABLES
  {
    // Pip transparency
    pipAlpha = 255;
    // inner Pip transparency
    innerPipAlpha = 64;
    // inner pip color
    innerPipColor = color( 255 , 255 , 255 , innerPipAlpha );
    // background transparency
    bgAlpha = 255;
    // background color
    bgColor = color( 255 , 255 , 255 , bgAlpha );
    // game field transparency
    gfAlpha = 20;
    // game field color
    gfColor = color( 0 , 0 , 0 , gfAlpha );
  }
  
  // RECORD-KEEPING VARIABLES
  {
    frameTime = 0;
    avgFrameTime = 20;
  }
  
  // GLOBAL OBJECTS
  {
    P = [];
  }
  
}

// UTILITY FUNCTIONS //////////////////////////////////////////////////////
// functions to convert vectors from game field to window & vice versa
function gf2winVect( a ) {
	return createVector( (a.x - xMin)*gf2winFactor + ulx ,
						           (a.y - yMin)*gf2winFactor + uly );
}
function win2gfVect( a ) {
	return createVector( (a.x - ulx)*win2gfFactor + xMin ,
						           (a.y - uly)*win2gfFactor + yMin );
}
// function to choose a random color
function randomColor( minCV , maxCV , minDev , alpha ) {
  var colorAcceptable = false;
  var r = 0;
  var g = 0;
  var b = 0;
  while( !colorAcceptable ) {
    r = random( minCV , maxCV );
    g = random( minCV , maxCV );
    b = random( minCV , maxCV );
    var a = (r + g + b)/3;
    var dev = sqrt( ( (a-r)*(a-r) + (a-g)*(a-g) + (a-b)*(a-b) ) / 3 );
    if( dev > minDev ) { colorAcceptable = true; }
  }
  return color( r , g , b , alpha );
}

// CLASS: Pip /////////////////////////////////////////////////////////////
var Pip = function( ) {
  // CONSTRUCTOR INPUTS: Pip
  //  xIn: center position
  // OBJECT VARIABLES: Pip
  // forward direction (normalized p5.Vector)
  this.fd = createVector( 1 , 0 );
  // lateral direction (normalized p5.Vector)
  this.ld = createVector( -this.fd.y , this.fd.x );
  // size value
  this.s = 0.1;
  // path radius
  this.pr = 4;
  // path angle
  this.pa = random( 0 , 2*PI );
  // path angle speed
  this.dpa = random( minDPA , maxDPA );
  // wiggle radius
  this.wr = random( minWR , maxWR );
  // wiggle angle
  this.wa = random( 0 , 2*PI );
  // wiggle angle speed
  this.dwa = random( minDWA , maxDWA );
  // center position (p5.Vector)
  this.x = createVector( (radLevel[this.level] + this.wr*(0.5+0.5*cos( this.wa ) ) )*cos( this.pa ) ,
                         (radLevel[this.level]  + this.wr*(0.5+0.5*cos( this.wa ) ) )*sin( this.pa ) );
  // pip color
  this.color = color( random(minc,maxc) , random(minc,maxc) , random(minc,maxc) , pipAlpha );
  // pip level
  this.level = 0;
  // time at each level
  this.timeAtLevel = [];
  for( var i = 0 ; i < numLevels ; i++ ) {
    this.timeAtLevel[i] = random( minTimeAtLevel[i] , maxTimeAtLevel[i] );
  }
  // start time this level
  this.levelStart = millis();
  // transitioning?
  this.transitioning = false;
  // start time for transition
  this.transStart = 0;
  
  // CLASS METHODS: Pip
  // Pip method: draw
  // draws the Pip to the canvas
  this.draw = function() {
    var v0 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.fd , this.s ) ) );
    var v1 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.ld , this.s ) ) );
    var v2 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.fd , -2*this.s ) ) );
    var v3 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.ld , -this.s ) ) );
    stroke( this.color );
    beginShape();
    vertex( v0.x , v0.y );
    vertex( v1.x , v1.y );
    vertex( v2.x , v2.y );
    vertex( v3.x , v3.y );
    endShape( CLOSE );
  };
  // Pip method: evolve
  this.evolve = function( dt ) {
    if( this.transitioning ) {
      // if Pip is transitioning, move toward next level
      var a = ( millis()-this.transStart) / transTime ;
      var r = (1-a)*radLevel[this.level] + a*radLevel[this.level+1];
      this.moveTo( r*cos( this.pa ) , r*sin( this.pa ) );
      // check if done transitioning. If so, start on next level
      if( ( millis()-this.transStart) > transTime ) {
        var s = this.dpa * radLevel[this.level] / radLevel[0];
        this.level++;
        this.transitioning = false;
        this.levelStart = millis();
        this.dpa = s / ( radLevel[this.level] / radLevel[0]);
      }
    } else {
      // if Pip is not transitioning, spin as usual
      if( this.level % 2 === 0 ) {
        this.pa += this.dpa*dt;
      } else {
        this.pa -= this.dpa*dt;
      }
      this.wa += this.dwa*dt;
      this.moveTo( (radLevel[this.level] + this.wr*(0.5+0.5*cos( this.wa ) ) )*cos( this.pa ) ,
                 (radLevel[this.level]  + this.wr*(0.5+0.5*cos( this.wa ) ) )*sin( this.pa ) );
      // check if time is up on this level, and if so start transitioning
      if( millis() - this.levelStart > this.timeAtLevel[ this.level ] ) {
        this.transitioning = true;
        this.transStart = millis();
      }
    }
    
    
  };
  // Pip method: moveTo
  // moves the Pip to a new location and orients it based on previous location
  this.moveTo = function( x , y ) {
    var newX = createVector( x , y );
    var newFD = p5.Vector.sub( newX , this.x );
    newFD.normalize();
    this.x = createVector( x , y );
    this.fd = createVector( newFD.x , newFD.y );
    this.ld = createVector( -newFD.y , newFD.x );
  };
};

function setup() {
  setupGlobalVariables();
  createCanvas( xRes , yRes );
  
  for( var i = 0 ; i < numPips ; i++ ) {
    var r = 4;
    P[i] = new Pip( r*cos( 2*PI*i/numPips ) , r*sin( 2*PI*i/numPips ) );
  }
}

function draw() {
  // reset frameTime
  var dt = millis()  - frameTime
  avgFrameTime = 0.99*avgFrameTime + 0.01*(dt);
  frameTime = millis();
  
  // draw background
  //background( bgColor );
  
  // draw game field
  fill( gfColor );
  noStroke();
  rect( ulx , uly , winExt , winExt );
  
  
  // draw pips
  fill( innerPipColor );
  for( var i = 0 ; i < numPips ; i++ ) {
    var r = 4 + random( -0.02 , 0.02 );
    P[i].evolve( avgFrameTime );
    
    strokeWeight(2);
    P[i].draw();
  }
}