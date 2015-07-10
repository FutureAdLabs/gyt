var rest = require("rest");
var _ = require("underscore");

function stripProtocol(req) {
  if(req.path.indexOf("https://") >= 0) {
    req.path = req.path.substring(req.path.indexOf("https://") + 8);
  }
}

var rdelete = function(cfg, url){
  return rest({
    method: "DELETE",
    path: url,
    headers: {
      "User-Agent":"Adludio Gyt",
      "Authorization": "token " + cfg.token
    }
  }).then(function(response) {
    if (response.status.code === 204) {
      return true;
    } else {
      throw response.entity;
    }
  }).catch(function(error) {
    throw error;
  });
};
module.exports.rdelete = rdelete;




var post = function(cfg, url, data){

  return rest({
    method: "POST",
    path: url,
    entity: JSON.stringify(data),
    headers: {
      "User-Agent":"Adludio Gyt",
      "Authorization": "token " + cfg.token
    }
  }).then(function(response) {
    if (response.status.code >= 200 && response.status.code < 300) {
      return JSON.parse(response.entity);
    } else {
      throw response.entity;
    }
  }).catch(function(error) {
    throw error;
  });

};
module.exports.post = post;


var get = function(cfg, properties) {
  var req = {};

  if (typeof properties === 'string') {
    req = {
      path: properties
    };
  } else {
    req = properties;
  }

  stripProtocol(req);

  if(cfg.token) {
    req.path = "https://" + req.path;
  } else {
    req.path = "https://" + cfg.username + ":" + cfg.password + "@" + req.path;
  }

  if(cfg.debug) {
    console.log("Calling: " + req.path);
  }

  req.headers = {
    "User-Agent":"Adludio Gyt"
  };

  if(cfg.token) {
    req.headers.Authorization = "token " + cfg.token;
  }

  return req;
};

module.exports.get = get;

function getNextPage(cfg, url, callback) {
  var req = get(cfg, url);

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

module.exports.getPaginatedResultSet = function(cfg, seedUrl, callback) {
  var results = [];

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

  getNextPage(cfg, seedUrl, cb);
};
