import { GameAction, IMacro, IMacroBar } from '../../interfaces';

// dispatched when a macro is clicked and set active
export class SetActiveMacro {
  static type = GameAction.SetActiveMacro;
  constructor(public macroName: string) {}
}

// dispatched when the active macro bars change
export class SetActiveMacroBars {
  static type = GameAction.SetActiveMacroBars;
  constructor(public macroBarNames: string[]) {}
}

// dispatched when a new custom macro is created or edited
export class CreateCustomMacro {
  static type = GameAction.CreateCustomMacro;
  constructor(public macro: IMacro) {}
}

// dispatched when a custom macro is deleted
export class DeleteCustomMacro {
  static type = GameAction.DeleteCustomMacro;
  constructor(public macro: IMacro) {}
}

// dispatched when the users macro bars change
export class SetMacroBars {
  static type = GameAction.SetMacroBar;
  constructor(public macroBars: IMacroBar[]) {}
}

// dispatched when the users macro bars change
export class SetDefaultMacros {
  static type = GameAction.SetDefaultMacros;
  constructor() {}
}
