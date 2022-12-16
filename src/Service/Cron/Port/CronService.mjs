/** @typedef {import("../../../Adapter/Cron/Cron.mjs").Cron} Cron */
/** @typedef {import("../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */
/** @typedef {import("../../../Adapter/Cron/task.mjs").task} _task */

export class CronService {
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {CronService}
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
        await (await import("../Command/RunCronCommand.mjs")).RunCronCommand.new(
            this.#shutdown_handler
        )
            .runCron(
                task,
                cron
            );
    }
}
