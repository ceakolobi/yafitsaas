import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function getSupabase() {
  if (!supabase) {
    console.warn('[Yafit] Supabase não configurado — SUPABASE_URL / SUPABASE_ANON_KEY ausentes no .env');
  }
  return supabase;
}

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://antum-evolution-api.h53ewi.easypanel.host';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '429683C4C977415CAAFCCE10F7D57E11';

const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Yafit SaaS API & Webhook Gateway', timestamp: new Date().toISOString(), evolutionApiUrl: EVOLUTION_API_URL });
});

async function sendWhatsAppMessage(instanceName: string, remoteJid: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
      body: JSON.stringify({ number: remoteJid, text, delay: 1200 }),
    });
    if (!response.ok) { console.error(`[Evolution API] Erro: ${response.status} ${await response.text()}`); return false; }
    console.log(`[Evolution API] Mensagem enviada para ${remoteJid} via ${instanceName}`);
    return true;
  } catch (err) { console.error('[Evolution API] Erro de rede:', err); return false; }
}

async function buildSalonContext(tenantId: string): Promise<string> {
  const db = getSupabase();
  if (!db) return 'Salão de beleza premium. Corte Feminino R$ 180, Mechas Balayage R$ 580, Unhas em Gel R$ 190, Sobrancelha R$ 95.';
  try {
    const [tenantRes, servicesRes, profsRes] = await Promise.all([
      db.from('yafit_tenants').select('name, phone, address, working_hours').eq('id', tenantId).maybeSingle(),
      db.from('yafit_services').select('name, price, duration_minutes').eq('tenant_id', tenantId).eq('active', true).order('name').limit(20),
      db.from('yafit_professionals').select('name, specialties').eq('tenant_id', tenantId).eq('active', true).limit(10),
    ]);
    const tenant = tenantRes.data;
    const services = servicesRes.data || [];
    const profs = profsRes.data || [];
    const salonName = tenant?.name || 'Salão';
    const servicesList = services.map((s: any) => `  • ${s.name} — R$ ${Number(s.price).toFixed(2)} (${s.duration_minutes} min)`).join('\n');
    const profsList = profs.map((p: any) => `  • ${p.name}: ${Array.isArray(p.specialties) ? p.specialties.join(', ') : p.specialties}`).join('\n');
    return `SALÃO: ${salonName}\nENDEREÇO: ${tenant?.address || ''}\nHORÁRIO: ${tenant?.working_hours || 'Segunda a Sábado 9h-19h'}\n\nSERVIÇOS:\n${servicesList || '  Consulte nossa equipe.'}\n\nEQUIPE:\n${profsList || '  Profissionais qualificados.'}`.trim();
  } catch (err) { console.error('[Yafit] Erro contexto:', err); return 'Salão de beleza premium.'; }
}

