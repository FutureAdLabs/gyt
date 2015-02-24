var rest = require("rest");
var request = require("./request");
var issues = require("./issues");
var util = require("./util");

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

    var pointsIndex = util.getPointsSectionIndex(issue.title);
    var title = "";

    if(pointsIndex < 0) {
      title = "[0/" + cfg.points + "] " + issue.title;
    } else {
      var nakedTitle = util.getNakedTitle(issue.title);
      title = "[0/" + cfg.points + "] " + nakedTitle;
    }

    updateTitle(cfg, issue, title);
  });
};
