var rest = require("rest");
var _ = require("underscore");
var async = require("async");
var asciitable = require("ascii-table");
var request = require("./request");
var repositories = require("./repos");
var util = require("./util");

function getIssues(cfg, repofilters, labelfilters, milestoneFiters, callback) {
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
            total: 0,
            points: 0,
            newlyAdded: 0,
            progress: 0,
            newlyAddedProgress: 0
          }
        };
        issues.repos.push(repoData);

        var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/issues?state=all";

        request.getPaginatedResultSet(cfg, url, function(err, res) {
          async.each(res, function(issue, issueCallback) {

            var labelNames = _.map(issue.labels, function(l) {
              return l.name.toLowerCase().replace(" ", "");
            });

            if(!_.some(_.pluck(issue.labels, "name"), function(l) {
              return _.contains(["Icebox", "ready", "in progress", "Newly added"], l);
            })) {
              if(issue.state === "closed") {
                labelNames.push("done");
                issue.labels.push({name: "done"});
              } else {
                labelNames.push("backlog");
                issue.labels.push({name: "backlog"});
              }
            }
            
            // console.log("milestone", issue.milestone && issue.milestone.title || "");
            // console.log("created_at", issue.created_at)
            // console.log("closed_at", issue.closed_at)
            // console.log("assignee", issue.assignee && issue.assignee.login || "");
            // console.log("Labels", issue.labels);
            // console.log("state", issue.state);

            if((!labelfilters.length || _.some(labelfilters, function(filter) {
              return _.contains(labelNames, filter);
            })) && (!milestoneFiters.length || (issue.milestone && _.contains(milestoneFiters, issue.milestone.title.toLowerCase()))
                   )  && (!cfg.state || cfg.state === issue.state)) {

              var milestone = "";
              if(issue.milestone) {
                milestone = issue.milestone.title;
              }

              var points = util.getCurrentPoints(issue.title);
              var progress = 0;
              if(issue.state === "closed") {
                progress = points;
              }
              var labels = _.pluck(issue.labels, "name");

              repoData.issues.push({
                number: issue.number,
                title: util.getNakedTitle(issue.title),
                labels: labels,
                milestone: milestone,
                points: points,
                assignee: issue.assignee && issue.assignee.login || "",
                created_at: issue.created_at,
                closed_at: issue.closed_at,
                progress: progress
              });

              repoData.totals.points += points;
              repoData.totals.progress += progress;

              if(labels.indexOf("newly added") !== -1 || labels.indexOf("Newly added") !== -1){
                repoData.totals.newlyAdded += points;
                repoData.totals.newlyAddedProgress += progress;
              }

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


function render(cfg, issues) {
  console.log();

  if(!issues.totals.total) {
    console.log("Non found.");
    return;
  }

  var heading = "SMT - DAY MONTH - DAY MONTH\n" +
                  "=================\n" +
                  "# Tech Status Update\n\n" +
                  "#### Dev KPIs\n";
    
  console.log(heading);
  console.log("* "+issues.totals.progress+" out of " +issues.totals.points+ " points completed (126 last week) (Two developers away this week)\n" +
              "* "+ ( (issues.totals.progress / issues.totals.points) * 100 | 0) +"% of what we set out to achieve (79% last week)\n" +
              "* " + ( (issues.totals.newlyAdded / issues.totals.points) * 100 | 0) + "% newly added (18% last week)\n" +
              "* " + ( ( (issues.totals.progress + issues.totals.newlyAddedProgress) / (issues.totals.points + issues.totals.newlyAdded)) * 100 | 0) + "% actual completed (83% last week)\n\n\n");
  
  console.log("#### Achieved");

  async.each(issues.repos, function(repo, rcb) {
    if(!repo.totals.total) {
      return rcb();
    }
    
    _.each(repo.issues, function(i) {
      if(i.progress == i.points){
        var row = [toTitleCase(repo.name), i.assignee || "NOT ASSIGNED", i.title.replace(/,/g, " ")].join(", ");
        console.log("* " + row);
      }
    });

    rcb();
  });

/*
#### Next Week
* Dashboard frontend
* Perspective peek demo
* Frontend development tutorial
*/
}


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
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

  var milestoneFiters = [];
  if(cfg && cfg.milestone) {
    milestoneFiters = cfg.milestone.toLowerCase().split(",");
  }

  getIssues(cfg, repofilters, labelfilters, milestoneFiters, function(err, issues) {
    render(cfg, issues);
  });
};
