/** @typedef {import("../../../Adapter/CronHandler/Cron.mjs").Cron} Cron */
/** @typedef {import("../../../Adapter/CronHandler/CronHandler.mjs").CronHandler} CronHandler */
/** @typedef {import("../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class CronHandlerService {
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {CronHandlerService}
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
     * @param {Cron} cron
     * @returns {Promise<CronHandler>}
     */
    async getCronHandler(cron) {
        return (await import("../Command/GetCronHandlerCommand.mjs")).GetCronHandlerCommand.new(
            this.#shutdown_handler
        )
            .getCronHandler(
                cron
            );
    }
}
