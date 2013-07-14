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

var fileDownloader = function(localFile)
{
    var restlerHtmlFile = function(urlParam) {
	if (urlParam)
	{
	    console.error('Trying to get url %s', urlParam);
	    rest.get(urlParam).on('complete', function(result, response) 
		    {
			console.error('Downloaded url %s successfully', urlParam);
			fs.writeFileSync(localFile, result);
		    });
	} 
	return urlParam;
    };
    return restlerHtmlFile;
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

var pass = function() {}

if (require.main == module)
{
    program
	.option('-c, --checks <check_file>', 'path to checks json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-u, --url <url>', 'url to html file', fileDownloader(HTMLFILE_DEFAULT), '')
	.option('-f, --file <html_file>', 'path to html file', pass, HTMLFILE_DEFAULT)
	.parse(process.argv);
    assertFileExists(HTMLFILE_DEFAULT);
    var checkJson = checkHtmlFile(program.checks, program.file);
    //var checkJson = checkHtmlFile(CHECKSFILE_DEFAULT, HTMLFILE_DEFAULT);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson)
}
else
{
    exports.checkHtmlFile = checkHtmlFile;
}
