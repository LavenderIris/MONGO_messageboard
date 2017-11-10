
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
app.set('views', path.join(__dirname, './views'));
// app.set('views', path.join(__dirname, './static'));
app.set('view engine', 'ejs');

// mongoose set up
app.use( express.static( "./static" ) );
mongoose.connect('mongodb://localhost/messageBoardDB');

var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
    author: {type: String, required: true, minlength: 4},
    text: {type: String, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, { timestamps: true });

var CommentSchema = new mongoose.Schema({
    // since this is a reference to a different document, the _ is the naming convention!
    _message: {type: Schema.Types.ObjectId, ref: 'Post'},
    author: {type: String, required: true, minlength: 4},
    text: { type: String, required: true },
   }, {timestamps: true });

 // set our models by passing them their respective Schemas
mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);

// store our models in variables
var Message = mongoose.model('Message');
var Comment = mongoose.model('Comment');

app.get('/', function(req, res) {
    Message.find({}, function(err, messages){
        if(err){
            res.render('index', {errors: messages.errors})
        } else{
            console.log(messages);
         
        }
    }).populate('comments').exec(function(err, messages){
        res.render('index', {messages: messages});
    });
})

app.post('/add_message', function(req, res) {
    console.log(req.body);
    var m = new Message();
    m.author = req.body['author'];
    m.text = req.body['text'];
    m.save(function(err){
        if(err){
            console.log('Errors', m.errors);
            res.render('index', {errors: m.errors})
        } else { // else console.log that we did well and then redirect to the root route
            console.log('successfully added a message');
            res.redirect('/');
        } 
    });
})

app.post('/add_comment/:id', function (req, res){
    Message.findOne({_id: req.params.id}, function(err, message){
        // data from form on the front end
        console.log("message to attach to", message)
        var comment = new Comment(req.body);
        //  set the reference like this:
        comment._message = message._id;
        // now save both to the DB
        comment.save(function(err){
            message.comments.push(comment);
            message.save(function(err){
                if(err){
                    res.render('index', {errors: message.errors})
                } else {
                    res.redirect('/');
                }
            });
         });
    });
 });


// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
