// pipSploder
// marthematicist - 2016
var vers = '0.01';
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
      gfe = yRes;
    } else {
      uly = 0.5*(yRes - xRes);
      ulx = 0;
      winExt = xRes;
    }
  }
  
  // GAME FIELD VARIABLES
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
  
  
  // DRAW VARIABLES
  {
    // background transparency
    bgAlpha = 255;
    // background color
    bgColor = color( 255 , 255 , 255 , bgAlpha );
    // game field transparency
    gfAlpha = 20;
    // game field color
    gfColor = color( 128 , 128 , 128 , gfAlpha );
  }
  
}

// UTILITY FUNCTIONS //////////////////////////////////////////////////////
// functions to convert vectors from sim to window & vice versa
function gf2winVect( a ) {
	return createVector( (a.x - xMin)*gf2winFactor + ulx ,
						           (a.y - yMin)*gf2winFactor + uly );
}
function win2gfVect( a ) {
	return createVector( (a.x - ulx)*win2gfFactor + xMin ,
						           (a.y - uly)*win2gfFactor + yMin );
}

function setup() {
  setupGlobalVariables();
  createCanvas( xRes , yRes );
  buf1 = createGraphics( xRes , yRes );
  buf2 = createGraphics( xRes , yRes );
}

function draw() {
  // draw background
  background( bgColor );
  
  // draw trail layer background
  buf1.fill( gfColor );
  buf1.rect( ulx , uly , winExt , winExt );
  buf1.noStroke();
  buf1.fill( 255 , 0 , 0 , 255 );
  buf1.ellipse( mouseX , mouseY , 20 , 20 );
  buf2.clear();
  buf2.ellipse( mouseX , mouseY , 20 , 20 );
  
  
  image( buf1 , 0 , 0 );
  image( buf2 , 0 , 0 );

}