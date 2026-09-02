import React, { useState } from 'react';
import { SUPABASE_SQL_SCHEMA } from '../../sql/supabaseSchema';
import { Database, ShieldCheck, Copy, Check, Terminal, Layers, Sparkles } from 'lucide-react';

export const SupabaseSqlView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Supabase SQL Schema & Multi-Tenant RLS
            </h1>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              RLS Isolado
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Schema PostgreSQL otimizado com isolamento nativo por <code className="font-mono text-emerald-700">tenant_id</code> via Row Level Security (RLS).
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'SQL Copiado com Sucesso!' : 'Copiar Script SQL'}</span>
        </button>
      </div>

      {/* RLS Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" /> Isolamento Multi-Tenant
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Cada tabela contém <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">tenant_id UUID REFERENCES tenants(id)</code> com restrição de acesso por JWT token via <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">auth.jwt() -&gt;&gt; 'tenant_id'</code>.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
            <Layers className="w-4 h-4" /> Índices de Alta Performance
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Índices compostos em <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">(tenant_id, scheduled_at)</code>, garantindo consultas de agenda ultrarrápidas mesmo com milhões de registros.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
            <Sparkles className="w-4 h-4" /> IA & Triggers Automáticos
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Tabelas preparadas para armazenar histórico de conversas do Agente IA (Yafit), webhooks de Langflow e rastreamento de consentimentos LGPD.
          </p>
        </div>
      </div>

      {/* SQL Code View */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden">
        <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-neutral-400 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-neutral-200">supabase_schema_yafit.sql</span>
          </div>
          <span className="font-mono text-[10px]">PostgreSQL 15+ / Supabase</span>
        </div>

        <div className="p-4 max-h-[500px] overflow-y-auto">
          <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </div>
    </div>
  );
};
