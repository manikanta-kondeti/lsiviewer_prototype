/* Author: Manikanta, K S Rajan */

// Global Variables Declaration

/* Related to Canvas */
var canvas, context, canvasWidth=1450, canvasHeight=600, drawScale, xMin, xMax, yMin, yMax, flagShift=0;

/* Related to styling */
var _zoomX=canvasWidth/2, _zoomY=canvasHeight/2, _moveX=0, _moveY=0, _labelWidth=4, _labelColor="#1c1313" , _penWidth=1, _fillColor="#c9baba", _strokeColor="000000", scaleCount=1;
var _mouseMove=0;


/* Data Variable*/
var geojson, labels=[], labelFlag=0, attrPopup=0, flagZoom=0, labelValue;


// Main Code 
$(document).ready(function(){
					 console.log('Document Loaded ');
					 $.post(php_var+'.json','',function(response){
								load(response);
								_moveX=0;
								_moveY=0;
								});
					 });


/*** Load --  Takes geojson from ajax. 
  Gives it to the global variable geojson.
  Create canvas and event listeners. 
  Calls InitJson -- Method 
  draw -- Method ( Display the map) 
  labelsFill and traverseLabels (Filling labels in arrays and giving control to the UI)--- 
 */


function load(response){
		  geojson = response;
		  //console.log(geojson);
		  canvas = document.getElementById("map");
		  context = canvas.getContext('2D');
		  canvas.addEventListener('mousedown',MouseDown, 'false');
		  canvas.addEventListener('mouseup',MouseUp, 'false');
		  canvas.addEventListener('mousemove',MouseMove, 'false');
		  canvas.addEventListener('DOMMouseScroll',handleScroll,false);
		  canvas.addEventListener('mousewheel',handleScroll,false);
		  initJson(geojson);

		  draw(geojson.features,'draw');
		  labelsFill();
		  traverseLabels(geojson.features);
};

// Initial Function 
function initJson(geojson){
		  //Initial setup for canvas
		  canvas = document.getElementById('map');
		  context = canvas.getContext('2d');
		  //Calculating Bounding Box 
		  draw(geojson.features,'bbox');
		  xScale = canvas.width/Math.abs(xMax-xMin);
		  yScale = canvas.height/Math.abs(yMax-yMin);
		  drawScale = xScale<yScale ? xScale : yScale;
		  if (((xMax-xMin)*drawScale)<canvasWidth/2){
					 flagShift = 1;
					 console.log("flagShift = "+flagShift);
		  }
		  //check for shifting the figure 
		  console.log(" for Points xMin = "+xMin + " xMax = "+xMax +" yMin = "+yMin+" yMax = "+yMax+ " xScale = "+xScale+ " yScale = "+yScale + " drawScale = "+drawScale );
}


/* This function is used to keep track of initial attributes = labels array will have the attributes data */
function labelsFill(){
		  var count=0;
		  for (var k in geojson.features[0].properties){
					 if (typeof geojson.features[0].properties[k] !== 'function') {
								labels[count++]=k;
					 }
		  }

		  for(var i = 0; i < labels.length; i++) {

					 $('.labels').append('<option>'+labels[i]+'</option>');

		  }

		  /*var select = document.getElementById("label");
			 var el = document.createElement("option");
			 el.textContent = "None";
			 el.value = "None";
			 select.appendChild(el);
			 for(var i = 0; i < labels.length; i++) {
			 var opt = labels[i];
			 var el = document.createElement("option");
			 el.textContent = opt;
			 el.value = opt;
			 select.appendChild(el);
			 }*/
}


