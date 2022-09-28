import cron from "node-cron";
import { existsSync } from "node:fs";
import { ShutdownHandler } from "../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs";
import { unlink, writeFile } from "node:fs/promises";

/** @typedef {import("./Cron.mjs").Cron} Cron */
/** @typedef {import("./cronTask.mjs").cronTask} cronTask */

export class CronHandler {
    /**
     * @type {Cron}
     */
    #cron;
    /**
     * @type {cronTask[]}
     */
    #cron_tasks;
    /**
     * @type {boolean}
     */
    #lock_created = false;
    /**
     * @type {boolean}
     */
    #running = false;
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @param {Cron} cron
     * @returns {CronHandler}
     */
    static new(shutdown_handler, cron) {
        return new this(
            shutdown_handler,
            cron
        );
    }

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @param {Cron} cron
     * @private
     */
    constructor(shutdown_handler, cron) {
        this.#shutdown_handler = shutdown_handler;
        this.#cron = cron;
        this.#cron_tasks = [];
    }

    /**
     * @param {cronTask} cron_task
     * @returns {void}
     */
    addCronTask(cron_task) {
        this.#cron_tasks.push(cron_task);
    }

    /**
     * @returns {Promise<void>}
     */
    async run() {
        if (this.#running) {
            return;
        }
        this.#running = true;

        const schedule = this.#cron.schedule ?? null;

        this.#shutdown_handler.addShutdownTask(async () => {
            await this.#unlockCron();

            this.#running = false;
        });

        if (schedule !== null) {
            await new Promise(resolve => {
                const scheduler = cron.schedule(schedule, async () => {
                    if (await this.#lockCron()) {
                        for (const cron_task of this.#cron_tasks) {
                            try {
                                await cron_task();
                            } catch (error) {
                                console.error(error);
                                break;
                            }
                        }

                        await this.#unlockCron();
                    }
                });

                this.#shutdown_handler.addShutdownTask(() => {
                    scheduler.stop();

                    resolve();
                });
            });
        } else {
            let error = false;

            if (await this.#lockCron()) {
                for (const cron_task of this.#cron_tasks) {
                    try {
                        await cron_task();
                    } catch (error) {
                        console.error(error);
                        error = true;
                        break;
                    }
                }
            } else {
                error = true;
            }

            await this.#shutdown_handler.shutdown(error ? 1 : null);
        }
    }

    /**
     * @returns {boolean}
     */
    #isCronLocked() {
        return existsSync(this.#cron.lock_file);
    }

    /**
     * @returns {Promise<boolean>}
     */
    async #lockCron() {
        const locked = this.#isCronLocked();

        if (locked) {
            console.info(`Skip cron because it's already running - If this should be an error, try to delete ${this.#cron.lock_file}`);
        } else {
            await writeFile(this.#cron.lock_file, Buffer.alloc(0));
            this.#lock_created = true;
        }

        return !locked;
    }

    /**
     * @returns {Promise<void>}
     */
    async #unlockCron() {
        if (this.#lock_created && this.#isCronLocked()) {
            await unlink(this.#cron.lock_file);
            this.#lock_created = false;
        }
    }
}
