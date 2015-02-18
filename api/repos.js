var rest = require("rest");
var _ = require("underscore");
var request = require("./request");

function get(cfg, callback) {
  if(!cfg || !cfg.org) {
    return callback("Please provide an organisation");
  }

  var url = "api.github.com/orgs/" + cfg.org + "/repos";
  var req = request.get(cfg, url);

  rest(req).then(function(response) {

    var res = JSON.parse(response.entity);

    return callback(null, res);
  });
}

module.exports.get = get;

module.exports.list = function(cfg) {
  get(cfg, function(err, res) {
    if(err) {
      console.error(err);
      return;
    }

    _.each(res, function(repo) {
      console.log(repo.name);
    });
  });
};
