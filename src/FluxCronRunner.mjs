import { existsSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";

/** @typedef {import("./ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */
/** @typedef {import("./task.mjs").task} _task */

export class FluxCronRunner {
    /**
     * @type {boolean}
     */
    #lock_created;
    /**
     * @type {ShutdownHandler | null}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @returns {FluxCronRunner}
     */
    static new(shutdown_handler = null) {
        return new this(
            shutdown_handler
        );
    }

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @private
     */
    constructor(shutdown_handler) {
        this.#shutdown_handler = shutdown_handler;
        this.#lock_created = false;
    }

    /**
     * @param {_task} task
     * @param {string} lock_file
     * @returns {Promise<void>}
     */
    async runCron(task, lock_file) {
        /**
         * @returns {Promise<void>}
         */
        const unlock = async () => {
            await this.#unlock(
                lock_file
            );
        };

        if (this.#shutdown_handler !== null) {
            await this.#shutdown_handler.addTask(
                async () => {
                    await unlock();
                }
            );
        } else {
            for (const name of [
                "SIGINT",
                "SIGTERM"
            ]) {
                process.on(name, async () => {
                    await unlock();
                });
            }
        }

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

        const exit_code = exit_error ? 1 : null;

        if (this.#shutdown_handler !== null) {
            await this.#shutdown_handler.shutdown(
                exit_code
            );
        } else {
            await unlock();
            process.exit(exit_code);
        }
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