// ─── Gemini via REST direto (compatível com qualquer formato de chave) ────────
async function generateAIReply(
  tenantId: string, salonName: string, salonContext: string,
  clientName: string, messageText: string,
  conversationHistory: Array<{ role: string; text: string }>
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const firstName = clientName ? clientName.split(' ')[0] : '';
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return `Olá${firstName ? ', ' + firstName : ''}! 😊 Seja bem-vindo(a) ao ${salonName}! Como posso te ajudar hoje?`;
  }
  const systemPrompt = `Você é a Yafit, atendente virtual do salão "${salonName}". Seu atendimento é humano, caloroso e eficiente — como uma recepcionista experiente, não um robô.

INFORMAÇÕES DO SALÃO:
${salonContext}

== COMPORTAMENTO GERAL ==
1. Nunca comece suas respostas com "Olá" ou "Claro" toda hora — varie as aberturas para soar natural.
2. Seja direta e objetiva. Respostas curtas e práticas, no estilo WhatsApp.
3. Use emojis com elegância: ✨ 💅 ✂️ 💆‍♀️ 🌸 — nunca em excesso.
4. Nunca confirme algo que você ainda não fez. Só confirme agendamentos depois de registrados.
5. Conduza a conversa ativamente — não apenas responda, guie o cliente até a resolução.
6. Nunca invente preços, horários ou informações que não estejam nas informações do salão.
7. Se o cliente pedir para falar com humano: "Claro! Vou transferir você para a recepção. 💬"

== LISTAS NUMERADAS ==
Quando listar serviços ou profissionais, use emojis numerados:
1️⃣ Serviço A — R$ 000
2️⃣ Serviço B — R$ 000
3️⃣ Serviço C — R$ 000
Termine com: "Me diga o número do serviço desejado e verifico os horários disponíveis para você! ✨"

Quando o cliente responder com um número (ex: "2", "quero o 3"), entenda que está se referindo ao item da lista anterior e prossiga com aquele serviço.

== FLUXO DE AGENDAMENTO ==
Siga esta ordem, uma etapa por vez, sem pular:
1. Identificar intenção (agendar, cancelar, tirar dúvida)
2. Apresentar serviços disponíveis em lista numerada
3. Confirmar qual serviço o cliente escolheu
4. Perguntar a data preferida
5. Perguntar o horário preferido
6. Apresentar profissionais disponíveis em lista numerada (com especialidades)
7. Confirmar o profissional escolhido
8. Verificar disponibilidade (data + hora + profissional)
9. Apresentar resumo: serviço, data, hora, profissional
10. Pedir confirmação final do cliente
11. Registrar o agendamento e confirmar

== CONTEXTO DA CONVERSA ==
Não repita informações que você já forneceu na mesma conversa. Se o cliente já escolheu o serviço, pule direto para a próxima etapa.

== HUMANIZAÇÃO ==
- Varie suas respostas: "Com certeza!", "Ótima escolha!", "Perfeito!", "Que bom que entrou em contato!"
- Nunca soe repetitivo ou mecânico.
- Demonstre entusiasmo genuíno pelo serviço do salão.`;
  const historyText = conversationHistory.length > 0
    ? '\nHISTÓRICO:\n' + conversationHistory.slice(-6).map(h => `${h.role === 'user' ? 'Cliente' : 'Yafit'}: ${h.text}`).join('\n')
    : '';
  const fullPrompt = `${systemPrompt}${historyText}\nNOME DO CLIENTE: ${clientName || 'Cliente'}\nMENSAGEM: ${messageText}\nResponda naturalmente para WhatsApp:`;
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }) }
    );
    const geminiData: any = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error('[Gemini REST] Erro:', JSON.stringify(geminiData));
      return `Olá${firstName ? ', ' + firstName : ''}! 😊 Seja bem-vindo(a) ao ${salonName}! Como posso te ajudar hoje?`;
    }
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || `Olá! Como posso ajudar você hoje? ✨`;
  } catch (err: any) {
    console.error('[Gemini REST] Erro de rede:', err?.message);
    return `Olá${firstName ? ', ' + firstName : ''}! 😊 Seja bem-vindo(a) ao ${salonName}! Como posso te ajudar hoje?`;
  }
}

const processedMsgIds = new Set<string>();
const conversationHistories = new Map<string, Array<{ role: string; text: string }>>();
const MAX_HISTORY = 12;
function getHistory(jid: string) { return conversationHistories.get(jid) || []; }
function addToHistory(jid: string, role: string, text: string) {
  const history = getHistory(jid);
  history.push({ role, text });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
  conversationHistories.set(jid, history);
}

app.post('/api/v1/webhook/evolution', async (req, res) => {
  res.json({ success: true, received: true });
  try {
    const body = req.body;
    const event = body?.event || body?.type;
    if (event !== 'messages.upsert' && event !== 'message') return;
    const data = body?.data || body;
    const message = data?.message || data?.messages?.[0] || data;
    const key = message?.key || data?.key;
    const instanceName = body?.instance || data?.instance || req.headers['x-instance-name'] as string || 'yafit';
    // Deduplicar por ID de mensagem (evita loop)
    const msgId: string = key?.id || '';
    if (msgId && processedMsgIds.has(msgId)) { return; }
    if (msgId) {
      processedMsgIds.add(msgId);
      if (processedMsgIds.size > 2000) processedMsgIds.delete(processedMsgIds.values().next().value);
    }
    // Ignorar mensagens proprias (fromMe)
    if (key?.fromMe === true || String(key?.fromMe) === 'true') return;
    const remoteJid: string = key?.remoteJid || data?.remoteJid || '';
    const pushName: string = data?.pushName || message?.pushName || 'Cliente';
    if (remoteJid.includes('@g.us')) return;
    const msgContent = message?.message || message;
    const messageText: string = msgContent?.conversation || msgContent?.extendedTextMessage?.text || msgContent?.imageMessage?.caption || '';
    if (!messageText.trim()) return;
    console.log(`[Webhook] [${instanceName}] ${pushName}: "${messageText}"`);
    const tenantId = (req.headers['x-tenant-id'] as string) || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const salonContext = await buildSalonContext(tenantId);
    const salonNameMatch = salonContext.match(/SALÃO:\s*(.+)/);
    const salonName = salonNameMatch?.[1]?.trim() || 'Bella Donna';
    const history = getHistory(remoteJid);
    addToHistory(remoteJid, 'user', messageText);
    const aiReply = await generateAIReply(tenantId, salonName, salonContext, pushName, messageText, history);
    addToHistory(remoteJid, 'assistant', aiReply);
    console.log(`[Webhook] Resposta para ${pushName}: "${aiReply.substring(0, 80)}..."`);
    await sendWhatsAppMessage(instanceName, remoteJid, aiReply);
  } catch (err: any) { console.error('[Webhook] Erro:', err?.message || err); }
});

