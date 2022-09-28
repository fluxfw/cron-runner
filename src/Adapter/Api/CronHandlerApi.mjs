import { CronHandler } from "../CronHandler/CronHandler.mjs";
import { CronHandlerService } from "../../Service/CronHandler/Port/CronHandlerService.mjs";
import { ShutdownHandler } from "../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs";

/** @typedef {import("../CronHandler/Cron.mjs").Cron} Cron */

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
        this.#cron_handler_service ??= this.#getCronHandlerService();
    }

    /**
     * @param {Cron} cron
     * @returns {CronHandler}
     */
    getCronHandler(cron) {
        return this.#cron_handler_service.getCronHandler(
            cron
        );
    }

    /**
     * @returns {CronHandlerService}
     */
    #getCronHandlerService() {
        return CronHandlerService.new(
            this.#shutdown_handler
        );
    }
}
