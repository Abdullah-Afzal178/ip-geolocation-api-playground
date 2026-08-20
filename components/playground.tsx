"use client";

import { useEffect, useMemo, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import { Check, ChevronDown, Copy, ExternalLink, Globe2, LoaderCircle, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { ENDPOINT_IDS, ENDPOINTS, buildRequestDetails, type CodeLanguage, type EndpointId, type PlaygroundRequestPayload, type RequestParams } from "@/lib/api-config";

type PlaygroundResponse = { endpointId: EndpointId; maskedUrl: string; curlCommand: string; codeSnippets: Record<CodeLanguage, string>; statusCode: number; durationMs: number; responseHeaders: Record<string, string>; response: unknown; error?: string; message?: string };
type BuilderMode = "request" | "shape";
const initialEndpoint = ENDPOINT_IDS[0];

function initialParams(id: EndpointId): RequestParams { return Object.fromEntries(Object.entries(ENDPOINTS[id].defaults).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])); }
function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function CodeBlock({ code, language }: { code: string; language: string }) {
  const highlighted = useMemo(() => Prism.languages[language] ? Prism.highlight(code, Prism.languages[language], language) : escapeHtml(code), [code, language]);
  return <pre className={`language-${language}`} suppressHydrationWarning><code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>;
}
export function Playground() {
  const [endpointId, setEndpointId] = useState<EndpointId>(initialEndpoint);
  const [params, setParams] = useState<RequestParams>(() => initialParams(initialEndpoint));
  const [response, setResponse] = useState<PlaygroundResponse | null>(null);
  const [builderMode, setBuilderMode] = useState<BuilderMode>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [optionSearch, setOptionSearch] = useState<Record<string, string>>({});
  const config = ENDPOINTS[endpointId];
  const requestSections = useMemo(() => config.paramSections.filter((section) => section.group === "request"), [config]);
  const shapeSections = useMemo(() => config.paramSections.filter((section) => section.group === "shape"), [config]);
  const hasShape = shapeSections.length > 0;
  const sections = builderMode === "shape" ? shapeSections : requestSections;

  useEffect(() => { setParams(initialParams(endpointId)); setResponse(null); setClientError(null); setBuilderMode("request"); setOptionSearch({}); }, [endpointId]);
  useEffect(() => { if (!copiedKey) return; const timer = window.setTimeout(() => setCopiedKey(null), 1800); return () => window.clearTimeout(timer); }, [copiedKey]);
  const preview = useMemo(() => buildRequestDetails(endpointId, params, "YOUR_API_KEY"), [endpointId, params]);
  const maskedUrl = response?.maskedUrl ?? preview.maskedUrl;
  const raw = response ? JSON.stringify(response.response ?? {}, null, 2) : '{\n  "message": "Send a request to inspect the JSON response."\n}';

  function updateParam(key: string, value: string) { setParams((current) => ({ ...current, [key]: value })); }
  function toggleArray(key: string, value: string) { setParams((current) => { const values = Array.isArray(current[key]) ? current[key] : []; return { ...current, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] }; }); }
  async function copy(key: string, text: string) { await navigator.clipboard.writeText(text); setCopiedKey(key); }
  function reset() { setParams(initialParams(endpointId)); setResponse(null); setClientError(null); setOptionSearch({}); }
  async function sendRequest() {
    setIsLoading(true); setClientError(null);
    const payload: PlaygroundRequestPayload = { endpointId, params };
    try { const res = await fetch("/api/playground", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const data = (await res.json()) as PlaygroundResponse; setResponse(data); if (!res.ok && data.message) setClientError(data.message); }
    catch (error) { setResponse(null); setClientError(error instanceof Error ? error.message : "The request could not be completed."); }
    finally { setIsLoading(false); }
  }

  return <main className="playground-shell">
    <header className="app-header">
      <a className="app-brand" href="#"><span><Globe2 size={19} /></span><b>IPGeolocation.io</b><i />API Playground</a>
      <div className="header-actions"><a href="https://ipgeolocation.io" target="_blank" rel="noreferrer">Powered by ipgeolocation.io <ExternalLink size={14} /></a></div>
    </header>
    <nav className="endpoint-nav" aria-label="API endpoints"><span>Endpoint</span><div>{ENDPOINT_IDS.map((id) => <button key={id} className={endpointId === id ? "active" : ""} onClick={() => setEndpointId(id)}>{ENDPOINTS[id].label}<small>GET</small></button>)}</div></nav>
    <div className="workspace">
      <aside className="request-pane">
        <div className="pane-title"><div><span className="kicker">Request</span><h1>Build your request</h1></div><button className="icon-button" onClick={reset} title="Reset request"><RotateCcw size={16} /></button></div>
        <label className="field endpoint-select"><span>Endpoint</span><div className="select-wrap"><select value={endpointId} onChange={(e) => setEndpointId(e.target.value as EndpointId)}>{ENDPOINT_IDS.map((id) => <option key={id} value={id}>{ENDPOINTS[id].label}</option>)}</select><ChevronDown size={16} /></div></label>
        <div className="endpoint-summary"><div><b>GET</b><code>{new URL(config.path).pathname}</code></div><p>{config.summary}</p></div>
        {hasShape && <div className="mode-tabs"><button className={builderMode === "request" ? "active" : ""} onClick={() => setBuilderMode("request")}>Request</button><button className={builderMode === "shape" ? "active" : ""} onClick={() => setBuilderMode("shape")}>Shape response</button></div>}
        <div className="sections">{sections.map((section, sectionIndex) => <section className="parameter-section" key={section.title}>
          <div className="section-heading"><span>{sectionIndex + 1}</span><div><h2>{section.title}</h2>{section.description && <p>{section.description}</p>}</div></div>
          <div className="field-grid">{section.fields.map((field) => {
            const value = params[field.key] ?? (field.type === "checkbox-group" ? [] : "");
            if (field.type === "checkbox-group") {
              const query = optionSearch[field.key]?.toLowerCase() ?? ""; const filtered = field.options.filter((option) => option.value.toLowerCase().includes(query)); const count = Array.isArray(value) ? value.length : 0;
              return <details className="option-picker" key={field.key}><summary><span><b>{field.label}</b><small>{field.hint}</small></span><em>{count ? `${count} selected` : "Default"}</em><ChevronDown size={16} /></summary><div className="option-popover"><input aria-label={`Search ${field.label}`} value={optionSearch[field.key] ?? ""} onChange={(e) => setOptionSearch((current) => ({ ...current, [field.key]: e.target.value }))} placeholder="Search options…" /><div>{filtered.map((option) => { const checked = Array.isArray(value) && value.includes(option.value); return <label key={option.value} className={checked ? "checked" : ""}><input type="checkbox" checked={checked} onChange={() => toggleArray(field.key, option.value)} /><span><code>{option.value}</code>{option.description && <small>{option.description}</small>}</span></label>; })}</div></div></details>;
            }
            if (field.type === "select") return <label className="field" key={field.key}><span>{field.label}</span><div className="select-wrap"><select value={String(value)} onChange={(e) => updateParam(field.key, e.target.value)}>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={16} /></div>{field.hint && <small>{field.hint}</small>}</label>;
            if (field.type === "textarea") return <label className="field wide" key={field.key}><span>{field.label}</span><textarea rows={field.rows ?? 4} value={String(value)} onChange={(e) => updateParam(field.key, e.target.value)} placeholder={field.placeholder} />{field.hint && <small>{field.hint}</small>}</label>;
            return <label className={`field ${field.key === "excludes" ? "wide" : ""}`} key={field.key}><span>{field.label}</span><input type={field.type} value={String(value)} onChange={(e) => updateParam(field.key, e.target.value)} placeholder={field.placeholder} />{field.hint && <small>{field.hint}</small>}</label>;
          })}</div>
        </section>)}</div>
        <div className="request-actions"><div className="privacy"><ShieldCheck size={15} /><span>Your API key stays server-side</span></div><button className="send-button" onClick={sendRequest} disabled={isLoading}>{isLoading ? <LoaderCircle className="spin" size={17} /> : <Play size={16} fill="currentColor" />}{isLoading ? "Sending…" : "Send request"}</button></div>
      </aside>
      <section className="response-pane">
        <div className="response-topline"><div><span className="kicker">Response</span><h2>Inspect the result</h2></div><div className="metrics"><span className={`status ${response?.statusCode && response.statusCode >= 200 && response.statusCode < 300 ? "success" : ""}`}><i />{response?.statusCode ?? "Pending"}</span><span>Time <b>{response ? `${response.durationMs} ms` : "—"}</b></span><span>Credits <b>{response?.responseHeaders?.["x-credits-charged"] || "—"}</b></span></div></div>
        <div className="url-bar"><span>Request URL</span><div><code>{maskedUrl}</code><button onClick={() => copy("url", maskedUrl)}>{copiedKey === "url" ? <Check size={16} /> : <Copy size={16} />}<span>{copiedKey === "url" ? "Copied" : "Copy URL"}</span></button></div></div>
        {clientError && <div className="error-banner"><b>{response?.error ?? "Request failed"}</b><span>{clientError}</span></div>}
        <div className="response-tabs"><strong>Raw JSON</strong><button className="copy-response" onClick={() => copy("output", raw)}>{copiedKey === "output" ? <Check size={16} /> : <Copy size={16} />}{copiedKey === "output" ? "Copied" : "Copy JSON"}</button></div>
        <div className="output"><CodeBlock code={raw} language="json" /></div>
      </section>
    </div>
  </main>;
}
