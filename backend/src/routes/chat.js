const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware } = require('../middlewares/auth');

// GET — Toutes les conversations de l'utilisateur
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        listings:listing_id (id, title, city, price),
        buyer:buyer_id (id, full_name, avatar_url),
        owner:owner_id (id, full_name, avatar_url)
      `)
      .or(`buyer_id.eq.${req.user.id},owner_id.eq.${req.user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    res.json({ conversations: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST — Créer ou récupérer une conversation
router.post('/conversations', authMiddleware, async (req, res) => {
  try {
    const { listing_id, owner_id } = req.body;

    // Vérifier si conversation existe déjà
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('listing_id', listing_id)
      .eq('buyer_id', req.user.id)
      .eq('owner_id', owner_id)
      .single();

    if (existing) {
      return res.json({ conversation: existing });
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        listing_id,
        buyer_id: req.user.id,
        owner_id
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ conversation: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET — Messages d'une conversation
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (id, full_name, avatar_url)
      `)
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Marquer les messages comme lus
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', req.params.id)
      .neq('sender_id', req.user.id);

    res.json({ messages: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST — Envoyer un message
router.post('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Message vide' });

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: req.params.id,
        sender_id: req.user.id,
        content
      }])
      .select(`*, sender:sender_id (id, full_name, avatar_url)`)
      .single();

    if (error) throw error;

    // Mettre à jour last_message de la conversation
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    res.status(201).json({ message: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;