/* getCenter = Appends center coords for each feature */
var getCenter = function(coords,geomtype){
		  var centerX=0, centerY=0;
 	    // console.log("geomtype = "+ geomtype+ "coords = "+ coords.length);
		  if(geomtype=="Point"){
					 console.log("In getCenters method, With point data x = "+ coords[0]+ " y = "+ coords[1]);
					 centerX = coords[0];
					 centerY = coords[1];
		  }

		  else if(geomtype=="LineString"){
					 console.log("LineString Coords"+ coords[0].length);
					 for(var i=0;i<coords.length;i++){
								var obj=coords[i];
								centerX += parseFloat(obj[0]);
								centerY += parseFloat(obj[1]);
					 }
					 centerX /= coords[0].length;
					 centerY /= coords[0].length;
		  }

		  else if(geomtype="Polygon"){
					 var pMinx, pMaxx,pMiny, pMaxy;
					 for(var i=0;i<coords[0].length;i++){
								var obj=coords[0][i];
								pMinx = pMinx<obj[0]?pMinx:obj[0];
								pMaxx = pMaxx>obj[0]?pMaxx:obj[0];
								pMiny = pMiny<obj[1]?pMiny:obj[1];
								pMaxy = pMaxy>obj[1]?pMaxy:obj[1];
					 }
					 centerX = (pMinx + pMaxx)/2;
					 centerY = (pMiny + pMaxy)/2;
		  }

		  else if(geomtype=="MultiPoint"){
					 for(var i=0;i<coords[0].length;i++){
								var obj=coords[0][i];
								centerX += parseFloat(obj[0]);
								centerY += parseFloat(obj[1]);
					 }
					 centerX /= coords[0].length;
					 centerY /= coords[0].length;
		  }

		  else if(geomtype=="MultiLineString"){
					 var pMinx, pMaxx,pMiny, pMaxy;
					 for(var i=0;i<coords[0].length;i++){
								var obj=coords[0][i];
								pMinx = pMinx<obj[0]?pMinx:obj[0];
								pMaxx = pMaxx>obj[0]?pMaxx:obj[0];
								pMiny = pMiny<obj[1]?pMiny:obj[1];
								pMaxy = pMaxy>obj[1]?pMaxy:obj[1];
					 }
					 centerX = (pMinx + pMaxx)/2;
					 centerY = (pMiny + pMaxy)/2;
		  }

		  else if(geomtype=="MultiPolygon"){
		  }
		  return [centerX,centerY];
} 




/* TraverseLabels = Appending centers to each feature(point, linestring, polygon, multi)  */

function traverseLabels(features){
		  for(var i=0;i<features.length;i++){
					 var coords = features[i].geometry.coordinates;
					 var geomtype = features[i].geometry.type;
					 var centers = getCenter(coords,geomtype);
					 // Put them into properties object and you're done.
					 //		console.log("centers[0]="+centers[0]+ " centers[1]="+centers[1]);
					 var props = features[i].properties;
					 props["centerX"]=centers[0];
					 props["centerY"]=centers[1];
		  }
		  for (var k in props){
					 if (typeof props[k] !== 'function') {
								//	console.log("        Key is " + k + ", value is" + props[k]);
					 }
		  }
}


/* Traverse Features = Draw (Heart in the application) */ 


