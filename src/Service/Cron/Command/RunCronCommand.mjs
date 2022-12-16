import { existsSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";

/** @typedef {import("../../../Adapter/Cron/Cron.mjs").Cron} Cron */
/** @typedef {import("../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */
/** @typedef {import("../../../Adapter/Cron/task.mjs").task} _task */

export class RunCronCommand {
    /**
     * @type {boolean}
     */
    #lock_created;
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {RunCronCommand}
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
        this.#lock_created = false;
    }

    /**
     * @param {_task} task
     * @param {Cron} cron
     * @returns {Promise<void>}
     */
    async runCron(task, cron) {
        this.#shutdown_handler.addShutdownTask(async () => {
            await this.#unlock(
                cron
            );
        });

        let exit_error = false;

        if (await this.#lock(
            cron
        )) {
            try {
                await task();
            } catch (error) {
                console.error(error);
                exit_error = true;
            }
        } else {
            exit_error = true;
        }

        await this.#shutdown_handler.shutdown(
            exit_error ? 1 : null
        );
    }

    /**
     * @param {Cron} cron
     * @returns {boolean}
     */
    #isLocked(cron) {
        return existsSync(cron.lock_file);
    }

    /**
     * @param {Cron} cron
     * @returns {Promise<boolean>}
     */
    async #lock(cron) {
        const locked = this.#isLocked(
            cron
        );

        if (locked) {
            console.info(`Skip cron because it's already running - If this should be an error, try to delete ${cron.lock_file}`);
        } else {
            await writeFile(cron.lock_file, Buffer.alloc(0));
            this.#lock_created = true;
        }

        return !locked;
    }

    /**
     * @param {Cron} cron
     * @returns {Promise<void>}
     */
    async #unlock(cron) {
        if (this.#lock_created && this.#isLocked(
            cron
        )) {
            await unlink(cron.lock_file);
            this.#lock_created = false;
        }
    }
}
