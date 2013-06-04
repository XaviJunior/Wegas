/*
YUI 3.10.1 (build 8bc088e)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("graphics-svg",function(e,t){function g(){}var n="svg",r="shape",i=/[a-z][^a-z]*/ig,s=/[\-]?[0-9]*[0-9|\.][0-9]*/g,o=e.Lang,u=e.AttributeLite,a,f,l,c,h,p,d,v=e.config.doc,m=e.ClassNameManager.getClassName;g.prototype={_pathSymbolToMethod:{M:"moveTo",m:"relativeMoveTo",L:"lineTo",l:"relativeLineTo",C:"curveTo",c:"relativeCurveTo",Q:"quadraticCurveTo",q:"relativeQuadraticCurveTo",z:"closePath",Z:"closePath"},_currentX:0,_currentY:0,_type:"path",curveTo:function(){return this._curveTo.apply(this,[e.Array(arguments),!1]),this},relativeCurveTo:function(){return this._curveTo.apply(this,[e.Array(arguments),!0]),this},_curveTo:function(e,t){var n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b=t?"c":"C",w=t?parseFloat(this._currentX):0,E=t?parseFloat(this._currentY):0;this._pathArray=this._pathArray||[],this._pathType!==b?(this._pathType=b,y=[b],this._pathArray.push(y)):(y=this._pathArray[Math.max(0,this._pathArray.length-1)],y||(y=[],this._pathArray.push(y))),g=this._pathArray.length-1,this._pathArray[g]=this._pathArray[g].concat(e),m=e.length-5;for(v=0;v<m;v+=6)s=parseFloat(e[v])+w,o=parseFloat(e[v+1])+E,u=parseFloat(e[v+2])+w,a=parseFloat(e[v+3])+E,f=parseFloat(e[v+4])+w,l=parseFloat(e[v+5])+E,c=Math.max(f,Math.max(s,u)),p=Math.max(l,Math.max(o,a)),h=Math.min(f,Math.min(s,u)),d=Math.min(l,Math.min(o,a)),n=Math.abs(c-h),r=Math.abs(p-d),i=[[this._currentX,this._currentY],[s,o],[u,a],[f,l]],this._setCurveBoundingBox(i,n,r),this._currentX=f,this._currentY=l},quadraticCurveTo:function(){return this._quadraticCurveTo.apply(this,[e.Array(arguments),!1]),this},relativeQuadraticCurveTo:function(){return this._quadraticCurveTo.apply(this,[e.Array(arguments),!0]),this},_quadraticCurveTo:function(e,t){var n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g=t?"q":"Q",y=t?parseFloat(this._currentX):0,b=t?parseFloat(this._currentY):0;this._pathArray=this._pathArray||[],this._pathType!==g?(this._pathType=g,u=[g],this._pathArray.push(u)):(u=this._pathArray[Math.max(0,this._pathArray.length-1)],u||(u=[],this._pathArray.push(u))),o=this._pathArray.length-1,this._pathArray[o]=this._pathArray[o].concat(e),m=e.length-3;for(v=0;v<m;v+=4)n=parseFloat(e[v])+y,r=parseFloat(e[v+1])+b,i=parseFloat(e[v+2])+y,s=parseFloat(e[v+3])+b,c=Math.max(i,n),p=Math.max(s,r),h=Math.min(i,n),d=Math.min(s,r),a=Math.abs(c-h),f=Math.abs(p-d),l=[[this._currentX,this._currentY],[n,r],[i,s]],this._setCurveBoundingBox(l,a,f),this._currentX=i,this._currentY=s},drawRect:function(e,t,n,r){return this.moveTo(e,t),this.lineTo(e+n,t),this.lineTo(e+n,t+r),this.lineTo(e,t+r),this.lineTo(e,t),this},drawRoundRect:function(e,t,n,r,i,s){return this.moveTo(e,t+s),this.lineTo(e,t+r-s),this.quadraticCurveTo(e,t+r,e+i,t+r),this.lineTo(e+n-i,t+r),this.quadraticCurveTo(e+n,t+r,e+n,t+r-s),this.lineTo(e+n,t+s),this.quadraticCurveTo(e+n,t,e+n-i,t),this.lineTo(e+i,t),this.quadraticCurveTo(e,t,e,t+s),this},drawCircle:function(e,t,n){var r=n*2;return this._drawingComplete=!1,this._trackSize(e,t),this._trackSize(e+r,t+r),this._pathArray=this._pathArray||[],this._pathArray.push(["M",e+n,t]),this._pathArray.push(["A",n,n,0,1,0,e+n,t+r]),this._pathArray.push(["A",n,n,0,1,0,e+n,t]),this._currentX=e,this._currentY=t,this},drawEllipse:function(e,t,n,r){var i=n*.5,s=r*.5;return this._drawingComplete=!1,this._trackSize(e,t),this._trackSize(e+n,t+r),this._pathArray=this._pathArray||[],this._pathArray.push(["M",e+i,t]),this._pathArray.push(["A",i,s,0,1,0,e+i,t+r]),this._pathArray.push(["A",i,s,0,1,0,e+i,t]),this._currentX=e,this._currentY=t,this},drawDiamond:function(e,t,n,r){var i=n*.5,s=r*.5;return this.moveTo(e+i,t),this.lineTo(e+n,t+s),this.lineTo(e+i,t+r),this.lineTo(e,t+s),this.lineTo(e+i,t),this},drawWedge:function(e,t,n,r,i,s){var o,u,a,f,l,c,h,p,d,v,m,g,y=i*2,b,w;this._pathArray=this._pathArray||[],s=s||i,this._pathType!=="M"?(this._pathType="M",b=["M"],this._pathArray.push(b)):b=this._getCurrentArray(),w=this._pathArray.length-1,this._pathArray[w].push(e),this._pathArray[w].push(e),Math.abs(r)>360&&(r=360),o=Math.ceil(Math.abs(r)/45),u=r/o,a=-(u/180)*Math.PI,f=n/180*Math.PI;if(o>0){c=e+Math.cos(n/180*Math.PI)*i,h=t+Math.sin(n/180*Math.PI)*s,this._pathType="L",w++,this._pathArray[w]=["L"],this._pathArray[w].push(Math.round(c)),this._pathArray[w].push(Math.round(h)),w++,this._pathType="Q",this._pathArray[w]=["Q"];for(g=0;g<o;++g)f+=a,l=f-a/2,p=e+Math.cos(f)*i,d=t+Math.sin(f)*s,v=e+Math.cos(l)*(i/Math.cos(a/2)),m=t+Math.sin(l)*(s/Math.cos(a/2)),this._pathArray[w].push(Math.round(v)),this._pathArray[w].push(Math.round(m)),this._pathArray[w].push(Math.round(p)),this._pathArray[w].push(Math.round(d))}return this._currentX=e,this._currentY=t,this._trackSize(y,y),this},lineTo:function(){return this._lineTo.apply(this,[e.Array(arguments),!1]),this},relativeLineTo:function(){return this._lineTo.apply(this,[e.Array(arguments),!0]),this},_lineTo:function(e,t){var n=e[0],r,i,s,o,u,a,f=t?"l":"L",l=t?parseFloat(this._currentX):0,c=t?parseFloat(this._currentY):0;this._pathArray=this._pathArray||[],this._shapeType="path",i=e.length,this._pathType!==f?(this._pathType=f,o=[f],this._pathArray.push(o)):o=this._getCurrentArray(),s=this._pathArray.length-1;if(typeof n=="string"||typeof n=="number")for(r=0;r<i;r+=2)u=parseFloat(e[r]),a=parseFloat(e[r+1]),this._pathArray[s].push(u),this._pathArray[s].push(a),u+=l,a+=c,this._currentX=u,this._currentY=a,this._trackSize.apply(this,[u,a]);else for(r=0;r<i;++r)u=parseFloat(e[r][0]),a=parseFloat(e[r][1]),this._pathArray[s].push(u),this._pathArray[s].push(a),this._currentX=u,this._currentY=a,u+=l,a+=c,this._trackSize.apply(this,[u,a])},moveTo:function(){return this._moveTo.apply(this,[e.Array(arguments),!1]),this},relativeMoveTo:function(){return this._moveTo.apply(this,[e.Array(arguments),!0]),this},_moveTo:function(e,t){var n,r,i=parseFloat(e[0]),s=parseFloat(e[1]),o=t?"m":"M",u=t?parseFloat(this._currentX):0,a=t?parseFloat(this._currentY):0;this._pathArray=this._pathArray||[],this._pathType=o,r=[o],this._pathArray.push(r),n=this._pathArray.length-1,this._pathArray[n]=this
._pathArray[n].concat([i,s]),i+=u,s+=a,this._currentX=i,this._currentY=s,this._trackSize(i,s)},end:function(){return this._closePath(),this},clear:function(){return this._currentX=0,this._currentY=0,this._width=0,this._height=0,this._left=0,this._right=0,this._top=0,this._bottom=0,this._pathArray=[],this._path="",this._pathType="",this},_closePath:function(){var t,n,r,i,s,o,u="",a=this.node,f=parseFloat(this._left),l=parseFloat(this._top),c=this.get("fill");if(this._pathArray){t=this._pathArray.concat();while(t&&t.length>0){n=t.shift(),i=n.length,r=n[0],r==="A"?u+=r+n[1]+","+n[2]:r==="z"||r==="Z"?u+=" z ":r==="C"||r==="c"?u+=r+(n[1]-f)+","+(n[2]-l):u+=" "+r+parseFloat(n[1]-f);switch(r){case"L":case"l":case"M":case"m":case"Q":case"q":for(o=2;o<i;++o)s=o%2===0?l:f,s=n[o]-s,u+=", "+parseFloat(s);break;case"A":s=" "+parseFloat(n[3])+" "+parseFloat(n[4]),s+=","+parseFloat(n[5])+" "+parseFloat(n[6]-f),s+=","+parseFloat(n[7]-l),u+=" "+s;break;case"C":case"c":for(o=3;o<i-1;o+=2)s=parseFloat(n[o]-f),s+=", ",s+=parseFloat(n[o+1]-l),u+=" "+s}}c&&c.color&&(u+="z"),e.Lang.trim(u),u&&a.setAttribute("d",u),this._path=u,this._fillChangeHandler(),this._strokeChangeHandler(),this._updateTransform()}},closePath:function(){return this._pathArray.push(["z"]),this},_getCurrentArray:function(){var e=this._pathArray[Math.max(0,this._pathArray.length-1)];return e||(e=[],this._pathArray.push(e)),e},getBezierData:function(e,t){var n=e.length,r=[],i,s;for(i=0;i<n;++i)r[i]=[e[i][0],e[i][1]];for(s=1;s<n;++s)for(i=0;i<n-s;++i)r[i][0]=(1-t)*r[i][0]+t*r[parseInt(i+1,10)][0],r[i][1]=(1-t)*r[i][1]+t*r[parseInt(i+1,10)][1];return[r[0][0],r[0][1]]},_setCurveBoundingBox:function(e,t,n){var r,i=this._currentX,s=i,o=this._currentY,u=o,a=Math.round(Math.sqrt(t*t+n*n)),f=1/a,l;for(r=0;r<a;++r)l=this.getBezierData(e,f*r),i=isNaN(i)?l[0]:Math.min(l[0],i),s=isNaN(s)?l[0]:Math.max(l[0],s),o=isNaN(o)?l[1]:Math.min(l[1],o),u=isNaN(u)?l[1]:Math.max(l[1],u);i=Math.round(i*10)/10,s=Math.round(s*10)/10,o=Math.round(o*10)/10,u=Math.round(u*10)/10,this._trackSize(s,u),this._trackSize(i,o)},_trackSize:function(e,t){e>this._right&&(this._right=e),e<this._left&&(this._left=e),t<this._top&&(this._top=t),t>this._bottom&&(this._bottom=t),this._width=this._right-this._left,this._height=this._bottom-this._top}},e.SVGDrawing=g,f=function(){this._transforms=[],this.matrix=new e.Matrix,this._normalizedMatrix=new e.Matrix,f.superclass.constructor.apply(this,arguments)},f.NAME="shape",e.extend(f,e.GraphicBase,e.mix({_x:0,_y:0,init:function(){this.initializer.apply(this,arguments)},initializer:function(e){var t=this,n=e.graphic,r=this.get("data");t.createNode(),n&&t._setGraphic(n),r&&t._parsePathData(r),t._updateHandler()},_setGraphic:function(t){var n;t instanceof e.SVGGraphic?this._graphic=t:(t=e.one(t),n=new e.SVGGraphic({render:t}),n._appendShape(this),this._graphic=n)},addClass:function(e){var t=this.node;t.className.baseVal=o.trim([t.className.baseVal,e].join(" "))},removeClass:function(e){var t=this.node,n=t.className.baseVal;n=n.replace(new RegExp(e+" "),e).replace(new RegExp(e),""),t.className.baseVal=n},getXY:function(){var e=this._graphic,t=e.getXY(),n=this._x,r=this._y;return[t[0]+n,t[1]+r]},setXY:function(e){var t=this._graphic,n=t.getXY();this._x=e[0]-n[0],this._y=e[1]-n[1],this.set("transform",this.get("transform"))},contains:function(t){return t===e.one(this.node)},compareTo:function(e){var t=this.node;return t===e},test:function(t){return e.Selector.test(this.node,t)},_getDefaultFill:function(){return{type:"solid",opacity:1,cx:.5,cy:.5,fx:.5,fy:.5,r:.5}},_getDefaultStroke:function(){return{weight:1,dashstyle:"none",color:"#000",opacity:1}},createNode:function(){var t=this,i=v.createElementNS("http://www.w3.org/2000/svg","svg:"+this._type),s=t.get("id"),o=t.name,u=t._camelCaseConcat,a=t.get("pointerEvents");t.node=i,t.addClass(m(r)+" "+m(u(n,r))+" "+m(o)+" "+m(u(n,o))),s&&i.setAttribute("id",s),a&&i.setAttribute("pointer-events",a),t.get("visible")||e.one(i).setStyle("visibility","hidden")},on:function(t,n){return e.Node.DOM_EVENTS[t]?e.one("#"+this.get("id")).on(t,n):e.on.apply(this,arguments)},_strokeChangeHandler:function(){var e=this.node,t=this.get("stroke"),n,r,i,s;t&&t.weight&&t.weight>0?(s=t.linejoin||"round",n=parseFloat(t.opacity),r=t.dashstyle||"none",i=o.isArray(r)?r.toString():r,t.color=t.color||"#000000",t.weight=t.weight||1,t.opacity=o.isNumber(n)?n:1,t.linecap=t.linecap||"butt",e.setAttribute("stroke-dasharray",i),e.setAttribute("stroke",t.color),e.setAttribute("stroke-linecap",t.linecap),e.setAttribute("stroke-width",t.weight),e.setAttribute("stroke-opacity",t.opacity),s==="round"||s==="bevel"?e.setAttribute("stroke-linejoin",s):(s=parseInt(s,10),o.isNumber(s)&&(e.setAttribute("stroke-miterlimit",Math.max(s,1)),e.setAttribute("stroke-linejoin","miter")))):e.setAttribute("stroke","none")},_fillChangeHandler:function(){var e=this.node,t=this.get("fill"),n,r;t?(r=t.type,r==="linear"||r==="radial"?(this._setGradientFill(t),e.setAttribute("fill","url(#grad"+this.get("id")+")")):t.color?(n=parseFloat(t.opacity),n=o.isNumber(n)?n:1,e.setAttribute("fill",t.color),e.setAttribute("fill-opacity",n)):e.setAttribute("fill","none")):e.setAttribute("fill","none")},_setGradientFill:function(e){var t,n,r,i,s,u=o.isNumber,a=this._graphic,f=e.type,l=a.getGradientNode("grad"+this.get("id"),f),c=e.stops,h=this.get("width"),p=this.get("height"),d=e.rotation||0,v=Math.PI/180,m=parseFloat(parseFloat(Math.tan(d*v)).toFixed(8)),g,y,b,w,E="0%",S="100%",x="0%",T="0%",N=e.cx,C=e.cy,k=e.fx,L=e.fy,A=e.r,O=[];f==="linear"?(N=h/2,C=p/2,Math.abs(m)*h/2>=p/2?(d<180?(x=0,T=p):(x=p,T=0),E=N-(C-x)/m,S=N-(C-T)/m):(d>90&&d<270?(E=h,S=0):(E=0,S=h),x=(m*(N-E)-C)*-1,T=(m*(N-S)-C)*-1),E=Math.round(100*E/h),S=Math.round(100*S/h),x=Math.round(100*x/p),T=Math.round(100*T/p),E=u(E)?E:0,S=u(S)?S:100,x=u(x)?x:0,T=u(T)?T:0,l.setAttribute("spreadMethod","pad"),l.setAttribute("width",h),l.setAttribute("height",p),l.setAttribute("x1",E+"%"),l.setAttribute("x2",S+"%"),l.setAttribute
("y1",x+"%"),l.setAttribute("y2",T+"%")):(l.setAttribute("cx",N*100+"%"),l.setAttribute("cy",C*100+"%"),l.setAttribute("fx",k*100+"%"),l.setAttribute("fy",L*100+"%"),l.setAttribute("r",A*100+"%")),y=c.length,b=0;for(g=0;g<y;++g)this._stops&&this._stops.length>0?(i=this._stops.shift(),s=!1):(i=a._createGraphicNode("stop"),s=!0),w=c[g],n=w.opacity,r=w.color,t=w.offset||g/(y-1),t=Math.round(t*100)+"%",n=u(n)?n:1,n=Math.max(0,Math.min(1,n)),b=(g+1)/y,i.setAttribute("offset",t),i.setAttribute("stop-color",r),i.setAttribute("stop-opacity",n),s&&l.appendChild(i),O.push(i);while(this._stops&&this._stops.length>0)l.removeChild(this._stops.shift());this._stops=O},_stops:null,set:function(){var e=this;u.prototype.set.apply(e,arguments),e.initialized&&e._updateHandler()},translate:function(){this._addTransform("translate",arguments)},translateX:function(){this._addTransform("translateX",arguments)},translateY:function(){this._addTransform("translateY",arguments)},skew:function(){this._addTransform("skew",arguments)},skewX:function(){this._addTransform("skewX",arguments)},skewY:function(){this._addTransform("skewY",arguments)},rotate:function(){this._addTransform("rotate",arguments)},scale:function(){this._addTransform("scale",arguments)},_addTransform:function(t,n){n=e.Array(n),this._transform=o.trim(this._transform+" "+t+"("+n.join(", ")+")"),n.unshift(t),this._transforms.push(n),this.initialized&&this._updateTransform()},_updateTransform:function(){var t=this._type==="path",n=this.node,r,i,s,o,u,a,f,l=this.matrix,c=this._normalizedMatrix,h,p=this._transforms.length;if(t||this._transforms&&this._transforms.length>0){o=this._x,u=this._y,s=this.get("transformOrigin"),a=o+s[0]*this.get("width"),f=u+s[1]*this.get("height"),t&&(this instanceof e.SVGPath||(a=this._left+s[0]*this.get("width"),f=this._top+s[1]*this.get("height")),c.init({dx:o+this._left,dy:u+this._top})),c.translate(a,f);for(h=0;h<p;++h)r=this._transforms[h].shift(),r&&(c[r].apply(c,this._transforms[h]),l[r].apply(l,this._transforms[h])),t&&this._transforms[h].unshift(r);c.translate(-a,-f),i="matrix("+c.a+","+c.b+","+c.c+","+c.d+","+c.dx+","+c.dy+")"}this._graphic.addToRedrawQueue(this),i&&n.setAttribute("transform",i),t||(this._transforms=[])},_draw:function(){var e=this.node;e.setAttribute("width",this.get("width")),e.setAttribute("height",this.get("height")),e.setAttribute("x",this._x),e.setAttribute("y",this._y),e.style.left=this._x+"px",e.style.top=this._y+"px",this._fillChangeHandler(),this._strokeChangeHandler(),this._updateTransform()},_updateHandler:function(){this._draw()},_transform:"",getBounds:function(){var e=this._type,t=this.get("stroke"),n=this.get("width"),r=this.get("height"),i=e==="path"?0:this._x,s=e==="path"?0:this._y,o=0;return e!=="path"&&(t&&t.weight&&(o=t.weight),n=i+n+o-(i-o),r=s+r+o-(s-o),i-=o,s-=o),this._normalizedMatrix.getContentRect(n,r,i,s)},toFront:function(){var e=this.get("graphic");e&&e._toFront(this)},toBack:function(){var e=this.get("graphic");e&&e._toBack(this)},_parsePathData:function(t){var n,r,o,u=e.Lang.trim(t.match(i)),a,f,l,c=this._pathSymbolToMethod;if(u){this.clear(),f=u.length||0;for(a=0;a<f;a+=1)l=u[a],r=l.substr(0,1),o=l.substr(1).match(s),n=c[r],n&&(o?this[n].apply(this,o):this[n].apply(this));this.end()}},destroy:function(){var e=this.get("graphic");e?e.removeShape(this):this._destroy()},_destroy:function(){this.node&&(e.Event.purgeElement(this.node,!0),this.node.parentNode&&this.node.parentNode.removeChild(this.node),this.node=null)}},e.SVGDrawing.prototype)),f.ATTRS={transformOrigin:{valueFn:function(){return[.5,.5]}},transform:{setter:function(e){return this.matrix.init(),this._normalizedMatrix.init(),this._transforms=this.matrix.getTransformArray(e),this._transform=e,e},getter:function(){return this._transform}},id:{valueFn:function(){return e.guid()},setter:function(e){var t=this.node;return t&&t.setAttribute("id",e),e}},x:{getter:function(){return this._x},setter:function(e){var t=this.get("transform");this._x=e,t&&this.set("transform",t)}},y:{getter:function(){return this._y},setter:function(e){var t=this.get("transform");this._y=e,t&&this.set("transform",t)}},width:{value:0},height:{value:0},visible:{value:!0,setter:function(e){var t=e?"visible":"hidden";return this.node&&(this.node.style.visibility=t),e}},fill:{valueFn:"_getDefaultFill",setter:function(t){var n,r=this.get("fill")||this._getDefaultFill();return n=t?e.merge(r,t):null,n&&n.color&&(n.color===undefined||n.color==="none")&&(n.color=null),n}},stroke:{valueFn:"_getDefaultStroke",setter:function(t){var n=this.get("stroke")||this._getDefaultStroke(),r;return t&&t.hasOwnProperty("weight")&&(r=parseInt(t.weight,10),isNaN(r)||(t.weight=r)),t?e.merge(n,t):null}},pointerEvents:{valueFn:function(){var e="visiblePainted",t=this.node;return t&&t.setAttribute("pointer-events",e),e},setter:function(e){var t=this.node;return t&&t.setAttribute("pointer-events",e),e}},node:{readOnly:!0,getter:function(){return this.node}},data:{setter:function(e){return this.get("node")&&this._parsePathData(e),e}},graphic:{readOnly:!0,getter:function(){return this._graphic}}},e.SVGShape=f,h=function(){h.superclass.constructor.apply(this,arguments)},h.NAME="path",e.extend(h,e.SVGShape,{_left:0,_right:0,_top:0,_bottom:0,_type:"path",_path:""}),h.ATTRS=e.merge(e.SVGShape.ATTRS,{path:{readOnly:!0,getter:function(){return this._path}},width:{getter:function(){var e=Math.max(this._right-this._left,0);return e}},height:{getter:function(){return Math.max(this._bottom-this._top,0)}}}),e.SVGPath=h,c=function(){c.superclass.constructor.apply(this,arguments)},c.NAME="rect",e.extend(c,e.SVGShape,{_type:"rect"}),c.ATTRS=e.SVGShape.ATTRS,e.SVGRect=c,p=function(){p.superclass.constructor.apply(this,arguments)},p.NAME="ellipse",e.extend(p,f,{_type:"ellipse",_draw:function(){var e=this.node,t=this.get("width"),n=this.get("height"),r=this.get("x"),i=this.get("y"),s=t*.5,o=n*.5,u=r+s,a=i+o;e.setAttribute("rx",s),e.setAttribute("ry",o),e.setAttribute("cx",u),e.setAttribute
("cy",a),this._fillChangeHandler(),this._strokeChangeHandler(),this._updateTransform()}}),p.ATTRS=e.merge(f.ATTRS,{xRadius:{setter:function(e){this.set("width",e*2)},getter:function(){var e=this.get("width");return e&&(e*=.5),e}},yRadius:{setter:function(e){this.set("height",e*2)},getter:function(){var e=this.get("height");return e&&(e*=.5),e}}}),e.SVGEllipse=p,l=function(){l.superclass.constructor.apply(this,arguments)},l.NAME="circle",e.extend(l,e.SVGShape,{_type:"circle",_draw:function(){var e=this.node,t=this.get("x"),n=this.get("y"),r=this.get("radius"),i=t+r,s=n+r;e.setAttribute("r",r),e.setAttribute("cx",i),e.setAttribute("cy",s),this._fillChangeHandler(),this._strokeChangeHandler(),this._updateTransform()}}),l.ATTRS=e.merge(e.SVGShape.ATTRS,{width:{setter:function(e){return this.set("radius",e/2),e},getter:function(){return this.get("radius")*2}},height:{setter:function(e){return this.set("radius",e/2),e},getter:function(){return this.get("radius")*2}},radius:{value:0}}),e.SVGCircle=l,d=function(){d.superclass.constructor.apply(this,arguments)},d.NAME="svgPieSlice",e.extend(d,e.SVGShape,e.mix({_type:"path",_draw:function(){var e=this.get("cx"),t=this.get("cy"),n=this.get("startAngle"),r=this.get("arc"),i=this.get("radius");this.clear(),this.drawWedge(e,t,n,r,i),this.end()}},e.SVGDrawing.prototype)),d.ATTRS=e.mix({cx:{value:0},cy:{value:0},startAngle:{value:0},arc:{value:0},radius:{value:0}},e.SVGShape.ATTRS),e.SVGPieSlice=d,a=function(){a.superclass.constructor.apply(this,arguments)},a.NAME="svgGraphic",a.ATTRS={render:{},id:{valueFn:function(){return e.guid()},setter:function(e){var t=this._node;return t&&t.setAttribute("id",e),e}},shapes:{readOnly:!0,getter:function(){return this._shapes}},contentBounds:{readOnly:!0,getter:function(){return this._contentBounds}},node:{readOnly:!0,getter:function(){return this._node}},width:{setter:function(e){return this._node&&(this._node.style.width=e+"px"),e}},height:{setter:function(e){return this._node&&(this._node.style.height=e+"px"),e}},autoSize:{value:!1},preserveAspectRatio:{value:"xMidYMid"},resizeDown:{value:!1},x:{getter:function(){return this._x},setter:function(e){return this._x=e,this._node&&(this._node.style.left=e+"px"),e}},y:{getter:function(){return this._y},setter:function(e){return this._y=e,this._node&&(this._node.style.top=e+"px"),e}},autoDraw:{value:!0},visible:{value:!0,setter:function(e){return this._toggleVisible(e),e}},pointerEvents:{value:"none"}},e.extend(a,e.GraphicBase,{set:function(){var t=this,n=arguments[0],r={autoDraw:!0,autoSize:!0,preserveAspectRatio:!0,resizeDown:!0},i,s=!1;u.prototype.set.apply(t,arguments);if(t._state.autoDraw===!0&&e.Object.size(this._shapes)>0)if(o.isString&&r[n])s=!0;else if(o.isObject(n))for(i in r)if(r.hasOwnProperty(i)&&n[i]){s=!0;break}s&&t._redraw()},_x:0,_y:0,getXY:function(){var t=e.one(this._node),n;return t&&(n=t.getXY()),n},initializer:function(){var e=this.get("render"),t=this.get("visible")?"visible":"hidden";this._shapes={},this._contentBounds={left:0,top:0,right:0,bottom:0},this._gradients={},this._node=v.createElement("div"),this._node.style.position="absolute",this._node.style.left=this.get("x")+"px",this._node.style.top=this.get("y")+"px",this._node.style.visibility=t,this._contentNode=this._createGraphics(),this._contentNode.style.visibility=t,this._contentNode.setAttribute("id",this.get("id")),this._node.appendChild(this._contentNode),e&&this.render(e)},render:function(t){var n=e.one(t),r=this.get("width")||parseInt(n.getComputedStyle("width"),10),i=this.get("height")||parseInt(n.getComputedStyle("height"),10);return n=n||e.one(v.body),n.append(this._node),this.parentNode=n,this.set("width",r),this.set("height",i),this},destroy:function(){this.removeAllShapes(),this._contentNode&&(this._removeChildren(this._contentNode),this._contentNode.parentNode&&this._contentNode.parentNode.removeChild(this._contentNode),this._contentNode=null),this._node&&(this._removeChildren(this._node),e.one(this._node).remove(!0),this._node=null)},addShape:function(e){e.graphic=this,this.get("visible")||(e.visible=!1);var t=this._getShapeClass(e.type),n=new t(e);return this._appendShape(n),n},_appendShape:function(e){var t=e.node,n=this._frag||this._contentNode;this.get("autoDraw")?n.appendChild(t):this._getDocFrag().appendChild(t)},removeShape:function(e){return e instanceof f||o.isString(e)&&(e=this._shapes[e]),e&&e instanceof f&&(e._destroy(),delete this._shapes[e.get("id")]),this.get("autoDraw")&&this._redraw(),e},removeAllShapes:function(){var e=this._shapes,t;for(t in e)e.hasOwnProperty(t)&&e[t]._destroy();this._shapes={}},_removeChildren:function(e){if(e.hasChildNodes()){var t;while(e.firstChild)t=e.firstChild,this._removeChildren(t),e.removeChild(t)}},clear:function(){this.removeAllShapes()},_toggleVisible:function(e){var t,n=this._shapes,r=e?"visible":"hidden";if(n)for(t in n)n.hasOwnProperty(t)&&n[t].set("visible",e);this._contentNode&&(this._contentNode.style.visibility=r),this._node&&(this._node.style.visibility=r)},_getShapeClass:function(e){var t=this._shapeClass[e];return t?t:e},_shapeClass:{circle:e.SVGCircle,rect:e.SVGRect,path:e.SVGPath,ellipse:e.SVGEllipse,pieslice:e.SVGPieSlice},getShapeById:function(e){var t=this._shapes[e];return t},batch:function(e){var t=this.get("autoDraw");this.set("autoDraw",!1),e(),this.set("autoDraw",t)},_getDocFrag:function(){return this._frag||(this._frag=v.createDocumentFragment()),this._frag},_redraw:function(){var t=this.get("autoSize"),n=this.get("preserveAspectRatio"),r=this.get("resizeDown")?this._getUpdatedContentBounds():this._contentBounds,i=r.left,s=r.right,o=r.top,u=r.bottom,a=s-i,f=u-o,l,c,h,p,d;t?t==="sizeContentToGraphic"?(d=e.one(this._node),l=parseFloat(d.getComputedStyle("width")),c=parseFloat(d.getComputedStyle("height")),h=p=0,this._contentNode.setAttribute("preserveAspectRatio",n)):(l=a,c=f,h=i,p=o,this._state.width=a,this._state.height=f,this._node&&(this._node.style.width=a+"px",this._node.style.height=f+"px")):(l=a,c=f,h=
i,p=o),this._contentNode&&(this._contentNode.style.left=h+"px",this._contentNode.style.top=p+"px",this._contentNode.setAttribute("width",l),this._contentNode.setAttribute("height",c),this._contentNode.style.width=l+"px",this._contentNode.style.height=c+"px",this._contentNode.setAttribute("viewBox",""+i+" "+o+" "+a+" "+f+"")),this._frag&&(this._contentNode&&this._contentNode.appendChild(this._frag),this._frag=null)},addToRedrawQueue:function(e){var t,n;this._shapes[e.get("id")]=e,this.get("resizeDown")||(t=e.getBounds(),n=this._contentBounds,n.left=n.left<t.left?n.left:t.left,n.top=n.top<t.top?n.top:t.top,n.right=n.right>t.right?n.right:t.right,n.bottom=n.bottom>t.bottom?n.bottom:t.bottom,n.width=n.right-n.left,n.height=n.bottom-n.top,this._contentBounds=n),this.get("autoDraw")&&this._redraw()},_getUpdatedContentBounds:function(){var e,t,n,r=this._shapes,i={};for(t in r)r.hasOwnProperty(t)&&(n=r[t],e=n.getBounds(),i.left=o.isNumber(i.left)?Math.min(i.left,e.left):e.left,i.top=o.isNumber(i.top)?Math.min(i.top,e.top):e.top,i.right=o.isNumber(i.right)?Math.max(i.right,e.right):e.right,i.bottom=o.isNumber(i.bottom)?Math.max(i.bottom,e.bottom):e.bottom);return i.left=o.isNumber(i.left)?i.left:0,i.top=o.isNumber(i.top)?i.top:0,i.right=o.isNumber(i.right)?i.right:0,i.bottom=o.isNumber(i.bottom)?i.bottom:0,this._contentBounds=i,i},_createGraphics:function(){var e=this._createGraphicNode("svg"),t=this.get("pointerEvents");return e.style.position="absolute",e.style.top="0px",e.style.left="0px",e.style.overflow="auto",e.setAttribute("overflow","auto"),e.setAttribute("pointer-events",t),e},_createGraphicNode:function(e,t){var n=v.createElementNS("http://www.w3.org/2000/svg","svg:"+e),r=t||"none";return e!=="defs"&&e!=="stop"&&e!=="linearGradient"&&e!=="radialGradient"&&n.setAttribute("pointer-events",r),n},getGradientNode:function(e,t){var n=this._gradients,r,i=t+"Gradient";return n.hasOwnProperty(e)&&n[e].tagName.indexOf(t)>-1?r=this._gradients[e]:(r=this._createGraphicNode(i),this._defs||(this._defs=this._createGraphicNode("defs"),this._contentNode.appendChild(this._defs)),this._defs.appendChild(r),e=e||"gradient"+Math.round(1e5*Math.random()),r.setAttribute("id",e),n.hasOwnProperty(e)&&this._defs.removeChild(n[e]),n[e]=r),r},_toFront:function(t){var n=this._contentNode;t instanceof e.SVGShape&&(t=t.get("node")),n&&t&&n.appendChild(t)},_toBack:function(t){var n=this._contentNode,r;t instanceof e.SVGShape&&(t=t.get("node")),n&&t&&(r=n.firstChild,r?n.insertBefore(t,r):n.appendChild(t))}}),e.SVGGraphic=a},"3.10.1",{requires:["graphics"]});
