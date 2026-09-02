import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Wifi, WifiOff, RefreshCw, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface WhatsAppStatus {
  connected: boolean;
  status: string;
  phone?: string;
  profileName?: string;
  instanceName?: string;
}

interface WhatsAppSettingsProps {
  tenantId: string;
  primaryColor?: string;
}

export const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({ tenantId, primaryColor = '#e11d48' }) => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`/api/v1/whatsapp/status?tenantId=${encodeURIComponent(tenantId)}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      const data: WhatsAppStatus = await r.json();
      setStatus(data);
      if (data.connected) { setQrCode(null); setPolling(false); }
    } catch { /* silencioso */ }
  }, [tenantId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(fetchStatus, 3500);
    return () => clearInterval(interval);
  }, [polling, fetchStatus]);

  const handleConnect = async () => {
    setLoading(true); setError(null); setQrCode(null);
    try {
      const r = await fetch('/api/v1/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ tenantId }),
      });
      const data = await r.json();
      if (data.status === 'connected') { await fetchStatus(); }
      else if (data.qrCode) { setQrCode(data.qrCode); setPolling(true); }
      else { setError('QR Code nao disponivel. Tente novamente em alguns segundos.'); }
    } catch { setError('Erro ao conectar. Verifique a conexao e tente novamente.'); }
    finally { setLoading(false); }
  };

  const handleRefreshQr = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/whatsapp/qr?tenantId=${encodeURIComponent(tenantId)}`, { headers: { 'x-tenant-id': tenantId } });
      const data = await r.json();
      if (data.qrCode) setQrCode(data.qrCode);
    } catch { setError('Erro ao atualizar QR Code.'); }
    finally { setLoading(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp? O atendimento automatico sera pausado.')) return;
    setDisconnecting(true);
    try {
      await fetch('/api/v1/whatsapp/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ tenantId }),
      });
      setQrCode(null); setPolling(false); await fetchStatus();
    } catch { setError('Erro ao desconectar.'); }
    finally { setDisconnecting(false); }
  };

  const isConnected = status?.connected;
  const phone = status?.phone ? status.phone.replace(/^55/, '') : null;
  const formattedPhone = phone ? (phone.length === 11 ? `(${phone.slice(0,2)}) ${phone.slice(2,7)}-${phone.slice(7)}` : phone) : null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
        <Smartphone className="w-4 h-4 text-green-600" />
        <h3 className="text-sm font-bold text-neutral-900">Atendimento via WhatsApp</h3>
        {isConnected && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> CONECTADO
          </span>
        )}
        {!isConnected && status && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
            <WifiOff className="w-3 h-3" /> DESCONECTADO
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {isConnected && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-800">{status?.profileName || 'WhatsApp'} conectado</p>
              {formattedPhone && <p className="text-[11px] text-green-700 mt-0.5">Numero: {formattedPhone}</p>}
              <p className="text-[10px] text-green-600 mt-0.5">A Yafit esta respondendo automaticamente via IA</p>
            </div>
          </div>
          <button onClick={handleDisconnect} disabled={disconnecting}
            className="w-full py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <WifiOff className="w-3 h-3" />}
            Desconectar WhatsApp
          </button>
        </div>
      )}

      {!isConnected && !qrCode && (
        <div className="space-y-3">
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
            <p className="font-bold text-neutral-800">Como conectar:</p>
            <p>1. Clique em <strong>"Gerar QR Code"</strong> abaixo</p>
            <p>2. Abra o WhatsApp no celular do salao</p>
            <p>3. Va em <strong>Aparelhos Conectados → Conectar aparelho</strong></p>
            <p>4. Escaneie o QR Code na tela</p>
            <p>5. Pronto! A Yafit comecara a responder automaticamente</p>
          </div>
          <button onClick={handleConnect} disabled={loading}
            className="w-full py-3 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: primaryColor }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            {loading ? 'Gerando QR Code...' : 'Conectar WhatsApp — Gerar QR Code'}
          </button>
        </div>
      )}

      {qrCode && !isConnected && (
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <p className="text-xs font-bold text-neutral-700 text-center">Escaneie com o WhatsApp do salao</p>
            <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-xs">
              <img src={qrCode} alt="QR Code WhatsApp" className="w-52 h-52 object-contain" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Aguardando conexao...
            </div>
            <p className="text-[10px] text-neutral-400 text-center">O QR Code expira em ~60 segundos.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefreshQr} disabled={loading}
              className="flex-1 py-2.5 text-xs font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Atualizar QR
            </button>
            <button onClick={() => { setQrCode(null); setPolling(false); }}
              className="py-2.5 px-4 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!qrCode && (
        <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-100">
          Certifique-se que o celular tem o WhatsApp atualizado e menos de 4 aparelhos conectados.
        </div>
      )}
    </div>
  );
};
