var rest = require("rest");
var _ = require("underscore");
var request = require("./request");
var repositories = require("./repos");

module.exports = function(cfg) {
  if(!cfg || !cfg.org) {
    console.log("Please provide an organisation");
    return;
  }

  repositories.get(cfg, function(err, repos) {
    if(err) {
      console.error(err);
      return;
    }

    _.each(repos, function(repo) {
      var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/issues?labels=backlog";
      var req = request.get(cfg, url);

      rest(req).then(function(response) {
        var res = JSON.parse(response.entity);
        if(res.length) {
          console.log("----------------------------------------------------------------------------------------------------");
          console.log(repo.name);
          _.each(res, function(issue) {
            console.log();
            console.log("Number: " + issue.number);
            console.log(issue.title);
            console.log("State: " + issue.state);
            _.each(issue.labels, function(label) {
              console.log("- " + label.name);
            });
          });
          console.log("----------------------------------------------------------------------------------------------------");
        }
      });
    });
  });
};
