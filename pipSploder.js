// pipSploder
// marthematicist - 2016
var vers = '0.09';
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
    maxDist = sqrt( minRes*minRes + maxRes*maxRes );
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
    radLevel = [];
    for( var i = 0 ; i < numLevels+1 ; i++ ) {
      radLevel[i] = 5.25 - 0.5*i;
    }
  }
  
  // PIP VARIABLES
  {
    // Pip size
    pipSize = 0.07;
    // Pip transparency
    pipAlpha = 255;
    // inner Pip transparency
    innerPipAlpha = 255;
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
    typMin = 2000;
    typMax = 5000;
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
    timeBetweenNewPips = 500;
  }
  
  // GLOBAL OBJECTS
  {
    G = 0;
  }
  
  // BASE VARIABLES
  {
    // base radius
    baseRadius = 1;
  }
  
  // BOMB VARIABLES
  {
    // bomb tansparency
    bombTravelAlpha = 255;
    bombBlastAlpha = 100;
    // bomb stroke weight
    bombWeight = 0.2;
    // bomb travel diameter
    bombDiam = 0.09;
    // bomb velocity
    bombVel = 0.003;
    // blast velocity
    blastVel = 0.0022;
    // maximum blast radius
    maxBlast = 1;
    // linger time
    bombLinger = 200;
  }
  
  // SPLOSION VARIABLES
  {
    splosionLife = 3000;
    splosionParticles = 20;
    splosionDiam = 0.05;
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
      /*
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
      fill( this.fillColor );
      beginShape();
      vertex( v0.x , v0.y );
      vertex( v1.x , v1.y );
      vertex( v2.x , v2.y );
      vertex( v3.x , v3.y );
      endShape( CLOSE );
      */
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
      if( this.pa < 0 ) { this.pa += TWO_PI; }
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
    /*
    var newX = createVector( x , y );
    var newFD = p5.Vector.sub( newX , this.x );
    newFD.normalize();
    */
    this.x = createVector( x , y );
    /*
    this.fd = createVector( newFD.x , newFD.y );
    this.ld = createVector( -newFD.y , newFD.x );
    */
  };
};

// CLASS: Splosion /////////////////////////////////////////////////////////////
var Splosion = function( x , c ) {
  //OBJECT VARIABLES:
  // position
  this.x = createVector( x.x , x.y );
  // color
  this.color = color( red(c) , green(c) , blue(c) , alpha(c) );
  // position (polar)
  this.angle = this.x.heading() % TWO_PI;
  this.radius = this.x.mag();
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
  // min/max explosion angles
  this.minAng = this.ang;
  this.maxAng = this.ang;
  // make sure destination is far enough from center
  if( this.xdd < baseRadius ) {
    this.xd = p5.Vector.mult( this.xdir , baseRadius );
    this.xdd = baseRadius;
  }
  if( this.xdd > radLevel[1] ) {
    this.xd = p5.Vector.mult( this.xdir , radLevel[1] );
    this.xdd = radLevel[1];
  }
  // normal direction
  this.xnorm = createVector( -this.xdir.y , this.xdir.x )
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
  
  
  // CLASS METHODS:
  // Bomb method: draw
  // draws the bomb
  this.draw = function() {
    if( this.mode === 'trav') {
      noStroke();
      var v1 =  p5.Vector.mult( this.xnorm , 0.1*sin(4*PI*(this.xpd-baseRadius)/(this.xdd-baseRadius) ) ) ;
      var v3 = gf2winVect( p5.Vector.add( this.xp , v1 ) );
      var v4 = gf2winVect( p5.Vector.sub( this.xp , v1 ) );
      fill(  hsvColor( random(0,360) , 0.5 , 1 , bombTravelAlpha ) );
      ellipse( v3.x , v3.y , bombDiam*gf2winFactor , bombDiam*gf2winFactor );
      fill(  hsvColor( random(0,360) , 0.5 , 1 , bombTravelAlpha ) );
      ellipse( v4.x , v4.y , bombDiam*gf2winFactor , bombDiam*gf2winFactor );
    }
    if( this.mode === 'blast' ) {
      noFill();
      stroke( hsvColor( random(0,360) , 0.5 , 1 , bombBlastAlpha ) );
      strokeWeight( bombWeight*gf2winFactor );
      var a = 0.1;
      var rx = createVector( this.xd.x + random(-a,a) , this.xd.y + random(-a,a) );
      var v = gf2winVect( rx );
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
      // it to max and kill the bomb
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
  // number of Bombs
  this.numB = 0;
  // array of Bombs
  this.bombs = [];
  
  // CLASS METHODS:
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
            if( d < this.bombs[b].br + pipSize*2 ) {
              this.pips[p].alive = false;
              append( this.splosions , new Splosion( this.pips[p].x , this.pips[p].strokeColor ) );
              this.numS++;
            }
          }
        }
      }
    }
  };
  // Game method: evolve
  // evolves all Pips, Splosions
  this.evolve = function( dt ) {
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
    // draw all Bombs
    for( var i = 0 ; i < this.numB ; i++ ) {
      this.bombs[i].draw();
    }
    // draw all Pips
    fill( innerPipColor );
    for( var i = 0 ; i < this.numP ; i++ ) {
      this.pips[i].draw();
    }
    // draw all Splosions
    for( var i = 0 ; i < this.numS ; i++ ) {
      this.splosions[i].draw();
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
    // remove dead Bombs
    ind = [];
    for( var i = 0 ; i < this.numB ; i++ ) {
      if( !this.bombs[i].alive ) {
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

// SETUP FUNCTION //////////////////////////////////////////////////////////////
function setup() {
  setupGlobalVariables();
  createCanvas( xRes , yRes );
  
  // initialize game
  G = new Game();
  gameTime = 0;
  
  // draw background
  background( bgColor );
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
  

  
  
  
  
  // draw game field
  fill( gfColor );
  noStroke();
  var d = 2*(radLevel[0]+0.2)*gf2winFactor;
  ellipse( 0.5*xRes , 0.5*yRes , d , d );
  //rect( ulx , uly , winExt , winExt );
  
  
  // evolve the game
  G.evolve( avgFrameTime );
  
  // draw the game
  G.draw();
  
  // draw background
  var r = 0.5*(minRes + maxDist )+0.5*gf2winFactor;
  var t = 0.5*(maxDist - minRes );
  strokeWeight(t);
  stroke(64);
  noFill();
  ellipse( 0.5*xRes , 0.5*yRes , r , r );
  
  if( frameCount % 100 === 0 ) {
    console.log( 'avgFrameTime=' + avgFrameTime + ' numP=' + G.numP );
  }
}

function touchStarted() {
  var m = win2gfVect( createVector( mouseX , mouseY ) );
  append( G.bombs , new Bomb( m ) );
  G.numB++;
}
/*
function touchStarted() {
  var m = win2gfVect( createVector( mouseX , mouseY ) );
  append( G.bombs , new Bomb( m ) );
  G.numB++;
}
*/