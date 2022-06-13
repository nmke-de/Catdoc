/**
 * One day, Catdoc could replace the Doc Morus as the engine behind NMKE.
 * The approach does neither need a database, nor PHP.
 * Instead, index.html will provide a frame, in which the content is pasted.
 * Unlike Doc Morus, Catdoc will retrieve its content from various text files on the server.
 * 
 * The advantage of Catdoc will be that security problems with database-passwords and DELETE-requests are history.
 * Core of Catdoc is the rtf-function, similar to how the select-function was crucial to Doc Morus.
**/

//Pastebin is the target's id where all content loaded into.
var pastebin = "box";
var basket = {};
var catfile = ".cats";
var catfile_read = false; //Whether cat-file is already read.
var tmp_pasteCat = false; //Only used once to determine whether to call pasteCat in readCat
var cats = ""; //Cat-file (categories) as a string.
var pastebin_cat = "catbox";
window.addEventListener("load",init);
window.onpopstate=(event)=>{
	if(event.state){
		a({href:"#"+event.state.url,goBack:true});
	}
};

function rtf(file,handler){//Read text file
	//If handler is null, then default to this function.
	if(handler==null||handler==undefined){
		handler = clog;
	}
	//Open a new AJAX-request
	var req = new XMLHttpRequest();
	req.addEventListener("load",(event)=>{
		handler(file)(event.target.responseText);
	});//usual handler
	req.addEventListener("error",function(event){//error handler
		alert("ERROR\n"+event.target.responseText);
	});
	req.open("get",file);//Do it!
	req.send(null);//Just do it!
}

function init(){//Initially called function.
	/*window.onpopstate=(event)=>{
		if(event.state){
			a({href:"#"+event.state.url,goBack:true});
		}
	};*/
	// Get URL
	var path = window.location.hash.split("#")[1];//TODO recognize handler type
	if(!path) return;
	// Read cat-file
	rtf(catfile,readCat(path));
	var splitted=path.split(".");
	if (splitted[1]) //Is not a category
		rtf(path,getHandler(splitted[splitted.length-1]));
	else if (catfile_read) //Is category
		pasteCat(path);
	else
		tmp_pasteCat = true;
	insertCats(path);
	$t(path);
}

function a(tag){// a stands for a-tag or for automatic.
	//console.log(tag);
	var path = tag.href.split("#")[1];//TODO recognize handler type
	if(!path) return;
	if(!catfile_read)
		rtf(catfile,readCat(path));
	if(!tag.goBack)//Execute if not history.back
		window.history.pushState({"url":path},"","#"+path);
	var splitted=path.split(".");
	if(splitted[1])
		rtf(path,getHandler(splitted[splitted.length-1]));
	else
		pasteCat(path);
	insertCats(path);
	$t(path);
}

var insertCats = (path)=>{
	var insert = "Categories: ";
	cats.replace(/(.*?)\t(.*?)\n/g,(match,cat,content)=>{
		if(content==path){
			insert = insert + "<span style='border: 0 1px solid #000;'><a onclick='a(this);' href='#"+cat+"'>"+cat+"</a></span>";
		}
		return match;
	});
	document.getElementById(pastebin_cat).innerHTML = insert;
};

var getHandler = (type)=>{
	switch(type){
		case "html":return pasteHTML;
		case "js":return pasteCode;
		case "quotes":return pasteQuote;
		case "morus": return pasteMorus;
		case "cdo": return pasteDoc;
		default:return pasteCode;
	}
};

var readCat = (path)=>()=>(text)=>{
	cats=text;
	insertCats(path);
	catfile_read=true;
	if (tmp_pasteCat){
		pasteCat(path);
		tmp_pasteCat = false;
	}
};

