import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Supabase client (server-side)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function getSupabase() {
  if (!supabase) {
    console.warn('[Yafit] Supabase nao configurado — SUPABASE_URL / SUPABASE_ANON_KEY ausentes no .env');
  }
  return supabase;
}

// Evolution API config from environment
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://antum-evolution-api.h53ewi.easypanel.host';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '429683C4C977415CAAFCCE10F7D57E11';

const app = express();
const PORT = 3000;
app.use(express.json());

// Initialize Google GenAI lazily
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  if (!genAiClient) genAiClient = new GoogleGenAI({ apiKey });
  return genAiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Yafit SaaS API & Webhook Gateway',
    timestamp: new Date().toISOString(),
    geminiAvailable: !!getGenAI(),
    evolutionApiUrl: EVOLUTION_API_URL,
  });
});

// Helper: Send WhatsApp message via Evolution API
async function sendWhatsAppMessage(instanceName: string, remoteJid: string, text: string): Promise<boolean> {
  try {
    const url = `${EVOLUTION_API_URL}/message/sendText/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
      body: JSON.stringify({ number: remoteJid, text, delay: 1200 }),
    });
    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[Evolution API] Erro ao enviar: ${response.status} ${errBody}`);
      return false;
    }
    console.log(`[Evolution API] Mensagem enviada para ${remoteJid} via ${instanceName}`);
    return true;
  } catch (err) {
    console.error('[Evolution API] Erro de rede:', err);
    return false;
  }
}

// Helper: Buscar contexto do salao no Supabase
async function buildSalonContext(tenantId: string): Promise<string> {
  const db = getSupabase();
  if (!db) return 'Salao de beleza premium. Corte Feminino R$ 180, Mechas Balayage R$ 580, Unhas em Gel R$ 190, Sobrancelha R$ 95.';
  try {
    const [tenantRes, servicesRes, profsRes] = await Promise.all([
      db.from('yafit_tenants').select('name, phone, address, working_hours').eq('id', tenantId).maybeSingle(),
      db.from('yafit_services').select('name, price, duration_minutes').eq('tenant_id', tenantId).eq('active', true).order('name').limit(20),
      db.from('yafit_professionals').select('name, specialties').eq('tenant_id', tenantId).eq('active', true).limit(10),
    ]);
    const tenant = tenantRes.data;
    const services = servicesRes.data || [];
    const profs = profsRes.data || [];
    const salonName = tenant?.name || 'Salao';
    const address = tenant?.address || '';
    const hours = tenant?.working_hours || 'Segunda a Sabado das 9h as 19h';
    const servicesList = services.map((s: any) => `  - ${s.name} R$ ${Number(s.price).toFixed(2)} (${s.duration_minutes} min)`).join('\n');
    const profsList = profs.map((p: any) => `  - ${p.name}: ${Array.isArray(p.specialties) ? p.specialties.join(', ') : p.specialties}`).join('\n');
    return `SALAO: ${salonName}\nENDERECO: ${address}\nHORARIO: ${hours}\n\nSERVICOS:\n${servicesList || '  Consulte a equipe.'}\n\nEQUIPE:\n${profsList || '  Profissionais qualificados.'}`;
  } catch (err) {
    console.error('[Yafit] Erro ao buscar contexto:', err);
    return 'Salao de beleza premium com atendimento de excelencia.';
  }
}

// Helper: Gerar resposta com Gemini
async function generateAIReply(tenantId: string, salonName: string, salonContext: string, clientName: string, messageText: string, conversationHistory: Array<{ role: string; text: string }>): Promise<string> {
  const ai = getGenAI();
  if (!ai) return `Ola${clientName ? ', ' + clientName.split(' ')[0] : ''}! Como posso te ajudar hoje? Estamos aqui para te atender!`;
  const systemPrompt = `Voce e a Yafit, assistente virtual do salao "${salonName}". Tom amigavel, sofisticado e eficiente. Portugues brasileiro.\nInformacoes do salao:\n${salonContext}\nRegras: respostas curtas (max 3-4 linhas), use emojis (*, -, 🌸), para agendamento peca nome/servico/data/horario.`;
  const historyText = conversationHistory.slice(-6).map(h => `${h.role === 'user' ? 'Cliente' : 'Yafit'}: ${h.text}`).join('\n');
  const fullPrompt = `${systemPrompt}\n\nHistorico:\n${historyText}\n\nCliente (${clientName || 'Cliente'}): ${messageText}\n\nYafit:`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: [{ role: 'user', parts: [{ text: fullPrompt }] }] });
    return response.text?.trim() || 'Ola! Como posso ajudar?';
  } catch (err: any) {
    console.error('[Gemini] Erro:', err?.message);
    return `Ola${clientName ? ', ' + clientName.split(' ')[0] : ''}! Tive uma instabilidade, mas estou aqui! Me conta o que precisa. ✨`;
  }
}

