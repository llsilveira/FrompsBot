import type Application from "./Application";

export type AppModuleClass = typeof AppModule;


export default abstract class AppModule {

  constructor(app: Application) {
    this.app = app;
    this.logger = app.logger.getLogger(this);
  }

  readonly app: Application;
  readonly logger;
}
