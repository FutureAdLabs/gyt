var rest = require("rest");
var _ = require("underscore");
var async = require("async");
var asciitable = require("ascii-table");
var request = require("./request");
var repositories = require("./repos");

function closeMilestone(cfg, callback) {

  repositories.get(cfg, function(err, repos) {
    if(err) {
      return callback(err);
    }

    async.eachSeries(repos, function(repo, repoCallback) {
      var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/milestones?state=open";
      var done = false;
      request.getPaginatedResultSet(cfg, url, function(err, res) {
        if(res.length && !res.message) {
          _.each(res, function(milestone) {
            if(milestone.title === cfg.milestone){
              done = true;
              url = "https://api.github.com/repos/" + cfg.org + "/" + repo.name + "/milestones/" + milestone.number;
              request.patch(cfg, url, {
                "title": cfg.milestone,
                "state": "closed"
              }).then(function(res){
                console.log(repo.name + " Milestone " + cfg.milestone + " closed");
                repoCallback(null);
              }).catch(function(error){
                repoCallback(error);
              });
            }
          });
          if(!done){
            console.log(repo.name + " Milestone " + cfg.milestone + " not found!");
            repoCallback(null);
          }
        }else{
          console.log("No Milestone found for " + repo.name)
          return repoCallback(null);
        }
      });

    }, function(err) {
      return callback(err);
    });

  });
}

module.exports = function(cfg) {

  if(!cfg.milestone){
    return console.error("Milstone title is missing");
  }

  closeMilestone(cfg, function(err) {
    if(err) {
      return console.error(err);
    }
    return console.log("DONE!");
  });
};
