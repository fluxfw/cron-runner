import { existsSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";

/** @typedef {import("../../flux-shutdown-handler/src/FluxShutdownHandler.mjs").FluxShutdownHandler} FluxShutdownHandler */
/** @typedef {import("./task.mjs").task} _task */

export class FluxCronRunner {
    /**
     * @type {FluxShutdownHandler}
     */
    #flux_shutdown_handler;
    /**
     * @type {boolean}
     */
    #lock_created;

    /**
     * @param {FluxShutdownHandler} flux_shutdown_handler
     * @returns {FluxCronRunner}
     */
    static new(flux_shutdown_handler) {
        return new this(
            flux_shutdown_handler
        );
    }

    /**
     * @param {FluxShutdownHandler} flux_shutdown_handler
     * @private
     */
    constructor(flux_shutdown_handler) {
        this.#flux_shutdown_handler = flux_shutdown_handler;
        this.#lock_created = false;
    }

    /**
     * @param {_task} task
     * @param {string} lock_file
     * @returns {Promise<void>}
     */
    async runCron(task, lock_file) {
        await this.#flux_shutdown_handler.addTask(async () => {
            await this.#unlock(
                lock_file
            );
        });

        let exit_error = false;

        if (await this.#lock(
            lock_file
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

        await this.#flux_shutdown_handler.shutdown(
            exit_error ? 1 : null
        );
    }

    /**
     * @param {string} lock_file
     * @returns {boolean}
     */
    #isLocked(lock_file) {
        return existsSync(lock_file);
    }

    /**
     * @param {string} lock_file
     * @returns {Promise<boolean>}
     */
    async #lock(lock_file) {
        const locked = this.#isLocked(
            lock_file
        );

        if (locked) {
            console.info(`Skip cron because it's already running - If this should be an error, try to delete ${lock_file}`);
        } else {
            await writeFile(lock_file, Buffer.alloc(0));
            this.#lock_created = true;
        }

        return !locked;
    }

    /**
     * @param {string} lock_file
     * @returns {Promise<void>}
     */
    async #unlock(lock_file) {
        if (this.#lock_created && this.#isLocked(
            lock_file
        )) {
            await unlink(lock_file);
            this.#lock_created = false;
        }
    }
}
