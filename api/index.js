// Main API handler for all endpoints
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  
  // Extract the path after /api
  const path = url.replace('/api', '');

  try {
    // Health check
    if (path === '/health') {
      return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    }

    // Campaign endpoints
    if (path.startsWith('/campaigns')) {
      return handleCampaignRoutes(req, res, path, method);
    }

    // Auth endpoints
    if (path.startsWith('/auth')) {
      return handleAuthRoutes(req, res, path, method);
    }

    // User endpoints
    if (path.startsWith('/users')) {
      return handleUserRoutes(req, res, path, method);
    }

    // Upload endpoints
    if (path.startsWith('/upload')) {
      return handleUploadRoutes(req, res, path, method);
    }

    // Donation endpoints
    if (path.startsWith('/donations')) {
      return handleDonationRoutes(req, res, path, method);
    }

    // Payout endpoints
    if (path.startsWith('/payouts')) {
      return handlePayoutRoutes(req, res, path, method);
    }

    // Comment endpoints
    if (path.startsWith('/comments')) {
      return handleCommentRoutes(req, res, path, method);
    }

    // Follow endpoints
    if (path.startsWith('/follows')) {
      return handleFollowRoutes(req, res, path, method);
    }

    // Stripe Connect endpoints
    if (path.startsWith('/stripe-connect')) {
      return handleStripeConnectRoutes(req, res, path, method);
    }

    // 404 for unknown endpoints
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: url
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Campaign routes handler
function handleCampaignRoutes(req, res, path, method) {
  if (path === '/campaigns/categories/stats' && method === 'GET') {
    return res.json({
      success: true,
      data: {
        categories: {
          "Medical": 45,
          "Education": 32,
          "Community": 28,
          "Emergency": 15,
          "Animals": 12,
          "Sports": 8
        },
        total: 140
      }
    });
  }

  if (path === '/campaigns' && method === 'GET') {
    // Parse query parameters
    const urlParams = new URL(req.url, `http://${req.headers.host}`);
    const featured = urlParams.searchParams.get('featured');
    const limit = parseInt(urlParams.searchParams.get('limit') || '10');
    
    // Mock campaign data
    const mockCampaigns = [
      {
        id: "1",
        title: "Help Build Community Center",
        summary: "Building a community center for local families",
        goalAmount: "50000",
        raisedAmount: "12500",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Community",
        coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        creator: {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          avatar: null
        },
        isActive: true,
        isApproved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "Medical Treatment Fund",
        summary: "Raising funds for urgent medical treatment",
        goalAmount: "25000",
        raisedAmount: "18000",
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Medical",
        coverImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
        creator: {
          id: "2",
          firstName: "Jane",
          lastName: "Smith",
          avatar: null
        },
        isActive: true,
        isApproved: true,
        createdAt: new Date().toISOString()
      }
    ];

    const campaigns = featured === 'true' ? mockCampaigns.slice(0, limit) : mockCampaigns;

    return res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: 1,
          limit,
          total: campaigns.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  }

  return res.status(404).json({
    success: false,
    message: 'Campaign endpoint not found'
  });
}

// Placeholder handlers for other routes
function handleAuthRoutes(req, res, path, method) {
  return res.status(501).json({ success: false, message: 'Auth endpoints not implemented yet' });
}

function handleUserRoutes(req, res, path, method) {
  return res.status(501).json({ success: false, message: 'User endpoints not implemented yet' });
}

function handleUploadRoutes(req, res, path, method) {
  return res.status(501).json({ success: false, message: 'Upload endpoints not implemented yet' });
}

function handleDonationRoutes(req, res, path, method) {
  return res.status(501).json({ success: false, message: 'Donation endpoints not implemented yet' });
}

function handlePayoutRoutes(req, res, path, method) {
  return res.status(501).json({ success: false, message: 'Payout endpoints not implemented yet' });
}

function handleCommentRoutes(req, res, path, method) {
  return res.status(501).json({ success: false, message: 'Comment endpoints not implemented yet' });
}

function handleFollowRoutes(req, res, path, method) {
  return res.status(501).json({ success: false, message: 'Follow endpoints not implemented yet' });
}

function handleStripeConnectRoutes(req, res, path, method) {
  return res.status(501).json({ success: false, message: 'Stripe Connect endpoints not implemented yet' });
}
