"use client";

import { useState, useCallback } from "react";
import {
  DEMO_TRANSCRIPTS,
  processTranscript,
  type ProcessedResult,
} from "@/lib/demo-data";

// ─── Tiny icon components ────────────────────────────────────────────
function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3a2.25 2.25 0 0 0-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );
}

// ─── Tab Button ──────────────────────────────────────────────────────
function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        active
          ? "bg-accent text-black"
          : "text-muted hover:text-foreground hover:bg-card-border/30"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-card-border/40 hover:bg-card-border text-muted hover:text-foreground transition-all"
    >
      {copied ? (
        <>
          <CheckIcon className="w-3.5 h-3.5 text-success" /> Copied
        </>
      ) : (
        <>
          <ClipboardIcon className="w-3.5 h-3.5" /> Copy
        </>
      )}
    </button>
  );
}

// ─── Vibe Badge ──────────────────────────────────────────────────────
function VibeBadge({ vibe }: { vibe: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    stressed: { bg: "bg-red-500/10", text: "text-red-400", label: "Stressed / Hurried" },
    relaxed: { bg: "bg-green-500/10", text: "text-green-400", label: "Relaxed / Satisfied" },
    neutral: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Neutral" },
  };
  const c = config[vibe] ?? config.neutral;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: "bg-green-500/10", text: "text-green-400", label: "Completed" },
    in_progress: { bg: "bg-amber-500/10", text: "text-amber-400", label: "In Progress" },
    follow_up_needed: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Follow-up Needed" },
  };
  const c = config[status] ?? config.completed;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ─── Processing Dots ─────────────────────────────────────────────────
function ProcessingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-20">
      <div className="w-2.5 h-2.5 rounded-full bg-accent dot-1" />
      <div className="w-2.5 h-2.5 rounded-full bg-accent dot-2" />
      <div className="w-2.5 h-2.5 rounded-full bg-accent dot-3" />
      <span className="ml-3 text-muted text-sm">The Site Boss is processing your memo...</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"extraction" | "email" | "json">("extraction");

  const handleProcess = useCallback(() => {
    if (!transcript.trim()) return;
    setProcessing(true);
    setResult(null);
    // Simulate AI processing time
    setTimeout(() => {
      setResult(processTranscript(transcript));
      setProcessing(false);
      setActiveTab("extraction");
    }, 1800);
  }, [transcript]);

  const loadDemo = useCallback((text: string) => {
    setTranscript(text);
    setResult(null);
  }, []);

  return (
    <div className="min-h-full">
      {/* ─── Header ───────────────────────────────────────────── */}
      <header className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <BoltIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Site Boss</h1>
              <p className="text-xs text-muted">Voice memos → Business output</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted bg-card-border/30 px-3 py-1.5 rounded-full">
              Demo Mode
            </span>
          </div>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-card-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-muted border border-accent/20 text-accent text-xs font-medium mb-6">
            <MicIcon className="w-3.5 h-3.5" />
            Built for UK Tradespeople
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Record it on the roof.
            <br />
            <span className="text-accent">We&apos;ll sort the rest.</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto text-base sm:text-lg">
            Dump a voice memo after every job. Site Boss extracts clients, costs,
            materials and action items — then drafts professional emails and
            pushes structured data to your systems.
          </p>
        </div>
      </section>

      {/* ─── Main App ─────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* ─── Left: Input ──────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Voice Memo Transcript
              </h3>
              <span className="text-xs text-muted">
                {transcript.length > 0
                  ? `${transcript.split(/\s+/).filter(Boolean).length} words`
                  : "Paste or pick a demo"}
              </span>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                setResult(null);
              }}
              placeholder="Paste a voice memo transcript here... or try one of the demos below."
              className="w-full h-48 sm:h-56 p-4 rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted/50 resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all text-sm leading-relaxed"
            />

            {/* Demo buttons */}
            <div className="space-y-2">
              <p className="text-xs text-muted font-medium">Try a demo:</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_TRANSCRIPTS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => loadDemo(d.transcript)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-card-border text-sm hover:border-accent/40 hover:bg-accent-muted transition-all"
                  >
                    <span>{d.icon}</span>
                    <span className="text-muted group-hover:text-foreground">
                      {d.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Process button */}
            <button
              onClick={handleProcess}
              disabled={!transcript.trim() || processing}
              className="w-full py-3 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <BoltIcon className="w-4 h-4" />
                  Run Site Boss
                </>
              )}
            </button>

            {/* How it works */}
            <div className="rounded-xl bg-card border border-card-border p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                How It Works
              </h4>
              <div className="space-y-2 text-sm text-muted">
                {[
                  ["1.", "Record a voice memo after every job"],
                  ["2.", "AI extracts clients, costs, materials & actions"],
                  ["3.", "\"Vibes\" filter detects your tone for email style"],
                  ["4.", "Auto-drafts professional client emails"],
                  ["5.", "Pushes structured JSON to Firebase / invoicing"],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <span className="text-accent font-bold mt-0.5">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right: Output ─────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Site Boss Output
              </h3>
              {result && (
                <div className="pulse-amber w-2 h-2 rounded-full bg-accent" />
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-card rounded-xl border border-card-border">
              <Tab active={activeTab === "extraction"} onClick={() => setActiveTab("extraction")}>
                Extraction
              </Tab>
              <Tab active={activeTab === "email"} onClick={() => setActiveTab("email")}>
                Email Draft
              </Tab>
              <Tab active={activeTab === "json"} onClick={() => setActiveTab("json")}>
                JSON
              </Tab>
            </div>

            {/* Output panels */}
            <div className="rounded-xl bg-card border border-card-border min-h-[400px] overflow-hidden">
              {processing ? (
                <ProcessingDots />
              ) : !result ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted text-sm">
                  <MicIcon className="w-10 h-10 mb-3 opacity-30" />
                  <p>Paste a transcript and hit &quot;Run Site Boss&quot;</p>
                  <p className="text-xs mt-1">or try one of the demos</p>
                </div>
              ) : (
                <div className="p-4 sm:p-5">
                  {/* ─── Extraction Tab ────────────────────── */}
                  {activeTab === "extraction" && (
                    <div className="space-y-5">
                      {/* Header badges */}
                      <div className="flex flex-wrap gap-2">
                        <VibeBadge vibe={result.extracted.vibe} />
                        <StatusBadge status={result.extracted.status} />
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-card-border/40 text-foreground">
                          {result.extracted.job_type}
                        </span>
                      </div>

                      {/* Client */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Client</h4>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-muted">Name: </span>
                            <span className="font-medium">{result.extracted.client_name}</span>
                          </div>
                          <div>
                            <span className="text-muted">Location: </span>
                            <span className="font-medium">{result.extracted.client_location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Financials */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Financials</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            ["Quoted", result.extracted.financials.quoted],
                            ["Materials", result.extracted.financials.materials_cost],
                            ["Labour", result.extracted.labor_hours],
                          ].map(([label, value]) => (
                            <div key={label} className="bg-background rounded-lg p-3 text-center">
                              <div className="text-xs text-muted mb-1">{label}</div>
                              <div className="text-sm font-semibold">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Materials */}
                      {result.extracted.materials.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Materials</h4>
                          <div className="space-y-1.5">
                            {result.extracted.materials.map((m, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between bg-background rounded-lg px-3 py-2 text-sm"
                              >
                                <span>{m.item}</span>
                                <span className="text-muted font-mono text-xs">x{m.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Action Items</h4>
                        <div className="space-y-1.5">
                          {result.extracted.action_items.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 bg-background rounded-lg px-3 py-2 text-sm"
                            >
                              <span className="text-accent mt-0.5">→</span>
                              <span className="capitalize">{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── Email Tab ─────────────────────────── */}
                  {activeTab === "email" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                            Auto-Generated Email
                          </h4>
                          <VibeBadge vibe={result.extracted.vibe} />
                        </div>
                        <CopyButton text={result.email_draft} />
                      </div>
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 bg-background rounded-lg p-4 font-sans">
                        {result.email_draft}
                      </pre>
                    </div>
                  )}

                  {/* ─── JSON Tab ──────────────────────────── */}
                  {activeTab === "json" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Firebase / API Ready
                        </h4>
                        <CopyButton text={result.json_output} />
                      </div>
                      <pre className="whitespace-pre-wrap text-xs leading-relaxed text-green-400 bg-background rounded-lg p-4 font-mono overflow-auto max-h-[500px]">
                        {result.json_output}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Features Grid ──────────────────────────────────── */}
        <div className="mt-16 grid sm:grid-cols-3 gap-4">
          {[
            {
              title: "Voice-First",
              desc: "Record at Greggs, on the roof, in the van. We handle the mess.",
              icon: "1",
            },
            {
              title: "Smart Emails",
              desc: "Tone-aware drafts: formal when you're stressed, friendly when it's all good.",
              icon: "2",
            },
            {
              title: "System Ready",
              desc: "Clean JSON output for Firebase, Xero, QuickBooks, or Lemon Squeezy.",
              icon: "3",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-card border border-card-border p-5 space-y-2"
            >
              <span className="w-8 h-8 rounded-lg bg-accent text-black flex items-center justify-center text-sm font-bold">{f.icon}</span>
              <h4 className="font-semibold text-sm">{f.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-card-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-muted">
          <span>Site Boss — Proof of Concept</span>
          <span>Customise this for your trade</span>
        </div>
      </footer>
    </div>
  );
}
