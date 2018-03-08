var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

if (!process.env.PORT || !process.env.IP) {
  console.log('IP and PORT should be provided as environment variables');
  process.exit();
}

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/thinktech', express.static(path.join(__dirname, 'uploads')));

app.get('/', function(req, res){
  res.render('index', {
    ip: process.env.IP,
    port: process.env.PORT,
    max_size: process.env.MAX_SIZE || 200
  });
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
  form.maxFileSize = 1024 * 1024 * (process.env.MAX_SIZE || 200);

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

app.use(function(request, response, next, error){
  console.log(error);
});

var server = app.listen(process.env.PORT, function(){
  console.log('Server listening on port ' + process.env.PORT);
});