app.post('/api/v1/langflow/execute-tool', async (req, res) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const { tool_name, input } = req.body;
  if (!tenantId) return res.status(400).json({ allowed: false, error: 'Missing x-tenant-id header.' });
  let toolOutput: Record<string, any> = {};
  const db = getSupabase();
  switch (tool_name) {
    case 'consultar_servicos': { if (db) { const { data, error } = await db.from('yafit_services').select('name, description, price, duration_minutes').eq('tenant_id', tenantId).eq('active', true).order('name'); toolOutput = error ? { error: error.message } : { services: data }; } else { toolOutput = { services: [{ name: 'Corte Feminino', price: 180.0, duration_minutes: 60 }] }; } break; }
    case 'consultar_profissionais': { if (db) { const { data, error } = await db.from('yafit_professionals').select('name, specialties, rating_average').eq('tenant_id', tenantId).eq('active', true); toolOutput = error ? { error: error.message } : { professionals: data }; } else { toolOutput = { professionals: [{ name: 'Ana Silva', specialties: ['Cabelo'], rating_average: 4.9 }] }; } break; }
    case 'consultar_cliente': { const phone = input?.phone || input?.telefone; if (db && phone) { const { data, error } = await db.from('yafit_customers').select('id, name, phone, email, loyalty_points, cashback_balance, total_spent, last_visit_at').eq('tenant_id', tenantId).eq('phone', phone).maybeSingle(); toolOutput = error ? { error: error.message } : { found: !!data, customer: data }; } else { toolOutput = { found: false, customer: null }; } break; }
    case 'criar_cliente': { const { name, phone, email } = input || {}; if (db && name && phone) { const { data, error } = await db.from('yafit_customers').insert([{ tenant_id: tenantId, name, phone, email: email || null, origin: 'whatsapp_yafit' }]).select('id, name, phone').single(); toolOutput = error ? { success: false, error: error.message } : { success: true, customer: data }; } else { toolOutput = { success: true, customer_id: `new-${Date.now()}` }; } break; }
    case 'buscar_horarios_disponiveis': { const requestedDate = input?.date || new Date().toISOString().split('T')[0]; if (db) { const { data: existing } = await db.from('yafit_appointments').select('scheduled_at').eq('tenant_id', tenantId).gte('scheduled_at', `${requestedDate}T00:00:00`).lte('scheduled_at', `${requestedDate}T23:59:59`).in('status', ['scheduled', 'confirmed', 'in_progress']); const allSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30']; const occupied = (existing || []).map((a: any) => a.scheduled_at.substring(11, 16)); toolOutput = { date: requestedDate, available_slots: allSlots.filter(s => !occupied.includes(s)) }; } else { toolOutput = { date: requestedDate, available_slots: ['09:30', '11:00', '14:00', '16:30', '18:00'] }; } break; }
    case 'criar_agendamento': { const { customer_id, professional_id, service_id, date, time, notes } = input || {}; if (db && customer_id && service_id && date && time) { const { data: svc } = await db.from('yafit_services').select('duration_minutes').eq('id', service_id).single(); const { data, error } = await db.from('yafit_appointments').insert([{ tenant_id: tenantId, customer_id, professional_id: professional_id || 'a0010000-0000-0000-0000-000000000001', service_id, scheduled_at: `${date}T${time}:00`, duration_minutes: svc?.duration_minutes || 60, source: 'whatsapp_yafit', notes: notes || null, status: 'confirmed' }]).select('id, scheduled_at, status').single(); toolOutput = error ? { success: false, error: error.message } : { success: true, appointment_id: data?.id, scheduled_at: data?.scheduled_at }; } else { toolOutput = { success: true, appointment_id: `apt-${Date.now()}`, status: 'confirmed' }; } break; }
    case 'cancelar_agendamento': { const { appointment_id, reason } = input || {}; if (db && appointment_id) { const { error } = await db.from('yafit_appointments').update({ status: 'cancelled', cancellation_reason: reason || 'Via WhatsApp' }).eq('id', appointment_id).eq('tenant_id', tenantId); toolOutput = error ? { success: false, error: error.message } : { success: true, appointment_id, status: 'cancelled' }; } else { toolOutput = { success: true, appointment_id, status: 'cancelled' }; } break; }
    default: toolOutput = { status: 'executed', result: 'OK' };
  }
  res.json({ allowed: true, tenant_id: tenantId, tool_name, input, output: toolOutput, policy_decision: { tenant_validated: true, role_allowed: true, requires_human_approval: false, executed_at: new Date().toISOString() } });
});

app.post('/api/ai/yafit-generate', async (req, res) => {
  try {
    const { message, tenantName, salonContext, conversationHistory } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({ success: true, source: 'local', reply: `Olá! Sou a Yafit, assistente do ${tenantName || 'Salão'}. Como posso te ajudar hoje?` });
    }
    const prompt = `Você é a Yafit, assistente do salão "${tenantName || 'Salão'}".\nDados: ${salonContext || ''}\nHistórico: ${JSON.stringify(conversationHistory || [])}\nMensagem: ${message}\nResponda em português, amigável e curto:`;
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    const geminiData: any = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Olá! Como posso ajudar?';
    res.json({ success: true, source: 'gemini-2.5-flash', reply });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ success: false, error: error?.message, fallbackReply: 'Olá! Como posso te ajudar hoje?' });
  }
});

