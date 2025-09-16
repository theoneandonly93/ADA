import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import {
  detectEnvironment,
  getEnvironment,
  getEnv,
  setEnv,
  hasEnv,
  getBooleanEnv,
  getNumberEnv,
  initBrowserEnvironment,
} from '../utils/environment';

describe('Environment Abstraction', () => {
  let originalProcess: any;
  let originalWindow: any;
  let originalGlobalThis: any;

  beforeEach(() => {
    // Store original values
    originalProcess = (global as any).process;
    originalWindow = (global as any).window;
    originalGlobalThis = (global as any).globalThis;

    // Clear environment cache
    getEnvironment().clearCache();
  });

  afterEach(() => {
    // Restore original values
    if (originalProcess !== undefined) {
      (global as any).process = originalProcess;
    } else {
      delete (global as any).process;
    }

    if (originalWindow !== undefined) {
      (global as any).window = originalWindow;
    } else {
      delete (global as any).window;
    }

    if (originalGlobalThis !== undefined) {
      (global as any).globalThis = originalGlobalThis;
    } else {
      delete (global as any).globalThis;
    }

    // Clear cache after each test
    getEnvironment().clearCache();
  });

  describe('detectEnvironment', () => {
    it('should detect Node.js environment', () => {
      // Current test environment is Node.js
      const env = detectEnvironment();
      expect(env).toBe('node');
    });

    it('should detect browser environment when window is present', () => {
      // Save original values
      const originalProcess = (global as any).process;
      const originalWindow = (global as any).window;

      // Mock browser environment
      delete (global as any).process;
      (global as any).window = {
        document: {},
      };
      (global as any).globalThis = global;

      // Test detection directly
      const detectedEnv = detectEnvironment();
      expect(detectedEnv).toBe('browser');

      // Restore original values
      (global as any).process = originalProcess;
      (global as any).window = originalWindow;
    });
  });

  describe('getEnv', () => {
    it('should get environment variable in Node.js', () => {
      process.env.TEST_VAR = 'test_value';
      const value = getEnv('TEST_VAR');
      expect(value).toBe('test_value');
      delete process.env.TEST_VAR;
    });

    it('should return default value when variable is not set', () => {
      const value = getEnv('NON_EXISTENT_VAR', 'default');
      expect(value).toBe('default');
    });

    it('should cache environment variable values', () => {
      process.env.CACHE_TEST = 'initial';
      const value1 = getEnv('CACHE_TEST');
      expect(value1).toBe('initial');

      // Change the actual env var
      process.env.CACHE_TEST = 'changed';

      // Should still get cached value
      const value2 = getEnv('CACHE_TEST');
      expect(value2).toBe('initial');

      // Clear cache and get new value
      getEnvironment().clearCache();
      const value3 = getEnv('CACHE_TEST');
      expect(value3).toBe('changed');

      delete process.env.CACHE_TEST;
    });
  });

  describe('setEnv', () => {
    it('should set environment variable', () => {
      setEnv('SET_TEST_VAR', 'test_value');
      const value = getEnv('SET_TEST_VAR');
      expect(value).toBe('test_value');
      delete process.env.SET_TEST_VAR;
    });

    it('should convert non-string values to strings', () => {
      setEnv('NUMBER_VAR', 123);
      const value = getEnv('NUMBER_VAR');
      expect(value).toBe('123');
      delete process.env.NUMBER_VAR;

      setEnv('BOOL_VAR', true);
      const value2 = getEnv('BOOL_VAR');
      expect(value2).toBe('true');
      delete process.env.BOOL_VAR;
    });
  });

  describe('hasEnv', () => {
    it('should return true for existing variables', () => {
      process.env.EXISTS = 'yes';
      expect(hasEnv('EXISTS')).toBe(true);
      delete process.env.EXISTS;
    });

    it('should return false for non-existing variables', () => {
      expect(hasEnv('DOES_NOT_EXIST')).toBe(false);
    });
  });

  describe('getBooleanEnv', () => {
    it('should parse true values correctly', () => {
      const trueValues = ['true', '1', 'yes', 'on'];

      trueValues.forEach((value) => {
        process.env.BOOL_TEST = value;
        expect(getBooleanEnv('BOOL_TEST')).toBe(true);
      });

      delete process.env.BOOL_TEST;
    });

    it('should parse false values correctly', () => {
      const falseValues = ['false', '0', 'no', 'off', 'anything', ''];

      falseValues.forEach((value) => {
        process.env.BOOL_TEST = value;
        expect(getBooleanEnv('BOOL_TEST')).toBe(false);
      });

      delete process.env.BOOL_TEST;
    });

    it('should return default value when not set', () => {
      expect(getBooleanEnv('NOT_SET', true)).toBe(true);
      expect(getBooleanEnv('NOT_SET', false)).toBe(false);
    });
  });

  describe('getNumberEnv', () => {
    it('should parse valid numbers', () => {
      process.env.NUM_TEST = '42';
      getEnvironment().clearCache(); // Clear cache after setting env var
      expect(getNumberEnv('NUM_TEST')).toBe(42);

      process.env.NUM_TEST = '3.14';
      getEnvironment().clearCache(); // Clear cache after setting env var
      expect(getNumberEnv('NUM_TEST')).toBe(3.14);

      process.env.NUM_TEST = '-100';
      getEnvironment().clearCache(); // Clear cache after setting env var
      expect(getNumberEnv('NUM_TEST')).toBe(-100);

      delete process.env.NUM_TEST;
    });

    it('should return undefined for invalid numbers', () => {
      process.env.NUM_TEST = 'not a number';
      expect(getNumberEnv('NUM_TEST')).toBeUndefined();
      delete process.env.NUM_TEST;
    });

    it('should return default value when not set or invalid', () => {
      expect(getNumberEnv('NOT_SET', 100)).toBe(100);

      process.env.INVALID_NUM = 'abc';
      expect(getNumberEnv('INVALID_NUM', 200)).toBe(200);
      delete process.env.INVALID_NUM;
    });
  });

  describe('Browser Environment', () => {
    it.skip('should initialize browser environment with config', () => {
      // Mock browser environment
      delete (global as any).process;
      (global as any).window = { document: {} };

      const { Environment, initBrowserEnvironment: init } = require('../environment');
      const env = new Environment();

      // Initialize with config
      init({
        API_KEY: 'test-key',
        DEBUG: true,
        MAX_RETRIES: 3,
      });

      // Check values were set
      expect(env.get('API_KEY')).toBe('test-key');
      expect(env.get('DEBUG')).toBe('true');
      expect(env.get('MAX_RETRIES')).toBe('3');
    });

    it.skip('should read from window.ENV in browser', () => {
      // Mock browser with window.ENV
      delete (global as any).process;
      (global as any).window = {
        document: {},
        ENV: {
          PRESET_VAR: 'preset_value',
        },
      };

      const { Environment } = require('../environment');
      const env = new Environment();

      expect(env.get('PRESET_VAR')).toBe('preset_value');
    });

    it.skip('should read from globalThis.__ENV__ in browser', () => {
      // Mock browser with globalThis.__ENV__
      delete (global as any).process;
      (global as any).window = { document: {} };
      (global as any).globalThis = {
        __ENV__: {
          GLOBAL_VAR: 'global_value',
        },
      };

      const { Environment } = require('../environment');
      const env = new Environment();

      expect(env.get('GLOBAL_VAR')).toBe('global_value');
    });
  });

  describe('getEnvironment singleton', () => {
    it('should return the same instance', () => {
      const env1 = getEnvironment();
      const env2 = getEnvironment();
      expect(env1).toBe(env2);
    });
  });

  describe('getAll', () => {
    it('should return all environment variables', () => {
      process.env.TEST1 = 'value1';
      process.env.TEST2 = 'value2';

      const allVars = getEnvironment().getAll();
      expect(allVars.TEST1).toBe('value1');
      expect(allVars.TEST2).toBe('value2');

      delete process.env.TEST1;
      delete process.env.TEST2;
    });
  });
});
