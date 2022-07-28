import { Express } from 'express';
import testRoutes from './test.routes';

function route(app: Express) {
    app.use(`/api/test`, testRoutes);
}

export default route;
