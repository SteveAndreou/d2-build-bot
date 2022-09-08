import { Get, Koa, Router } from '@discordx/koa';
import { RouterContext } from '@koa/router';
import { Next } from 'koa';

@Router()
class HealthEndpoint {
    @Get('/')
    handle(ctx: RouterContext, next: Next, koa: Koa): Promise<Next> {
        ctx.body = 'Hello world!';
        return next();
    }
}
