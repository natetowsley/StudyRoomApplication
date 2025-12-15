import pool from '../config/database';
import crypto from 'crypto';

const generateInviteCode = () => {
    // cryptographically strong data through crypto.randomBytes()
    return crypto.randomBytes(6).toString('hex');
}

// Create a new community
exports.createCommunity = async (req, res) => {
    const { name, description } = req.body;
    // req.user comes from authenticateToken middleware
    const ownerId = req.user.userId;

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
exports.getUserCommunities = async (req, res) => {
    const userId = req.user.userId;

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
exports.getCommunityDetails = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.user.userId;

    try {
        const memberCheck = await pool.query(
            `SELECT role FROM community_members
            WHERE community_id = $1 and user_id = $2`,
            [communityId, userId]
        );
    
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