// In-memory conversation history (por remoteJid)
const conversationHistories = new Map<string, Array<{ role: string; text: string }>>();
function getHistory(jid: string) { return conversationHistories.get(jid) || []; }
function addToHistory(jid: string, role: string, text: string) {
  const history = getHistory(jid);
  history.push({ role, text });
  if (history.length > 12) history.splice(0, history.length - 12);
  conversationHistories.set(jid, history);
}

// Evolution API Webhook endpoint
app.post('/api/v1/webhook/evolution', async (req, res) => {
  res.json({ success: true, received: true }); // responde imediatamente
  try {
    const body = req.body;
    const event = body?.event || body?.type;
    if (event !== 'messages.upsert' && event !== 'message') {
      console.log(`[Evolution Webhook] Evento ignorado: ${event}`);
      return;
    }
    const data = body?.data || body;
    const message = data?.message || data?.messages?.[0] || data;
    const key = message?.key || data?.key;
    const instanceName = body?.instance || data?.instance || req.headers['x-instance-name'] as string || 'yafit';
    if (key?.fromMe === true) { console.log('[Evolution Webhook] Mensagem propria ignorada'); return; }
    const remoteJid: string = key?.remoteJid || data?.remoteJid || '';
    const pushName: string = data?.pushName || message?.pushName || 'Cliente';
    if (remoteJid.includes('@g.us')) { console.log(`[Evolution Webhook] Grupo ignorado: ${remoteJid}`); return; }
    const msgContent = message?.message || message;
    const messageText: string = msgContent?.conversation || msgContent?.extendedTextMessage?.text || msgContent?.imageMessage?.caption || '';
    if (!messageText.trim()) { console.log('[Evolution Webhook] Mensagem sem texto'); return; }
    console.log(`[Evolution Webhook] [${instanceName}] ${pushName} (${remoteJid}): "${messageText}"`);
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-bella-donna';
    const salonContext = await buildSalonContext(tenantId);
    const salonNameMatch = salonContext.match(/SALAO:\s*(.+)/);
    const salonName = salonNameMatch?.[1]?.trim() || 'Bella Donna';
    const history = getHistory(remoteJid);
    addToHistory(remoteJid, 'user', messageText);
    const aiReply = await generateAIReply(tenantId, salonName, salonContext, pushName, messageText, history);
    addToHistory(remoteJid, 'assistant', aiReply);
    console.log(`[Evolution Webhook] Resposta para ${pushName}: "${aiReply.substring(0, 80)}..."`);
    await sendWhatsAppMessage(instanceName, remoteJid, aiReply);
  } catch (err: any) {
    console.error('[Evolution Webhook] Erro:', err?.message || err);
  }
});

