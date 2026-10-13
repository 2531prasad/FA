/* Independent local file utility; converted documents do not become research reports. */
(() => {
  const draft = {content:'', filename:'', source:'', version:''};
  function open({openDialog, api, getToken, mountMarkdown}) {
    openDialog('PDF to Markdown', `
      <section class="pdf-converter">
        <p class="converter-intro">Turn a PDF into an editable Markdown file. Conversion runs on this computer.</p>
        <p class="form-note">Best for PDFs with selectable text. Scans need OCR; tables and reading order may need cleanup.</p>
        <div class="converter-step"><span class="mono">01 / CHOOSE A PDF</span>
          <label class="field">PDF file<input id="converter-file" type="file" accept=".pdf,application/pdf" aria-describedby="converter-limits"></label>
          <p id="converter-limits" class="form-note">Up to 25 MiB. The source PDF is not saved or modified.</p>
          <button id="converter-run" class="button primary" disabled>Convert PDF</button>
        </div>
        <p id="converter-status" role="status" aria-live="polite">Checking local converter…</p>
        <section id="converter-result" hidden>
          <div class="converter-step"><span class="mono">02 / REVIEW & EDIT</span>
            <p id="converter-source" class="form-note"></p>
            <label class="field">Markdown<textarea id="converter-markdown" class="editor" spellcheck="false"></textarea></label>
            <details id="converter-preview"><summary>Preview Markdown</summary><article id="converter-rendered" class="report-body prose"></article></details>
          </div>
          <div class="converter-step"><span class="mono">03 / SAVE LOCALLY</span>
            <label class="field">Markdown filename<input id="converter-filename" maxlength="160" autocomplete="off" aria-describedby="converter-destination"></label>
            <p id="converter-destination" class="form-note">Saved in this workspace’s Converted/ folder, separate from research reports. Existing files are never overwritten.</p>
            <div class="action-row"><button id="converter-save" class="button primary">Save locally</button><button id="converter-download" class="button">Download .md</button></div>
            <p id="converter-saved" role="status" aria-live="polite"></p>
          </div>
        </section>
      </section>`);
    const dialog = document.querySelector('#dialog');
    dialog.classList.add('converter-dialog');
    const root = dialog.querySelector('.pdf-converter');
    const q = selector => root.querySelector(selector);
    const file = q('#converter-file'), run = q('#converter-run'), status = q('#converter-status');
    const editor = q('#converter-markdown'), filename = q('#converter-filename'), result = q('#converter-result');
    const saved = q('#converter-saved'), preview = q('#converter-preview');
    const controller = new AbortController();
    let ready = false, converting = false, saving = false, previewTimer;
    const active = () => root.isConnected && dialog.open;
    const update = () => {
      run.disabled = !ready || converting || saving || !file.files.length;
      file.disabled = converting || saving;
      q('#converter-save').disabled = saving || converting || !editor.value.trim();
      q('#converter-download').disabled = converting || !editor.value.trim();
      editor.disabled = saving || converting; filename.disabled = saving || converting;
    };
    const render = () => { if (preview.open) mountMarkdown(q('#converter-rendered'), editor.value, 'Converted/' + filename.value); };
    const remember = () => { draft.content = editor.value; draft.filename = filename.value; saved.textContent = ''; update(); clearTimeout(previewTimer); previewTimer = setTimeout(render, 200); };
    function showDraft() {
      editor.value = draft.content; filename.value = draft.filename;
      result.hidden = !draft.content;
      q('#converter-source').textContent = draft.source ? `${draft.source} · MarkItDown ${draft.version}` : '';
      render(); update();
    }
    showDraft();
    dialog.addEventListener('close', () => { controller.abort(); clearTimeout(previewTimer); dialog.classList.remove('converter-dialog'); }, {once:true});
    api('/api/converter', {signal:controller.signal}).then(data => {
      if (!active()) return;
      ready = data.ready;
      status.textContent = ready ? `Ready · MarkItDown ${data.version} · local PDF conversion` : data.error;
      update();
    }).catch(error => { if (active()) status.textContent = error.message; });
    file.addEventListener('change', () => {
      const selected = file.files[0];
      if (selected && (!/\.pdf$/i.test(selected.name) || selected.size > 25 * 1024 * 1024)) {
        status.textContent = 'Choose a PDF no larger than 25 MiB.'; file.value = '';
      } else if (selected) status.textContent = `Selected ${selected.name}.${draft.content ? ' Your previous result stays below until conversion succeeds.' : ''}`;
      update();
    });
    run.addEventListener('click', async () => {
      const selected = file.files[0]; if (!selected || converting) return;
      converting = true; update(); run.textContent = 'Converting…';
      status.textContent = 'Extracting text locally. Large PDFs can take up to two minutes.';
      try {
        const data = await api('/api/convert-pdf', {method:'POST', headers:{'Content-Type':'application/pdf', 'X-Ledger-Token':getToken()}, body:selected, signal:controller.signal});
        if (!active()) return;
        draft.content = data.markdown; draft.source = selected.name; draft.version = data.version;
        draft.filename = (selected.name.replace(/\.pdf$/i,'').replace(/[^a-z0-9 ._-]/gi,'-').replace(/^[^a-z0-9]+/i,'').slice(0,150) || 'converted') + '.md';
        saved.textContent = ''; showDraft(); status.textContent = 'Converted. Review the text, then save locally or download.';
      } catch (error) { if (active()) status.textContent = error.message; }
      finally { converting = false; if (active()) { run.textContent = 'Convert PDF'; update(); } }
    });
    editor.addEventListener('input', remember); filename.addEventListener('input', remember);
    preview.addEventListener('toggle', render);
    q('#converter-save').addEventListener('click', async () => {
      if (saving) return;
      saving = true; update(); saved.textContent = 'Saving…';
      try {
        const data = await api('/api/converter/save', {method:'POST', headers:{'Content-Type':'application/json', 'X-Ledger-Token':getToken()}, body:JSON.stringify({filename:filename.value, content:editor.value})});
        if (active()) saved.textContent = `Saved to ${data.path}`;
      } catch (error) { if (active()) saved.textContent = error.message; }
      finally { saving = false; if (active()) update(); }
    });
    q('#converter-download').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([editor.value],{type:'text/markdown;charset=utf-8'}));
      const link = document.createElement('a'); link.href = url; link.download = filename.value.trim() || 'converted.md';
      link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
    });
  }
  globalThis.FAConverter = Object.freeze({open});
})();
