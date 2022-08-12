import { Express } from 'express';
import testRoutes from './test.routes';
import proxyController from '../controllers/proxy.controller';

function route(app: Express) {
    app.use(`/api/test`, testRoutes);

    app.use(`/api/proxy`, proxyController().corsAnywhere);
}

export default route;
