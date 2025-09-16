import { type UUID, logger, type Agent, type Entity, type Memory } from '@elizaos/core';
import { drizzle } from 'drizzle-orm/pglite';
import { BaseDrizzleAdapter } from '../base';
import { DIMENSION_MAP, type EmbeddingDimensionColumn } from '../schema/embedding';
import type { PGliteClientManager } from './manager';

/**
 * PgliteDatabaseAdapter class represents an adapter for interacting with a PgliteDatabase.
 * Extends BaseDrizzleAdapter.
 *
 * @constructor
 * @param {UUID} agentId - The ID of the agent.
 * @param {PGliteClientManager} manager - The manager for the Pglite client.
 *
 * @method withDatabase
 * @param {() => Promise<T>} operation - The operation to perform on the database.
 * @return {Promise<T>} - The result of the operation.
 *
 * @method init
 * @return {Promise<void>} - A Promise that resolves when the initialization is complete.
 *
 * @method close
 * @return {void} - A Promise that resolves when the database is closed.
 */
export class PgliteDatabaseAdapter extends BaseDrizzleAdapter {
  private manager: PGliteClientManager;
  protected embeddingDimension: EmbeddingDimensionColumn = DIMENSION_MAP[384];

  /**
   * Constructor for creating an instance of a class.
   * @param {UUID} agentId - The unique identifier for the agent.
   * @param {PGliteClientManager} manager - The manager for the Pglite client.
   */
  constructor(agentId: UUID, manager: PGliteClientManager) {
    super(agentId);
    this.manager = manager;
    this.db = drizzle(this.manager.getConnection() as any);
  }

  // Methods required by TypeScript but not in base class
  async getEntityByIds(entityIds: UUID[]): Promise<Entity[] | null> {
    // Delegate to the correct method name
    return this.getEntitiesByIds(entityIds);
  }

  async getMemoriesByServerId(_params: { serverId: UUID; count?: number }): Promise<Memory[]> {
    // This method doesn't seem to exist in the base implementation
    // Provide a basic implementation that returns empty array
    logger.warn('getMemoriesByServerId called but not implemented - returning empty array');
    return [];
  }

  async ensureAgentExists(agent: Partial<Agent>): Promise<Agent> {
    // Check if agent exists, create if not
    const existingAgent = await this.getAgent(this.agentId);
    if (existingAgent) {
      return existingAgent;
    }

    // Create the agent with required fields
    const newAgent: Agent = {
      id: this.agentId,
      name: agent.name || 'Unknown Agent',
      username: agent.username,
      bio: agent.bio || 'An AI agent',
      createdAt: agent.createdAt || Date.now(),
      updatedAt: agent.updatedAt || Date.now(),
    };

    await this.createAgent(newAgent);
    const createdAgent = await this.getAgent(this.agentId);
    if (!createdAgent) {
      throw new Error('Failed to create agent');
    }
    return createdAgent;
  }

  /**
   * Runs database migrations. For PGLite, migrations are handled by the
   * migration service, not the adapter itself.
   * @returns {Promise<void>}
   */
  async runMigrations(): Promise<void> {
    logger.debug('PgliteDatabaseAdapter: Migrations are handled by the migration service');
    // Migrations are handled by the migration service, not the adapter
  }

  /**
   * Asynchronously runs the provided database operation while checking if the database is currently shutting down.
   * If the database is shutting down, a warning is logged and null is returned.
   *
   * @param {Function} operation - The database operation to be performed.
   * @returns {Promise<T>} A promise that resolves with the result of the database operation.
   */
  protected async withDatabase<T>(operation: () => Promise<T>): Promise<T> {
    if (this.manager.isShuttingDown()) {
      logger.warn('Database is shutting down');
      return null as unknown as T;
    }
    return operation();
  }

  /**
   * Asynchronously initializes the database by running migrations.
   *
   * @returns {Promise<void>} A Promise that resolves when the database initialization is complete.
   */
  async init(): Promise<void> {
    logger.debug('PGliteDatabaseAdapter initialized, skipping automatic migrations.');
  }

  /**
   * Checks if the database connection is ready and active.
   * For PGLite, this checks if the client is not in a shutting down state.
   * @returns {Promise<boolean>} A Promise that resolves to true if the connection is healthy.
   */
  async isReady(): Promise<boolean> {
    return !this.manager.isShuttingDown();
  }

  /**
   * Asynchronously closes the database.
   */
  async close() {
    await this.manager.close();
  }

  /**
   * Asynchronously retrieves the connection from the client.
   *
   * @returns {Promise<PGlite>} A Promise that resolves with the connection.
   */
  async getConnection() {
    return this.manager.getConnection();
  }
}
