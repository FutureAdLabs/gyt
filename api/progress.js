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
    console.log("Please provide a points progress");
    return;
  }

  issues.get(cfg, function(err, issue) {

    if(err) {
      console.error(err);
      return;
    }

    var estimation = util.getCurrentPoints(issue.title);
    var title = "[" + cfg.points + "/" + estimation + "] " + util.getNakedTitle(issue.title);
    updateTitle(cfg, issue, title);
  });
};
