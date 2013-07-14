#!/usr/bin/env node
var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html_tocheck";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. exiting.", instr);
	process.exit();
    }
    return instr;
};

assertFileExists('grader.js')

var fileDownloader = function(remoteUrl, localFile, cb, cbparam)
{
    if (fs.existsSync(localFile)) { fs.unlinkSync(localFile); }
    if (remoteUrl)
    {
	console.error('Trying to get url %s', remoteUrl);
	var res = rest.get(remoteUrl).on('complete', function(result, response) 
		{
		    console.error('Downloaded url %s successfully', remoteUrl);
		    fs.writeFileSync(localFile, result);
		    cb(cbparam);
		});
	//console.error('Status of request: %s', res.request.finished.toString());
	//console.error('Headers of request: %s', JSON.stringify(res.url, null, 4));
	/*
	   var res = rest.get(remoteUrl);
	   fs.writeFileSync(localFile, res.request.res.rawEncoded.toString());
	   */
    }
};

var cheerioHtmlFile = function(htmlFile) {
    return cheerio.load(fs.readFileSync(htmlFile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(checksFile, htmlFile) {
    $ = cheerioHtmlFile(htmlFile);
    var checks = loadChecks(checksFile).sort();
    var out = {};
    for (var icheck in checks) {
	var present = $(checks[icheck]).length > 0;
	out[checks[icheck]] = present;
    }
    return out;
};

var clone = function(fn)
{
    return fn.bind({});
};

var pass = function(invar) { return invar; }

var main_fork = function(prg)
{
    assertFileExists(prg.file);
    var checkJson = checkHtmlFile(prg.checks, prg.file);
    //var checkJson = checkHtmlFile(CHECKSFILE_DEFAULT, HTMLFILE_DEFAULT);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson)
}

if (require.main == module)
{
    program
	.option('-c, --checks <check_file>', 'path to checks json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-u, --url <url>', 'url to html file', clone(pass), '')
	.option('-f, --file <html_file>', 'path to html file', clone(pass), HTMLFILE_DEFAULT)
	.parse(process.argv);
    if (program.url) {
	program.file = HTMLFILE_DEFAULT; 
	fileDownloader(program.url, program.file, main_fork, program);
    } else {
	main_fork(program);
    }
}
else
{
    exports.checkHtmlFile = checkHtmlFile;
}

/*
var rest = require('restler');
var res = rest.get('http://www.google.com');
while (!res.request.finished) {}
var str = res.request.res.rawEncoded;
console.log(str)
console.log(res.request.res.rawEncoded.substr(0, 120));
localFile = 'index.html_tocheck';
fs.writeFileSync(localFile, res.request.res.rawEncoded.toString());
 */
