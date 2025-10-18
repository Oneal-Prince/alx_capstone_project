import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * EditorRunner
 * Props:
 *  - html, css, js: strings (user code)
 *  - externalResources?: string[] (optional CDN scripts/styles)
 */
export default function EditorRunner({
  html = "",
  css = "",
  js = "",
  externalResources = []
}) {
  const [srcDoc, setSrcDoc] = useState("");
  const [isRunning, setIsRunning] = useState(false) 
    const [isLoading, setIsLoading] = useState(false);
  const [consoleLines, setConsoleLines] = useState([]); // {id, type, text}
  const [runtimeError, setRuntimeError] = useState(null);
  const [iframeKey, setIframeKey] = useState(0); // forces iframe remount (used by Stop)
  const iframeRef = useRef(null);

  // Limit console entries
  const MAX_LOGS = 300;

  // Escape closing script tags so user's content doesn't prematurely close injected scripts
  const escapeScriptTag = (s = "") => String(s).replace(/<\/script>/gi, "<\\/script>");

  const buildSrcDoc = useCallback(() => {
    // resources injection
    const resourceTags = (externalResources || [])
      .map((url) => {
        const u = String(url).trim();
        if (!u) return "";
        if (u.match(/\.(css)(\?|$)/i) || u.startsWith("https://fonts.googleapis.com")) {
          return `<link rel="stylesheet" href="${u}">`;
            } else {
          return `<script src="${u}" defer></script>`;
        }
      })
      .join("\n");

    const safeCss = escapeScriptTag(css);
    const safeHtml = escapeScriptTag(html);
    const safeJs = escapeScriptTag(js);

    // helper script: captures console & errors and posts to parent
    const helperScript = `
(function () {
  function send(type, payload) {
    try { window.parent.postMessage({ source: 'codepen-sandbox', type: type, payload: payload }, '*'); } catch (e) {}
  }

  ['log','info','warn','error'].forEach(function(level){
   const orig = console[level];
    console[level] = function () {
      try {
        const args = Array.from(arguments).map(function(a){
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch(e) { return String(a); }
        });
        send('console', { level: level, args: args });
      } catch(e){}
      try { orig && orig.apply(console, arguments); } catch(e){}
    };
  });

  window.addEventListener('error', function(ev){
    send('runtime-error', { message: ev.message, filename: ev.filename, lineno: ev.lineno, colno: ev.colno });
  });

  window.addEventListener('unhandledrejection', function(ev){
    try {
      const reason = ev.reason && ev.reason.message ? ev.reason.message : (typeof ev.reason === 'string' ? ev.reason : JSON.stringify(ev.reason));
      send('runtime-error', { message: reason });
       } catch(e){}
  });

  send('sandbox-ready', { ts: Date.now() });
})();
`;

    // Wrap user JS in try/catch to forward synchronous errors
    const userJSSafe = `
try {
${safeJs}
} catch (e) {
  try { window.parent.postMessage({ source: 'codepen-sandbox', type: 'runtime-error', payload: { message: e && e.message ? e.message : String(e) } }, '*'); } catch (err) {}
}
`;

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  ${resourceTags}
  <style>${safeCss}</style>
</head>
<body>
  ${safeHtml}
  <script>${helperScript}<\/script>
  <script>${userJSSafe}<\/script>
</body>
</html>`;
  }, [html, css, js, externalResources]);

  // Message listener: receive console logs / errors from iframe
  useEffect(() => {
    function onMessage(e) {
      const d = e.data;
      if (!d || d.source !== "codepen-sandbox") return;
      if (d.type === "console") {
        const { level, args } = d.payload || {};
         const text = (args || []).join(" ");
        setConsoleLines((prev) => {
          const next = [...prev, { id: Date.now() + Math.random(), type: level || "log", text }];
          if (next.length > MAX_LOGS) next.splice(0, next.length - MAX_LOGS);
          return next;
        });
      } else if (d.type === "runtime-error") {
        const { message } = d.payload || {};
        const msg = message || "Runtime error";
        setRuntimeError(msg);
        setConsoleLines((prev) => {
          const next = [...prev, { id: Date.now() + Math.random(), type: "error", text: msg }];
          if (next.length > MAX_LOGS) next.splice(0, next.length - MAX_LOGS);
          return next;
        });
      } else if (d.type === "sandbox-ready") {
        // optional: show ready state
      }
    }
  window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Called when iframe finishes load
  const onIframeLoad = () => {
    setIsLoading(false);
    setIsRunning(true);
  };

  // Run the code: builds srcDoc and sets it
  const handleRun = useCallback(() => {
    setConsoleLines([]);
    setRuntimeError(null);
    setIsLoading(true);
    const doc = buildSrcDoc();
    setSrcDoc(doc);
    // focus attempt
    setTimeout(() => {
    try { iframeRef.current && iframeRef.current.contentWindow && iframeRef.current.contentWindow.focus(); } catch (e) {}
    }, 200);
  }, [buildSrcDoc]);

  // Stop: destroy iframe by bumping key and clear state
  const handleStop = () => {
    // remount iframe to forcibly stop scripts
    setIframeKey((k) => k + 1);
    setSrcDoc(""); // blank doc
    setIsLoading(false);
    setIsRunning(false);
    setConsoleLines((prev) => [...prev, { id: Date.now() + Math.random(), type: "info", text: "[Stopped]" }]);
  };

  // Download current srcDoc as standalone HTML file
  const handleDownload = () => {
    if (!srcDoc) return;
     const blob = new Blob([srcDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pen.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to Run
  useEffect(() => {
    function onKey(e) {
      const isMeta = e.ctrlKey || e.metaKey;
      if (isMeta && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    }
     window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRun]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Controls */}
      <div className="flex items-center gap-2 p-2 border-b">
        <button
          onClick={handleRun}
          disabled={isLoading}
          className={`px-3 py-1 rounded-md text-sm font-medium ${isLoading ? "bg-indigo-300 text-white cursor-wait opacity-70" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
          aria-label="Run (Ctrl/Cmd+Enter)"
        >
          {isLoading ? "Running…" : "Run"}
        </button>
          <button
          onClick={handleStop}
          className="px-3 py-1 rounded-md text-sm font-medium border bg-white/5 hover:bg-white/10"
          title="Stop (kill running code)"
        >
          Stop
        </button>

        <button
          onClick={handleDownload}
          className="px-3 py-1 rounded-md text-sm font-medium border bg-white/5 cursor-pointer hover:bg-white/10"
        >
          Download
        </button>

        <div className="ml-auto text-sm text-gray-500">
          {isRunning ? "Last run: active" : "Not run yet"}
        </div>
      </div>
       {/* Main area: preview + console */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 h-0">
        {/* Preview */}
        <div className="col-span-1 border rounded-md overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium">Preview</div>
          <div className="flex-1 bg-white">
            <iframe
              key={iframeKey} // remounts when key changes
              ref={iframeRef}
              title="live-preview"
              srcDoc={srcDoc}
              onLoad={onIframeLoad}
              sandbox="allow-scripts allow-forms" // no allow-same-origin for better isolation
              className="w-full h-full border-0"
            />
          </div>
        </div>
          {/* Console */}
        <div className="col-span-1 flex flex-col border rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium">Console</div>
          <div className="flex-1 p-3 bg-black text-white font-mono text-sm overflow-auto">
            {consoleLines.length === 0 && <div className="text-gray-400">Console output will appear here</div>}
            {consoleLines.map((line) => (
              <div key={line.id} className={`mb-1 ${line.type === "error" ? "text-red-400" : line.type === "warn" ? "text-yellow-300" : "text-white"}`}>
                <span className="text-gray-500 mr-2">[{line.type}]</span>
                <span>{line.text}</span>
              </div>
            ))}
            {runtimeError && <div className="mt-2 text-red-400">Runtime Error: {String(runtimeError)}</div>}
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500">
            Tip: press <kbd className="px-1 py-0.5 border rounded bg-white/5">Ctrl</kbd>/<kbd className="px-1 py-0.5 border rounded bg-white/5">Cmd</kbd> + <kbd className="px-1 py-0.5 border rounded bg-white/5">Enter</kbd> to Run.
          </div>
        </div>
      </div>
    </div>
  );
  }