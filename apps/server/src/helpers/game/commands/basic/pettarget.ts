import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PetTarget extends MacroCommand {
  override aliases = ['pettarget'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!player.pets?.length) {
      this.sendMessage(player, "You don't have any pets!");
      return;
    }

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );

    if (!target || target === player) {
      player.pets.forEach((pet) => {
        const ai = this.game.worldManager
          .getMap(pet.map)
          ?.state.getNPCSpawner(pet.uuid)
          ?.getNPCAI(pet.uuid);

        if (!ai) {
          this.sendMessage(player, 'Could not get AI to reset agro!');
          return;
        }

        ai.resetAgro(true);

        this.game.messageHelper.sendLogMessageToPlayer(player, {
          message: `Agro reset!`,
          from: pet.name,
        });
      });

      return;
    }

    player.pets.forEach((pet) => {
      const ai = this.game.worldManager
        .getMap(pet.map)
        ?.state.getNPCSpawner(pet.uuid)
        ?.getNPCAI(pet.uuid);

      if (!ai) {
        this.sendMessage(player, 'Could not get AI to reset agro!');
        return;
      }

      ai.focusTarget(target);

      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: `Focusing targetting on ${target.name}!`,
        from: pet.name,
      });
    });
  }
}
