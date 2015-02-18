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
  var boxWidth = 150;
  var topAndBottom = "";

  _.times(boxWidth, function() {
    topAndBottom += "-";
  });

  rest(req).then(function(response) {

    var res = JSON.parse(response.entity);
    console.log(topAndBottom);
    _.each(res, function(issue) {
      var line = "| " + issue.number;
      var space = 10 - line.length;

      _.times(space, function() {
        line  += " ";
      });

      line += issue.title;

      _.times(90 - line.length - 1, function() {
        line += " ";
      });

      _.each(issue.labels, function(label) {
        line += label.name + " ";
      });

      space = boxWidth - line.length - 1;

      _.times(space, function() {
        line  += " ";
      });

      line += "|";
      console.log(line);
    });
    console.log(topAndBottom);
  });
};
