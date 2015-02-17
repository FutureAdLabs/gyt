var fs = require("fs");

module.exports.load = function() {
  var data;
  try {
    data = fs.readFileSync(__dirname + "/config.json");
  } catch(e) {
    return {};
  }
  if (!data) {
    return {};
  }

  try {
    var cfg = JSON.parse(data);
    return cfg;
  } catch(e) {
    return {};
  }
};

module.exports.save = function(cfg, callback) {
  if(!cfg) {
    return callback("No config provided");
  }

  var cfgString = JSON.stringify(cfg, null, 2);

  fs.writeFile(__dirname + "/config.json", cfgString, callback);
};
