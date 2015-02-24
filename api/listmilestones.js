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
      var url = "api.github.com/repos/" + cfg.org + "/" + repo.name + "/milestones";
      var req = request.get(cfg, url);

      rest(req).then(function(response) {

        res = JSON.parse(response.entity);
        if(res.length && !res.message) {
          _.each(res, function(milestone) {
            milestones.push(milestone.title);
          });
        }
        repoCallback();
      });

    }, function(err) {
      callback(err, _.uniq(milestones));
    });

  });
}


module.exports = function(cfg) {
  getMilestones(cfg, function(err, milestones) {
    if(err) {
      return console.error(err);
    }

    _.each(milestones, function(milestone) {
      console.log(milestone);
    });
  });
};
