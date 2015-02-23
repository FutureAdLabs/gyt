module.exports.get = function(cfg, properties) {
  var req = {};

  if (typeof properties === 'string') {
    req = {
      path: properties
    };
  } else {
    req = properties;
  }

  if(cfg.token) {
    req.path = "https://" + req.path;
  } else {
    req.path = "https://" + cfg.username + ":" + cfg.password + "@" + req.path;
  }

  req.headers = {
    "User-Agent":"Adludio Gyt"
  };

  if(cfg.token) {
    req.headers.Authorization = "token " + cfg.token;
  }

  return req;
};
