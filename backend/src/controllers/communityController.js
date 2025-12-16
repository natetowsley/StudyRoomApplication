import pool from '../config/database.js';
import crypto from 'crypto';

const generateInviteCode = () => {
    // cryptographically strong data through crypto.randomBytes()
    return crypto.randomBytes(6).toString('hex');
};

// Create a new community
const createCommunity = async (req, res) => {
    const { name, description } = req.body;
    // req.user comes from authenticateToken middleware
    const ownerId = req.user.id;

    // Check Fields
    if (!name || name.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Community name is required'
        });
    }

    // Start database transaction
    // Done so all following queries succeed of fail together
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Generate channel's unique invite code
        const inviteCode = generateInviteCode();

        // Insert community
        const communityResult = await client.query(
            `INSERT INTO communities (name, description, owner_id, invite_code)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, description, owner_id, invite_code, created_at`,
            [name.trim(), description || '', ownerId, inviteCode]
        );

        // Store newly made community as community
        const community = communityResult.rows[0];

        // Insert general text and general voice channels
        await client.query(
            `INSERT INTO channels (community_id, name, type)
            VALUES ($1, $2, $3), ($1, $4, $5)`,
            [community.id, 'general', 'text', 'General Voice', 'voice']
        );

        // Add owner as member of community
        await client.query(
            `INSERT INTO community_members (community_id, user_id, role)
            VALUES ($1, $2, $3)`,
            [community.id, ownerId, 'owner']
        );

        // Commit transaction (only done because of BEGIN (line 27))
        // Means all queries executed together (if one fails all fail)
        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Community created successfully',
            community: {
                id: community.id,
                name: community.name,
                description: community.description,
                inviteCode: community.invite_code,
                ownerId: community.owner_id,
                createdAt: community.created_at
            }
        });
    } catch (error) {
        // Rollback transaction - All queries cancelled
        await client.query('ROLLBACK');
        console.error('Create community error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create community',
            error: error.message
        });
    } finally {
        // Release done in finally block as it will happen in both try and catch case
        client.release();
    }
};