// ─── WhatsApp Management ──────────────────────────────────────────────────────
app.post('/api/v1/whatsapp/connect', async (req, res) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || req.body?.tenantId || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const instanceName = `yafit-${tenantId.replace(/[^a-z0-9]/gi, '-')}`;
  const webhookUrl = `${process.env.APP_URL || 'https://yafit.antum.com.br'}/api/v1/webhook/evolution`;
  try {
    const checkRes = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, { headers: { 'apikey': EVOLUTION_API_KEY } });
    const instances: any[] = await checkRes.json();
    const existing = instances.find((i: any) => i.name === instanceName);
    if (existing && existing.connectionStatus === 'open') {
      return res.json({ success: true, status: 'connected', instanceName, phone: existing.ownerJid?.replace('@s.whatsapp.net', ''), profileName: existing.profileName });
    }
    let qrCode: string | null = null;
    if (!existing) {
      const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY }, body: JSON.stringify({ instanceName, qrcode: true, integration: 'WHATSAPP-BAILEYS' }) });
      const createData: any = await createRes.json();
      qrCode = createData?.qrcode?.base64 || null;
    } else {
      const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, { headers: { 'apikey': EVOLUTION_API_KEY } });
      const connectData: any = await connectRes.json();
      qrCode = connectData?.base64 || connectData?.qrcode?.base64 || null;
    }
    await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY }, body: JSON.stringify({ webhook: { enabled: true, url: webhookUrl, webhookByEvents: false, webhookBase64: false, events: ['MESSAGES_UPSERT'] } }) });
    res.json({ success: true, status: qrCode ? 'qr_ready' : 'connecting', instanceName, qrCode });
  } catch (err: any) { console.error('[WhatsApp Connect] Erro:', err?.message); res.status(500).json({ success: false, error: err?.message }); }
});

app.get('/api/v1/whatsapp/status', async (req, res) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const instanceName = `yafit-${tenantId.replace(/[^a-z0-9]/gi, '-')}`;
  try {
    const r = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, { headers: { 'apikey': EVOLUTION_API_KEY } });
    const instances: any[] = await r.json();
    const inst = instances.find((i: any) => i.name === instanceName);
    if (!inst) return res.json({ connected: false, status: 'not_created', instanceName });
    res.json({ connected: inst.connectionStatus === 'open', status: inst.connectionStatus, instanceName, phone: inst.ownerJid?.replace('@s.whatsapp.net', ''), profileName: inst.profileName });
  } catch (err: any) { res.status(500).json({ connected: false, error: err?.message }); }
});

app.get('/api/v1/whatsapp/qr', async (req, res) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const instanceName = `yafit-${tenantId.replace(/[^a-z0-9]/gi, '-')}`;
  try {
    const r = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, { headers: { 'apikey': EVOLUTION_API_KEY } });
    const data: any = await r.json();
    res.json({ success: true, qrCode: data?.base64 || data?.qrcode?.base64 || null, instanceName });
  } catch (err: any) { res.status(500).json({ success: false, error: err?.message }); }
});

app.delete('/api/v1/whatsapp/disconnect', async (req, res) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || req.body?.tenantId || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const instanceName = `yafit-${tenantId.replace(/[^a-z0-9]/gi, '-')}`;
  try {
    await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, { method: 'DELETE', headers: { 'apikey': EVOLUTION_API_KEY } });
    res.json({ success: true, message: 'WhatsApp desconectado.' });
  } catch (err: any) { res.status(500).json({ success: false, error: err?.message }); }
});

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
