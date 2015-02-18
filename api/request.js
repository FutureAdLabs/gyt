module.exports.get = function(cfg, url) {
  if(cfg.token) {
    url = "https://" + url;
  } else {
    url = "https://" + cfg.username + ":" + cfg.password + "@" + url;
  }

  var req = {
    "path": url,
    headers: {
      "User-Agent":"Adludio Gyt"
    }
  };

  if(cfg.token) {
    req.headers.Authorization = "token " + cfg.token;
  }

  return req;
};