function draw(features,action){
		  context.beginPath();
		  context.clearRect(0,0,(canvasWidth),(canvasHeight));
		  context.save();
		  context.translate(_zoomX,_zoomY);
		  context.scale(scaleCount,scaleCount);
		  context.translate(-_zoomX,-_zoomY);
		  context.translate(_moveX,_moveY);

		  if(flagShift == 1){
					 context.translate(canvasWidth/2-300,0);
		  }
		  context.fillStyle = "#"+_fillColor;
		  context.lineWidth = _penWidth;
		  context.strokeStyle = "#"+_strokeColor; 

		  var imageObj = new Image();
		  var w= 64;
		  var h = 64;
		  imageObj.onload = function() {
					 context.drawImage(imageObj,canvasWidth-200,canvasHeight-100,w,h);
		  };
		  imageObj.src = 'assets/img/north.png';
		  for(var i=0; i<features.length; i++){
					 var coords = features[i].geometry.coordinates;
					 var geomtype =  features[i].geometry.type;
					 var props =  features[i].properties;

					// console.log("geomtype Bitch"+ geomtype+ "  with data = "+ coords);
					 if(geomtype=="Polygon"){
								traverseCoordinates(coords[0],action,geomtype);
								if(labelFlag==1){
										  cx = props["centerX"];
										  cy = props["centerY"];
										  cx = (cx-xMin)*drawScale;
										  cy = (yMax-cy)*drawScale;

										  context.save();
										  context.font =_labelWidth+ "pt Calibri";
										  context.fillStyle = _labelColor;
										  context.fillText(props[labelValue], cx-8,cy);
										  context.restore();
								}
					 }
					 else if(geomtype=="Point" || geomtype=="MultiPoint"){
								//			console.log("coords of "+ geomtype + " is = " + coords);
								if(labelFlag==1){
										  console.log("Label toggle");
										  cx = props["centerX"];
										  cy = props["centerY"];
										  cx = (cx-xMin)*drawScale;
										  cy = (yMax-cy)*drawScale;
										  context.save();
										  context.font =_labelWidth + "pt Calibri";
										  console.log("_labelWidth = "+_labelWidth);
										  context.fillStyle = _labelColor;
										  console.log("Label value =" + labelValue);
										  context.fillText(props[labelValue], cx,cy);
										  context.restore();
								}
								traverseCoordinates(coords,action,geomtype);
					 }
					 else if(geomtype=="LineString"){
								traverseCoordinates(coords,action,geomtype);
								if(labelFlag==1){
										  cx = props["centerX"];
										  cy = props["centerY"];
										  cx = (cx-xMin)*drawScale;
										  cy = (yMax-cy)*drawScale;
										  context.save();
										  context.font =_labelWidth+ "pt Calibri";
										  context.fillStyle = _labelColor;
										  context.fillText(props[labelValue], cx-8,cy);
										  context.restore();
								}
					 }
					 else if(geomtype=="MultiLineString"){

								traverseCoordinates(coords[0],action,geomtype);
					 }
					 else if(geomtype=="MultiPolygon"){

								for(var k=0; k<coords.length; k++){
										  traverseCoordinates(coords[k][0],action,geomtype);
								}
					 }
		  }
		  context.restore();
}

function traverseCoordinates(coordinates,action,geomtype){
		  if(geomtype=="Point" || geomtype=="MultiPoint"){
					 var x = coordinates[0];
					 var y = coordinates[1];
					 if(action == 'bbox'){
								xMin = xMin<x?xMin:x;
								xMax = xMax>x?xMax:x;
								yMin = yMin<y?yMin:y;
								yMax = yMax>y?yMax:y;
					 }
					 else if(action == 'draw'){
								x = (x-xMin)*drawScale;
								y = (yMax-y)*drawScale;
								//	context.lineTo(x,y);
								context.beginPath();
								context.rect(x,y,2,2);
								context.fillStyle = _fillColor;
								context.StrokeStyle = _strokeColor;
								context.fill();			
								context.stroke();
					 }
		  }
		  else{
					 for(var j=0; j<coordinates.length; j++){
								var x = coordinates[j][0];
								var y = coordinates[j][1];
								if(action == 'bbox'){
										  xMin = xMin<x?xMin:x;
										  xMax = xMax>x?xMax:x;
										  yMin = yMin<y?yMin:y;
										  yMax = yMax>y?yMax:y;
								}
								else if(action == 'draw'){
										  x = (x-xMin)*drawScale;
										  y = (yMax-y)*drawScale;

										  if(j==0){
													 context.beginPath();
													 context.moveTo(x,y);
										  }
										  else{

													 context.lineTo(x,y);
										  }
								}
					 }
					 if(action == 'draw'){
								context.strokeStyle = _strokeColor;
								context.stroke();
								if(geomtype!="LineString"){
										  context.fillStyle = _fillColor;
										  context.fill();
								}
					 }
		  }
}



