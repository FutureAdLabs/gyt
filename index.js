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

      if(args.org) {
        cfg.org = args.org;
      }

      require("./api/listrepos")(cfg);
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
  "--org -o": {
    type: "string",
    description: "GitHub organisation"
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
