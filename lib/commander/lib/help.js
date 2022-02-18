import { humanReadableArgName } from './argument.js';

class Help {
  constructor() {
    this.helpWidth = undefined;
    this.sortSubcommands = false;
    this.sortOptions = false;
  }

  visibleCommands(cmd) {
    const visibleCommands = cmd.commands.filter((cmd) => !cmd._hidden);
    if (cmd._hasImplicitHelpCommand()) {
      const [, helpName, helpArgs] =
        cmd._helpCommandnameAndArgs.match(/([^ ]+) *(.*)/);
      const helpCommand = cmd.createCommand(helpName).helpOption(false);
      helpCommand.description(cmd._helpCommandDescription);
      if (helpArgs) helpCommand.arguments(helpArgs);
      visibleCommands.push(helpCommand);
    }
    if (this.sortSubcommands) {
      visibleCommands.sort((a, b) => {
        return a.name().localeCompare(b.name());
      });
    }
    return visibleCommands;
  }

  visibleOptions(cmd) {
    const visibleOptions = cmd.options.filter((option) => !option.hidden);

    const showShortHelpFlag =
      cmd._hasHelpOption &&
      cmd._helpShortFlag &&
      !cmd._findOption(cmd._helpShortFlag);
    const showLongHelpFlag =
      cmd._hasHelpOption && !cmd._findOption(cmd._helpLongFlag);
    if (showShortHelpFlag || showLongHelpFlag) {
      let helpOption;
      if (!showShortHelpFlag) {
        helpOption = cmd.createOption(cmd._helpLongFlag, cmd._helpDescription);
      } else if (!showLongHelpFlag) {
        helpOption = cmd.createOption(cmd._helpShortFlag, cmd._helpDescription);
      } else {
        helpOption = cmd.createOption(cmd._helpFlags, cmd._helpDescription);
      }
      visibleOptions.push(helpOption);
    }
    if (this.sortOptions) {
      const getSortKey = (option) => {
        return option.short
          ? option.short.replace(/^-/, '')
          : option.long.replace(/^--/, '');
      };
      visibleOptions.sort((a, b) => {
        return getSortKey(a).localeCompare(getSortKey(b));
      });
    }
    return visibleOptions;
  }

  visibleArguments(cmd) {
    if (cmd._argsDescription) {
      cmd._args.forEach((argument) => {
        argument.description =
          argument.description || cmd._argsDescription[argument.name()] || '';
      });
    }

    if (cmd._args.find((argument) => argument.description)) {
      return cmd._args;
    }
    return [];
  }

  subcommandTerm(cmd) {
    const args = cmd._args.map((arg) => humanReadableArgName(arg)).join(' ');
    return (
      cmd._name +
      (cmd._aliases[0] ? '|' + cmd._aliases[0] : '') +
      (cmd.options.length ? ' [options]' : '') +
      (args ? ' ' + args : '')
    );
  }

  optionTerm(option) {
    return option.flags;
  }

