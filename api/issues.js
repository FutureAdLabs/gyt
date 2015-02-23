var rest = require("rest");
var _ = require("underscore");
var request = require("./request");

function get(cfg, callback) {
  if(!cfg || !cfg.org) {
    console.log("Please provide an organisation");
    return;
  }

  if(!cfg || !cfg.repo) {
    console.log("Please provide a repository");
    return;
  }

  if(!cfg || !cfg.number) {
    console.log("Please provide an issue number");
    return;
  }

  var url = "api.github.com/repos/" + cfg.org + "/" + cfg.repo + "/issues/" + cfg.number;
  var req = request.get(cfg, url);

  rest(req).then(function(response) {

    var res = JSON.parse(response.entity);

    return callback(null, res);
  });
}

module.exports.get = get;
