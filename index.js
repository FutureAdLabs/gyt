#!/usr/bin/env node

var path = require("path");
var fs = require("fs");

var config = require("./config");
var cfg = config.load();

var commands = {
  "config": {
    description: "Display configuration",
    action: function(args) {
      console.log(JSON.stringify(cfg, null, 2));
    }
  },
  "set": {
    description: "Set config value",
    action: function(args) {
      if(args.username) {
        cfg.username = args.username;
      }

      if(args.password) {
        cfg.password = args.password;
      }

      if(args.org) {
        cfg.org = args.org;
      }

      if(args.token) {
        cfg.token = args.token;
      }

      config.save(cfg, function(err) {
        if(err) {
          console.error(err);
        } else {
          console.log("Configuration updated");
        }
      });
    }
  },
  "listrepos": {
    description: "List repositories",
    action: function(args) {
      if(args.username) {
        cfg.username = args.username;
      }

      if(args.password) {
        cfg.password = args.password;
      }

      if(args.token) {
        cfg.token = args.token;
      }

      if(args.org) {
        cfg.org = args.org;
      }

      require("./api/repos").list(cfg);
    }
  },
  "listissues": {
    description: "List issues",
    action: function(args) {
      if(args.username) {
        cfg.username = args.username;
      }

      if(args.password) {
        cfg.password = args.password;
      }

      if(args.token) {
        cfg.token = args.token;
      }

      if(args.org) {
        cfg.org = args.org;
      }

      if(args.repo) {
        cfg.repo = args.repo;
      }

      require("./api/listissues")(cfg);
    }
  },
  "icebox": {
    description: "List icebox issues",
    action: function(args) {
      if(args.username) {
        cfg.username = args.username;
      }

      if(args.password) {
        cfg.password = args.password;
      }

      if(args.token) {
        cfg.token = args.token;
      }

      if(args.org) {
        cfg.org = args.org;
      }

      if(args.repo) {
        cfg.repo = args.repo;
      }

      require("./api/listicebox")(cfg);
    }
  },
  "backlog": {
    description: "List backlog issues",
    action: function(args) {
      if(args.username) {
        cfg.username = args.username;
      }

      if(args.password) {
        cfg.password = args.password;
      }

      if(args.token) {
        cfg.token = args.token;
      }

      if(args.org) {
        cfg.org = args.org;
      }

      if(args.repo) {
        cfg.repo = args.repo;
      }

      require("./api/listbacklog")(cfg);
    }
  },
  "ready": {
    description: "List ready issues",
    action: function(args) {
      if(args.username) {
        cfg.username = args.username;
      }

      if(args.password) {
        cfg.password = args.password;
      }

      if(args.token) {
        cfg.token = args.token;
      }

      if(args.org) {
        cfg.org = args.org;
      }

      if(args.repo) {
        cfg.repo = args.repo;
      }

      require("./api/listready")(cfg);
    }
  },
  "inprogress": {
    description: "List in progress issues",
    action: function(args) {
      if(args.username) {
        cfg.username = args.username;
      }

      if(args.password) {
        cfg.password = args.password;
      }

      if(args.token) {
        cfg.token = args.token;
      }

      if(args.org) {
        cfg.org = args.org;
      }

      if(args.repo) {
        cfg.repo = args.repo;
      }

      require("./api/listinprogress")(cfg);
    }
  },
  "done": {
    description: "List completed issues",
    action: function(args) {
      if(args.username) {
        cfg.username = args.username;
      }

      if(args.password) {
        cfg.password = args.password;
      }

      if(args.token) {
        cfg.token = args.token;
      }

      if(args.org) {
        cfg.org = args.org;
      }

      if(args.repo) {
        cfg.repo = args.repo;
      }

      require("./api/listdone")(cfg);
    }
  }
};

function printCommands() {
  console.error("\nAvailable commands:\n");
  for (var key in commands) {
    console.error("  " + key + " \t- " + commands[key].description);
  }
  console.error("");
}

var args = require("raptor-args").createParser({
  "--help -h": {
    description: "Show this help message"
  },
  "--command *": {
    type: "string"
  },
  "--username -u": {
    type: "string",
    description: "GitHub username"
  },
  "--password -p": {
    type: "string",
    description: "GitHub password"
  },
  "--token -t": {
    type: "string",
    description: "GitHub OAuth token"
  },
  "--org -o": {
    type: "string",
    description: "GitHub organisation"
  },
  "--repo -r": {
    type: "string",
    description: "GitHub repository"
  }
}).validate(function(result) {
  if (result.help) {
    this.printUsage();
    printCommands();
    process.exit(0);
  }
  var command = result.command;
  if (typeof command !== "string") {
    result._ = command.slice(1);
    command = command[0];
  } else {
    result._ = [];
  }
  result.command = commands[command];
  if (!result.command) {
    console.error(command ? ("Unknown command '" + command + "'.")
                  : "No command specified.");
    printCommands();
    process.exit(1);
  }
}).onError(function(err) {
  this.printUsage();
  console.error(err);
  process.exit(1);
}).usage("Usage: gyt <command> [options]").parse();

args.command.action(args);
