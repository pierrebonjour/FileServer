const http = require('http');
const fs = require('fs');
const path = require('path');

let port = process.argv[2] || 80;
const httpServer = http.createServer(requestHandler);
httpServer.listen(port, () => {console.log('server is listening on port '+ port)});

function requestHandler(req, res){
  if(req.url === '/'){
    sendIndexHtml(res);
  }else if( req.url === '/list'){
    sendListOfUploadedFiles(res);
  }else if( req.url === '/del'){
    delListOfUploadedFiles(res);
  }else if( /\/download\/[^\/]+$/.test(req.url)){
    sendUploadedFile(req.url, res);
  }else if( /\/upload\/[^\/]+$/.test(req.url) ){
    saveUploadedFile(req, res)
  }else{
    sendInvalidRequest(res);
  }
}

function sendIndexHtml(res){
  let indexFile = path.join(__dirname, 'index.html');
  fs.readFile(indexFile, (err, content) => {
    if(err){
      res.writeHead(404, {'Content-Type': 'text'});
      res.write('File Not Found!');
      res.end();
    }else{
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(content);
      res.end();
    }
  })
}

function sendListOfUploadedFiles(res){
  let uploadDir = path.join(__dirname,'download');
  fs.readdir(uploadDir, (err, files) => {
    if(err){
      console.log(err);
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(err.message));
      res.end();
    }else{
	  var finalList = new Array();
	  for (const key in files){
		if(files[key]!="remove")
		{
			finalList.push(files[key]);
		}
	  }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(finalList));
      res.end();
    }
  })
}

function delListOfUploadedFiles(res){
  let uploadDir = path.join(__dirname,'download');
  fs.readdir(uploadDir, (err, files) => {
    if(err){
      console.log(err);
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(err.message));
      res.end();
    }else{
	  var finalList = new Array();
	  for (const key in files){
		  
		let file = path.join(__dirname, 'download',files[key]);
			  fs.unlink(file, (err) => {
				  if (err) {
					  console.log(err);
					  res.writeHead(400, {'Content-Type': 'application/json'});
					  res.write(JSON.stringify(err.message));
					  res.end();
				  }			  
				  //file removed
				})
		  }
	  
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(finalList));
      res.end();
    }
  })
}


function sendUploadedFile(url, res){
  let file = path.join(__dirname, url);
  fs.readFile(file,'utf8', (err, content) => {
    if(err){
      res.writeHead(404, {'Content-Type': 'text'});
      res.write('File Not Found!');
      res.end();
    }else{
		var returnStr = checkValidityOfFile(content);
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(returnStr);
		res.end();
		
		/*
		res.writeHead(200, {'Content-Type': 'application/octet-stream'});
		res.write(content);
		res.end();
		*/
    }
  })
}

function checkValidityOfFile(content)
{
	var dataArray = content.split(/\r?\n/);  //Be careful if you are in a \r\n world...
	var finalArray = new Array();
	if(dataArray.length==0) return "format non valide";
	dataArray.forEach(element => {
		if(!isEmptyOrSpaces(element))
		{
			//try to see if there is 3 colomns
			var lineArr = element.split(',');
			if (lineArr.length != 3) return "format non valide";
			var el0 = lineArr[0].trim();
			var el1 = lineArr[1].trim();
			var el2 = lineArr[2].trim();
			finalArray.push([el0,el1,el2]);
		}
		
	});
	return JSON.stringify(finalArray);
}

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}

function saveUploadedFile(req, res){
  console.log('saving uploaded file');
  let fileName = path.basename(req.url);
  let file = path.join(__dirname,'download', fileName)
  req.pipe(fs.createWriteStream(file));
  req.on('end', () => {
    res.writeHead(200, {'Content-Type': 'text'});
    res.write('OK - fichier sur serveur');
    res.end();
  })
}

function sendInvalidRequest(res){
  res.writeHead(400, {'Content-Type': 'application/json'});
  res.write('Invalid Request');
  res.end(); 
}