/* Styling Params (Zoom, Pan, Pen, Color, Label) */

function _equalPosition(){
		  _zoomX=canvasWidth/2, _zoomY=canvasHeight/2, _moveX=0, _moveY=0, _labelWidth=4 , _penWidth=1, scaleCount=1;
		  draw(geojson.features, 'draw');
}

function _zoomIn(){
		  scaleCount *= 1.2;
		  if(flagZoom !=0){
					 flagZoom -= 1;
					 draw(geojson.features, 'draw');
		  }
		  else{
					 flagZoom=0;
					 _zoomX = (canvasWidth/2);
					 _zoomY = (canvasHeight/2);
					 draw(geojson.features, 'draw');
		  }
}
function _zoomOut()
{
		  scaleCount /= 1.2;
		  if(flagZoom!=0){
					 flagZoom -= 1;
					 draw(geojson.features, 'draw');
		  }
		  else{
					 flagZoom=0;
					 _zoomX=(canvasWidth/2);
					 _zoomY=(canvasHeight/2);
					 draw(geojson.features, 'draw');
		  }
}
function _zoomEvent(event)
{
		  var canvasX = event.clientX;
		  var canvasY = event.clientY;
		  console.log("$$$$$ Zoomed in x="+canvasX+" y="+canvasY);
		  _zoomX=canvasX-canvas.offsetLeft;
		  _zoomY=canvasY-canvas.offsetTop;
		  flagZoom += 1;
		  scaleCount *= 1.2;
		  draw(geojson.features, 'draw');
}

function _panUp(){
		  _moveY=_moveY-10;
		  console.log("Up clicked " + _moveY);
		  draw(geojson.features, 'draw');
}
function _panDown(){
		  _moveY=_moveY+10;
		  console.log("Down clicked " + _moveY);
		  draw(geojson.features, 'draw');
}
function _panLeft(){
		  _moveX=_moveX-10;
		  draw(geojson.features, 'draw');
}
function _panRight(){
		  _moveX=_moveX+10;
		  draw(geojson.features, 'draw');
}


//Label functionalities

function _labelSizeIncrease(){
		  if(_labelWidth != 20){
					 _labelWidth += 1;
		  }
		  draw(geojson.features, 'draw');
}

function _labelSizeDecrease(){
		  if(_labelWidth != 1){
					 _labelWidth -= 1;
		  }
		  draw(geojson.features, 'draw');
}

function _fillColorChange(){
		  console.log("bgColor button clicked");
		  var fillColorValue = document.getElementById('fillColorButton').value;
		  _fillColor = fillColorValue;
		  console.log("fill Color button clicked with value: " + fillColorValue);
		  draw(geojson.features, 'draw');
}

function _labelColorChange(){
		  console.log("labelColor button clicked");
		  var labelColorValue = document.getElementById('labelColorButton').value;
		  _labelColor = labelColorValue;
		  console.log("label Color button clicked with value: " + labelColorValue);
		  draw(geojson.features, 'draw');
}


function _strokeColorChange(){
		  console.log("Stroke Color button clicked");
		  var _strokeColorValue = document.getElementById('strokeColorButton').value;
		  _strokeColor = _strokeColorValue;
		  console.log("bgColor button clicked with value: " + _strokeColorValue);
		  draw(geojson.features, 'draw');
}



//Pen width 
function _penIncrease(){
		  console.log("pen Increase called");
		  _penWidth += 0.15;
		  if(_penWidth>=3){
					 _penWidth = 3;
		  }
		  draw(geojson.features, 'draw');
}


function _penDecrease(){
		  _penWidth -= 0.1;
		  if (_penWidth<=0.01){
					 _penWidth = 0.01;
		  }
		  draw(geojson.features, 'draw');
		  console.log("Decrease Called");
}

