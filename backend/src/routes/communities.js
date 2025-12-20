import express from 'express'
import communityController from '../controllers/communityController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Community routes
router.post('/', communityController.createCommunity);
router.get('/', communityController.getUserCommunities);
router.get('/:communityId', communityController.getCommunityDetails);

// Join/Leave communities
router.post('/join', communityController.joinCommunity);
router.delete('/:communityId/leave', communityController.leaveCommunity);

// Channel Management
router.post('/:communityId/channels', communityController.createChannel);
router.delete('/:communityId/channels/:channelId', communityController.deleteChannel);

// Message routes
router.get('/:communityId/channels/:channelId/messages', communityController.fetchMessages);
export default router;