function pasteCat(path){
	var insert = "Category:"+path+"<ul>";
	if(!catfile_read);
	cats.replace(/(.*?)\t(.*?)\n/g,(match,cat,content)=>{
		if(cat==path){
			insert = insert + "<li><a onclick='a(this);' href='#"+content+"'>"+content+"</a></li>";
		}
		return match;
	});
	document.getElementById(pastebin).innerHTML = insert + "</ul>";
	return;//Currently a dummy
}

var pasteHTML = (url)=>(htext)=>{
	document.getElementById(pastebin).innerHTML = htext;
};

var pasteCode = (url)=>(text)=>{//Paste verbatim text
	//Replace stuff that could be interpreted as HTML.
	text = text.replace(/&/g,"&amp;")
	text = text.replace(/</g,"&lt;");
	text = text.replace(/>/g,"&gt;");
	document.getElementById(pastebin).innerHTML = "<pre><code>"+text+"</code></pre>";
};

var pasteQuote = (url)=>(text)=>{
	/*
	Format:
	QUOTE -- author (further stuff)
	/^(.*?)\s*?--\s*?(.*?)\s*?\((.*?)\)/
	*/
	readquote = /(.*?)\s*?--\s*?(.*?)\s*?\((.*?)\)/.exec(text);
	var writequote = "";
	if (!readquote){
		readquote = /(.*?)\s*?--\s*?(.*)\s*?/.exec(text);
		if(!readquote)throw new Error("Aah, help!");
		writequote = "<blockquote>"+readquote[1]+"</blockquote><address rel=\"author\">"+readquote[2]+"</address>";
	}else{
		writequote = "<blockquote>"+readquote[1]+"</blockquote><address rel=\"author\">"+readquote[2]+"</address><span class=\"quote-additional\">"+readquote[3]+"</span>";
	}
	document.getElementById(pastebin).innerHTML = writequote;
	document.getElementsByTagName("title")[0].innerHTML = readquote[2];
}

