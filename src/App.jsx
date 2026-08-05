import { useState } from "react";
import { supabase } from "./supabaseClient";

// Swap this out for the real wording whenever you have it — shown in red
// right above the submit button, same as sketched.
const DISCLAIMER_TEXT = `This is not a tool/material/supplies request form.
This is for suggestions on how tools and supplies can be sent to the field in a way that better accommodates the field method of work/organization.
There is no guarantee that these methods will be implemented due to constraints on this end.
THIS IS NOT AN OFFICIAL COMPANY FORM.
This sends directly back to me (a small piss-ant worker) at Rigging Loft.
Thank you for any suggestions and/or ideas.
Stay safe.`;

const GANG_OPTIONS = ["Raising", "Bolt Up", "Plumb up", "Welding", "Safety", "Misc", "Unassigned"];

async function submitFieldRequest(payload) {
  try {
    const { error } = await supabase.from("field_requests").insert(payload);
    return { ok: !error, error: error ? error.message : null };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

// Same bright little chime used in the main Riggy app when something saves.
let sharedAudioCtx = null;
function getAudioCtx() {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}
function playSaveChime() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.16, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playNote(880, now, 0.12);
    playNote(1318.51, now + 0.09, 0.22);
  } catch {
    // Audio not available/blocked — fine to just skip it
  }
}

export default function App() {
  const [jobOrLocation, setJobOrLocation] = useState("");
  const [name, setName] = useState("");
  const [gang, setGang] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = jobOrLocation.trim().length > 0 && text.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    playSaveChime();
    const result = await submitFieldRequest({
      job_or_location: jobOrLocation.trim(),
      reported_by: name.trim() || null,
      gang: gang || null,
      contact_email: contactEmail.trim() || null,
      text: text.trim(),
    });
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
            Your suggestion has been sent. Thanks for letting us know.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setJobOrLocation("");
              setName("");
              setGang("");
              setContactEmail("");
              setText("");
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="text-slate-200 font-semibold text-lg mb-5 text-center">
          Send a suggestion
        </h1>

        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Job # or location <span className="text-amber-400">*</span>
          </label>
          <input
            value={jobOrLocation}
            onChange={(e) => setJobOrLocation(e.target.value)}
            placeholder="e.g. 4990 or Hard Rock"
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Name <span className="text-slate-600">(optional)</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Gang <span className="text-slate-600">(optional)</span>
          </label>
          <select
            value={gang}
            onChange={(e) => setGang(e.target.value)}
            className="w-full appearance-none bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
          >
            <option value="">Select gang...</option>
            {GANG_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Contact email for response <span className="text-slate-600">(optional)</span>
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's the suggestion?"
          rows={6}
          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500/60 resize-none"
        />

        <p className="text-xs text-red-400 mb-4 text-left whitespace-pre-line leading-relaxed">
          {DISCLAIMER_TEXT}
        </p>

        {error && <p className="text-xs text-red-400 mb-3 text-center">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full text-sm bg-amber-500 text-slate-950 font-semibold rounded-md py-2.5 hover:bg-amber-400 disabled:opacity-40"
        >
          {submitting ? "Sending..." : "Send suggestion"}
        </button>
      </div>
    </div>
  );
}
