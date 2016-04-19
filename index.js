var express = require ("express");
var app = express ();

app.use(express.static(__dirname + "/public"));

app.set('port', process.env.APP_PORT || 3000);

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get ('port')+ '; press Ctrl-C to end')
});