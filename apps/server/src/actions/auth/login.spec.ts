import {
  GameAction,
  GameServerEvent,
  GameServerResponse,
} from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginAction } from './login';

// Mock the meta.json import
vi.mock('../../../content/_output/meta.json', () => ({
  default: { hash: 'test-hash-123' },
  hash: 'test-hash-123',
}));

// Create mock game object with all required methods
const createMockGame = () => ({
  accountDB: {
    getAccountForLoggingIn: vi.fn(),
    checkPassword: vi.fn(),
    getAccount: vi.fn(),
    registerIP: vi.fn(),
    simpleAccount: vi.fn(),
    changePassword: vi.fn(),
  },
  lobbyManager: {
    hasJoinedGame: vi.fn(),
    leaveGame: vi.fn(),
    joinLobby: vi.fn(),
    simpleOnlineAccounts: [],
  },
  subscriptionHelper: {
    checkAccountForExpiration: vi.fn(),
  },
  logger: {
    error: vi.fn(),
    log: vi.fn(),
  },
  worldDB: {
    motd: 'Welcome to the game!',
  },
  holidayHelper: {
    currentHoliday: vi.fn(),
  },
  contentManager: {
    charSelectData: { races: [], classes: [] },
  },
  dynamicEventHelper: {
    getEventsForPlayer: vi.fn(),
  },
  db: {
    prepareForTransmission: vi.fn(),
  },
});

// Create mock callbacks
const createMockCallbacks = () => ({
  broadcast: vi.fn(),
  emit: vi.fn(),
  register: vi.fn(),
});

// Create mock account data
const createMockAccount = (overrides: any = {}) => ({
  username: 'testuser',
  password: 'hashedpassword',
  isBanned: false,
  players: [
    { charSlot: 0, name: 'Player1' },
    { charSlot: 1, name: 'Player2' },
  ],
  temporaryPassword: null as string | null,
  ...overrides,
});