var pasteMorus = (url)=>(hypertext)=>{
	//Unordered list
	while(hypertext.search(/@ul([\n\r]|.)*?@\/ul/)!=-1){ // Format: @ul -item1 \n -item2 @/ul
		var ulist_whole = /@ul(([\n\r]|.)*?)@\/ul/.exec(hypertext);
		var ulist = ulist_whole[1];
		console.log(ulist);
		//console.log(ulist_whole);
		while(ulist.search(/- +.*?[\n\r]/)!=-1){
			var litext = /- +(.*?)[\n\r]/.exec(ulist);
			ulist = ulist.replace(/- +.*?[\n\r]/,"<li>"+litext[1]+"</li>");
		}
		hypertext = hypertext.replace(/@ul([\n\r]|.)*?@\/ul/,"<ul>"+ulist+"</ul>");
	}
	while(hypertext.search(/### +.*?[\n\r]/)!=-1){ // Format: ### H3-Titel [Zeilenende]
		var h3title = /### +(.*?)[\n\r]/.exec(hypertext);
		hypertext = hypertext.replace(/### +.*?[\n\r]/,"<h3>"+h3title[1]+"</h3>");
	}
	while(hypertext.search(/## +.*?[\n\r]/)!=-1){ // Format: ## H2-Titel [Zeilenende]
		var h2title = /## +(.*?)[\n\r]/.exec(hypertext);
		hypertext = hypertext.replace(/## +.*?[\n\r]/,"<h2>"+h2title[1]+"</h2>");
	}
	while(hypertext.search(/# +.*?[\n\r]/)!=-1){ // Format: # H1-Titel [Zeilenende]
		var h1title = /# +(.*?)[\n\r]/.exec(hypertext);
		hypertext = hypertext.replace(/# +.*?[\n\r]/,"<h1>"+h1title[1]+"</h1>");
	}
	while(hypertext.search(/\[\[.*?\|.*?\]\]/)!=-1){ //Format: [[href|text]]
		var hlink = /\[\[(.*?)\|(.*?)\]\]/.exec(hypertext);
		hypertext = hypertext.replace(/\[\[(.*?)\|(.*?)\]\]/,"<a href=\"#"+hlink[1]+"\" onclick=\"a(this);\">"+hlink[2]+"</a>");
	}
	document.getElementById("box").innerHTML = hypertext;
};

var pasteDoc = (url)=>(text)=>{
	/*
	General Format: !command(arguments)(innerHTML)
	Arguments' brackets are ommitted if there are none.
	*/
	//Reset basket
	basket = {};
	//Set title
	var title = /!title\s*?\((.*?)\)/.exec(text);
	document.getElementsByTagName("title")[0].innerHTML = title[1];
	text = text.replace(/!title\s*?\((.*?)\)/g,"");
	//Two-argument-commands
	text = text.replace(/!(.*?)\s*?\((.*?)\)\s*?\((.*?)\)/g,(match,cmd,attr,arg)=>{
		switch(cmd){
			case "var": basket[attr]=arg; return "";
			case "a":return "<a href=\""+attr+"\" onclick=\"a(this);\">"+arg+"</a>";
			case "img":return "<img src=\""+attr+"\" alt=\""+arg+"\" />";
			default: return match;
		}
	});
	//One-argument-commands
	text = text.replace(/!(.*?)\s*?\((.*?)\)/g,(match,cmd,arg)=>{
		switch(cmd){
			case "h1":return "<h1>"+arg+"</h1>";
			case "h2":return "<h2>"+arg+"</h2>";
			case "h3":return "<h3>"+arg+"</h2>";
			case "i":return "<li>"+arg+"</li>";//i for item
			case "var":return basket[arg];
			case "js":return "<script src=\""+arg+"\"></script>"
			default: return match;
		}
	});
	//Zero-argument-commands
	text = text.replace(/!(.*?)\s/g,(match,cmd)=>{
		switch(cmd){
			case "hr":  return "<hr />\n";
			case "ul":  return "<ul>\n";
			case "/ul": return "</ul>\n";
			case "ol":  return "<ol>\n";
			case "/ol": return "</ol>\n";
			case "js":  return "<script>\n";
			case "/js": return "</script>\n";
			case "p":   return "<p>\n";
			case "/p":  return "</p>\n";
			case "next":return "<a onclick=\"a(this);\" href=\"#"+basket.blogname+"-"+(+basket.blogpage+1)+".cdo\">Next page</a>\n";
			case "prev":return "<a onclick=\"a(this);\" href=\"#"+basket.blogname+"-"+(+basket.blogpage-1)+".cdo\">Previous page</a>\n";
			default: return match;
		}
	});
	// One-argument type-ins
	text = text.replace(/(.*?)[ \t\r\f]+?(.*?)\n/g,(match,type_in,arg)=>{
		switch(type_in){
			case "#": return "<h1>"+arg+"</h1>";
			case "##": return "<h2>"+arg+"</h2>";
			case "###": return "<h3>"+arg+"</h3>";
			case "-": return "<li>"+arg+"</li>";
			default: return match;
		}
	});
	// Zero-argument type-ins
	text = text.replace(/([\n])\s+/g,(match,type_in)=>{ //TODO Type-ins still not elegantly solved.
		switch(type_in){
			case "\n": return "</p><p>";
			default: return match;
		}
	});

	document.getElementById("box").innerHTML = text;
};

var clog = (url)=>(text)=>{
	console.log("URL:\t"+url+"\nBox:\t"+text);
};

function $t(title){
	//Set title shortcut
	document.getElementsByTagName("title")[0].innerHTML = title;
}

/** Manipulate history - copied from StackOverflow
 *	function processAjaxData(response, urlPath){
		document.getElementById("content").innerHTML = response.html;
		document.title = response.pageTitle;
		window.history.pushState({"html":response.html,"pageTitle":response.pageTitle},"", urlPath);
	}
 *	window.onpopstate = function(e){
		if(e.state){
			document.getElementById("content").innerHTML = e.state.html;
			document.title = e.state.pageTitle;
		}
	};
 */
