import { CronHandler } from "../../../Adapter/CronHandler/CronHandler.mjs";
import { ShutdownHandler } from "../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs";

/** @typedef {import("../../../Adapter/CronHandler/Cron.mjs").Cron} Cron */

export class GetCronHandlerCommand {
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {GetCronHandlerCommand}
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
     * @returns {CronHandler}
     */
    getCronHandler(cron) {
        return CronHandler.new(
            this.#shutdown_handler,
            cron
        );
    }
}
