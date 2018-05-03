const uri = process.env.MONGODB_URI;

var mongoose = require('mongoose');

mongoose.connect(uri);

mongoose.connection.on('error', function(err) {
    console.error('MongoDB error: %s', err);
});

module.exports = mongoose;