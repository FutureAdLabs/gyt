var rest = require("rest");
var _ = require("underscore");
var async = require("async");
var asciitable = require("ascii-table");
var request = require("./request");
var repositories = require("./repos");

function deleteMilestone(cfg, callback) {

  repositories.get(cfg, function(err, repos) {
    if(err) {
      return callback(err);
    }

    async.eachSeries(repos, function(repo, repoCallback) {
      var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/milestones?state=all";

      request.getPaginatedResultSet(cfg, url, function(err, res) {
        if(res.length && !res.message) {
          _.each(res, function(milestone) {
            if(milestone.title === cfg.milestone){
              url = "https://api.github.com/repos/" + cfg.org + "/" + repo.name + "/milestones/" + milestone.number;
              request.rdelete(cfg, url).then(function(res){
                console.log("Deleted " + cfg.milestone + " from " + repo.name);
                repoCallback(null);
              }).catch(function(err){
                repoCallback(err);
              });
            }
          });
        }else{
          console.log("No Milestone found for " + repo.name)
          return repoCallback();
        }
      });

    }, function(err) {
      return callback(err);
    });

  });
}


module.exports = function(cfg) {

  if(!cfg.milestone){
    return console.error("Milstone title or dueon is missing");
  }

  deleteMilestone(cfg, function(err) {
    if(err) {
      return console.error(err);
    }
    return console.log("DONE!");
  });
};
