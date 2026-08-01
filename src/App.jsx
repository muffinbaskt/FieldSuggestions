import { useState } from "react";
import { supabase } from "./supabaseClient";

async function submitFieldRequest(text, reportedBy) {
  try {
    const { error } = await supabase.from("field_requests").insert({
      text,
      reported_by: reportedBy || null,
    });
    return { ok: !error, error: error ? error.message : null };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

export default function App() {
  const [text, setText] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await submitFieldRequest(text.trim(), reportedBy.trim());
    setSubmitting(false);
    if (result.ok) {
      setSent(true);
    } else {
      setError("Couldn't send that — check your connection and try again.");
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-slate-100 font-semibold text-xl mb-2">Sent</h1>
          <p className="text-slate-400 text-sm mb-6">
            Your request has been sent. Thanks for letting us know.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setText("");
              setReportedBy("");
            }}
            className="text-sm bg-amber-500 text-slate-950 font-semibold rounded-md px-4 py-2 hover:bg-amber-400"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-slate-200 font-semibold text-lg mb-1 text-center">
          Send a request
        </h1>
        <p className="text-sm text-slate-500 mb-5 text-center">
          Need something, or want to flag an issue? Send a quick note — no login needed.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What do you need?"
          rows={5}
          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500/60 resize-none"
        />
        <input
          value={reportedBy}
          onChange={(e) => setReportedBy(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
        />
        {error && <p className="text-xs text-red-400 mb-3 text-center">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          className="w-full text-sm bg-amber-500 text-slate-950 font-semibold rounded-md py-2.5 hover:bg-amber-400 disabled:opacity-40"
        >
          {submitting ? "Sending..." : "Send request"}
        </button>
      </div>
    </div>
  );
}
