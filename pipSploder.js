// pipSploder
// marthematicist - 2016
var vers = '1.07';
console.log( 'pipSploder - version ' + vers );


// GLOBAL VARIABLES /////////////////////////////////////////
function setupGlobalVariables() {
  // WINDOW DIMENSION VARIABLES
  {
    // window resolution (pixels)
    xRes = windowWidth;
    yRes = windowHeight;
    minRes = min( xRes , yRes );
    maxRes = max( xRes , yRes );
    // center of window
    xC = 0.5*xRes;
    yC = 0.5*yRes;
    // distance corner-to-corner
    maxDist = sqrt( minRes*minRes + maxRes*maxRes );
    // window area
    winArea = xRes*yRes;
    // window play area upper-left corner screen coordinates
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
  
  // GAME FIELD DIMENSION VARIABLES
  {
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
  
  // GAME FIELD VARIABLES
  {
    // number of Pips at start of game
    startPips = 0;
    // number of levels
    // (this includes level 0, which is the start level.
    //  note that pips immediately transition out of level 0)
    numLevels = 9;
    // level radii
    maxRadius = 4.75;
    minRadius = 1.1;
    // change in radius per level
    dRadius = ( maxRadius - minRadius ) / numLevels;
    // Array of radii for each level
    radLevel = [];
    for( var i = 0 ; i < numLevels+1 ; i++ ) {
      radLevel[i] = maxRadius - dRadius*(i-1);
    }
    // the radius of the end level (where pips damage player)
    radLevel[numLevels] = 1.75;
  }
  
  // GAME FIELD DISPLAY VARIABLES
  {
    // background transparency
    bgAlpha = 255;
    // background color
    bgColor = color( 30 , 30 , 30 , bgAlpha );
    // game field transparency
    gfAlpha = 5;
    // game field color
    gfColor = color( 0 , 0 , 0 , gfAlpha );
    // game field line alpha
    gfLineAlpha = 48;
    // game field line color
    gfLineColor = color( 255 , 255 , 255 , gfLineAlpha );
    // game field color velocity
    gfColorSpeed = 0.1;
  }
  
  // TIME VARIABLES
  {
    // time to spend in pre
    preDuration = 5000;
    // time to draw the last frame
    frameTime = 0;
    // running average of frameTime
    avgFrameTime = 20;
    // time since game was initialized
    gameTime = 0;
    // min time between clicks
    minTimeBetweenClicks = 200;
    // time of last click
    clickTime = 0;
    // time at death
    timeAtDeath = 0;
    // random splosion frequency (pre and post)
    randomSplosionFrequency = 100;
    randomSplosionTime = 0;
  }
  
  // PIP VARIABLES
  {
    // Pip size
    pipSize = 0.07;
    // Pip transparency
    pipAlpha = 255;
    // inner Pip transparency
    innerPipAlpha = 255;
    // pip outline thickness
    pipLineWeight = 0.02;
    // pip speed (change in path angle)
    typDPA = 0.0003;
    typDPASet = 0.0003;
    // time pips spend at each level
    // min/max time per level (ms)
    typMin = 4000;
    typMax = 8000;
    typMinSet = 4000;
    typMaxSet = 8000;
    minTimeAtLevel = [ 0 ];
    maxTimeAtLevel = [ 0 ];
    minTimeAtLevelSet = [ 0 ];
    maxTimeAtLevelSet = [ 0 ];
    for( var i = 1 ; i < numLevels ; i++ ) {
      minTimeAtLevel[i] = typMin;
      maxTimeAtLevel[i] = typMax;
      minTimeAtLevelSet[i] = typMin;
      maxTimeAtLevelSet[i] = typMax;
    }
    // pip transition time
    transTime = 1200;
    transTimeSet = 1200;
    // time between adding new pips
    timeBetweenNewPips = 600;
    timeBetweenNewPipsSet = 600;
    // time of last pip added
    newPipTime = 0;
  }
  
  // PIP SPEED UP VARIABLES
  {
    // time between speeding up
    speedUpInterval = 20000;
    // last time sped up
    speedUpTime = 0;
    // change in time between adding new pips
    timeBetweenNewPipsFactor = 0.92;
    // change in time at level factor
    timeAtLevelFactor = 0.82;
    // change in pip speed factor
    pipSpeedChangeFactor = 1.05;
    // change in pip transition time factor
    transTimeFactor = 0.92;
  }
  
  // BOMB VARIABLES
  {
    // bomb tansparency
    bombTravelAlpha = 255;
    bombBlastAlpha = 255;
    // bomb stroke weight
    bombWeight = 0.2;
    // bomb travel diameter
    bombDiam = 0.09;
    // bomb velocity
    bombVel = 0.003;
    // blast velocity
    blastVel = 0.0022;
    // maximum blast radius
    maxBlast = 1.2;
    // linger time
    bombLinger = 200;
  }
  
  // SPLOSION VARIABLES
  {
    splosionLife = 3000;
    splosionParticles = 20;
    splosionDiam = 0.05;
  }
  
  // BASE VARIABLES
  {
    // BASE: GENERAL
    // base transparency/color
    baseAlpha = 64;
    baseColor = color( 0 , 0 , 0 , baseAlpha );
    baseStroke = color( 0 , 128 , 196 , baseAlpha );
    // base radius
    baseRadius = 1.75;
    // base weight
    baseWeight = 0.03;
    // BASE: LIFE METER ////////////////////////////////
    // maximum life
    maxLife = 20;
    // player life
    playerLife = 20;
    // life alpha
    lifeAlpha = 200;
    // life color
    lifeColor = color( 255 , 0 , 128 , lifeAlpha );
    // life meter radius
    lifeRadius = 1.5;
    // life meter weight
    lifeWeight = 0.1;
    // life meter ratio (of solid)
    lifeRatio = 0.7;
    // life meter angle per unit
    lifeAnglePerUnit = TWO_PI / maxLife;
    // life meter angle displayed per unit
    lifeAngleDisplayed = lifeAnglePerUnit*lifeRatio;
  }
  
  // BOMB METER VARIABLES
  {
    // bomb meter transparency/color
    bmAlpha = 200;
    bmFullColor = color( 0 , 255 , 128 , bmAlpha );
    bmPartColor = color( 0 , 96 , 48 , bmAlpha );
    // max number of bombs
    maxBombs = 3;
    // player's number of bombs
    playerBombs = maxBombs;
    // bomb build speed
    bombBuildSpeed = 0.0009;
    // bomb meter radius
    bmRadius = 1.25;
    // bomb meter weight
    bmWeight = 0.1;
    // bomb meter ratio
    bmRatio = 0.93;
    // bomb meter angle per unit
    bmAnglePerUnit = TWO_PI / maxBombs;
    // bomb meter angle displayed per unit
    bmAngleDisplayed = bmAnglePerUnit*bmRatio;
  }
  
  // POW METER VARIABLES
  {
    // pow meter transparency and color
    pmAlpha = 200;
    pmColor = color( 255 , 128 , 0 , pmAlpha );
    // pow button radius
    pbColor = color( 255 , 255 , 64  , pmAlpha );
    // pow meter max
    pmMax = 100;
    // pow meter value
    pmValue = 0;
    // pow meter radius
    pmRadius = 1;
    // pow  button radius
    pbRadius = 0.75;
    // pow meter weight
    pmWeight = 0.1;
    // levels Pips are powed per pow
    levelsPerPow = 5;
    // pow animation transparency
    paAlpha = 128;
    // min/max radius of pow animation
    paMax = radLevel[ numLevels - levelsPerPow ] ;
    paMin = baseRadius;
    // pow animation on
    paOn = true;
    // pow animation duration
    paDuration = 1500;
    // pow animation start time
    paTime = 0;
    // pow animation weight
    paWeight = 0.05;
    // pow triggered
    powTriggered = false;
  }
  
  // SCORE VARIABLES:
  {
    // game score:
    gameScore = 0;
    // points per Pip
    pointsPerPip = 1000;
    // bonus multiplier for multi-kill bombs
    bonusMultPerPip = 0.5;
    // score text size
    scoreTextSize = 0.60;
    // score transparency
    scoreAlpha = 128;
    // score color
    scoreColor = color( 255 , 255 , 255 , scoreAlpha );
    scorebgAlpha = 128;
    scorebgColor = color( 30 , 30 , 30 , scorebgAlpha);
    // height of score display
    textAlign( LEFT , TOP );
    scoreHeight = font1.textBounds( '120:0,08' , 0 , 0 , scoreTextSize*gf2winFactor ).h*1.3 ;
    // score x, y values
    scoreX1 = xC - 0.5*radLevel[0]*gf2winFactor;
    scoreX2 = xC + 0.5*radLevel[0]*gf2winFactor;
    scoreY = uly;
  }
  
  // CONSTANTS
  {
    LOG10 = log(10);
    LOG1000 = log(1000);
  }
  
  // initialize game
  G = new Game();
  gameTime = 0;
  background(0);
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
// function to format a number with commas
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
// function that returns a text string formatted as a number with input in ms
function millisToTimeString(x) {
  var s = ( round( x % 60000 /1000) ).toString();
  if( s.length < 2 ) { s = '0' + s; }
  var m = ( ( x - (x%60000)) / 60000 ).toString();
  var d = ( round( x % 1000 / 10 ) ).toString();
  if( d.length < 2 ) { d = '0' + d; }
  return ( '' + m + ':' + s + ':' + d );
}

// CLASS: Pip /////////////////////////////////////////////////////////////
var Pip = function( ) {
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
  this.dpa = typDPA;
  // position (p5.Vector)
  this.x = createVector( radLevel[this.level] * cos( this.pa ) , radLevel[this.level] * sin( this.pa ) );
  // pip color
  this.strokeColor = hsvColor( random(0,360) , random(0.5,0.5) , random(1,1) , pipAlpha );
  this.fillColor = color( red(this.strokeColor) , green(this.strokeColor) , blue(this.strokeColor) , innerPipAlpha );
  // pip level (start at 0)
  this.level = 0;
  // time at each level (populate random value for each level)
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
  // did Pip reach the center?
  this.reachedCenter = false;
  
  // CLASS METHODS: Pip
  // Pip method: draw
  // draws the Pip to the canvas
  this.draw = function() {
    if( this.alive ) {
      strokeWeight(pipLineWeight*gf2winFactor);
      stroke( this.strokeColor );
      fill( this.fillColor );
      var v0 = gf2winVect( this.x );
      ellipse( v0.x , v0.y , this.s*gf2winFactor*2 , this.s*gf2winFactor*2 );
      
    }
  };
  // Pip method: evolve
  this.evolve = function( dt ) {
    if( this.transitioning ) {
      // if Pip is transitioning, move toward next level
      var a = ( gameTime-this.transStart) / transTime ;
      var r = (1-a)*radLevel[this.level] + a*radLevel[this.level+1];
      this.x = createVector( r*cos( this.pa ) , r*sin( this.pa ) );
      // check if done transitioning. If so, start on next level
      if( ( gameTime-this.transStart) > transTime ) {
        this.level++;
        if( this.level > numLevels-1 ) {
          // Pip reached the center
          this.alive = false;
          this.reachedCenter = true;
        } else {
          // Pip isn;t at center yet, transition to next level
          this.transitioning = false;
          this.levelStart = gameTime;
          // maintain constant linear speed (d_path_angle increases with level)
          this.dpa = typDPA * radLevel[0] / radLevel[this.level];
        }
      }
    } else {
      // if Pip is not transitioning, spin as usual
      if( this.level % 2 === 0 ) {
        // even levels spin one direction
        this.pa += this.dpa*dt;
      } else {
        // odd levels the opposite direction
        this.pa -= this.dpa*dt;
      }
      this.pa %= TWO_PI;
      if( this.pa < 0 ) { this.pa += TWO_PI; }
      // set new position
      this.x = createVector( radLevel[this.level]*cos( this.pa ) , radLevel[this.level]*sin( this.pa ) );
      // check if time is up on this level, and if so start transitioning
      if( gameTime - this.levelStart > this.timeAtLevel[ this.level ] ) {
        this.transitioning = true;
        this.transStart = gameTime;
      }
    }
    
  };
};

// CLASS: Splosion /////////////////////////////////////////////////////////////
var Splosion = function( x , c ) {
  //OBJECT VARIABLES:
  // position
  this.x = createVector( x.x , x.y );
  // color
  this.color = color( red(c) , green(c) , blue(c) , alpha(c) );
  // lifetime
  this.life = splosionLife;
  // birth time
  this.birth = gameTime;
  // number of particles
  this.np = splosionParticles;
  // diameter of particles
  this.pd = splosionDiam;
  // min/max particle velocities
  this.pvMin = 0.001;
  this.pvMax = 0.002;
  // array of particle positions and velocities
  this.px = [];
  this.pv = [];
  for( var i = 0 ; i < this.np ; i++ ) {
    this.px[i] = createVector( x.x , x.y );
    this.pv[i] = p5.Vector.random2D();
    this.pv[i].mult( random( this.pvMin , this.pvMax ) );
  }
  // is it alive?
  this.alive = true;
  
  // CLASS METHODS:
  // Splosion method: draw
  // draws the Splosion
  this.draw = function() {
    noStroke();
    var c = color( red(this.color) , green(this.color) , blue(this.color) ,
                   255*(1-(gameTime-this.birth)/this.life) );
    fill( c );
    for( var i = 0 ; i < this.np ; i++ ) {
      var p = gf2winVect( this.px[i] );
      ellipse( p.x , p.y , this.pd*gf2winFactor , this.pd*gf2winFactor );
    }
  };
  // Splosion method: evolve
  // evolves the Splosion
  this.evolve = function( dt ) {
    // check if life time is up, and if so kill it
    if( gameTime - this.birth > this.life ) {
      this.alive = false;
    } else {
      // if it is still alive, move it
      for( var i = 0 ; i < this.np ; i++ ) {
        this.px[i].add( p5.Vector.mult( this.pv[i] , dt ) );
      }
    }
  }
};

// CLASS: Bomb ////////////////////////////////////////////////////////
var Bomb = function( xd ) {
  // OBJECT VARIABLES:
  // mode: trav , blast , dying
  this.mode = 'trav';
  // destination (p5.Vector)
  this.xd = createVector( xd.x , xd.y );
  // destination distance (from center)
  this.xdd = this.xd.mag();
  // direction (p5.Vector)
  this.xdir = createVector( xd.x , xd.y );
  this.xdir.normalize();
  // heading
  this.ang = this.xdir.heading() % TWO_PI;
  if( this.ang < 0 ) { this.ang += TWO_PI; }
  // min/max explosion angles (used to detect collisions more efficiently)
  this.minAng = this.ang;
  this.maxAng = this.ang;
  // make sure destination is far enough from center and not too far
  if( this.xdd < baseRadius ) {
    this.xd = p5.Vector.mult( this.xdir , baseRadius );
    this.xdd = baseRadius;
  }
  if( this.xdd > radLevel[1] ) {
    this.xd = p5.Vector.mult( this.xdir , radLevel[1] );
    this.xdd = radLevel[1];
  }
  // normal direction
  this.xnorm = createVector( -this.xdir.y , this.xdir.x );
  // position
  this.xp = p5.Vector.mult( this.xdir , baseRadius );
  // position distance (from center)
  this.xpd = this.xp.mag();
  // originating position
  this.xo = createVector( this.xp.x , this.xp.y );
  // velocity (trav)
  this.v = p5.Vector.mult( this.xdir , bombVel );
  // blast radius
  this.br = 0;
  // alive?
  this.alive = true;
  // time at start of dying
  this.dyingTime = 0;
  // number of Pips killed
  this.pipsKilled = 0;
  // number of loops to do
  this.numLoops = round( 0.65* ( this.xdd - baseRadius ) / dRadius ) ;
  
  
  // CLASS METHODS:
  // Bomb method: draw
  // draws the bomb
  this.draw = function() {
    if( this.mode === 'trav') {
      noStroke();
      var v1 =  p5.Vector.mult( this.xnorm , 0.1*sin(this.numLoops*PI*(this.xpd-baseRadius)/(this.xdd-baseRadius) ) ) ;
      var v3 = gf2winVect( p5.Vector.add( this.xp , v1 ) );
      var v4 = gf2winVect( p5.Vector.sub( this.xp , v1 ) );
      fill(  hsvColor( random(0,360) , 0.5 , 1 , bombTravelAlpha ) );
      ellipse( v3.x , v3.y , bombDiam*gf2winFactor , bombDiam*gf2winFactor );
      fill(  hsvColor( random(0,360) , 0.5 , 1 , bombTravelAlpha ) );
      ellipse( v4.x , v4.y , bombDiam*gf2winFactor , bombDiam*gf2winFactor );
    }
    if( this.mode === 'blast' ) {
      noFill();
      stroke( hsvColor( random(45,315) , 0.5 , 1 , bombBlastAlpha - 0.85*bombBlastAlpha*this.br/maxBlast ) );
      strokeWeight( bombWeight*gf2winFactor );
      var v = gf2winVect( this.xd );
      var d = this.br*2*gf2winFactor;
      ellipse( v.x , v.y , d , d );
    }
  };
  // Bomb method: evolve
  // evolves the bomb
  this.evolve = function( dt ) {
    // if in travel mode
    if( this.mode === 'trav' ) {
      // move it
      this.xp.add( p5.Vector.mult( this.v , dt ) );
      this.xpd = this.xp.mag();
      // if it has traveled past the destination,
      // set postition to destination and change to
      // blast mode
      if( this.xp.mag() > this.xdd ) {
        this.xp = createVector( this.xd.x , this.xd.y );
        this.mode = 'blast';
      }
    }
    // if in blast mode
    if( this.mode === 'blast' ) {
      // increase blast radius
      this.br += blastVel * dt;
      // find min/max explosion angles
      var a = asin( (this.br+2*pipSize) / this.xdd ) % TWO_PI;
      this.minAng = ( this.ang - a ) % TWO_PI;
      if( this.minAng < 0 ) { this.minAng += TWO_PI; }
      this.maxAng = ( this.ang + a ) % TWO_PI;
      if( this.maxAng < 0 ) { this.maxAng += TWO_PI; }
      // if blast radius has exceeded maximum, set
      // it to max and change mode to dying
      if( this.br > maxBlast ) {
        this.br = maxBlast;
        this.mode = 'dying';
        this.dyingTime = gameTime;
      }
    }
    // if in dying mode
    if( this.mode === 'dying' ) {
      // check if linger time expired
      if( gameTime - this.dyingTime > bombLinger ) {
        this.alive = false;
      }
    }
  }
};

// CLASS: Game /////////////////////////////////////////////////////////////////
var Game = function() {
  // OBJECT VARIABLES:
  // game mode: 'pre' 'gameOn' 'post'
  this.mode = 'pre';
  // time this mode started
  this.modeTime = gameTime;
  // trigger next mode switch
  this.triggerNextMode = false;
  // number of Pips
  this.numP = startPips;
  // array of Pips
  this.pips = [];
  for( var i = 0 ; i < startPips ; i++ ) {
    this.pips[i] = new Pip();
  }
  // number of Splosions
  this.numS = 0;
  // array of Splosions
  this.splosions = [];
  // some splosions for the start of game
  for( var i = 0 ; i < 10 ; i++ ) {
    var c = hsvColor( random(0,360) , 0.5 , 1 , pipAlpha );
    var x = createVector( 0 , 0 );
    this.splosions[i] = new Splosion( x , c );
    this.numS++;
  }
  // number of Bombs
  this.numB = 0;
  // array of Bombs
  this.bombs = [];
  
  // CLASS METHODS:
  // Game method: pow
  // splodes all Pips a number of levels (levelsPerPow) from center
  this.pow = function() {
    // parse through all Pips
    for( var i = 0 ; i < this.numP ; i++ ) {
      // if the pip is in the pow levels, splode it
      if( this.pips[i].level >= numLevels - levelsPerPow ) {
        // pip is now dead
        this.pips[i].alive = false;
        // add new Splosion
        append( this.splosions , new Splosion( this.pips[i].x , this.pips[i].strokeColor ) );
              this.numS++;
        // increase score
        gameScore += pointsPerPip;
      }
    }
    // start pow animation
    paOn = true;
    paTime = gameTime;
  }
  // Game method: checkBlasts
  // checks whether blasts have killed any pips
  this.checkBlasts = function() {
    // for each Bomb
    for( var b = 0 ; b < this.numB ; b++ ) {
      // only check bombs in 'blast' mode
      if( this.bombs[b].mode === 'blast' || this.bombs[b].mode === 'dying' ) {
        var b1 = this.bombs[b].minAng;
        var b2 = this.bombs[b].maxAng;
        // parse through all pips
        for( var p = 0 ; p < this.numP ; p++ ) {
          var p1 = this.pips[p].pa;
          // only check pips with angles within the blast angle
          if( (b1>b2)&&(p1>b1||p1<b2) || (b1<=b2)&&(p1>b1&&p1<b2) ) {
            var d = p5.Vector.dist( this.pips[p].x , this.bombs[b].xd );
            // if pip has been hit
            if( d < this.bombs[b].br + pipSize*2 ) {
              // kill the pip
              this.pips[p].alive = false;
              // add new splosion
              append( this.splosions , new Splosion( this.pips[p].x , this.pips[p].strokeColor ) );
              this.numS++;
              // increase pow meter
              pmValue++;
              if( pmValue > pmMax ) { pmValue = pmMax; }
              // increment number of pips this bomb has killed
              this.bombs[b].pipsKilled++;
              // increase game score
              gameScore += pointsPerPip;
            }
          }
        }
      }
    }
  };
  // Game method: updateSpeedVariables
  // updates global variables controlling speed of the game
  this.updateSpeedVariables = function() {
    var e = ( gameTime / speedUpInterval );
    timeBetweenNewPips = timeBetweenNewPipsSet*pow(timeBetweenNewPipsFactor,e);
    for( var i = 0 ; i < numLevels ; i++ ) {
      minTimeAtLevel[i] = minTimeAtLevelSet[i]*pow(timeAtLevelFactor,e);
      maxTimeAtLevel[i] = maxTimeAtLevelSet[i]*pow(timeAtLevelFactor,e);;
    }
    transTime = transTimeSet*pow(transTimeFactor,e);
    typDPA = typDPASet*pow(pipSpeedChangeFactor,e);
  };
  // Game method: evolve
  // evolves all Pips, Splosions
  this.evolve = function( dt ) {
    // EVOLVE: PRE ///////////////////////////////////////
    if( this.mode === 'pre' ) {
      // start pow if it has been triggered
      if( powTriggered ) {
        G.pow();
        powTriggered = false;
      }
      // check if it's time to turn off pow
      if( paOn && (gameTime - paTime > paDuration ) ) {
        paOn = false;
        powTriggered = true;
      }
      // evolve all Splosions
      for( var i = 0 ; i < this.numS ; i++ ) {
        this.splosions[i].evolve( dt );
      }
      // remove dead objects
      this.removeDeadObj();
      // randomly add splosions
      if( gameTime - randomSplosionTime > randomSplosionFrequency) {
          var c = hsvColor( random(0,360) , 0.5 , 1 , 255 );
          append( this.splosions , new Splosion( createVector(0,0) , c ) );
          this.numS++;
          randomSplosionTime = gameTime;
      }
      // check if it's time to transition to game mode 'gameOn'
      if( this.triggerNextMode ) {
        // reset gameTime
        gameTime = 0;
        clickTime = gameTime;
        // set up for 'gameOn'
        this.mode = 'gameOn';
        this.modeTime = gameTime;
        this.numP = startPips;
        // array of Pips
        this.pips = [];
        for( var i = 0 ; i < startPips ; i++ ) {
          this.pips[i] = new Pip();
        }
        // number of Splosions
        this.numS = 0;
        // array of Splosions
        this.splosions = [];
        // add some splosions at the origin
        for( var i = 0 ; i < 10 ; i++ ) {
          var c = hsvColor( random(0,360) , 0.5 , 1 , 255 );
          append( this.splosions , new Splosion( createVector(0,0) , c ) );
          this.numS++;
        }
        // trigger a pow to celebrate
        powTriggered = true;
        background( bgColor );
      }
    }
    // EVOLVE: GAMEON ////////////////////////////////////
    if( this.mode === 'gameOn' ) {
      // update global variables controlling game speed
      this.updateSpeedVariables();
      // start pow if it has been triggered
      if( powTriggered ) {
        G.pow();
        powTriggered = false;
        playerBombs = maxBombs;
      }
      // check if it's time to turn off pow
      if( paOn && (gameTime - paTime > paDuration ) ) {
        paOn = false;
      }
      // check if blast killed any pips
      this.checkBlasts();
      // check if it's time for a new pip
      if( gameTime - newPipTime > timeBetweenNewPips ) {
        this.pips[ this.numP ] = new Pip();
        this.numP++;
        newPipTime = gameTime;
      }
      // evolve all Bombs
      for( var i = 0 ; i < this.numB ; i++ ) {
        this.bombs[i].evolve( dt );
      }
      // evolve all Pips
      for( var i = 0 ; i < this.numP ; i++ ) {
        this.pips[i].evolve( dt );
      }
      // evolve all Splosions
      for( var i = 0 ; i < this.numS ; i++ ) {
        this.splosions[i].evolve( dt );
      }
      // increase bomb meter
      playerBombs += dt * bombBuildSpeed;
      if( playerBombs > maxBombs ) { playerBombs = maxBombs; }
      // remove dead objects
      this.removeDeadObj();
      // check if game is over (move to post)
      if( playerLife <= -1 ) {
        // transition to post mode
        this.mode = 'post';
        this.modeTime = gameTime;
        timeAtDeath = gameTime;
        // clear pips
        this.pips = [];
        this.numP = 0;
        // clear splosions
        this.splosions = [];
        this.numS = 0;
        // clear bombs
        this.bombs = [];
        this.numB = 0;
        background(0);
        powTriggered = true;
      }
    }
    // EVOLVE: POST ///////////////////////////////////////
    if( this.mode === 'post' ) {
      // start pow if it has been triggered
      if( powTriggered ) {
        G.pow();
        powTriggered = false;
      }
      // check if it's time to turn off pow
      if( paOn && (gameTime - paTime > paDuration ) ) {
        paOn = false;
        powTriggered = true;
      }
      // evolve all Splosions
      for( var i = 0 ; i < this.numS ; i++ ) {
        this.splosions[i].evolve( dt );
      }
      // remove dead objects
      this.removeDeadObj();
      // randomly add splosions
      if( gameTime - randomSplosionTime > randomSplosionFrequency) {
          var c = hsvColor( random(0,360) , 0.5 , 1 , 255 );
          append( this.splosions , new Splosion( createVector(0,0) , c ) );
          this.numS++;
          randomSplosionTime = gameTime;
      }
    }
  };
  // Game method: draw
  // draws game field and all Pips, Splosions
  this.draw = function() {
    // DRAW: GAMEON ////////////////////////////////////////////////////////////////
    if( this.mode === 'gameOn' ) {
      // draw background
      background( gfColor );
      // draw level circles
      strokeWeight( 0.02*gf2winFactor );
      for( var i = 0 ; i < numLevels ; i++ ) {
        var a = gameTime*gfColorSpeed;
        stroke( hsvColor( (a + 360*i/numLevels)%360 , 0.25 , 1 , gfLineAlpha ) );
        noFill();
        var d = ( radLevel[i] - 0.5*dRadius )*2*gf2winFactor;
        ellipse( xC , 0.5*yRes , d , d );
      }
      // draw all Bombs
      for( var i = 0 ; i < this.numB ; i++ ) {
        this.bombs[i].draw();
      }
      // draw all Pips
      for( var i = 0 ; i < this.numP ; i++ ) {
        this.pips[i].draw();
      }
      // draw all Splosions
      for( var i = 0 ; i < this.numS ; i++ ) {
        this.splosions[i].draw();
      }
      // draw the pow animation
      if( paOn ) {
        var a = (gameTime - paTime)/paDuration;
        var d1 = 2*gf2winFactor*( paMin + (paMax - paMin)*(0.5+0.5*cos(TWO_PI*a) ) );
        var d2 = 2*gf2winFactor*( paMin + (paMax - paMin)*(0.5-0.5*cos(TWO_PI*a) ) );
        noFill();
        strokeWeight( paWeight*gf2winFactor );
        stroke( hsvColor( 360*a , 1 , 1 , paAlpha*(1-a) ) );
        ellipse( xC , yC , d1 , d1 );
        stroke( hsvColor( 360*(1-a) , 1 , 1 , paAlpha*(1-a) ) );
        ellipse( xC , yC , d2 , d2 );
      }
      // draw the base
      fill( baseColor );
      var d = 2*baseRadius*gf2winFactor;
      stroke( baseStroke );
      strokeWeight( baseWeight*gf2winFactor );
      ellipse( xC , yC , d , d );
      // draw pow meter
      if( pmValue > 0 ) {
        d = pmRadius * gf2winFactor * 2;
        noFill();
        stroke( pmColor );
        strokeWeight( pmWeight*gf2winFactor );
        arc( xC , yC , d , d , 0 , TWO_PI*pmValue/pmMax );
      }
      // draw pow button (if pm is full)
      if( pmValue >= pmMax ) {
        noStroke()
        fill( pbColor );
        d = pbRadius * gf2winFactor * 2;
        ellipse( xC , yC , d , d );
        textAlign( CENTER , CENTER );
        fill( lifeColor );
        textFont( font1 );
        textSize( 0.5*gf2winFactor );
        text( 'BOMBE' , xC , yC );
      }
      // draw life meter
      d = lifeRadius * gf2winFactor * 2;
      noFill();
      stroke( lifeColor );
      strokeWeight( lifeWeight*gf2winFactor );
      for( var i = 0 ; i < playerLife ; i++ ) {
        arc( xC , yC , d , d , i*lifeAnglePerUnit - 0.5* lifeAngleDisplayed ,
             i*lifeAnglePerUnit + 0.5* lifeAngleDisplayed );
      }
      // draw bomb meter
      d = bmRadius * gf2winFactor * 2;
      stroke( bmFullColor );
      strokeWeight( bmWeight*gf2winFactor );
      for( var i = 0 ; i < playerBombs ; i++ ) {
        if( i+1 > playerBombs ) {
          stroke( bmPartColor );
          arc( xC , yC , d , d , i*bmAnglePerUnit - 0.5*bmAngleDisplayed ,
              i*bmAnglePerUnit - 0.5*bmAngleDisplayed + (playerBombs%1)*bmAngleDisplayed );
        }else {
          arc( xC , yC , d , d , i*bmAnglePerUnit - 0.5*bmAngleDisplayed ,
               i*bmAnglePerUnit + 0.5*bmAngleDisplayed );
        }
        
      }
      // draw score
      var cv = (gameTime*0.05)%360;
      var scoreText = numberWithCommas( gameScore );
      textFont( font1 );
      textAlign( RIGHT , TOP );
      textSize( scoreTextSize*gf2winFactor );
      var bbox = font1.textBounds(scoreText, 0.05*xRes , 0 , scoreTextSize*gf2winFactor );
      fill( scorebgColor );
      noStroke();
      rect( 0 , scoreY , scoreX1 , scoreHeight );
      fill( hsvColor( cv , 0.5 , 1 , 255 ) );
      text( scoreText , scoreX1 , scoreY );
      
      // draw time
      var cv = (gameTime*0.05)%360;
      var timeText = millisToTimeString( gameTime );
      textAlign( LEFT , TOP );
      textSize( scoreTextSize*gf2winFactor );
      fill( scorebgColor );
      var x2 = xC + 0.5*radLevel[0]*gf2winFactor;
      rect( scoreX2 , scoreY , xRes - scoreX2 , scoreHeight );
      fill( hsvColor( cv , 0.5 , 1 , 255 ) );
      text( timeText , scoreX2 , scoreY );
    }
    // DRAW: POST ////////////////////////////////////////////////////////////////////
    if( this.mode === 'post' ) {
      // game over screen
      background( 0 , 0 , 0 , 64 );
      // draw the pow animation
      if( paOn ) {
         var a = (gameTime - paTime)/paDuration;
        var d1 = 2*gf2winFactor*( pmRadius + (2*pmRadius - pmRadius)*(0.5+0.5*cos(TWO_PI*a) ) );
        var d2 = 2*gf2winFactor*( pmRadius + (2*pmRadius - pmRadius)*(0.5-0.5*cos(TWO_PI*a) ) );
        noFill();
        strokeWeight( paWeight*gf2winFactor );
        stroke( hsvColor( 360*a , 1 , 1 , paAlpha*(1) ) );
        ellipse( xC , yC , d1 , d1 );
        stroke( hsvColor( 360*(a) , 1 , 1 , paAlpha*(1) ) );
        ellipse( xC , yC , d2 , d2 );
      }
      // draw all Splosions
      for( var i = 0 ; i < this.numS ; i++ ) {
        this.splosions[i].draw();
      }
      // draw the game over info
      noStroke();
      fill(255);
      textAlign( CENTER , CENTER );
      textFont( font2 );
      textStyle( NORMAL );
    	textSize( minRes*0.08 );
    	var scoreText = numberWithCommas( gameScore );
    	var timeText = millisToTimeString( timeAtDeath );
    	var cv = (gameTime*0.05)%360;
    	fill( hsvColor( (cv+30)%360 , 0.5 , 1 , 196 ) );
    	text( 'GAME OVER', xC , yC - 0.25*winExt );
    	textFont( font1 );
    	textSize( minRes*0.05 );
    	text( 'score: ' + scoreText + '\ntime: ' + timeText  , xC , yC + 0.25*winExt );
    	// draw restart button
    	noStroke();
      fill( hsvColor( (cv)%360 , 0.5 , 0.5 , 196 ) );
      d = pmRadius * gf2winFactor * 2;
      ellipse( xC , yC , d , d );
      textAlign( CENTER , CENTER );
      fill( hsvColor( (cv+30)%360 , 0.5 , 1 , 196 ) );
      textFont( font1 );
      textSize( 0.57*gf2winFactor );
      textStyle( BOLD );
      text( 'RESTART' , xC , yC );
    }
    // DRAW: PRE /////////////////////////////////////////////////////////////////////////
    if( this.mode === 'pre' ) {
      // game over screen
      background( 0 , 0 , 0 , 64 );
      // draw the pow animation
      if( paOn ) {
        var a = (gameTime - paTime)/paDuration;
        var d1 = 2*gf2winFactor*( pmRadius + (2*pmRadius - pmRadius)*(0.5+0.5*cos(TWO_PI*a) ) );
        var d2 = 2*gf2winFactor*( pmRadius + (2*pmRadius - pmRadius)*(0.5-0.5*cos(TWO_PI*a) ) );
        noFill();
        strokeWeight( paWeight*gf2winFactor );
        stroke( hsvColor( 360*a , 1 , 1 , paAlpha*(1) ) );
        ellipse( xC , yC , d1 , d1 );
        stroke( hsvColor( 360*(a) , 1 , 1 , paAlpha*(1) ) );
        ellipse( xC , yC , d2 , d2 );
      }
      // draw all Splosions
      for( var i = 0 ; i < this.numS ; i++ ) {
        this.splosions[i].draw();
      }
      noStroke();
      fill(255);
      textFont( font2 );
      textAlign( CENTER , CENTER );
    	textSize( minRes*0.1 );
    	textStyle( NORMAL );
    	//var scoreText = numberWithCommas( gameScore );
    	var cv = (gameTime*0.05)%360;
    	fill( hsvColor( (cv+30)%360 , 0.5 , 1 , 128 ) );
    	text( 'PIP SPLODER', xC , yC - 0.37*winExt );
    	textSize( minRes*0.05 );
    	text( '- marthematicist -', xC , yC - 0.25*winExt );
    	textFont( font1 );
    	textSize( minRes*0.05 );
    	text( 'version ' + vers  , xC , yC + 0.25*winExt );
    	// draw begin button
    	noStroke();
      fill( pbColor );
      fill( hsvColor( (cv)%360 , 0.5 , 0.5 , 220 ) );
      d = pmRadius * gf2winFactor * 2;
      ellipse( xC , yC , d , d );
      textAlign( CENTER , CENTER );
      fill( hsvColor( (cv+30)%360 , 0.5 , 1 , 255 ) );
      textFont( font1 );
      textSize( 0.7*gf2winFactor );
      textStyle( BOLD );
      text( 'BEGIN' , xC , yC );
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
        if( this.pips[i].reachedCenter ) { playerLife--; }
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
    // remove dead Bombs
    ind = [];
    for( var i = 0 ; i < this.numB ; i++ ) {
      if( !this.bombs[i].alive ) {
        var n = this.bombs[i].pipsKilled;
        if( n > 1 ) {
          var m = (n-1)*bonusMultPerPip;
          gameScore += n*pointsPerPip*m;
        }
        append( ind , i );
      }
    }
    reverse( ind );
    for( var i = 0 ; i < ind.length ; i++ ) {
      this.bombs.splice( ind[i] , 1 );
    }
    this.numB -= ind.length;
  }
};

// P5 PRELOAD FUNCTION ////////////////////////////////////////////////////////////
function preload() {
  font1 = loadFont('assets/DS-DIGI.TTF');
  font2 = loadFont('assets/PLANK.TTF');
}


// P5 SETUP FUNCTION //////////////////////////////////////////////////////////////
function setup() {
  setupGlobalVariables();
  createCanvas( xRes , yRes );
  
  textStyle( BOLD );
  // draw background
  background( 30 , 30 , 30 , 255 );
}
// P5 DRAW FUNCTION ////////////////////////////////////////////////////////////////
function draw() {
  
  // reset avgFrameTime
  var dt = millis()  - frameTime;
  if( dt < avgFrameTime*10 ) {
    avgFrameTime = 0.9*avgFrameTime + 0.1*(dt);
  }
  frameTime = millis();
  // roll forward gameTime
  gameTime += avgFrameTime;

  // evolve the game
  G.evolve( avgFrameTime );
  
  // draw the game
  G.draw();

  // log out data periodically
  if( frameCount % 500 === 0 ) {
    //console.log( 'avgFrameTime=' + avgFrameTime + ' numP=' + G.numP );
  }
}

// EVENT HANDLER: TOUCH ////////////////////////////////////////////////////////////
function touchStarted() {
  // check min time btw clicks
  if( gameTime - clickTime > minTimeBetweenClicks ) {
    clickTime = gameTime;
    // get mouse position
    var m = win2gfVect( createVector( mouseX , mouseY ) );
    // GAME MODE: GAMEON
    if( G.mode === 'gameOn' ) {
      // if pow meter is filled and touch is in pow button, trigger a pow
      if( (pmValue >= pmMax) && ( m.mag() <= pmRadius ) ) {
        powTriggered = true;
        pmValue = 0;
      } else {
        // if the player has bpmbs, make a new bomb
        if( playerBombs >= 1 ) {
          var m = win2gfVect( createVector( mouseX , mouseY ) );
          append( G.bombs , new Bomb( m ) );
          G.numB++;
          playerBombs--;
        }
      }
    }
    // GAME MODE: POST
    // if reset button pushed, reset
    if( (G.mode === 'post') && (m.mag() <= pmRadius) ) {
      background(bgColor);
      setupGlobalVariables();
      // skip load screen
      G.triggerNextMode = true;
    }
    // GAME MODE: PRE
    // if begin button pushed, begin
    if( (G.mode === 'pre') && (m.mag() <= pmRadius) ) {
      background(bgColor);
      G.triggerNextMode = true;
    }
  }
}
/*
function touchStarted() {
  var m = win2gfVect( createVector( mouseX , mouseY ) );
  append( G.bombs , new Bomb( m ) );
  G.numB++;
}
*/