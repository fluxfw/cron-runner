/** @typedef {import("../CronHandler/Cron.mjs").Cron} Cron */
/** @typedef {import("../CronHandler/CronHandler.mjs").CronHandler} CronHandler */
/** @typedef {import("../../Service/CronHandler/Port/CronHandlerService.mjs").CronHandlerService} CronHandlerService */
/** @typedef {import("../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class CronHandlerApi {
    /**
     * @type {CronHandlerService | null}
     */
    #cron_handler_service = null;
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {CronHandlerApi}
     */
    static new(shutdown_handler) {
        return new this(
            shutdown_handler
        );
    }

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @private
     */
    constructor(shutdown_handler) {
        this.#shutdown_handler = shutdown_handler;
    }

    /**
     * @returns {Promise<void>}
     */
    async init() {

    }

    /**
     * @param {Cron} cron
     * @returns {Promise<CronHandler>}
     */
    async getCronHandler(cron) {
        return (await this.#getCronHandlerService()).getCronHandler(
            cron
        );
    }

    /**
     * @returns {Promise<CronHandlerService>}
     */
    async #getCronHandlerService() {
        this.#cron_handler_service ??= (await import("../../Service/CronHandler/Port/CronHandlerService.mjs")).CronHandlerService.new(
            this.#shutdown_handler
        );

        return this.#cron_handler_service;
    }
}