describe('LoginAction', () => {
  let loginAction: LoginAction;
  let mockGame: ReturnType<typeof createMockGame>;
  let mockCallbacks: ReturnType<typeof createMockCallbacks>;

  beforeEach(() => {
    loginAction = new LoginAction();
    mockGame = createMockGame();
    mockCallbacks = createMockCallbacks();
    vi.clearAllMocks();
  });

  describe('class properties', () => {
    it('should have correct type', () => {
      expect(loginAction.type).toBe(GameServerEvent.Login);
    });

    it('should have correct required keys', () => {
      expect(loginAction.requiredKeys).toEqual(['username', 'password']);
    });

    it('should not require logged in state', () => {
      expect(loginAction.requiresLoggedIn).toBe(false);
    });
  });

  describe('validation', () => {
    it('should return error when username is missing', async () => {
      const data = { password: 'test123' };
      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        wasSuccess: false,
        message: 'No username specified.',
      });
    });

    it('should return error when password is missing', async () => {
      const data = { username: 'testuser' };
      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        wasSuccess: false,
        message: 'No password specified.',
      });
    });

    it('should return error when both username and password are missing', async () => {
      const data = {};
      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        wasSuccess: false,
        message: 'No username specified.',
      });
    });
  });

  describe('account retrieval errors', () => {
    it('should handle database error when getting account for logging in', async () => {
      const data = { username: 'testuser', password: 'test123' };
      mockGame.accountDB.getAccountForLoggingIn.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        message:
          'Could not get account; try again or contact a GM if this persists.',
      });
    });

    it('should return error when account does not exist', async () => {
      const data = { username: 'nonexistent', password: 'test123' };
      mockGame.accountDB.getAccountForLoggingIn.mockResolvedValue(null);

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        wasSuccess: false,
        message: 'Username not registered.',
      });
    });
  });

  describe('authentication', () => {
    it('should return error when password is incorrect', async () => {
      const data = { username: 'testuser', password: 'wrongpassword' };
      const mockAccount = createMockAccount();

      mockGame.accountDB.getAccountForLoggingIn.mockResolvedValue(mockAccount);
      mockGame.accountDB.checkPassword.mockReturnValue(false);

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        wasSuccess: false,
        message: 'Incorrect password.',
      });
      expect(mockGame.accountDB.checkPassword).toHaveBeenCalledWith(
        data,
        mockAccount,
      );
    });

    it('should return error when account is banned', async () => {
      const data = { username: 'banneduser', password: 'test123' };
      const mockAccount = createMockAccount({ isBanned: true });

      mockGame.accountDB.getAccountForLoggingIn.mockResolvedValue(mockAccount);
      mockGame.accountDB.checkPassword.mockReturnValue(true);

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        wasSuccess: false,
        message: 'You are banned.',
      });
    });
  });

  describe('successful login', () => {
    const setupSuccessfulLogin = () => {
      const data = {
        username: 'testuser',
        password: 'test123',
        socketIp: '127.0.0.1',
      };
      const mockAccount = createMockAccount();
      const mockRealAccount = createMockAccount();
      const mockSimpleAccount = { username: 'testuser', isGM: false };

      mockGame.accountDB.getAccountForLoggingIn.mockResolvedValue(mockAccount);
      mockGame.accountDB.checkPassword.mockReturnValue(true);
      mockGame.accountDB.getAccount.mockResolvedValue(mockRealAccount);
      mockGame.accountDB.simpleAccount.mockReturnValue(mockSimpleAccount);
      mockGame.lobbyManager.hasJoinedGame.mockReturnValue(false);
      mockGame.holidayHelper.currentHoliday.mockReturnValue('Halloween');
      mockGame.dynamicEventHelper.getEventsForPlayer.mockReturnValue([]);
      mockGame.db.prepareForTransmission.mockReturnValue(mockRealAccount);

      return { data, mockAccount, mockRealAccount, mockSimpleAccount };
    };

    it('should successfully log in user with valid credentials', async () => {
      const { data, mockRealAccount, mockSimpleAccount } =
        setupSuccessfulLogin();

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({});
      expect(mockGame.accountDB.registerIP).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
      );
      expect(mockCallbacks.register).toHaveBeenCalledWith('testuser');
      expect(
        mockGame.subscriptionHelper.checkAccountForExpiration,
      ).toHaveBeenCalledWith(mockRealAccount);
      expect(mockGame.lobbyManager.joinLobby).toHaveBeenCalledWith(
        mockRealAccount,
      );
    });

    it('should broadcast user addition to chat', async () => {
      const { data, mockSimpleAccount } = setupSuccessfulLogin();

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockCallbacks.broadcast).toHaveBeenCalledWith({
        action: GameAction.ChatAddUser,
        user: mockSimpleAccount,
      });
    });

    it('should emit login response with account data', async () => {
      const { data, mockRealAccount } = setupSuccessfulLogin();

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockCallbacks.emit).toHaveBeenCalledWith({
        type: GameServerResponse.Login,
        account: {
          ...mockRealAccount,
          players: [mockRealAccount.players[0], mockRealAccount.players[1]],
        },
        motd: 'Welcome to the game!',
        onlineUsers: [],
        currentHoliday: 'Halloween',
      });
    });

    it('should emit character creation information', async () => {
      const { data } = setupSuccessfulLogin();

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockCallbacks.emit).toHaveBeenCalledWith({
        action: GameAction.SetCharacterCreateInformation,
        charCreateInfo: { races: [], classes: [] },
      });
    });

    it('should emit asset hash', async () => {
      const { data } = setupSuccessfulLogin();

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockCallbacks.emit).toHaveBeenCalledWith({
        action: GameAction.SettingsSetAssetHash,
        assetHash: 'test-hash-123',
      });
    });

    it('should emit events list', async () => {
      const { data } = setupSuccessfulLogin();

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockCallbacks.emit).toHaveBeenCalledWith({
        action: GameAction.EventSetList,
        events: [],
      });
    });

    it('should leave existing game if user already joined', async () => {
      const { data } = setupSuccessfulLogin();
      mockGame.lobbyManager.hasJoinedGame.mockReturnValue(true);

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockGame.lobbyManager.leaveGame).toHaveBeenCalledWith('testuser');
    });

    it('should not leave game if user has not joined', async () => {
      const { data } = setupSuccessfulLogin();
      mockGame.lobbyManager.hasJoinedGame.mockReturnValue(false);

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockGame.lobbyManager.leaveGame).not.toHaveBeenCalled();
    });

    it('should handle temporary password', async () => {
      const { data, mockAccount, mockRealAccount } = setupSuccessfulLogin();
      mockAccount.temporaryPassword = 'temp123';

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockGame.accountDB.changePassword).toHaveBeenCalledWith(
        mockRealAccount,
        'temp123',
      );
    });

    it('should not change password if no temporary password', async () => {
      const { data } = setupSuccessfulLogin();

      await loginAction.act(mockGame as any, mockCallbacks, data);

      expect(mockGame.accountDB.changePassword).not.toHaveBeenCalled();
    });

    it('should sort players by charSlot correctly', async () => {
      const { data } = setupSuccessfulLogin();
      const mockRealAccountWithUnsortedPlayers = createMockAccount({
        players: [
          { charSlot: 2, name: 'Player3' },
          { charSlot: 0, name: 'Player1' },
          { charSlot: 1, name: 'Player2' },
        ],
      });

      mockGame.accountDB.getAccount.mockResolvedValue(
        mockRealAccountWithUnsortedPlayers,
      );
      mockGame.db.prepareForTransmission.mockReturnValue(
        mockRealAccountWithUnsortedPlayers,
      );

      await loginAction.act(mockGame as any, mockCallbacks, data);

      const loginEmitCall = mockCallbacks.emit.mock.calls.find(
        (call) => call[0].type === GameServerResponse.Login,
      );

      expect(loginEmitCall).toBeDefined();
      expect(loginEmitCall![0].account.players).toEqual([
        { charSlot: 0, name: 'Player1' },
        { charSlot: 1, name: 'Player2' },
        { charSlot: 2, name: 'Player3' },
      ]);
    });
  });

  describe('error handling', () => {
    it('should handle error when getting real account', async () => {
      const data = { username: 'testuser', password: 'test123' };
      const mockAccount = createMockAccount();

      mockGame.accountDB.getAccountForLoggingIn.mockResolvedValue(mockAccount);
      mockGame.accountDB.checkPassword.mockReturnValue(true);
      mockGame.accountDB.getAccount.mockResolvedValue(null);

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        message: 'Could not get real account from login.',
      });
    });

    it('should handle general errors during login process', async () => {
      const data = { username: 'testuser', password: 'test123' };
      const mockAccount = createMockAccount();

      mockGame.accountDB.getAccountForLoggingIn.mockResolvedValue(mockAccount);
      mockGame.accountDB.checkPassword.mockReturnValue(true);
      mockGame.accountDB.getAccount.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        loginAction.act(mockGame as any, mockCallbacks, data),
      ).rejects.toThrow('Could not login username?');
    });
  });

  describe('edge cases', () => {
    const setupSuccessfulLogin = () => {
      const data = {
        username: 'testuser',
        password: 'test123',
        socketIp: '127.0.0.1',
      };
      const mockAccount = createMockAccount();
      const mockRealAccount = createMockAccount();
      const mockSimpleAccount = { username: 'testuser', isGM: false };

      mockGame.accountDB.getAccountForLoggingIn.mockResolvedValue(mockAccount);
      mockGame.accountDB.checkPassword.mockReturnValue(true);
      mockGame.accountDB.getAccount.mockResolvedValue(mockRealAccount);
      mockGame.accountDB.simpleAccount.mockReturnValue(mockSimpleAccount);
      mockGame.lobbyManager.hasJoinedGame.mockReturnValue(false);
      mockGame.holidayHelper.currentHoliday.mockReturnValue('Halloween');
      mockGame.dynamicEventHelper.getEventsForPlayer.mockReturnValue([]);
      mockGame.db.prepareForTransmission.mockReturnValue(mockRealAccount);

      return { data, mockAccount, mockRealAccount, mockSimpleAccount };
    };

    it('should handle empty username string', async () => {
      const data = { username: '', password: 'test123' };

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        wasSuccess: false,
        message: 'No username specified.',
      });
    });

    it('should handle empty password string', async () => {
      const data = { username: 'testuser', password: '' };

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({
        wasSuccess: false,
        message: 'No password specified.',
      });
    });

    it('should handle account with no players', async () => {
      const { data } = setupSuccessfulLogin();
      const mockRealAccountNoPlayers = createMockAccount({ players: [] });

      mockGame.accountDB.getAccount.mockResolvedValue(mockRealAccountNoPlayers);
      mockGame.db.prepareForTransmission.mockReturnValue(
        mockRealAccountNoPlayers,
      );

      await loginAction.act(mockGame as any, mockCallbacks, data);

      const loginEmitCall = mockCallbacks.emit.mock.calls.find(
        (call) => call[0].type === GameServerResponse.Login,
      );

      expect(loginEmitCall).toBeDefined();
      expect(loginEmitCall![0].account.players).toEqual([]);
    });

    it('should handle missing socketIp', async () => {
      const { mockAccount, mockRealAccount, mockSimpleAccount } =
        setupSuccessfulLogin();
      const data = { username: 'testuser', password: 'test123' }; // No socketIp

      const result = await loginAction.act(
        mockGame as any,
        mockCallbacks,
        data,
      );

      expect(result).toEqual({});
      expect(mockGame.accountDB.registerIP).toHaveBeenCalledWith(
        'testuser',
        undefined,
      );
    });
  });
});
