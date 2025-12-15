import express from 'express'
import communityController from '../controllers/communityController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', communityController.createCommunity);

router.get('/', communityController.getUserCommunities);

router.get('/:communityId', communityController.getCommunityDetails);

export default router;