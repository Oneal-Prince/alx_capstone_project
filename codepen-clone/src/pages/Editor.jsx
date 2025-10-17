import React, { useEffect, useState } from "react";



export default function Editor() {
  const [html, setHtml] = useState("<div class='app'><h1>Hello World</h1></div>");
  const [css, setCss] = useState("body{font-family:Inter,system-ui;}.app{padding:16px;}h1{color:#0f172a}");
  const [js, setJs] = useState("console.log('Hello from user JS');");

  // optional: autosave draft to localStorage
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("draft", JSON.stringify({ html, css, js, updated: Date.now() }));
    }, 1000);
    return () => clearTimeout(t);
  }, [html, css, js]);

  // load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("draft");
      if (raw) {
          const parsed = JSON.parse(raw);
        if (parsed.html) setHtml(parsed.html);
        if (parsed.css) setCss(parsed.css);
        if (parsed.js) setJs(parsed.js);
      }
    } catch (e) {}
  }, []);

  return (
    <div className="h-screen grid grid-rows-[auto_1fr]">
      <header className="flex items-center justify-between px-4 py-2 border-b">
        <div className="text-lg font-semibold">CodePen Clone — Editor</div>
        <div className="text-sm text-gray-600">Logged in as: You</div>
      </header>

      <main className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden">
        <section className="col-span-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">HTML</div>
            <div className="text-sm text-gray-500">Edit HTML</div>
             </div>
          <textarea
            className="w-full h-40 p-2 font-mono text-sm border rounded"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">CSS</div>
            <div className="text-sm text-gray-500">Edit CSS</div>
          </div>
          <textarea
            className="w-full h-32 p-2 font-mono text-sm border rounded"
            value={css}
            onChange={(e) => setCss(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">JavaScript</div>
            <div className="text-sm text-gray-500">Edit JS</div>
              </div>
          <textarea
            className="w-full h-32 p-2 font-mono text-sm border rounded"
            value={js}
            onChange={(e) => setJs(e.target.value)}
          />
        </section>

        <section className="col-span-1 flex flex-col gap-2">
          {/*<EditorRunner html={html} css={css} js={js} externalResources={[]} />*/}
        </section>
      </main>
    </div>
  );
}