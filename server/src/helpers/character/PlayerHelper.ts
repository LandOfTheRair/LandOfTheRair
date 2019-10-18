import { Singleton } from 'typescript-ioc';
import { Currency, IPlayer, Skill } from '../../interfaces';


@Singleton
export class PlayerHelper {

  public init() {}

  // flag a certain skill for a player
  public flagSkill(player: IPlayer, skill: Skill|Skill[]): void {
    player.flaggedSkills = Array.isArray(skill) ? skill : [skill];
  }

  // gain exp for a player
  public gainExp(player: IPlayer, xpGained: number): void {
    if (player.gainingAXP && xpGained > 0) return;

    // TODO: modify xpGained for sub
    if (isNaN(xpGained)) throw new Error(`XP gained for ${player.name} is NaN!`);
    player.exp += Math.max(player.exp + xpGained, 0);

  }

  // gain axp for a player
  public gainAxp(player: IPlayer, axpGained: number): void {
    if (!player.gainingAXP && axpGained > 0) return;

    // TODO: modify axpGained for sub
    if (isNaN(axpGained)) throw new Error(`AXP gained for ${player.name} is NaN!`);
    player.axp = Math.max(player.axp + axpGained, 0);

  }

  // gain skill for a player
  public gainSkill(player: IPlayer, skill: Skill, skillGained: number): void {

    // TODO: modify skillGained for sub
    if (isNaN(skillGained)) throw new Error(`Skill gained for ${player.name} is NaN!`);

    player.skills[skill] = Math.max((player.skills[skill] ?? 0) + skillGained);

  }

  // gain all currently flagged skills
  public gainCurrentSkills(player: IPlayer, skillGained: number): void {
    if (!player.flaggedSkills || !player.flaggedSkills.length) return;

    const [primary, secondary, tertiary, quaternary] = player.flaggedSkills;

    if (quaternary) {
      this.gainSkill(player, primary, skillGained * 0.45);
      this.gainSkill(player, secondary, skillGained * 0.25);
      this.gainSkill(player, tertiary, skillGained * 0.15);
      this.gainSkill(player, quaternary, skillGained * 0.15);

    } else if (tertiary) {
      this.gainSkill(player, primary, skillGained * 0.55);
      this.gainSkill(player, secondary, skillGained * 0.25);
      this.gainSkill(player, tertiary, skillGained * 0.20);

    } else if (secondary) {
      this.gainSkill(player, primary, skillGained * 0.75);
      this.gainSkill(player, secondary, skillGained * 0.25);

    } else {
      this.gainSkill(player, primary, skillGained);
    }
  }

  // gain currency for a player
  public gainCurrency(player: IPlayer, currency: Currency = Currency.Gold, currencyGained: number): void {
    if (isNaN(currencyGained)) throw new Error(`Currency gained ${currency} for ${player.name} is NaN!`);

    player.currency[currency] = Math.max((player.currency[currency] ?? 0) + currencyGained, 0);

  }

}
