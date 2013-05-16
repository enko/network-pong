var crypto = require('crypto');

/*
 * GET home page.
 */

function getSessionID() {
  return crypto.createHash('md5').update((new Date()).toString()).digest('hex');
}

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.game = function(req, res){
  res.render('game', { title: 'Express', sessionID: getSessionID });
};
