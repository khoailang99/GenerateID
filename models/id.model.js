var mongoose = require('mongoose');

var idSchema = new mongoose.Schema({
	Name: String,
	IsUsed: {type: Boolean, default: false}
});

var ID = mongoose.model('ID', idSchema);

module.exports = ID; 
