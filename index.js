#!/usr/bin/env node

var path = require("path");
var fs = require("fs");

var config = require("./config");
var cfg = config.load();

function updateConfig(args, cfg) {
  for(var item in args) {
    cfg[item] = args[item];
  }
}

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
      updateConfig(args, cfg);

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
      updateConfig(args, cfg);

      require("./api/repos").list(cfg);
    }
  },
  "report": {
    description: "Generate SMT report",
    action: function(args) {
      updateConfig(args, cfg);

      require("./api/smt-report")(cfg);
    }
  },
  "listissues": {
    description: "List issues",
    action: function(args) {
      updateConfig(args, cfg);

      require("./api/listissues")(cfg);
    }
  },
  "setpoints": {
    description: "Set points estimate for an issue",
    action: function(args) {
      updateConfig(args, cfg);

      require("./api/points")(cfg);
    }
  },
  "listmilestones": {
    description: "List milestones",
    action: function(args) {
      updateConfig(args, cfg);

      require("./api/listmilestones")(cfg);
    }
  },
  "addmilestone": {
    description: "Create new milestone on each org repo",
    action: function(args) {
      updateConfig(args, cfg);

      require("./api/addmilestone")(cfg);
    }
  },
  "delmilestone": {
    description: "Dekete existing milestone on each org repo matching the title",
    action: function(args) {
      updateConfig(args, cfg);

      require("./api/deleteMilestone")(cfg);
    }
  },
  "moveon": {
    description: "Move issue on to next stage",
    action: function(args) {
      updateConfig(args, cfg);

      require("./api/moveon.js")(cfg);
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
  "--password -pw": {
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
  },
  "--label -l": {
    type: "string",
    description: "GitHub issue label"
  },
  "--number -n": {
    type: "number",
    description: "GitHub issue number"
  },
  "--points -p": {
    type: "number",
    description: "GitHub issue points estimation"
  },
  "--milestone -m": {
    type: "string",
    description: "GitHub issues milestone"
  },
  "--state": {
    type: "string",
    description: "GitHub issues state"
  },
  "--runner -R": {
    type: "string",
    description: "Output render method"
  },
  "--debug -d": {
    type: "boolean",
    description: "Output debug"
  },
  "--description": {
    type: "string",
    description: "Milestone description"
  },
  "--dueon": {
    type: "date",
    description: "Milestone Due Date"
  },
  "--user": {
    type: "string",
    description: "Filter issues based on who created the task"
  },
  "--assignee": {
    type: "string",
    description: "Filter issues based on assignee"
  },
  "--nopoints": {
    type: "string",
    description: "Filter issues that have not been assigned an estimation"
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