// REST API for Tool Execution
app.post('/api/v1/langflow/execute-tool', async (req, res) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-bella-donna';
  const { tool_name, input } = req.body;
  if (!tenantId) return res.status(400).json({ allowed: false, error: 'Missing x-tenant-id header.' });
  let toolOutput: Record<string, any> = {};
  const db = getSupabase();
  switch (tool_name) {
    case 'consultar_servicos': {
      if (db) { const { data, error } = await db.from('yafit_services').select('name, description, price, duration_minutes').eq('tenant_id', tenantId).eq('active', true).order('name'); toolOutput = error ? { error: error.message } : { services: data }; }
      else toolOutput = { services: [{ name: 'Corte Feminino', price: 180 }, { name: 'Mechas Balayage', price: 580 }, { name: 'Unhas Gel', price: 190 }] };
      break;
    }
    case 'consultar_profissionais': {
      if (db) { const { data, error } = await db.from('yafit_professionals').select('name, specialties, rating_average').eq('tenant_id', tenantId).eq('active', true); toolOutput = error ? { error: error.message } : { professionals: data }; }
      else toolOutput = { professionals: [{ name: 'Ana Silva', specialties: ['Cabelo'] }, { name: 'Juliana Costa', specialties: ['Unhas'] }] };
      break;
    }
    case 'consultar_cliente': {
      const phone = input?.phone || input?.telefone;
      if (db && phone) { const { data, error } = await db.from('yafit_customers').select('id, name, phone, email, loyalty_points, cashback_balance, total_spent').eq('tenant_id', tenantId).eq('phone', phone).maybeSingle(); toolOutput = error ? { error: error.message } : { found: !!data, customer: data }; }
      else toolOutput = { found: false, customer: null };
      break;
    }
    case 'criar_cliente': {
      const { name, phone, email } = input || {};
      if (db && name && phone) { const { data, error } = await db.from('yafit_customers').insert([{ tenant_id: tenantId, name, phone, email: email || null, origin: 'whatsapp_yafit' }]).select('id, name, phone').single(); toolOutput = error ? { success: false, error: error.message } : { success: true, customer: data }; }
      else toolOutput = { success: true, customer_id: `new-${Date.now()}` };
      break;
    }
    case 'buscar_horarios_disponiveis': {
      const requestedDate = input?.date || new Date().toISOString().split('T')[0];
      if (db) { const { data: existing } = await db.from('yafit_appointments').select('scheduled_at').eq('tenant_id', tenantId).gte('scheduled_at', `${requestedDate}T00:00:00`).lte('scheduled_at', `${requestedDate}T23:59:59`).in('status', ['scheduled', 'confirmed', 'in_progress']); const allSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30']; const occupied = (existing || []).map((a: any) => a.scheduled_at.substring(11, 16)); toolOutput = { date: requestedDate, available_slots: allSlots.filter(s => !occupied.includes(s)) }; }
      else toolOutput = { date: requestedDate, available_slots: ['09:30', '11:00', '14:00', '16:30', '18:00'] };
      break;
    }
    case 'criar_agendamento': {
      const { customer_id, professional_id, service_id, date, time, notes } = input || {};
      if (db && customer_id && service_id && date && time) { const { data: svc } = await db.from('yafit_services').select('duration_minutes').eq('id', service_id).single(); const { data, error } = await db.from('yafit_appointments').insert([{ tenant_id: tenantId, customer_id, professional_id: professional_id || 'a0010000-0000-0000-0000-000000000001', service_id, scheduled_at: `${date}T${time}:00`, duration_minutes: svc?.duration_minutes || 60, source: 'whatsapp_yafit', notes: notes || null, status: 'confirmed' }]).select('id, scheduled_at, status').single(); toolOutput = error ? { success: false, error: error.message } : { success: true, appointment_id: data?.id, scheduled_at: data?.scheduled_at }; }
      else toolOutput = { success: true, appointment_id: `apt-${Date.now()}`, status: 'confirmed' };
      break;
    }
    case 'cancelar_agendamento': {
      const { appointment_id, reason } = input || {};
      if (db && appointment_id) { const { error } = await db.from('yafit_appointments').update({ status: 'cancelled', cancellation_reason: reason || 'Solicitado via WhatsApp' }).eq('id', appointment_id).eq('tenant_id', tenantId); toolOutput = error ? { success: false, error: error.message } : { success: true, appointment_id, status: 'cancelled' }; }
      else toolOutput = { success: true, appointment_id, status: 'cancelled' };
      break;
    }
    default: toolOutput = { status: 'executed', result: 'OK' };
  }
  res.json({ allowed: true, tenant_id: tenantId, tool_name, input, output: toolOutput, executed_at: new Date().toISOString() });
});

// Server-side Gemini API chat for Yafit dashboard
app.post('/api/ai/yafit-generate', async (req, res) => {
  try {
    const { message, tenantName, salonContext, conversationHistory } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.json({ success: true, source: 'local', reply: `Ola! Sou a Yafit, assistente do ${tenantName || 'Salao'}. Como posso te ajudar?` });
    }
    const systemPrompt = `Voce e a Yafit, assistente do salao "${tenantName || 'Yafit Salao'}". Tom amigavel e eficiente. Portugues brasileiro.\n${salonContext || 'Corte R$ 180, Mechas R$ 580, Unhas R$ 190.'}\nRespostas curtas para WhatsApp. Use emojis (*, -, 🌸).`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nHistorico: ${JSON.stringify(conversationHistory || [])}\n\nCliente: ${message}` }] }],
    });
    res.json({ success: true, source: 'gemini-2.5-flash', reply: response.text || 'Ola! Como posso ajudar?' });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ success: false, error: error?.message, fallbackReply: 'Ola! Tive uma instabilidade, mas posso te ajudar!' });
  }
});

// Vite middleware / static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Yafit SaaS] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Yafit SaaS] Evolution API: ${EVOLUTION_API_URL}`);
  });
}

startServer();