//Labels

function labelToggle(){
		  var labelButton = document.getElementById("label").value;
		  if(labelButton!="None"){
					 labelFlag=1;
				//	 console.log(geojson);
					 console.log("labelValue "+ labelButton );
					 document.getElementById("label").value=1;
					 labelValue=labelButton;
					 draw(geojson.features,'draw');
		  }
		  else if(labelButton == "None"){
					 console.log("labelValue "+ labelButton );
					 labelFlag=0;
					 draw(geojson.features,'draw');
		  }


}

/* Attribute Table */

function dialog(){
		  var dialog = document.getElementById('window');
		  console.log("Dialog show clicked");
		  string = "";
		  for(var i=0;i<labels.length;i++){
					 string = string+'<th>'+labels[i]+'</th>';
		  }
		  $('.diag-head-tr').html(string);
		  var content;
		  for(var i=0;i<geojson.features.length;i++){
					 content = content + '<tr>';
					 for(var j=0;j<labels.length;j++){
								values = geojson.features[i].properties[labels[j]];
								content = content + '<td>'+values+'</td>';
					 }
					 content = content+"</tr>";
		  }
		  $('.diag-body').html(content);

}


function dialog1(){
		  document.getElementById('exit').onclick = function() {
					 dialog.close();
		  }
}



/*End of Styling params */



/* Mouse Controls */
// Adding event handlers 

var lastX=canvasWidth/2, lastY=canvasHeight/2;
var dragStart=[],dragged=false;
var MouseDown = function(evt){
		  console.log("In mouse down");
		  document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
		  lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
		  lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
		  dragStart = [lastX,lastY];
		  dragged = false;
}
var MouseMove = function(evt){
		  console.log("In mouse move");
		  lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
		  lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
		  dragged = true;
		  if (dragStart){
					 var pt = [lastX,lastY];
					 _moveX = pt[0]-dragStart[0];
					 _moveY = pt[1]-dragStart[1];
					 draw(geojson.features,'draw');
		  }
}
var MouseUp = function(evt){
		  dragged = false;
		  console.log("In mouse up");
		  dragStart = null;
}

var scaleFactor = 1.1;
var zoom = function(clicks){
		  var pt = [lastX,lastY];
		  _zoomX = lastX;
		  _zoomY = lastY;
		  var factor = Math.pow(scaleFactor,clicks);
		  scaleCount = factor;
		  console.log("clicks = "+clicks+ " factor = "+factor);
		  console.log("zoomX = "+_zoomX+ " zoomY = "+_zoomY);
		  /*	context.translate(pt.x,pt.y);
				var factor = Math.pow(scaleFactor,clicks);
				context.scale(factor,factor);
				context.translate(-pt[0],-pt[1]);*/
		  draw(geojson.features,'draw');
}

var handleScroll = function(evt){
		  console.log("Scroll");
		  var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
		  if (delta) zoom(delta);
		  return evt.preventDefault() && false;
};


//Color changes--  Fill color, Labe color , Stroke color
$(document).ready(function(){

					 console.log($('.labels li a'));
					 console.log("php var "+php_var);
					 $("#stroke_color").spectrum({
								color: "#f00",
								showButtons: false,
								move:function kanta(color){
								x =  $('#stroke_color').spectrum('get').toHexString();
								_strokeColor = x;
								draw(geojson.features, 'draw');
					}
			});

					 $("#fill_color").spectrum({
						color: "#f00",
						showButtons: false,
						move:function(color){
						x =  $('#fill_color').spectrum('get').toHexString();
						_fillColor = x;
						draw(geojson.features, 'draw');
			}
});

$("#label_color").spectrum({
		color: "#f00",
		showButtons: false,
		move:function(color){
					x=  $('#label_color').spectrum('get').toHexString();
					_labelColor = x;
					console.log(x);
					draw(geojson.features, 'draw');
		}
	});
});


