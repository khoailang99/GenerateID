var randomstring = require("randomstring");
var ejs = require('ejs');
var ID = require('../models/id.model');

module.exports.index = async function (req, res) {
	let page = parseInt(req.query.page) || 1;
	let perPage = 8;
	let ids = await ID.find({IsUsed: false});
	res.render('index', {totalIds: ids.length, ids: ids.slice((page-1)*perPage, page*perPage)})
};

module.exports.create = function(req,res) {
  const generateStrings = (numberOfStrings, stringLength) => {
	  const randomstring = require('randomstring');
	  const s = new Set();

	  while (s.size < numberOfStrings) {
	    s.add(randomstring.generate({
	    	length: stringLength,
	    	charset: 'hex'
	    }));
	  }
	  return s;
	}
	const strings = generateStrings(5000, 6);

	for (const value of strings.values()) {
	    ID.create({ Name: value }, function (err, small) {
		if (err) return handleError(err);
		  // saved!
		});
	}

	res.send("Tạo thành công!");
};

module.exports.listIds = async function(req, res) {
  let page = parseInt(req.query.page) || 1;
	let perPage = 8;
	let used = req.query.used;
	let unused = req.query.unused;
	let listIdsUpdated = req.query.arrIds;
	var promiseA = new Promise( (resolutionFunc,rejectionFunc) => {
		if(listIdsUpdated == null) {
			resolutionFunc();
		}
		listIdsUpdated.forEach(async (value, index) => {
			const doc = await ID.findOne({Name: value});
			doc.IsUsed = true;
			await doc.save();
			if(listIdsUpdated.length == index + 1) {
				resolutionFunc();
			}
		});
	});

	promiseA.then(async function(){
		let ids = await ID.find({
			$or: [{IsUsed: used}, {IsUsed: unused}]
		});
		let x = ids.slice((page-1)*perPage, page*perPage);
		ejs.renderFile('views/ejs/list_ids.ejs', {totalIds: ids.length, ids: x},function(err, str){
			res.send(str);
		});
	});
};
