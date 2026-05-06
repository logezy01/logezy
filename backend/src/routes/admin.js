const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

// Toutes les routes admin nécessitent d'être admin
router.use(authMiddleware, roleMiddleware('admin'));

// GET — Statistiques globales
router.get('/stats', async (req, res) => {
  try {
    const [users, listings, messages, conversations] = await Promise.all([
      supabase.from('users').select('id, role, created_at', { count: 'exact' }),
      supabase.from('listings').select('id, type, status, created_at', { count: 'exact' }),
      supabase.from('messages').select('id', { count: 'exact' }),
      supabase.from('conversations').select('id', { count: 'exact' })
    ]);

    const usersByRole = users.data?.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    const listingsByType = listings.data?.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {});

    const listingsByStatus = listings.data?.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      stats: {
        total_users: users.count || 0,
        total_listings: listings.count || 0,
        total_messages: messages.count || 0,
        total_conversations: conversations.count || 0,
        users_by_role: usersByRole,
        listings_by_type: listingsByType,
        listings_by_status: listingsByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET — Tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, is_verified, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ users: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT — Activer/désactiver un utilisateur
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users').select('is_active').eq('id', req.params.id).single();

    const { data, error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: `Utilisateur ${data.is_active ? 'activé' : 'désactivé'}`, user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET — Toutes les annonces
router.get('/listings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, users:owner_id (full_name, email, role)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ listings: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT — Changer le statut d'une annonce
router.put('/listings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Statut mis à jour', listing: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;