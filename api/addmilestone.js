var rest = require("rest");
var _ = require("underscore");
var async = require("async");
var asciitable = require("ascii-table");
var request = require("./request");
var repositories = require("./repos");

function addMilestones(cfg, callback) {
  repositories.get(cfg, function(err, repos) {
    if(err) {
      return callback(err);
    }
    async.eachSeries(repos, function(repo, repoCallback) {
      var url = "https://api.github.com/repos/" + cfg.org + "/" + repo.name + "/milestones";
      request.post(cfg, url, {
        "title": cfg.milestone,
        "state": "open",
        "description": cfg.description || "",
        "due_on": new Date(cfg.dueon)
      }).then(function(res){
        console.log("Milestone " + cfg.milestone + " created and is dueon " + cfg.dueon);
        repoCallback(null);
      }).catch(function(error){
        repoCallback(error);
      });
    }, function(err) {
      callback(err);
    });
  });
}

module.exports = function(cfg) {

  if(!cfg.milestone || !cfg.dueon){
    return console.error("Milstone title or dueon is missing");
  }

  addMilestones(cfg, function(err, milestones) {
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
