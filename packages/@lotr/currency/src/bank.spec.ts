import type { IPlayer } from '@lotr/interfaces';
import { Currency } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bankDeposit, bankWithdraw } from './bank';
import * as currencyModule from './currency';

// Mock the currency module functions
vi.mock('./currency', () => ({
  gainCurrency: vi.fn(),
  loseCurrency: vi.fn(),
}));

const mockGainCurrency = vi.mocked(currencyModule.gainCurrency);
const mockLoseCurrency = vi.mocked(currencyModule.loseCurrency);

describe('Bank Functions', () => {
  let mockPlayer: IPlayer;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPlayer = {
      currency: { [Currency.Gold]: 1000 },
      bank: {
        deposits: { [Currency.Gold]: 500 },
      },
    } as IPlayer;
  });

  describe('bankDeposit', () => {
    it('should deposit currency into bank and remove from player', () => {
      const amount = 100;
      const currency = Currency.Gold;

      bankDeposit(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(600);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should initialize bank deposits if currency does not exist', () => {
      const amount = 50;
      const currency = Currency.Silver;

      bankDeposit(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(50);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should use Gold as default currency when not specified', () => {
      const amount = 75;

      bankDeposit(mockPlayer, amount);

      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(575);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        Currency.Gold,
      );
    });

    it('should handle zero amount deposit', () => {
      const initialAmount = mockPlayer.bank.deposits[Currency.Gold]!;
      const amount = 0;

      bankDeposit(mockPlayer, amount, Currency.Gold);

      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(initialAmount);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        Currency.Gold,
      );
    });

    it('should handle negative amount deposit by ensuring bank balance does not go below 0', () => {
      const amount = -1000; // More than current bank balance
      const currency = Currency.Gold;

      bankDeposit(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(0);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should work with different currency types', () => {
      const amount = 25;
      const currency = Currency.Fate;

      bankDeposit(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(25);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should work with seasonal currencies', () => {
      const amount = 10;
      const currency = Currency.Christmas;

      bankDeposit(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(10);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should handle decimal amounts', () => {
      const amount = 123.45;
      const currency = Currency.Gold;

      bankDeposit(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(623.45);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should ensure bank balance never goes below 0 even with large negative deposits', () => {
      mockPlayer.bank.deposits[Currency.Gold] = 100;
      const amount = -500;

      bankDeposit(mockPlayer, amount, Currency.Gold);

      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(0);
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        Currency.Gold,
      );
    });

    it('should handle undefined bank deposits property by initializing it', () => {
      const player = {
        currency: { [Currency.Gold]: 1000 },
        bank: { deposits: {} },
      } as IPlayer;

      const amount = 200;
      const currency = Currency.Silver;

      bankDeposit(player, amount, currency);

      expect(player.bank.deposits[currency]).toBe(200);
      expect(mockLoseCurrency).toHaveBeenCalledWith(player, amount, currency);
    });
  });

  describe('bankWithdraw', () => {
    it('should withdraw currency from bank and add to player', () => {
      const amount = 100;
      const currency = Currency.Gold;

      bankWithdraw(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(400);
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should initialize bank deposits if currency does not exist before withdrawal', () => {
      const amount = 50;
      const currency = Currency.Silver;

      bankWithdraw(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(0); // 0 - 50 = -50, but Math.max ensures it's 0
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should use Gold as default currency when not specified', () => {
      const amount = 75;

      bankWithdraw(mockPlayer, amount);

      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(425);
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        Currency.Gold,
      );
    });

    it('should handle zero amount withdrawal', () => {
      const initialAmount = mockPlayer.bank.deposits[Currency.Gold]!;
      const amount = 0;

      bankWithdraw(mockPlayer, amount, Currency.Gold);

      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(initialAmount);
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        Currency.Gold,
      );
    });

    it('should ensure bank balance never goes below 0 when withdrawing more than available', () => {
      const amount = 1000; // More than current bank balance (500)
      const currency = Currency.Gold;

      bankWithdraw(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(0);
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should handle negative amount withdrawal (which effectively becomes a deposit)', () => {
      const amount = -100;
      const currency = Currency.Gold;

      bankWithdraw(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(600); // 500 - (-100) = 600
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should work with different currency types', () => {
      mockPlayer.bank.deposits[Currency.Fate] = 150;
      const amount = 25;
      const currency = Currency.Fate;

      bankWithdraw(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(125);
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should work with seasonal currencies', () => {
      mockPlayer.bank.deposits[Currency.Halloween] = 50;
      const amount = 10;
      const currency = Currency.Halloween;

      bankWithdraw(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(40);
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should handle decimal amounts', () => {
      const amount = 123.45;
      const currency = Currency.Gold;

      bankWithdraw(mockPlayer, amount, currency);

      expect(mockPlayer.bank.deposits[currency]).toBe(376.55);
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        amount,
        currency,
      );
    });

    it('should handle undefined bank deposits property by initializing it', () => {
      const player = {
        currency: { [Currency.Gold]: 1000 },
        bank: { deposits: {} },
      } as IPlayer;

      const amount = 200;
      const currency = Currency.Silver;

      bankWithdraw(player, amount, currency);

      expect(player.bank.deposits[currency]).toBe(0); // Initialized to 0, then 0 - 200 = -200, but Math.max ensures it's 0
      expect(mockGainCurrency).toHaveBeenCalledWith(player, amount, currency);
    });
  });

  describe('Integration Tests', () => {
    it('should handle deposit followed by withdrawal correctly', () => {
      const initialBankBalance = mockPlayer.bank.deposits[Currency.Gold]!;
      const depositAmount = 200;
      const withdrawAmount = 150;

      // Deposit first
      bankDeposit(mockPlayer, depositAmount, Currency.Gold);
      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(
        initialBankBalance + depositAmount,
      );

      // Then withdraw
      bankWithdraw(mockPlayer, withdrawAmount, Currency.Gold);
      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(
        initialBankBalance + depositAmount - withdrawAmount,
      );

      // Verify currency functions were called correctly
      expect(mockLoseCurrency).toHaveBeenCalledWith(
        mockPlayer,
        depositAmount,
        Currency.Gold,
      );
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        withdrawAmount,
        Currency.Gold,
      );
    });

    it('should handle multiple currencies simultaneously', () => {
      const goldDeposit = 100;
      const silverDeposit = 50;
      const fateWithdraw = 25;

      // Set up initial balances
      mockPlayer.bank.deposits[Currency.Silver] = 200;
      mockPlayer.bank.deposits[Currency.Fate] = 100;

      // Perform operations
      bankDeposit(mockPlayer, goldDeposit, Currency.Gold);
      bankDeposit(mockPlayer, silverDeposit, Currency.Silver);
      bankWithdraw(mockPlayer, fateWithdraw, Currency.Fate);

      // Check final balances
      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(600); // 500 + 100
      expect(mockPlayer.bank.deposits[Currency.Silver]).toBe(250); // 200 + 50
      expect(mockPlayer.bank.deposits[Currency.Fate]).toBe(75); // 100 - 25

      // Verify all currency function calls
      expect(mockLoseCurrency).toHaveBeenCalledTimes(2);
      expect(mockGainCurrency).toHaveBeenCalledTimes(1);
    });

    it('should properly handle edge case of exact balance withdrawal', () => {
      const exactBalance = mockPlayer.bank.deposits[Currency.Gold]!;

      bankWithdraw(mockPlayer, exactBalance, Currency.Gold);

      expect(mockPlayer.bank.deposits[Currency.Gold]).toBe(0);
      expect(mockGainCurrency).toHaveBeenCalledWith(
        mockPlayer,
        exactBalance,
        Currency.Gold,
      );
    });
  });
});