// Get all communities a user is currently a member of
const getUserCommunities = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT
                c.id,
                c.name,
                c.description,
                c.owner_id,
                c.invite_code,
                c.created_at,
                u.username as owner_username,
                cm.role as user_role,
                (SELECT COUNT(*) FROM community_members WHERE community_id = c.id) as member_count
            FROM communities c
            INNER JOIN community_members cm ON c.id = cm.community_id
            INNER JOIN users u ON c.owner_id = u.id
            WHERE cm.user_id = $1
            ORDER BY c.created_at DESC`,
            [userId]
        );
        res.json({
            success: true,
            communities: result.rows
        });
    } catch (error) {
        console.error('Get user communities error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch communities',
            error: error.message
        });
    }
};

// Get details for a specific community
const getCommunityDetails = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.user.id;

    try {
        // Check if user is member of community
        const memberCheck = await pool.query(
            `SELECT role FROM community_members
            WHERE community_id = $1 and user_id = $2`,
            [communityId, userId]
        );

        // Return status 403 if user not a member of community
        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this community'
            });
        }

        // Get community info
        const communityResult = await pool.query(
            `SELECT 
                c.*,
                u.username as owner_username,
                (SELECT COUNT(*) FROM community_members WHERE community_id = c.id) as member_count
            FROM communities c
            INNER JOIN users u ON c.owner_id = u.id
            WHERE c.id = $1`,
            [communityId]
        );

        // Return status 404 if community not found
        if (communityResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Community not found'
            });
        }

        // Get all channels in said community
        const channelsResult = await pool.query(
            `SELECT id, name, type, created_at
            FROM channels
            WHERE community_id = $1
            ORDER BY 
                CASE WHEN name = 'general' THEN 0 ELSE 1 END,
                type ASC,
                created_at ASC`, // general channel first, text before voice, older channels first
            [communityId]
        );

        // Return success
        res.json({
            success: true,
            community: communityResult.rows[0],
            channels: channelsResult.rows,
            userRole: memberCheck.rows[0].role
        });
    } catch (error) {
        console.error('Get community details error: ', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch community details',
            error: error.message
        });
    }
};

// User using an invite link
const joinCommunity = async (req, res) => {
    // Retrieve invite code from body
    const { inviteCode } = req.body;
    const userId = req.user.id;

    // Check for valid invite code
    if (!inviteCode || inviteCode.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Invite Code is required'
        });
    }

    try {
        // Retrieve community that invite code belongs to
        const communityResult = await pool.query(
            `SELECT id, name, description, owner_id, invite_code
            FROM communities 
            WHERE invite_code = $1`,
            [inviteCode.trim()]
        );

        // Return status 404 if no community found
        if (communityResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        const community = communityResult.rows[0];

        // Check if user is already a member
        const memberCheck = await pool.query(
            `SELECT id
            FROM community_members
            WHERE community_id = $1 AND user_id = $2`,
            [community.id, userId]
        );

        // Return status 400 if already a member
        if (memberCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this community'
            });
        }

        const memberCountResult = await pool.query(
            `SELECT COUNT(*) as count FROM community_members
            WHERE community_id = $1`,
            [community.id]
        );

        const currentMemberCount = parseInt(memberCountResult.rows[0].count);

        /*TODO*************************************
         *     10 MEMBER LIMIT PER COMMUNITY      *
         *      IS TO BE CHANGED (MVP ONLY)       *
         ******************************************/
        if (currentMemberCount >= 10) {
            return res.status(400).json({
                success: false,
                message: "This community is full (maximum 10 members)"
            });
        }

        // Add user as member
        const addMember = await pool.query(
            `INSERT INTO community_members (community_id, user_id, role)
            VALUES ($1, $2, $3)`,
            [community.id, userId, 'member']
        );

        // Return success
        res.status(200).json({
            success: true,
            message: 'Successfully joined community',
            community: {
                id: community.id,
                name: community.name,
                description: community.description,
                ownerId: community.owner_id,
                inviteCode: community.invite_code
            }
        });

    } catch (error) {
        console.error('Join community error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to join community',
            error: error.message
        });
    }
};

const createChannel = async (req, res) => {
    const { communityId } = req.params;
    const { name, type } = req.body;
    const userId = req.user.id;

    // Validate channel name parameter
    if (!name || name.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Channel name is required'
        });
    }

    // Validate channel type
    if (type !== 'text' && type !== 'voice') {
        return res.status(400).json({
            success: false,
            message: 'Channel type must be "text" or "voice"'
        });
    }

    // Name is all lower case for text channels, custom case for voice
    const sanitizedName = type === 'text'
        ? name.trim().toLowerCase()
        : name.trim();

    try {
        const ownerCheck = await pool.query(
            `SELECT owner_id FROM communities WHERE id = $1`,
            [communityId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Community not found'
            });
        }

        /*TODO*************************************
        *    ALLOW PERMITTED ROLES TO CREATE     *
        *     CHANNELS (OWNER ONLY FOR MVP)      *
        ******************************************/
        if (ownerCheck.rows[0].owner_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the community owner can create channels'
            });
        }

        // Get current number of channels in community
        const channelCountResult = await pool.query(
            `SELECT COUNT(*) as count FROM channels WHERE community_id = $1`,
            [communityId]
        );

        const currentChannelCount = parseInt(channelCountResult.rows[0].count);

        if (currentChannelCount >= 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 channels allowed per community'
            });
        }

        const duplicateCheck = await pool.query(
            `SELECT id FROM channels WHERE community_id = $1 AND LOWER(name) = LOWER($2)`,
            [communityId, sanitizedName]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A channel with this name already exists'
            });
        }

        // Create channel
        const result = await pool.query(
            `INSERT INTO channels (community_id, name, type)
            VALUES ($1, $2, $3)
            RETURNING id, community_id, name, type, created_at`,
            [communityId, sanitizedName, type]
        );

        // Return success
        res.status(201).json({
            success: true,
            message: 'Channel created successfully',
            channel: result.rows[0]
        });

    } catch (error) {
        console.error('Create channel error: ', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create channel',
            error: error.message
        });
    }
};

const deleteChannel = async (req, res) => {
    const { communityId, channelId } = req.params;
    const userId = req.user.id;

    try {
        // Verify that user is owner of channel
        const ownerCheck = await pool.query(
            `SELECT owner_id FROM communities WHERE id = $1`,
            [communityId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Community not found'
            });
        }

        if (ownerCheck.rows[0].owner_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the community owner can delete channels'
            });
        }

        // Check if channel exists and retrieve name
        const channelCheck = await pool.query(
            `SELECT name FROM channels WHERE id = $1 AND community_id = $2`,
            [channelId, communityId]
        );

        if (channelCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        const channelName = channelCheck.rows[0].name;

        // Prevent deleting default channels
        if (channelName.toLowerCase() === 'general' ||
            channelName.toLowerCase() === 'general voice') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete default channels'
            });
        }

        // Delete the channel
        await pool.query(
            `DELETE FROM channels WHERE id = $1 AND community_id = $2`,
            [channelId, communityId]
        );

        // Return success
        res.json({
            success: true,
            message: 'Channel deleted successfully'
        })
    } catch (error) {
        console.error('Delete channel error: ', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete channel',
            error: error.message
        });
    }
};

const leaveCommunity = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.user.id;

    try {
        // Check if user is a member
        const memberCheck = await pool.query(
            `SELECT id FROM community_members WHERE community_id = $1 AND user_id = $2`,
            [communityId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'You are not a member of this community'
            });
        }

        // Remove from community
        await pool.query(
            `DELETE FROM community_members WHERE community_id = $1 AND user_id = $2`,
            [communityId, userId]
        );

        // Return success
        res.json({
            success: true,
            message: 'Successfully left community'
        });
    } catch (error) {
        console.error('Leave community error: ', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave community',
            error: error.message
        });
    }
};

const communityController = {
    createCommunity,
    getUserCommunities,
    getCommunityDetails,
    joinCommunity,
    createChannel,
    deleteChannel,
    leaveCommunity
};

export default communityController;