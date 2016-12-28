// pipSploder
// marthematicist - 2016
var vers = '0.02';
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
    numPips = 500;
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
  }
  
  // PIP CONSTRUCTOR VARIABLES
  {
    // random color parameters
    minc = 150;
    maxc = 255;
    minColorDev = 20;
    // speed values
    minDPA = 0.008;
    maxDPA = 0.016;
    // wiggle values
    minWR = 0.2;
    maxWR = 0.3;
    minDWA = 0.06;
    maxDWA = 0.10;
  }
  
  
  // DRAW VARIABLES
  {
    // Pip transparency
    pipAlpha = 255;
    // background transparency
    bgAlpha = 255;
    // background color
    bgColor = color( 255 , 255 , 255 , bgAlpha );
    // game field transparency
    gfAlpha = 20;
    // game field color
    gfColor = color( 128 , 128 , 128 , gfAlpha );
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
  this.x = createVector( (this.pr + this.wr*(0.5+0.5*cos( this.wa ) ) )*cos( this.pa ) ,
                         (this.pr + this.wr*(0.5+0.5*cos( this.wa ) ) )*sin( this.pa ) );
  // pip color
  this.color = color( random(minc,maxc) , random(minc,maxc) , random(minc,maxc) , pipAlpha );
  
  // CLASS METHODS: Pip
  // Pip method: draw
  // draws the Pip to the canvas
  this.draw = function() {
    var v0 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.fd , this.s ) ) );
    var v1 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.ld , this.s ) ) );
    var v2 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.fd , -2*this.s ) ) );
    var v3 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.ld , -this.s ) ) );
    fill( this.color );
    beginShape();
    vertex( v0.x , v0.y );
    vertex( v1.x , v1.y );
    vertex( v2.x , v2.y );
    vertex( v3.x , v3.y );
    endShape( CLOSE );
  };
  // Pip method: evolve
  this.evolve = function() {
    this.pa += this.dpa;
    this.wa += this.dwa;
    this.moveTo( (this.pr + this.wr*cos( this.wa ) )*cos( this.pa ) ,
                 (this.pr + this.wr*cos( this.wa ) )*sin( this.pa ) );
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
  // draw background
  background( bgColor );
  
  // draw game field
  fill( gfColor );
  rect( ulx , uly , winExt , winExt );
  
  
  // draw pips
  fill( 200 , 200 , 255 , 255 );
  for( var i = 0 ; i < numPips ; i++ ) {
    var r = 4 + random( -0.02 , 0.02 );
    P[i].evolve();
    P[i].draw();
  }
}