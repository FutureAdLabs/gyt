var rest = require("rest");
var _ = require("underscore");
var async = require("async");
var asciitable = require("ascii-table");
var request = require("./request");
var repositories = require("./repos");

function getIssues(cfg, repofilters, labelfilters, callback) {
  var issues = {
    repos: [],
    totals: {}
  };

  repositories.get(cfg, function(err, repos) {
    if(err) {
      return callback(err);
    }

    async.each(repos, function(repo, repoCallback) {
      if(!repofilters.length || _.contains(repofilters, repo.name)) {
        var repoData = {
          name: repo.name,
          issues: [],
          totals: {
            total: 0
          }
        };
        issues.repos.push(repoData);

        var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/issues?state=all";
        var req = request.get(cfg, url);

        rest(req).then(function(response) {
          var res = JSON.parse(response.entity);
          async.each(res, function(issue, issueCallback) {
            var labelNames = _.map(issue.labels, function(l) {
              return l.name.toLowerCase().replace(" ", "");
            });

            if(!labelfilters.length || _.some(labelfilters, function(filter) {
              return _.contains(labelNames, filter);
            })) {

              repoData.issues.push({
                number: issue.number,
                title: issue.title,
                labels: _.pluck(issue.labels, "name")
              });

              _.each(labelfilters, function(filter) {
                if(_.contains(labelNames, filter)) {
                  if(repoData.totals[filter]) {
                    repoData.totals[filter]++;
                  } else {
                    repoData.totals[filter] = 1;
                  }
                }
              });

              repoData.totals.total++;
            }

            issueCallback();
          }, repoCallback);
        });
      } else {
        repoCallback();
      }
    }, function() {
      async.each(issues.repos, function(r, cb) {
        for(var group in r.totals) {
          if(issues.totals[group]) {
            issues.totals[group] += r.totals[group];
          } else {
            issues.totals[group] = r.totals[group];
          }
        }

        cb();
      }, function() {
        return callback(null, issues);
      });
    });
  });
}

function render(issues) {
  console.log();

  if(!issues.totals.total) {
    console.log("Non found.");
    return;
  }

  async.each(issues.repos, function(repo, rcb) {
    if(!repo.totals.total) {
      return rcb();
    }

    var repoTable = new asciitable(repo.name);

    _.each(repo.issues, function(i) {
      repoTable.addRow(i.number, i.title, i.labels.join(","));
    });

    console.log();
    console.log(repoTable.toString());

    var totalsTable = new asciitable();

    for(var group in repo.totals) {
      totalsTable.addRow(group, repo.totals[group]);
    }
    console.log(totalsTable.toString());

    rcb();
  }, function() {
    var totalsTable = new asciitable('Totals');

    for(var group in issues.totals) {
      totalsTable.addRow(group, issues.totals[group]);
    }

    console.log();
    console.log();
    console.log(totalsTable.toString());
  });
}

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

  getIssues(cfg, repofilters, labelfilters, function(err, issues) {
    render(issues);
  });
};