  argumentTerm(argument) {
    return argument.name();
  }

  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => {
      return Math.max(max, helper.subcommandTerm(command).length);
    }, 0);
  }

  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => {
      return Math.max(max, helper.optionTerm(option).length);
    }, 0);
  }

  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => {
      return Math.max(max, helper.argumentTerm(argument).length);
    }, 0);
  }

  commandUsage(cmd) {
    let cmdName = cmd._name;
    if (cmd._aliases[0]) {
      cmdName = cmdName + '|' + cmd._aliases[0];
    }
    let parentCmdNames = '';
    for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
      parentCmdNames = parentCmd.name() + ' ' + parentCmdNames;
    }
    return parentCmdNames + cmdName + ' ' + cmd.usage();
  }

  commandDescription(cmd) {
    return cmd.description();
  }

  subcommandDescription(cmd) {
    return cmd.description();
  }

  optionDescription(option) {
    const extraInfo = [];

    if (option.argChoices) {
      extraInfo.push(
        `choices: ${option.argChoices
          .map((choice) => JSON.stringify(choice))
          .join(', ')}`
      );
    }
    if (option.defaultValue !== undefined) {
      const showDefault =
        option.required ||
        option.optional ||
        (option.isBoolean() && typeof option.defaultValue === 'boolean');
      if (showDefault) {
        extraInfo.push(
          `default: ${
            option.defaultValueDescription ||
            JSON.stringify(option.defaultValue)
          }`
        );
      }
    }

    if (option.presetArg !== undefined && option.optional) {
      extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
    }
    if (option.envVar !== undefined) {
      extraInfo.push(`env: ${option.envVar}`);
    }
    if (extraInfo.length > 0) {
      return `${option.description} (${extraInfo.join(', ')})`;
    }

    return option.description;
  }

  argumentDescription(argument) {
    const extraInfo = [];
    if (argument.argChoices) {
      extraInfo.push(
        `choices: ${argument.argChoices
          .map((choice) => JSON.stringify(choice))
          .join(', ')}`
      );
    }
    if (argument.defaultValue !== undefined) {
      extraInfo.push(
        `default: ${
          argument.defaultValueDescription ||
          JSON.stringify(argument.defaultValue)
        }`
      );
    }
    if (extraInfo.length > 0) {
      const extraDescripton = `(${extraInfo.join(', ')})`;
      if (argument.description) {
        return `${argument.description} ${extraDescripton}`;
      }
      return extraDescripton;
    }
    return argument.description;
  }

  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth || 80;
    const itemIndentWidth = 2;
    const itemSeparatorWidth = 2;
    function formatItem(term, description) {
      if (description) {
        const fullText = `${term.padEnd(
          termWidth + itemSeparatorWidth
        )}${description}`;
        return helper.wrap(
          fullText,
          helpWidth - itemIndentWidth,
          termWidth + itemSeparatorWidth
        );
      }
      return term;
    }
    function formatList(textArray) {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth));
    }

    let output = [`Usage: ${helper.commandUsage(cmd)}`, ''];

    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([commandDescription, '']);
    }

    const argumentList = helper.visibleArguments(cmd).map((argument) => {
      return formatItem(
        helper.argumentTerm(argument),
        helper.argumentDescription(argument)
      );
    });
    if (argumentList.length > 0) {
      output = output.concat(['Arguments:', formatList(argumentList), '']);
    }

    const optionList = helper.visibleOptions(cmd).map((option) => {
      return formatItem(
        helper.optionTerm(option),
        helper.optionDescription(option)
      );
    });
    if (optionList.length > 0) {
      output = output.concat(['Options:', formatList(optionList), '']);
    }

    const commandList = helper.visibleCommands(cmd).map((cmd) => {
      return formatItem(
        helper.subcommandTerm(cmd),
        helper.subcommandDescription(cmd)
      );
    });
    if (commandList.length > 0) {
      output = output.concat(['Commands:', formatList(commandList), '']);
    }

    return output.join('\n');
  }

  padWidth(cmd, helper) {
    return Math.max(
      helper.longestOptionTermLength(cmd, helper),
      helper.longestSubcommandTermLength(cmd, helper),
      helper.longestArgumentTermLength(cmd, helper)
    );
  }

  wrap(str, width, indent, minColumnWidth = 40) {
    if (str.match(/[\n]\s+/)) return str;

    const columnWidth = width - indent;
    if (columnWidth < minColumnWidth) return str;

    const leadingStr = str.substr(0, indent);
    const columnText = str.substr(indent);

    const indentString = ' '.repeat(indent);
    const regex = new RegExp(
      '.{1,' +
        (columnWidth - 1) +
        '}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)',
      'g'
    );
    const lines = columnText.match(regex) || [];
    return (
      leadingStr +
      lines
        .map((line, i) => {
          if (line.slice(-1) === '\n') {
            line = line.slice(0, line.length - 1);
          }
          return (i > 0 ? indentString : '') + line.trimRight();
        })
        .join('\n')
    );
  }
}

export { Help };
