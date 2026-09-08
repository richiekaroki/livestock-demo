'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their default values.
 *
 * For more information, see:
 * - https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration
 */

exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['Wam Mfugo API'],
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  /**
   * This attribute controls whether the agent communicates with New Relic.
   * Set to false to disable the agent.
   */
  agent_enabled: process.env.NEW_RELIC_ENABLED === 'true' || false,
  /**
   * Logging configuration.
   */
  logging: {
    /**
     * Level at which to log. 'trace' is most verbose, 'fatal' is least.
     */
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    /**
     * The filepath at which to log. The default is to log to stdout only.
     */
    filepath: process.env.NEW_RELIC_LOG_FILE || 'stdout',
  },
  /**
   * When true, all request headers are attached to events and errors.
   */
  allow_all_headers: true,
  /**
   * Attributes to include in transaction events.
   */
  attributes: {
    /**
     * Prefix of attributes to exclude from all destination. Excluded
     * attributes will not appear in any trace or transaction event.
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },
  /**
   * Application monitoring configuration.
   */
  application_logging: {
    /**
     * Enables the application logging feature.
     */
    enabled: true,
    /**
     * Enables forwarding of application log data to New Relic.
     */
    forwarding: {
      /**
       * Enables log forwarding.
       */
      enabled: true,
    },
  },
  /**
   * Distributed tracing configuration.
   */
  distributed_tracing: {
    /**
     * Enables distributed tracing.
     */
    enabled: true,
  },
  /**
   * Infinite tracing configuration.
   */
  infinite_tracing: {
    /**
     * Enables infinite tracing.
     */
    trace_observer: {
      host: process.env.NEW_RELIC_TRACE_OBSERVER_HOST,
      port: process.env.NEW_RELIC_TRACE_OBSERVER_PORT || 443,
    },
  },
  /**
   * Error collector configuration.
   */
  error_collector: {
    /**
     * Enables error collection.
     */
    enabled: true,
    /**
     * When true, the agent collects stack traces for errors.
     */
    capture_events: true,
    /**
     * When true, the agent collects error events.
     */
    collect_error_traces: true,
  },
  /**
   * Transaction events configuration.
   */
  transaction_events: {
    /**
     * Enables transaction events.
     */
    enabled: true,
  },
  /**
   * Browser monitoring configuration.
   */
  browser_monitoring: {
    /**
     * Enables browser monitoring.
     */
    enable: false,
  },
};