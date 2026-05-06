const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration upload photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Format image non supporté'));
    }
  }
});

// GET — Toutes les annonces (public, avec filtres)
router.get('/', async (req, res) => {
  try {
    const { type, city, bedrooms, min_price, max_price, status = 'active', page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('listings')
      .select(`
        *,
        users:owner_id (full_name, phone, avatar_url, is_verified),
        listing_images (image_url, is_cover, order_index)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (type) query = query.eq('type', type);
    if (city) query = query.ilike('city', `%${city}%`);
    if (bedrooms) query = query.gte('bedrooms', parseInt(bedrooms));
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ listings: data, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET — Une annonce par ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        users:owner_id (id, full_name, phone, avatar_url, is_verified, created_at),
        listing_images (image_url, is_cover, order_index)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Annonce introuvable' });
    }

    // Incrémenter les vues
    await supabase
      .from('listings')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', req.params.id);

    res.json({ listing: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST — Créer une annonce
router.post('/', authMiddleware, roleMiddleware('proprietaire', 'agent', 'admin'), async (req, res) => {
  try {
    const {
      title, description, type, price, price_period,
      city, neighborhood, address, bedrooms, bathrooms,
      living_rooms, area, floors, is_furnished,
      has_parking, has_garden, has_pool, has_security
    } = req.body;

    if (!title || !type || !price || !city) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const { data, error } = await supabase
      .from('listings')
      .insert([{
        owner_id: req.user.id,
        title, description, type, price, price_period,
        city, neighborhood, address,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        living_rooms: living_rooms || 0,
        area, floors: floors || 0,
        is_furnished: is_furnished || false,
        has_parking: has_parking || false,
        has_garden: has_garden || false,
        has_pool: has_pool || false,
        has_security: has_security || false,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Annonce créée avec succès', listing: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT — Modifier une annonce
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { data: listing } = await supabase
      .from('listings')
      .select('owner_id')
      .eq('id', req.params.id)
      .single();

    if (!listing) return res.status(404).json({ error: 'Annonce introuvable' });

    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const { data, error } = await supabase
      .from('listings')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Annonce modifiée', listing: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE — Supprimer une annonce
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { data: listing } = await supabase
      .from('listings')
      .select('owner_id')
      .eq('id', req.params.id)
      .single();

    if (!listing) return res.status(404).json({ error: 'Annonce introuvable' });

    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await supabase.from('listings').delete().eq('id', req.params.id);
    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST — Upload photos
router.post('/:id/images', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const images = req.files.map((file, index) => ({
      listing_id: req.params.id,
      image_url: `/uploads/${file.filename}`,
      is_cover: index === 0,
      order_index: index
    }));

    const { data, error } = await supabase
      .from('listing_images')
      .insert(images)
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Photos uploadées', images: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET — Annonces du propriétaire connecté
router.get('/owner/my-listings', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, listing_images (image_url, is_cover)`)
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ listings: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;