var rest = require("rest");
var _ = require("underscore");
var request = require("./request");
var repositories = require("./repos");

module.exports = function(cfg) {
  if(!cfg || !cfg.org) {
    console.log("Please provide an organisation");
    return;
  }

  var repofilters = [];
  if(cfg && cfg.repo) {
    repofilters = cfg.repo.split(",");
  }

  var labelfilters = [];
  if(cfg && cfg.label) {
    labelfilters = cfg.label.split(",");
  }

  var boxWidth = 150;
  var topAndBottom = "";
  var line = "";

  var orgTotals = {
    total: 0,
    icebox: 0,
    backlog: 0,
    ready: 0,
    inprogress: 0,
    done: 0
  };

  _.times(boxWidth, function() {
    topAndBottom += "-";
  });

  repositories.get(cfg, function(err, repos) {
    if(err) {
      console.error(err);
      return;
    }
    console.log();

    _.each(repos, function(repo) {
      if(!repofilters.length || _.contains(repofilters, repo.name)) {
        var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/issues?state=all";
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
              var labelNames = _.map(issue.labels, function(l) {
                return l.name.toLowerCase().replace(" ", "");
              });
              if(!labelfilters.length || _.some(labelfilters, function(filter) {
                return _.contains(labelNames, filter);
              })) {
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
              }
            });
            console.log(topAndBottom);
            console.log();
          }
        });
      }
    });
  });
};
