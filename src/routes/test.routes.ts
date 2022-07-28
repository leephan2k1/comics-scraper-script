import Router from 'express-promise-router';
import testRoute from '../controllers/test.controller';
const router = Router();

/*
this route just test!
/test
*/
router.route('/').get(testRoute().testGet).post(testRoute().testPost);

export default router;
