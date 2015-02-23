var rest = require("rest");
var _ = require("underscore");
var async = require("async");
var request = require("./request");
var issues = require("./issues");

function updateTitle(cfg, issue, title) {
  var url = "api.github.com/repos/" + cfg.org + "/" + cfg.repo + "/issues/" + cfg.number;
  var req = request.get(cfg, {
    path: url,
    method: "PATCH",
    entity: JSON.stringify({
      title: title
    })
  });

  rest(req).then(function(response) {
    console.log("OK");
  });
}

function getCurrentPoints(title) {
  var slashIndex = title.indexOf("/");
  var closeIndex = title.indexOf("]");
  var points = title.substring(slashIndex + 1, closeIndex);
  return points;
}

function getNakedTitle(title) {
  var closeIndex = title.indexOf("]");
  var nakedTitle = title.substring(closeIndex + 2);

  return nakedTitle;
}


module.exports = function(cfg) {
  if(!cfg || !cfg.points) {
    console.log("Please provide the points estimate");
    return;
  }

  issues.get(cfg, function(err, issue) {

    if(err) {
      console.error(err);
      return;
    }

    var re = /\[\d+\/\d+\]/;

    var pointsIndex = issue.title.search(re);
    var title = "";

    if(pointsIndex < 0) {
      title = "[0/" + cfg.points + "] " + issue.title;
    } else {
      var nakedTitle = getNakedTitle(issue.title);
      title = "[0/" + cfg.points + "] " + nakedTitle;
    }

    updateTitle(cfg, issue, title);
  });
};
