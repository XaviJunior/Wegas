/*
YUI 3.5.0pr1 (build 4342)
Copyright 2011 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
YUI.add("get",function(a){var k=require("path"),b=require("vm"),e=require("fs"),f=require("url"),h=require("http"),i=require("https");a.Get=function(){};a.config.base=k.join(__dirname,"../");a.Get.urlInfoPort=function(l){return l.port?parseInt(l.port,10):l.protocol==="http:"?80:443;};YUI.require=require;YUI.process=process;var j=function(l){return l.replace(/\\/g,"\\\\");};a.Get._exec=function(r,n,l){var q=j(k.dirname(n));var s=j(n);if(q.match(/^https?:\/\//)){q=".";s="remoteResource";}var o="(function(YUI) { var __dirname = '"+q+"'; "+"var __filename = '"+s+"'; "+"var process = YUI.process;"+"var require = function(file) {"+" if (file.indexOf('./') === 0) {"+"   file = __dirname + file.replace('./', '/'); }"+" return YUI.require(file); }; "+r+" ;return YUI; })";var m=b.createScript(o,n);var p=m.runInThisContext(o);YUI=p(YUI);l(null,n);};a.Get._include=function(o,l){if(o.match(/^https?:\/\//)){var n=f.parse(o,parseQueryString=false),s=a.Get.urlInfoPort(n),m=n.pathname;if(n.search){m+=n.search;}var r=h;if(s===443||n.protocol==="https:"){r=i;}r.get({host:n.hostname,port:s,path:m},function(t){var p="";t.setEncoding("utf8");t.on("data",function(u){p+=u;});t.on("end",function(){a.Get._exec(p,o,l);});});}else{if(a.config.useSync){var q=e.readFileSync(o,"utf8");a.Get._exec(q,o,l);}else{e.readFile(o,"utf8",function(t,p){a.Get._exec(p,o,l);});}}};var d=function(m,n,l){if(a.Lang.isFunction(m.onEnd)){m.onEnd.call(a,n,l);}},g=function(l){if(a.Lang.isFunction(l.onSuccess)){l.onSuccess.call(a,l);}d(l,"success","success");},c=function(l,m){if(a.Lang.isFunction(l.onFailure)){l.onFailure.call(a,m,l);}d(l,m,"fail");};a.Get.script=function(v,q){var o=a.Array,u=o(v),m,r,p=u.length,t=0,n=function(){if(t===p){g(q);}};for(r=0;r<p;r++){m=u[r];m=m.replace(/'/g,"%27");a.Get._include(m,function(s,l){if(!a.config){a.config={debug:true};}if(s){if(s.stack){o.each(s.stack.split("\n"),function(w){});}else{console.log(s);}}else{t++;n();}});}};},"3.5.0pr1",{requires:["yui-base"]});