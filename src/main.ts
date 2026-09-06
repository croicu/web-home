import { Context } from "./runtime/context";

function bootstrap(): void {
    const logger = Context.Instance.logger;

    logger.info("app.bootstrap.start");

    const root = document.querySelector<HTMLDivElement>("#app");
    if (root) {
        root.innerHTML = "<h1>__project_name__</h1>";
    }

    logger.info("app.bootstrap.end");
}

bootstrap();
