// pipSploder
// marthematicist - 2016
var vers = '0.08';
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
    numPips = 0;
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
    numLevels = 8;
    // level radii
    radLevel = [ 4.75 , 4.25 , 3.75 , 3.25 , 2.75 , 2.25 , 1.75 , 1.25 , 0.75 ];
  }
  
  // PIP VARIABLES
  {
    // Pip size
    pipSize = 0.07;
    // Pip transparency
    pipAlpha = 255;
    // inner Pip transparency
    innerPipAlpha = 32;
    // inner pip color
    innerPipColor = color( 0 , 0 , 0 , innerPipAlpha );
    // pip outline thickness
    pipLineWeight = 0.02;
    // speed values
    minDPA = 0.0003;
    maxDPA = 0.0003;
    // wiggle values
    minWR = 0.03;
    maxWR = 0.03;
    minDWA = 0.017;
    maxDWA = 0.020;
    // transition time (ms)
    transTime = 1500;
    // min/max time per level (ms)
    typMin = 15000;
    typMax = 20000;
    minTimeAtLevel = [ 0 , typMin ,typMin , typMin , typMin , typMin , typMin , typMin ];
    maxTimeAtLevel = [ 0 , typMax ,typMax , typMax , typMax , typMax , typMax , typMax ];
  }
  
  
  // GAME FIELD VARIABLES
  {
    // background transparency
    bgAlpha = 255;
    // background color
    bgColor = color( 64 , 64 , 64 , bgAlpha );
    // game field transparency
    gfAlpha = 10;
    // game field color
    gfColor = color( 0 , 0 , 0 , gfAlpha );
    // game field line alpha
    gfLineAlpha = 32;
    // game field line color
    gfLineColor = color( 255 , 255 , 255 , gfLineAlpha );
    // game field color velocity
    gfColorSpeed = 0.1;
  }
  
  // RECORD-KEEPING VARIABLES
  {
    frameTime = 0;
    avgFrameTime = 100;
  }
  
  // TIME VARIABLES
  {
    // simte since game was initialized
    gameTime = 0;
    // time of last pip added
    newPipTime = 0;
    // time between adding new pips
    timeBetweenNewPips = 2000;
  }
  
  // GLOBAL OBJECTS
  {
    G = 0;
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
function hsvColor( h , s , v , a ) {
  var c = v*s;
  var x = c*( 1 - abs( (h/60) % 2 - 1 ) );
  var m = v - c;
  var rp = 0;
  var gp = 0;
  var bp = 0;
  if( 0 <= h && h < 60 ) {
    rp = c;  gp = x , bp = 0;
  }
  if( 60 <= h && h < 120 ) {
    rp = x;  gp = c , bp = 0;
  }
  if( 120 <= h && h < 180 ) {
    rp = 0;  gp = c , bp = x;
  }
  if( 180 <= h && h < 240 ) {
    rp = 0;  gp = x , bp = c;
  }
  if( 240 <= h && h < 300 ) {
    rp = x;  gp = 0 , bp = c;
  }
  if( 300 <= h && h < 360 ) {
    rp = c;  gp = 0 , bp = x;
  }
  return color( (rp+m)*255 , (gp+m)*255 , (bp+m)*255 , a );
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
  this.s = pipSize;
  // path radius
  this.pr = 4;
  // path angle
  this.pa = random( 0 , TWO_PI );
  // path angle speed
  this.dpa = random( minDPA , maxDPA );
  // wiggle radius
  this.wr = random( minWR , maxWR );
  // wiggle angle
  this.wa = random( 0 , TWO_PI );
  // wiggle angle speed
  this.dwa = random( minDWA , maxDWA );
  // center position (p5.Vector)
  this.x = createVector( (radLevel[this.level] + this.wr*(0.5+0.5*cos( this.wa ) ) )*cos( this.pa ) ,
                         (radLevel[this.level]  + this.wr*(0.5+0.5*cos( this.wa ) ) )*sin( this.pa ) );
  // pip color
  this.strokeColor = hsvColor( random(0,360) , random(0.5,0.5) , random(1,1) , pipAlpha );
  this.fillColor = color( red(this.strokeColor) , green(this.strokeColor) , blue(this.strokeColor) , innerPipAlpha );
  // pip level
  this.level = 0;
  // time at each level
  this.timeAtLevel = [];
  for( var i = 0 ; i < numLevels ; i++ ) {
    this.timeAtLevel[i] = random( minTimeAtLevel[i] , maxTimeAtLevel[i] );
  }
  // start time this level
  this.levelStart = gameTime;
  // transitioning?
  this.transitioning = false;
  // start time for transition
  this.transStart = 0;
  // is Pip alive?
  this.alive = true;
  
  // CLASS METHODS: Pip
  // Pip method: draw
  // draws the Pip to the canvas
  this.draw = function() {
    if( this.alive ) {
      var v0 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.fd , this.s ) ) );
      var v1 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.ld , this.s ) ) );
      var v2;
      if( this.transitioning ) {
        v2 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.fd , -1.5*this.s ) ) );
      } else {
        v2 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.fd , -2*this.s ) ) );
      }
      var v3 = gf2winVect( p5.Vector.add( this.x , p5.Vector.mult( this.ld , -this.s ) ) );
      strokeWeight(pipLineWeight*gf2winFactor);
      stroke( this.strokeColor );
      //fill( this.fillColor );
      beginShape();
      vertex( v0.x , v0.y );
      vertex( v1.x , v1.y );
      vertex( v2.x , v2.y );
      vertex( v3.x , v3.y );
      endShape( CLOSE );
    }
  };
  // Pip method: evolve
  this.evolve = function( dt ) {
    if( this.transitioning ) {
      // if Pip is transitioning, move toward next level
      var a = ( gameTime-this.transStart) / transTime ;
      var r = (1-a)*radLevel[this.level] + a*radLevel[this.level+1];
      this.wa += this.dwa*dt;
      this.wa %= TWO_PI;
      this.moveTo( r*cos( this.pa + 0.9*this.wr*cos(this.wa) ) ,
                   r*sin( this.pa + 0.9*this.wr*cos(this.wa) ) );
      // check if done transitioning. If so, start on next level
      if( ( gameTime-this.transStart) > transTime ) {
        var s = this.dpa * radLevel[this.level] / radLevel[0];
        this.level++;
        if( this.level > numLevels-1 ) {
          this.alive = false;
        } else {
          this.transitioning = false;
          this.levelStart = gameTime;
         this.dpa = s / ( radLevel[this.level] / radLevel[0]);
        }
      }
    } else {
      // if Pip is not transitioning, spin as usual
      if( this.level % 2 === 0 ) {
        this.pa += this.dpa*dt;
      } else {
        this.pa -= this.dpa*dt;
      }
      this.pa %= TWO_PI;
      this.wa += this.dwa*dt;
      this.wa %= TWO_PI;
      this.moveTo( (radLevel[this.level] + this.wr*(0.5+0.5*cos( this.wa ) ) )*cos( this.pa ) ,
                 (radLevel[this.level]  + this.wr*(0.5+0.5*cos( this.wa ) ) )*sin( this.pa ) );
      // check if time is up on this level, and if so start transitioning
      if( gameTime - this.levelStart > this.timeAtLevel[ this.level ] ) {
        this.transitioning = true;
        this.transStart = gameTime;
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

// CLASS: Splosion /////////////////////////////////////////////////////////////
var Splosion = function( x , y , c ) {
  
}

// CLASS: Game /////////////////////////////////////////////////////////////////
var Game = function() {
  // OBJECT VARIABLES:
  // number of Pips
  this.numP = numPips;
  // array of Pips
  this.pips = [];
  for( var i = 0 ; i < numPips ; i++ ) {
    this.pips[i] = new Pip();
  }
  // number of Splosions
  this.numS = 0;
  // array of Splosions
  this.splosions = [];
  
  // CLASS METHODS:
  // Game method: evolve
  // evolves all Pips, Splosions
  this.evolve = function( dt ) {
    // check if it's time for a new pip
    if( gameTime - newPipTime > timeBetweenNewPips ) {
      this.pips[ this.numP ] = new Pip();
      this.numP++;
      newPipTime = gameTime;
    }
    // evolve all Pips
    for( var i = 0 ; i < this.numP ; i++ ) {
      this.pips[i].evolve( dt );
    }
    // remove dead objects
    this.removeDeadObj();
  };
  // Game method: draw
  // draws game field and all Pips, Splosions
  this.draw = function() {
    // draw circles
    strokeWeight( 0.02*gf2winFactor );
    for( var i = 0 ; i < numLevels ; i++ ) {
      var a = gameTime*gfColorSpeed;
      stroke( hsvColor( (a + 360*i/numLevels)%360 , 0.25 , 1 , gfLineAlpha ) );
      noFill();
      var d = ( radLevel[i] - 0.25 )*2*gf2winFactor;
      ellipse( 0.5*xRes , 0.5*yRes , d , d );
    }
    // draw all Pips
    fill( innerPipColor );
    for( var i = 0 ; i < this.numP ; i++ ) {
      this.pips[i].draw();
    }
  };
  // Game method: removeDeadObj
  // removes dead Pips, Splosions
  this.removeDeadObj = function() {
    // remove dead Pips
    var ind = [];
    for( var i = 0 ; i < this.numP ; i++ ) {
      if( !this.pips[i].alive ) {
        append( ind , i );
      }
    }
    reverse( ind );
    for( var i = 0 ; i < ind.length ; i++ ) {
      this.pips.splice( ind[i] , 1 );
    }
    this.numP -= ind.length;
    // remove dead Splosions
    ind = [];
    for( var i = 0 ; i < this.numS ; i++ ) {
      if( !this.splosions[i].alive ) {
        append( ind , i );
      }
    }
    reverse( ind );
    for( var i = 0 ; i < ind.length ; i++ ) {
      this.splosions.splice( ind[i] , 1 );
    }
    this.numS -= ind.length;
  }
  
};

// SETUP FUNCTION //////////////////////////////////////////////////////////////
function setup() {
  setupGlobalVariables();
  createCanvas( xRes , yRes );
  
  // initialize game
  G = new Game();
  
  // draw background
  background(bgColor);
  var c1 = color( 0 , 0 , 0 , 255 );
  var I = 40;
  var dMax = sqrt( xRes*xRes + yRes*yRes );
  for( var i = 0 ; i < I ; i++ ) {
    var d = lerp( dMax , minRes , i/I);
    fill( lerpColor( bgColor , c1 , i/I ) );
    noStroke();
    ellipse( 0.5*xRes , 0.5*yRes , d , d );
  }
  gameTime = 0;
}

function draw() {
  // reset avgFrameTime
  var dt = millis()  - frameTime;
  if( dt < avgFrameTime*3 ) {
    avgFrameTime = 0.9*avgFrameTime + 0.1*(dt);
  }
  frameTime = millis();
  // roll forward gameTime
  gameTime += avgFrameTime;
  //console.log( avgFrameTime );
  
  // draw background
  //background( bgColor );
  
  // draw game field
  fill( gfColor );
  noStroke();
  ellipse( 0.5*xRes , 0.5*yRes , minRes , minRes );
  //rect( ulx , uly , winExt , winExt );
  
  // evolve the game
  G.evolve( avgFrameTime );
  
  // draw the game
  G.draw();
  
}