var rest = require("rest");
var _ = require("underscore");

module.exports = function(cfg) {
  if(!cfg || !cfg.org) {
    console.log("Please provide an organisation");
    return;
  }
  var url = "https://" + cfg.username + ":" + cfg.password + "@api.github.com/orgs/" + cfg.org + "/repos";

  rest({
    "path": url,
    headers: {
      "User-Agent":"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)"
    }
  }).then(function(response) {

    var res = JSON.parse(response.entity);

    _.each(res, function(repo) {
      console.log(repo.name);
    });
  });
};
