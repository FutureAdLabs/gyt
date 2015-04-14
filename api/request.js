function stripProtocol(req) {
  if(req.path.indexOf("https://") >= 0) {
    req.path = req.path.substring(req.path.indexOf("https://") + 8);
  }
}


module.exports.get = function(cfg, properties) {
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
