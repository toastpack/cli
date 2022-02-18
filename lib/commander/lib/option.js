import { InvalidArgumentError } from './error.js';

class Option {
  constructor(flags, description) {
    this.flags = flags;
    this.description = description || '';

    this.required = flags.includes('<');
    this.optional = flags.includes('[');

    this.variadic = /\w\.\.\.[>\]]$/.test(flags);
    this.mandatory = false;
    const optionFlags = splitOptionFlags(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.negate = false;
    if (this.long) {
      this.negate = this.long.startsWith('--no-');
    }
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.presetArg = undefined;
    this.envVar = undefined;
    this.parseArg = undefined;
    this.hidden = false;
    this.argChoices = undefined;
  }

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  preset(arg) {
    this.presetArg = arg;
    return this;
  }

  env(name) {
    this.envVar = name;
    return this;
  }

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory;
    return this;
  }

  hideHelp(hide = true) {
    this.hidden = !!hide;
    return this;
  }

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(
          `Allowed choices are ${this.argChoices.join(', ')}.`
        );
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  name() {
    if (this.long) {
      return this.long.replace(/^--/, '');
    }
    return this.short.replace(/^-/, '');
  }

  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''));
  }

  is(arg) {
    return this.short === arg || this.long === arg;
  }

  isBoolean() {
    return !this.required && !this.optional && !this.negate;
  }
}

function camelcase(str) {
  return str.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

function splitOptionFlags(flags) {
  let shortFlag;
  let longFlag;

  const flagParts = flags.split(/[ |,]+/);
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
    shortFlag = flagParts.shift();
  longFlag = flagParts.shift();

  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}

export { Option, splitOptionFlags };
