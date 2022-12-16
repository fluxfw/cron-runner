/** @typedef {import("../Cron/Cron.mjs").Cron} Cron */
/** @typedef {import("../../Service/Cron/Port/CronService.mjs").CronService} CronService */
/** @typedef {import("../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */
/** @typedef {import("../Cron/task.mjs").task} _task */

export class CronApi {
    /**
     * @type {CronService | null}
     */
    #cron_service = null;
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {CronApi}
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
     * @param {_task} task
     * @param {Cron} cron
     * @returns {Promise<void>}
     */
    async runCron(task, cron) {
        await (await this.#getCronService()).runCron(
            task,
            cron
        );
    }

    /**
     * @returns {Promise<CronService>}
     */
    async #getCronService() {
        this.#cron_service ??= (await import("../../Service/Cron/Port/CronService.mjs")).CronService.new(
            this.#shutdown_handler
        );

        return this.#cron_service;
    }
}
