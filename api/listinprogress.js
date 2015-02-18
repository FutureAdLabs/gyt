var rest = require("rest");
var _ = require("underscore");
var request = require("./request");
var repositories = require("./repos");

module.exports = function(cfg) {
  if(!cfg || !cfg.org) {
    console.log("Please provide an organisation");
    return;
  }

  var boxWidth = 150;
  var topAndBottom = "";
  var line = "";

  _.times(boxWidth, function() {
    topAndBottom += "-";
  });

  repositories.get(cfg, function(err, repos) {
    if(err) {
      console.error(err);
      return;
    }

    _.each(repos, function(repo) {
      var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/issues?labels=in%20progress";
      var req = request.get(cfg, url);

      rest(req).then(function(response) {
        var res = JSON.parse(response.entity);
        if(res.length) {
          console.log(topAndBottom);
          line = "| " + repo.name;
          _.times(boxWidth - line.length - 1, function() {
            line += " ";
          });
          line += "|";
          console.log(line);
          console.log(topAndBottom);

          _.each(res, function(issue) {
            line = "| " + issue.number;

            _.times(10 - line.length - 1, function() {
              line += " ";
            });

            line += issue.title;

            _.times(90 - line.length - 1, function() {
              line += " ";
            });

            _.each(issue.labels, function(label) {
              line += label.name + " ";
            });

            _.times(boxWidth - line.length - 1, function() {
              line += " ";
            });

            line += "|";

            console.log(line);
          });
          console.log(topAndBottom);
          console.log();
        }
      });
    });
  });
};
