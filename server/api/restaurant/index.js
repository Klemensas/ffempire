'use strict';

import {Router} from 'express';
import * as controller from './restaurant.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', controller.index);
// router.get('/', auth.hasRole('admin'), controller.index);
// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
// router.get('/', auth.isAuthenticated(), controller.restaurantView);
router.get('/map', auth.isAuthenticated(), controller.map);
router.get('/buildings', auth.isAuthenticated(), controller.getBuildings);
router.post('/:id/buildings/upgrade', auth.isAuthenticated(), controller.upgradeBuilding);
// router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
// router.get('/:id', auth.isAuthenticated(), controller.show);
// router.post('/', controller.create);

module.exports = router;