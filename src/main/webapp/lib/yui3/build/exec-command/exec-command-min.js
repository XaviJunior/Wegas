/*
YUI 3.5.0 (build 5089)
Copyright 2012 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
YUI.add("exec-command",function(b){var a=function(){a.superclass.constructor.apply(this,arguments);};b.extend(a,b.Base,{_lastKey:null,_inst:null,command:function(f,e){var d=a.COMMANDS[f];if(d){return d.call(this,f,e);}else{return this._command(f,e);}},_command:function(g,f){var d=this.getInstance();try{try{d.config.doc.execCommand("styleWithCSS",null,1);}catch(j){try{d.config.doc.execCommand("useCSS",null,0);}catch(i){}}d.config.doc.execCommand(g,null,f);}catch(h){}},getInstance:function(){if(!this._inst){this._inst=this.get("host").getInstance();}return this._inst;},initializer:function(){b.mix(this.get("host"),{execCommand:function(e,d){return this.exec.command(e,d);},_execCommand:function(e,d){return this.exec._command(e,d);}});this.get("host").on("dom:keypress",b.bind(function(d){this._lastKey=d.keyCode;},this));},_wrapContent:function(f,e){var d=(this.getInstance().host.editorPara&&!e?true:false);if(d){f="<p>"+f+"</p>";}else{f=f+"<br>";}return f;}},{NAME:"execCommand",NS:"exec",ATTRS:{host:{value:false}},COMMANDS:{wrap:function(f,d){var e=this.getInstance();return(new e.EditorSelection()).wrapContent(d);},inserthtml:function(f,d){var e=this.getInstance();if(e.EditorSelection.hasCursor()||b.UA.ie){return(new e.EditorSelection()).insertContent(d);}else{this._command("inserthtml",d);}},insertandfocus:function(h,e){var g=this.getInstance(),d,f;if(g.EditorSelection.hasCursor()){e+=g.EditorSelection.CURSOR;d=this.command("inserthtml",e);f=new g.EditorSelection();f.focusCursor(true,true);}else{this.command("inserthtml",e);}return d;},insertbr:function(j){var i=this.getInstance(),h=new i.EditorSelection(),d="<var>|</var>",e=null,g=(b.UA.webkit)?"span.Apple-style-span,var":"var";if(h._selection.pasteHTML){h._selection.pasteHTML(d);}else{this._command("inserthtml",d);}var f=function(l){var k=i.Node.create("<br>");l.insert(k,"before");return k;};i.all(g).each(function(m){var l=true;if(b.UA.webkit){l=false;if(m.get("innerHTML")==="|"){l=true;}}if(l){e=f(m);if((!e.previous()||!e.previous().test("br"))&&b.UA.gecko){var k=e.cloneNode();e.insert(k,"after");e=k;}m.remove();}});if(b.UA.webkit&&e){f(e);h.selectNode(e);}},insertimage:function(e,d){return this.command("inserthtml",'<img src="'+d+'">');},addclass:function(f,d){var e=this.getInstance();return(new e.EditorSelection()).getSelected().addClass(d);},removeclass:function(f,d){var e=this.getInstance();return(new e.EditorSelection()).getSelected().removeClass(d);},forecolor:function(f,g){var e=this.getInstance(),d=new e.EditorSelection(),h;if(!b.UA.ie){this._command("useCSS",false);}if(e.EditorSelection.hasCursor()){if(d.isCollapsed){if(d.anchorNode&&(d.anchorNode.get("innerHTML")==="&nbsp;")){d.anchorNode.setStyle("color",g);h=d.anchorNode;}else{h=this.command("inserthtml",'<span style="color: '+g+'">'+e.EditorSelection.CURSOR+"</span>");d.focusCursor(true,true);}return h;}else{return this._command(f,g);}}else{this._command(f,g);}},backcolor:function(f,g){var e=this.getInstance(),d=new e.EditorSelection(),h;if(b.UA.gecko||b.UA.opera){f="hilitecolor";}if(!b.UA.ie){this._command("useCSS",false);}if(e.EditorSelection.hasCursor()){if(d.isCollapsed){if(d.anchorNode&&(d.anchorNode.get("innerHTML")==="&nbsp;")){d.anchorNode.setStyle("backgroundColor",g);h=d.anchorNode;}else{h=this.command("inserthtml",'<span style="background-color: '+g+'">'+e.EditorSelection.CURSOR+"</span>");d.focusCursor(true,true);}return h;}else{return this._command(f,g);}}else{this._command(f,g);}},hilitecolor:function(){return a.COMMANDS.backcolor.apply(this,arguments);},fontname2:function(f,g){this._command("fontname",g);var e=this.getInstance(),d=new e.EditorSelection();if(d.isCollapsed&&(this._lastKey!=32)){if(d.anchorNode.test("font")){d.anchorNode.set("face",g);}}},fontsize2:function(f,h){this._command("fontsize",h);var e=this.getInstance(),d=new e.EditorSelection();if(d.isCollapsed&&d.anchorNode&&(this._lastKey!=32)){if(b.UA.webkit){if(d.anchorNode.getStyle("lineHeight")){d.anchorNode.setStyle("lineHeight","");}}if(d.anchorNode.test("font")){d.anchorNode.set("size",h);}else{if(b.UA.gecko){var g=d.anchorNode.ancestor(e.EditorSelection.DEFAULT_BLOCK_TAG);if(g){g.setStyle("fontSize","");}}}}},insertunorderedlist:function(d){this.command("list","ul");},insertorderedlist:function(d){this.command("list","ol");},list:function(y,C){var f=this.getInstance(),i,o=this,x="dir",e="yui3-touched",q,l,m,h,r,u,j,k,A,d,w=(f.host.editorPara?true:false),v=new f.EditorSelection();y="insert"+((C==="ul")?"un":"")+"orderedlist";if(b.UA.ie&&!v.isCollapsed){l=v._selection;i=l.htmlText;m=f.Node.create(i)||f.one("body");if(m.test("li")||m.one("li")){this._command(y,null);return;}if(m.test(C)){h=l.item?l.item(0):l.parentElement();r=f.one(h);d=r.all("li");u="<div>";d.each(function(n){u=o._wrapContent(n.get("innerHTML"));});u+="</div>";j=f.Node.create(u);if(r.get("parentNode").test("div")){r=r.get("parentNode");}if(r&&r.hasAttribute(x)){if(w){j.all("p").setAttribute(x,r.getAttribute(x));}else{j.setAttribute(x,r.getAttribute(x));}}if(w){r.replace(j.get("innerHTML"));}else{r.replace(j);}if(l.moveToElementText){l.moveToElementText(j._node);}l.select();}else{k=b.one(l.parentElement());if(!k.test(f.EditorSelection.BLOCKS)){k=k.ancestor(f.EditorSelection.BLOCKS);}if(k){if(k.hasAttribute(x)){q=k.getAttribute(x);}}if(i.indexOf("<br>")>-1){i=i.split(/<br>/i);}else{var B=f.Node.create(i),t=B?B.all("p"):null;if(t&&t.size()){i=[];t.each(function(s){i.push(s.get("innerHTML"));});}else{i=[i];}}A="<"+C+' id="ie-list">';b.each(i,function(s){var n=f.Node.create(s);if(n&&n.test("p")){if(n.hasAttribute(x)){q=n.getAttribute(x);}s=n.get("innerHTML");}A+="<li>"+s+"</li>";});A+="</"+C+">";l.pasteHTML(A);h=f.config.doc.getElementById("ie-list");h.id="";if(q){h.setAttribute(x,q);}if(l.moveToElementText){l.moveToElementText(h);}l.select();}}else{if(b.UA.ie){k=f.one(v._selection.parentElement());if(k.test("p")){if(k&&k.hasAttribute(x)){q=k.getAttribute(x);}i=b.EditorSelection.getText(k);if(i===""){var z="";if(q){z=' dir="'+q+'"';}A=f.Node.create(b.Lang.sub("<{tag}{dir}><li></li></{tag}>",{tag:C,dir:z}));
k.replace(A);v.selectNode(A.one("li"));}else{this._command(y,null);}}else{this._command(y,null);}}else{f.all(C).addClass(e);if(v.anchorNode.test(f.EditorSelection.BLOCKS)){k=v.anchorNode;}else{k=v.anchorNode.ancestor(f.EditorSelection.BLOCKS);}if(!k){k=v.anchorNode.one(f.EditorSelection.BLOCKS);}if(k&&k.hasAttribute(x)){q=k.getAttribute(x);}if(k&&k.test(C)){var g=k.ancestor("p");i=f.Node.create("<div/>");h=k.all("li");h.each(function(n){i.append(o._wrapContent(n.get("innerHTML"),g));});if(q){if(w){i.all("p").setAttribute(x,q);}else{i.setAttribute(x,q);}}if(w){i=f.Node.create(i.get("innerHTML"));}var p=i.get("firstChild");k.replace(i);v.selectNode(p);}else{this._command(y,null);}A=f.all(C);if(q){if(A.size()){A.each(function(s){if(!s.hasClass(e)){s.setAttribute(x,q);}});}}A.removeClass(e);}}},justify:function(i,j){if(b.UA.webkit){var h=this.getInstance(),g=new h.EditorSelection(),d=g.anchorNode;var f=d.getStyle("backgroundColor");this._command(j);g=new h.EditorSelection();if(g.anchorNode.test("div")){var e="<span>"+g.anchorNode.get("innerHTML")+"</span>";g.anchorNode.set("innerHTML",e);g.anchorNode.one("span").setStyle("backgroundColor",f);g.selectNode(g.anchorNode.one("span"));}}else{this._command(j);}},justifycenter:function(d){this.command("justify","justifycenter");},justifyleft:function(d){this.command("justify","justifyleft");},justifyright:function(d){this.command("justify","justifyright");},justifyfull:function(d){this.command("justify","justifyfull");}}});var c=function(j,v,r){var k=this.getInstance(),t=k.config.doc,h=t.selection.createRange(),g=t.queryCommandValue(j),l,f,i,e,n,u,q;if(g){l=h.htmlText;f=new RegExp(r,"g");i=l.match(f);if(i){l=l.replace(r+";","").replace(r,"");h.pasteHTML('<var id="yui-ie-bs">');e=t.getElementById("yui-ie-bs");n=t.createElement("div");u=t.createElement(v);n.innerHTML=l;if(e.parentNode!==k.config.doc.body){e=e.parentNode;}q=n.childNodes;e.parentNode.replaceChild(u,e);b.each(q,function(d){u.appendChild(d);});h.collapse();if(h.moveToElementText){h.moveToElementText(u);}h.select();}}this._command(j);};if(b.UA.ie){a.COMMANDS.bold=function(){c.call(this,"bold","b","FONT-WEIGHT: bold");};a.COMMANDS.italic=function(){c.call(this,"italic","i","FONT-STYLE: italic");};a.COMMANDS.underline=function(){c.call(this,"underline","u","TEXT-DECORATION: underline");};}b.namespace("Plugin");b.Plugin.ExecCommand=a;},"3.5.0",{skinnable:false,requires:["frame"]});