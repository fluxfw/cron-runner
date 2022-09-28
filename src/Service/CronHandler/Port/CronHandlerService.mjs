import { CronHandler } from "../../../Adapter/CronHandler/CronHandler.mjs";
import { GetCronHandlerCommand } from "../Command/GetCronHandlerCommand.mjs";
import { ShutdownHandler } from "../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs";

/** @typedef {import("../../../Adapter/CronHandler/Cron.mjs").Cron} Cron */

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
     * @returns {CronHandler}
     */
    getCronHandler(cron) {
        return GetCronHandlerCommand.new(
            this.#shutdown_handler
        )
            .getCronHandler(
                cron
            );
    }
}
