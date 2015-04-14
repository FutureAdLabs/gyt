var rest = require("rest");
var _ = require("underscore");
var async = require("async");
var asciitable = require("ascii-table");
var request = require("./request");
var repositories = require("./repos");

function getMilestones(cfg, callback) {
  var milestones = [];

  repositories.get(cfg, function(err, repos) {
    if(err) {
      return callback(err);
    }

    async.eachSeries(repos, function(repo, repoCallback) {
      var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/milestones?state=all";

      request.getPaginatedResultSet(cfg, url, function(err, res) {

        if(res.length && !res.message) {
          _.each(res, function(milestone) {

            var due = new Date(milestone.due_on);
            var now = new Date();
            var dueInDays = Math.floor((due - now) / (1000*60*60*24)) + 1;
            if(dueInDays < 0) {
              dueInDays = 0;
            }

            milestones.push({
              name: milestone.title,
              repo: repo.name,
              state: milestone.state,
              due: dueInDays
            });
          });
        }
        repoCallback();
      });

    }, function(err) {
      callback(err, milestones);
    });

  });
}


module.exports = function(cfg) {
  getMilestones(cfg, function(err, milestones) {
    if(err) {
      return console.error(err);
    }

    console.log();

    var milestoneTable = new asciitable("Milestones");
    milestoneTable.setHeading("Name", "Repo", "State", "Due in days");

    _.each(milestones, function(milestone) {
      milestoneTable.addRow(milestone.name, milestone.repo, milestone.state, milestone.due);
    });

    console.log(milestoneTable.toString());
  });
};
