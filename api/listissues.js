var rest = require("rest");
var _ = require("underscore");
var request = require("./request");

module.exports = function(cfg) {
  if(!cfg || !cfg.org) {
    console.log("Please provide an organisation");
    return;
  }

  if(!cfg || !cfg.repo) {
    console.log("Please provide a repository");
    return;
  }

  var url = "api.github.com/repos/" + cfg.org + "/" + cfg.repo + "/issues?state=all";
  var req = request.get(cfg, url);

  rest(req).then(function(response) {

    var res = JSON.parse(response.entity);

    console.log(res);

    _.each(res, function(issue) {
      console.log();
      console.log("----------------------------------------------------------------------------------------------------");
      console.log("Number: " + issue.number);
      console.log(issue.title);
      console.log("State: " + issue.state);
      _.each(issue.labels, function(label) {
        console.log("- " + label.name);
      });
      console.log("----------------------------------------------------------------------------------------------------");
    });
  });
};
