var rest = require("rest");
var _ = require("underscore");
var request = require("./request");

function getNextPage(cfg, url, callback) {
  var req = request.get(cfg, url);

  rest(req).then(function(response) {

    var nav = {};

    if(response.headers.Link) {
      var navArray = response.headers.Link.split(",");

      var next = _.filter(navArray, function(item) {
        return item.indexOf('rel="next"') >= 0;
      })[0];

      if(!next) {
        next = "";
      } else {
        next = next.substring(next.indexOf("<") + 1, next.indexOf(">"));
      }

      var last = _.filter(navArray, function(item) {
        return item.indexOf('rel="last"') >= 0;
      })[0];

      if(!last) {
        last = "";
      } else {
        last = last.substring(last.indexOf("<") + 1, last.indexOf(">"));
      }

      nav.next = next;
      nav.last = last;
    }

    var res = JSON.parse(response.entity);

    return callback(null, res, nav);
  });
}

function get(cfg, callback) {
  if(!cfg || !cfg.org) {
    return callback("Please provide an organisation");
  }

  var results = [];

  var url = "api.github.com/orgs/" + cfg.org + "/repos";

  var cb = function(err, res, nav) {
    if(err) {
      return callback(err);
    }
    _.each(res, function(item) {
      results.push(item);
    });

    if(nav.next) {
      return getNextPage(cfg, nav.next, cb);
    }

    return callback(null, results);
  };

  getNextPage(cfg, url, cb);
}

module.exports.get = get;

module.exports.list = function(cfg) {
  get(cfg, function(err, res) {
    if(err) {
      console.error(err);
      return;
    }
    console.log("HERE!");
    _.each(res, function(repo) {
      console.log(repo.name);
    });
  });
};
