

const $ = (id) => document.getElementById(id);

const stateKey = 'cv_builder_v1';
const themeKey = 'cv_theme_custom_v1';

const els = {
  themeSelect: $('themeSelect'),
  btnExportTheme: $('btnExportTheme'),
  importTheme: $('importTheme'),
  customThemeBox: $('customThemeBox'),
  tPrimary: $('tPrimary'),
  tSecondary: $('tSecondary'),
  tText: $('tText'),
  tPaper: $('tPaper'),

  name: $('name'),
  title: $('title'),
  location: $('location'),
  phone: $('phone'),
  email: $('email'),
  linkedin: $('linkedin'),
  website: $('website'),
  headline: $('headline'),
  summary: $('summary'),

  skillsTech: $('skillsTech'),
  skillsAdmin: $('skillsAdmin'),
  skillsSoft: $('skillsSoft'),
  languages: $('languages'),

  expList: $('expList'),
  projList: $('projList'),
  eduList: $('eduList'),
  certList: $('certList'),

  btnAddExp: $('btnAddExp'),
  btnAddProj: $('btnAddProj'),
  btnAddEdu: $('btnAddEdu'),
  btnAddCert: $('btnAddCert'),

  btnSuggestBullets: $('btnSuggestBullets'),
  btnClearAll: $('btnClearAll'),

  btnExportPDF: $('btnExportPDF'),
  btnExportDOCX: $('btnExportDOCX'),
  btnSaveJSON: $('btnSaveJSON'),
  importJSON: $('importJSON'),

  paperWrap: $('paperWrap'),

  pName: $('pName'),
  pTitle: $('pTitle'),
  pHeadline: $('pHeadline'),
  pContact: $('pContact'),
  pSummary: $('pSummary'),
  pSkillsTech: $('pSkillsTech'),
  pSkillsAdmin: $('pSkillsAdmin'),
  pSkillsSoft: $('pSkillsSoft'),
  pLanguages: $('pLanguages'),
  pCerts: $('pCerts'),
  pExps: $('pExps'),
  pProjects: $('pProjects'),
  pEdu: $('pEdu'),
};

function defaultState(){
  return {
    theme: 'theme-modern',
    customTheme: {
      paperAccent: '#2563eb',
      paperAccent2: '#7c3aed',
      paperText: '#0b1220',
      paperBg: '#ffffff'
    },
    personal: {
      name: '', title: '', location: '', phone: '', email: '', linkedin: '', website: '', headline: ''
    },
    summary: '',
    skills: {
      tech: '', admin: '', soft: '', languages: ''
    },
    experiences: [],
    projects: [],
    education: [],
    certifications: []
  };
}

let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(stateKey);
    if (!raw) {
      const s = defaultState();
      const ct = loadCustomTheme();
      if (ct) s.customTheme = ct;
      return s;
    }
    const s = JSON.parse(raw);
    const d = defaultState();
    // merge shallow
    const out = { ...d, ...s };
    out.personal = { ...d.personal, ...(s.personal || {}) };
    out.skills = { ...d.skills, ...(s.skills || {}) };
    out.experiences = Array.isArray(s.experiences) ? s.experiences : [];
    out.projects = Array.isArray(s.projects) ? s.projects : [];
    out.education = Array.isArray(s.education) ? s.education : [];
    out.certifications = Array.isArray(s.certifications) ? s.certifications : [];

    const ct = loadCustomTheme();
    if (ct) out.customTheme = { ...out.customTheme, ...ct };

    return out;
  } catch(e){
    return defaultState();
  }
}

function saveState(){
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function loadCustomTheme(){
  try{
    const raw = localStorage.getItem(themeKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e){
    return null;
  }
}

function saveCustomTheme(ct){
  localStorage.setItem(themeKey, JSON.stringify(ct));
}

function splitCSV(s){
  return (s || '').split(',').map(x => x.trim()).filter(Boolean);
}

function esc(s){
  return String(s || '').replace(/[&<>\"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

function linkify(url){
  const u = String(url || '').trim();
  if (!u) return '';
  const safe = esc(u);
  return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
}

function applyTheme(){
  const sel = state.theme;

  els.paperWrap.classList.remove('theme-modern','theme-minimal','theme-classic','theme-custom');

  if (sel === 'theme-custom'){
    els.paperWrap.classList.add('theme-custom');
    const ct = state.customTheme;
    els.paperWrap.style.setProperty('--paper-accent', ct.paperAccent || '#2563eb');
    els.paperWrap.style.setProperty('--paper-accent2', ct.paperAccent2 || '#7c3aed');
    els.paperWrap.style.setProperty('--paper-text', ct.paperText || '#0b1220');
    els.paperWrap.style.setProperty('--paper-bg', ct.paperBg || '#ffffff');
    els.paperWrap.style.setProperty('--paper-muted', '#334155');
    els.paperWrap.style.setProperty('--paper-border', 'rgba(2,6,23,.12)');

    els.customThemeBox.style.display = 'block';
  } else {
    els.paperWrap.classList.add(sel);
    els.paperWrap.style.removeProperty('--paper-accent');
    els.paperWrap.style.removeProperty('--paper-accent2');
    els.paperWrap.style.removeProperty('--paper-text');
    els.paperWrap.style.removeProperty('--paper-bg');
    els.paperWrap.style.removeProperty('--paper-muted');
    els.paperWrap.style.removeProperty('--paper-border');

    els.customThemeBox.style.display = 'none';
  }
}

function themeToJSON(){
  if (state.theme !== 'theme-custom') {
    // export a preset snapshot too
    const computed = getComputedStyle(els.paperWrap);
    return {
      name: state.theme,
      vars: {
        paperAccent: computed.getPropertyValue('--paper-accent').trim(),
        paperAccent2: computed.getPropertyValue('--paper-accent2').trim(),
        paperText: computed.getPropertyValue('--paper-text').trim(),
        paperBg: computed.getPropertyValue('--paper-bg').trim(),
      }
    };
  }
  return { name: 'custom', vars: { ...state.customTheme } };
}

function applyThemeJSON(obj){
  const v = obj?.vars || obj;
  if (!v) throw new Error('JSON de tema inválido');
  state.customTheme = {
    paperAccent: v.paperAccent || v['--paper-accent'] || '#2563eb',
    paperAccent2: v.paperAccent2 || v['--paper-accent2'] || '#7c3aed',
    paperText: v.paperText || v['--paper-text'] || '#0b1220',
    paperBg: v.paperBg || v['--paper-bg'] || '#ffffff'
  };
  state.theme = 'theme-custom';
  saveCustomTheme(state.customTheme);
  saveState();
  hydrateThemeControls();
  applyTheme();
}

function download(filename, content, mime='application/json'){
  const blob = new Blob([content], {type:mime});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
}

function bindInputs(){
  const mapPersonal = [
    ['name','name'],['title','title'],['location','location'],['phone','phone'],['email','email'],['linkedin','linkedin'],['website','website'],['headline','headline']
  ];
  for (const [id, key] of mapPersonal){
    els[id].addEventListener('input', () => {
      state.personal[key] = els[id].value;
      syncPreview();
      saveState();
    });
  }

  els.summary.addEventListener('input', () => {
    state.summary = els.summary.value;
    syncPreview();
    saveState();
  });

  const mapSkills = [
    ['skillsTech','tech'],['skillsAdmin','admin'],['skillsSoft','soft'],['languages','languages']
  ];
  for (const [id, key] of mapSkills){
    els[id].addEventListener('input', () => {
      state.skills[key] = els[id].value;
      syncPreview();
      saveState();
    });
  }

  // theme
  els.themeSelect.addEventListener('change', () => {
    state.theme = els.themeSelect.value;
    saveState();
    applyTheme();
  });

  const themeInputs = [ ['tPrimary','paperAccent'], ['tSecondary','paperAccent2'], ['tText','paperText'], ['tPaper','paperBg'] ];
  for (const [id, key] of themeInputs){
    els[id].addEventListener('input', () => {
      state.customTheme[key] = els[id].value;
      saveCustomTheme(state.customTheme);
      if (state.theme !== 'theme-custom'){
        state.theme = 'theme-custom';
        els.themeSelect.value = 'theme-custom';
      }
      saveState();
      applyTheme();
    });
  }

  els.btnExportTheme.addEventListener('click', () => {
    const obj = themeToJSON();
    download('tema-curriculo.json', JSON.stringify(obj, null, 2));
  });

  els.importTheme.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try{
      const txt = await file.text();
      const obj = JSON.parse(txt);
      applyThemeJSON(obj);
      alert('Tema importado com sucesso.');
    } catch(err){
      alert('Falha ao importar tema: ' + (err?.message || err));
    } finally {
      e.target.value = '';
    }
  });

  // lists
  els.btnAddExp.addEventListener('click', () => addExperience());
  els.btnAddProj.addEventListener('click', () => addProject());
  els.btnAddEdu.addEventListener('click', () => addEducation());
  els.btnAddCert.addEventListener('click', () => addCertification());

  // helpers
  els.btnSuggestBullets.addEventListener('click', () => {
    const s = [
      'Modelo de bullet com impacto:',
      '- [Ação] + [ferramenta/processo] + [resultado] (métrica/tempo/custo/qualidade)',
      'Exemplos:',
      '- Automatizei conciliação usando Excel/Power Query, reduzindo tempo de fechamento de 2 dias para 6 horas.',
      '- Implementei API REST em Node/Python, melhorando tempo de resposta em 30% e reduzindo falhas em produção.'
    ].join('\n');
    if (!els.summary.value.trim()) {
      els.summary.value = 'Profissional com experiência em tecnologia e rotinas administrativas, com foco em organização, execução e melhoria contínua.\n\n' + s;
      state.summary = els.summary.value;
      syncPreview();
      saveState();
    } else {
      els.summary.value = els.summary.value + '\n\n' + s;
      state.summary = els.summary.value;
      syncPreview();
      saveState();
    }
  });

  els.btnClearAll.addEventListener('click', () => {
    if (!confirm('Limpar todos os dados do currículo?')) return;
    state = defaultState();
    saveCustomTheme(state.customTheme);
    saveState();
    hydrateAll();
    syncPreview();
  });

  // export
  els.btnExportPDF.addEventListener('click', () => {
    window.print();
  });

  els.btnSaveJSON.addEventListener('click', () => {
    download('curriculo-dados.json', JSON.stringify(state, null, 2));
  });

  els.importJSON.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try{
      const txt = await file.text();
      const obj = JSON.parse(txt);
      state = { ...defaultState(), ...obj };
      // keep theme saved separately too
      if (state.customTheme) saveCustomTheme(state.customTheme);
      saveState();
      hydrateAll();
      syncPreview();
      alert('Dados importados com sucesso.');
    } catch(err){
      alert('Falha ao importar dados: ' + (err?.message || err));
    } finally {
      e.target.value = '';
    }
  });

  els.btnExportDOCX.addEventListener('click', () => exportDOCX());

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      // browser handles print; keep.
    }
  });
}

function hydrateThemeControls(){
  els.themeSelect.value = state.theme;
  els.tPrimary.value = state.customTheme.paperAccent || '#2563eb';
  els.tSecondary.value = state.customTheme.paperAccent2 || '#7c3aed';
  els.tText.value = state.customTheme.paperText || '#0b1220';
  els.tPaper.value = state.customTheme.paperBg || '#ffffff';
}

function hydratePersonal(){
  els.name.value = state.personal.name;
  els.title.value = state.personal.title;
  els.location.value = state.personal.location;
  els.phone.value = state.personal.phone;
  els.email.value = state.personal.email;
  els.linkedin.value = state.personal.linkedin;
  els.website.value = state.personal.website;
  els.headline.value = state.personal.headline;
  els.summary.value = state.summary;

  els.skillsTech.value = state.skills.tech;
  els.skillsAdmin.value = state.skills.admin;
  els.skillsSoft.value = state.skills.soft;
  els.languages.value = state.skills.languages;
}

function mkItemShell(title, onRemove){
  const wrap = document.createElement('div');
  wrap.className = 'item';
  wrap.innerHTML = `
    <div class="itemTop">
      <div class="itemTitle">${esc(title)}</div>
      <div class="itemActions">
        <button class="iconBtn" data-act="remove" title="Remover">Remover</button>
      </div>
    </div>
    <div class="itemBody"></div>
  `;
  wrap.querySelector('[data-act="remove"]').addEventListener('click', onRemove);
  return { wrap, body: wrap.querySelector('.itemBody') };
}

function renderExperienceEditor(){
  els.expList.innerHTML = '';
  state.experiences.forEach((exp, idx) => {
    const sh = mkItemShell(exp.role || `Experiência ${idx+1}`, () => {
      state.experiences.splice(idx,1);
      saveState();
      renderExperienceEditor();
      syncPreview();
    });

    sh.body.innerHTML = `
      <div class="grid2">
        <div>
          <label class="lbl">Cargo</label>
          <input class="input" data-k="role" value="${esc(exp.role)}" placeholder="Ex: Analista Administrativo" />
        </div>
        <div>
          <label class="lbl">Empresa</label>
          <input class="input" data-k="company" value="${esc(exp.company)}" placeholder="Ex: Empresa X" />
        </div>
        <div>
          <label class="lbl">Período</label>
          <input class="input" data-k="period" value="${esc(exp.period)}" placeholder="Ex: 2022 — Atual" />
        </div>
        <div>
          <label class="lbl">Local (opcional)</label>
          <input class="input" data-k="place" value="${esc(exp.place)}" placeholder="Ex: Remoto" />
        </div>
      </div>
      <label class="lbl" style="margin-top:10px;">Bullets (um por linha)</label>
      <textarea class="textarea" rows="4" data-k="bullets" placeholder="Ex:\n- Organizei rotina...\n- Automatizei...">${esc((exp.bullets||[]).join('\n'))}</textarea>
      <div class="helper">Dica: use 3–5 bullets com impacto (ação + ferramenta + resultado/métrica).</div>
    `;

    sh.body.querySelectorAll('[data-k]').forEach(input => {
      input.addEventListener('input', () => {
        const k = input.getAttribute('data-k');
        if (k === 'bullets') exp.bullets = String(input.value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
        else exp[k] = input.value;
        saveState();
        renderExperienceEditor(); // update title
        syncPreview();
      }, { passive:true });
    });

    els.expList.appendChild(sh.wrap);
  });
}

function renderProjectEditor(){
  els.projList.innerHTML = '';
  state.projects.forEach((p, idx) => {
    const sh = mkItemShell(p.name || `Projeto ${idx+1}`, () => {
      state.projects.splice(idx,1);
      saveState();
      renderProjectEditor();
      syncPreview();
    });

    sh.body.innerHTML = `
      <div class="grid2">
        <div>
          <label class="lbl">Nome</label>
          <input class="input" data-k="name" value="${esc(p.name)}" placeholder="Ex: Dashboard financeiro" />
        </div>
        <div>
          <label class="lbl">Link (opcional)</label>
          <input class="input" data-k="link" value="${esc(p.link)}" placeholder="https://..." />
        </div>
        <div>
          <label class="lbl">Stack / Ferramentas</label>
          <input class="input" data-k="stack" value="${esc(p.stack)}" placeholder="Ex: Python, SQL, Power BI" />
        </div>
        <div>
          <label class="lbl">Período (opcional)</label>
          <input class="input" data-k="period" value="${esc(p.period)}" placeholder="Ex: 2024" />
        </div>
      </div>
      <label class="lbl" style="margin-top:10px;">Descrição (bullets, um por linha)</label>
      <textarea class="textarea" rows="4" data-k="bullets" placeholder="Ex:\n- Construí...\n- Integrei...">${esc((p.bullets||[]).join('\n'))}</textarea>
    `;

    sh.body.querySelectorAll('[data-k]').forEach(input => {
      input.addEventListener('input', () => {
        const k = input.getAttribute('data-k');
        if (k === 'bullets') p.bullets = String(input.value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
        else p[k] = input.value;
        saveState();
        renderProjectEditor();
        syncPreview();
      }, { passive:true });
    });

    els.projList.appendChild(sh.wrap);
  });
}

function renderEducationEditor(){
  els.eduList.innerHTML = '';
  state.education.forEach((e, idx) => {
    const sh = mkItemShell(e.course || `Formação ${idx+1}`, () => {
      state.education.splice(idx,1);
      saveState();
      renderEducationEditor();
      syncPreview();
    });

    sh.body.innerHTML = `
      <div class="grid2">
        <div>
          <label class="lbl">Curso</label>
          <input class="input" data-k="course" value="${esc(e.course)}" placeholder="Ex: Administração" />
        </div>
        <div>
          <label class="lbl">Instituição</label>
          <input class="input" data-k="school" value="${esc(e.school)}" placeholder="Ex: Universidade X" />
        </div>
        <div>
          <label class="lbl">Período</label>
          <input class="input" data-k="period" value="${esc(e.period)}" placeholder="Ex: 2018 — 2021" />
        </div>
        <div>
          <label class="lbl">Detalhes (opcional)</label>
          <input class="input" data-k="details" value="${esc(e.details)}" placeholder="Ex: TCC, ênfase, CR" />
        </div>
      </div>
    `;

    sh.body.querySelectorAll('[data-k]').forEach(input => {
      input.addEventListener('input', () => {
        const k = input.getAttribute('data-k');
        e[k] = input.value;
        saveState();
        renderEducationEditor();
        syncPreview();
      }, { passive:true });
    });

    els.eduList.appendChild(sh.wrap);
  });
}

function renderCertEditor(){
  els.certList.innerHTML = '';
  state.certifications.forEach((c, idx) => {
    const sh = mkItemShell(c.name || `Certificação ${idx+1}`, () => {
      state.certifications.splice(idx,1);
      saveState();
      renderCertEditor();
      syncPreview();
    });

    sh.body.innerHTML = `
      <div class="grid2">
        <div>
          <label class="lbl">Nome</label>
          <input class="input" data-k="name" value="${esc(c.name)}" placeholder="Ex: Excel Avançado" />
        </div>
        <div>
          <label class="lbl">Emissor / Instituição</label>
          <input class="input" data-k="issuer" value="${esc(c.issuer)}" placeholder="Ex: Alura" />
        </div>
        <div>
          <label class="lbl">Ano (opcional)</label>
          <input class="input" data-k="year" value="${esc(c.year)}" placeholder="Ex: 2023" />
        </div>
        <div>
          <label class="lbl">Link (opcional)</label>
          <input class="input" data-k="link" value="${esc(c.link)}" placeholder="https://..." />
        </div>
      </div>
    `;

    sh.body.querySelectorAll('[data-k]').forEach(input => {
      input.addEventListener('input', () => {
        const k = input.getAttribute('data-k');
        c[k] = input.value;
        saveState();
        renderCertEditor();
        syncPreview();
      }, { passive:true });
    });

    els.certList.appendChild(sh.wrap);
  });
}

function addExperience(){
  state.experiences.unshift({ role:'', company:'', period:'', place:'', bullets:[] });
  saveState();
  renderExperienceEditor();
  syncPreview();
}
function addProject(){
  state.projects.unshift({ name:'', link:'', stack:'', period:'', bullets:[] });
  saveState();
  renderProjectEditor();
  syncPreview();
}
function addEducation(){
  state.education.unshift({ course:'', school:'', period:'', details:'' });
  saveState();
  renderEducationEditor();
  syncPreview();
}
function addCertification(){
  state.certifications.unshift({ name:'', issuer:'', year:'', link:'' });
  saveState();
  renderCertEditor();
  syncPreview();
}

function syncPreview(){
  const p = state.personal;
  els.pName.textContent = p.name || 'Seu Nome';
  els.pTitle.textContent = p.title || 'Título / Cargo alvo';
  els.pHeadline.textContent = p.headline || '';

  const contactLines = [];
  if (p.location) contactLines.push(esc(p.location));
  if (p.phone) contactLines.push(esc(p.phone));
  if (p.email) contactLines.push(esc(p.email));
  if (p.linkedin) contactLines.push(linkify(p.linkedin));
  if (p.website) contactLines.push(linkify(p.website));
  els.pContact.innerHTML = contactLines.join('<br>');

  els.pSummary.textContent = state.summary || '';

  function renderTags(el, csv){
    const arr = splitCSV(csv);
    el.innerHTML = arr.map(t => `<span class="cvTag">${esc(t)}</span>`).join('');
  }

  renderTags(els.pSkillsTech, state.skills.tech);
  renderTags(els.pSkillsAdmin, state.skills.admin);
  renderTags(els.pSkillsSoft, state.skills.soft);

  els.pLanguages.textContent = state.skills.languages || '';

  // certs
  els.pCerts.innerHTML = '';
  state.certifications.forEach(c => {
    const div = document.createElement('div');
    div.className = 'cvItem';
    const title = [c.name, c.issuer].filter(Boolean).join(' — ');
    const meta = [c.year].filter(Boolean).join('');
    div.innerHTML = `
      <div class="cvItemTop">
        <div class="cvItemTitle">${esc(title || '—')}</div>
        <div class="cvItemMeta">${esc(meta)}</div>
      </div>
    `;
    els.pCerts.appendChild(div);
  });

  // experiences
  els.pExps.innerHTML = '';
  state.experiences.forEach(exp => {
    const div = document.createElement('div');
    div.className = 'cvItem';
    const topLeft = exp.role || '—';
    const topRight = exp.period || '';
    const org = [exp.company, exp.place].filter(Boolean).join(' • ');
    const bullets = (exp.bullets || []).map(b => `<li>${esc(b)}</li>`).join('');
    div.innerHTML = `
      <div class="cvItemTop">
        <div class="cvItemTitle">${esc(topLeft)}</div>
        <div class="cvItemMeta">${esc(topRight)}</div>
      </div>
      <div class="cvItemOrg">${esc(org)}</div>
      ${bullets ? `<ul class="cvBullets">${bullets}</ul>` : ''}
    `;
    els.pExps.appendChild(div);
  });

  // projects
  els.pProjects.innerHTML = '';
  state.projects.forEach(pr => {
    const div = document.createElement('div');
    div.className = 'cvItem';
    const title = pr.name || '—';
    const meta = pr.period || '';
    const org = [pr.stack, pr.link].filter(Boolean).join(' • ');
    const bullets = (pr.bullets || []).map(b => `<li>${esc(b)}</li>`).join('');
    div.innerHTML = `
      <div class="cvItemTop">
        <div class="cvItemTitle">${esc(title)}</div>
        <div class="cvItemMeta">${esc(meta)}</div>
      </div>
      <div class="cvItemOrg">${esc(org)}</div>
      ${bullets ? `<ul class="cvBullets">${bullets}</ul>` : ''}
    `;
    els.pProjects.appendChild(div);
  });

  // education
  els.pEdu.innerHTML = '';
  state.education.forEach(ed => {
    const div = document.createElement('div');
    div.className = 'cvItem';
    const title = ed.course || '—';
    const meta = ed.period || '';
    const org = [ed.school, ed.details].filter(Boolean).join(' • ');
    div.innerHTML = `
      <div class="cvItemTop">
        <div class="cvItemTitle">${esc(title)}</div>
        <div class="cvItemMeta">${esc(meta)}</div>
      </div>
      <div class="cvItemOrg">${esc(org)}</div>
    `;
    els.pEdu.appendChild(div);
  });
}

function hydrateAll(){
  hydrateThemeControls();
  hydratePersonal();

  renderExperienceEditor();
  renderProjectEditor();
  renderEducationEditor();
  renderCertEditor();

  applyTheme();
}

function cleanText(s){
  return String(s || '').replace(/\s+$/g,'').trim();
}

function buildDocxTextBlocks(){
  const p = state.personal;

  const linesContact = [];
  if (p.location) linesContact.push(p.location);
  if (p.phone) linesContact.push(p.phone);
  if (p.email) linesContact.push(p.email);
  if (p.linkedin) linesContact.push(p.linkedin);
  if (p.website) linesContact.push(p.website);

  const blocks = {
    name: cleanText(p.name),
    title: cleanText(p.title),
    headline: cleanText(p.headline),
    contact: linesContact.filter(Boolean),
    summary: cleanText(state.summary),
    skillsTech: splitCSV(state.skills.tech),
    skillsAdmin: splitCSV(state.skills.admin),
    skillsSoft: splitCSV(state.skills.soft),
    languages: cleanText(state.skills.languages),
    experiences: state.experiences.map(e => ({
      role: cleanText(e.role),
      company: cleanText(e.company),
      place: cleanText(e.place),
      period: cleanText(e.period),
      bullets: (e.bullets || []).map(cleanText).filter(Boolean)
    })),
    projects: state.projects.map(pr => ({
      name: cleanText(pr.name),
      period: cleanText(pr.period),
      stack: cleanText(pr.stack),
      link: cleanText(pr.link),
      bullets: (pr.bullets || []).map(cleanText).filter(Boolean)
    })),
    education: state.education.map(ed => ({
      course: cleanText(ed.course),
      school: cleanText(ed.school),
      period: cleanText(ed.period),
      details: cleanText(ed.details)
    })),
    certifications: state.certifications.map(c => ({
      name: cleanText(c.name),
      issuer: cleanText(c.issuer),
      year: cleanText(c.year),
      link: cleanText(c.link)
    }))
  };

  return blocks;
}

async function exportDOCX(){
  const blocks = buildDocxTextBlocks();
  if (!blocks.name && !blocks.title && !blocks.summary && !blocks.experiences.length) {
    alert('Preencha ao menos alguns dados antes de exportar.');
    return;
  }

  const {
    Document, Packer, Paragraph, TextRun,
    HeadingLevel, AlignmentType,
    ExternalHyperlink, UnderlineType
  } = window.docx;

  function H(text){
    return new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 220, after: 90 }
    });
  }

  function P(text){
    return new Paragraph({
      children: [new TextRun({ text })],
      spacing: { after: 80 }
    });
  }

  function Psmall(text){
    return new Paragraph({
      children: [new TextRun({ text, size: 20 })],
      spacing: { after: 60 }
    });
  }

  function bullets(items){
    return items.map(t => new Paragraph({
      text: t.replace(/^[-•*]\s?/, ''),
      bullet: { level: 0 },
      spacing: { after: 50 }
    }));
  }

  function linkPara(label, url){
    if (!url) return null;
    return new Paragraph({
      children: [
        new TextRun({ text: label + ': ' }),
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: url,
              style: 'Hyperlink',
              underline: { type: UnderlineType.SINGLE }
            })
          ],
          link: url
        })
      ],
      spacing: { after: 60 }
    });
  }

  const children = [];

  // header
  if (blocks.name) {
    children.push(new Paragraph({
      children: [new TextRun({ text: blocks.name, bold: true, size: 40 })],
      spacing: { after: 90 }
    }));
  }
  if (blocks.title) children.push(new Paragraph({ children:[new TextRun({ text: blocks.title, bold:true })], spacing:{ after: 90 } }));
  if (blocks.headline) children.push(Psmall(blocks.headline));

  // contact
  if (blocks.contact.length) {
    children.push(Psmall(blocks.contact.join(' | ')));
  }
  if (state.personal.linkedin) {
    const lp = linkPara('LinkedIn', cleanText(state.personal.linkedin));
    if (lp) children.push(lp);
  }
  if (state.personal.website) {
    const wp = linkPara('Site', cleanText(state.personal.website));
    if (wp) children.push(wp);
  }

  // summary
  if (blocks.summary) {
    children.push(H('Resumo'));
    children.push(P(blocks.summary));
  }

  // skills
  const skillsParts = [];
  if (blocks.skillsTech.length) skillsParts.push('Tecnologias: ' + blocks.skillsTech.join(', '));
  if (blocks.skillsAdmin.length) skillsParts.push('Administrativo: ' + blocks.skillsAdmin.join(', '));
  if (blocks.skillsSoft.length) skillsParts.push('Soft skills: ' + blocks.skillsSoft.join(', '));
  if (skillsParts.length) {
    children.push(H('Habilidades'));
    skillsParts.forEach(s => children.push(Psmall(s)));
  }
  if (blocks.languages) {
    children.push(H('Idiomas'));
    children.push(Psmall(blocks.languages));
  }

  // experience
  if (blocks.experiences.length) {
    children.push(H('Experiência'));
    blocks.experiences.forEach(e => {
      const title = [e.role, e.company].filter(Boolean).join(' — ');
      const meta = [e.period, e.place].filter(Boolean).join(' | ');
      if (title) children.push(new Paragraph({ children:[new TextRun({ text: title, bold:true })], spacing:{ after: 40 } }));
      if (meta) children.push(Psmall(meta));
      if (e.bullets?.length) children.push(...bullets(e.bullets));
      children.push(new Paragraph({ text:'', spacing:{ after: 120 } }));
    });
  }

  // projects
  if (blocks.projects.length) {
    children.push(H('Projetos'));
    blocks.projects.forEach(pj => {
      const title = pj.name || '';
      const meta = [pj.period, pj.stack, pj.link].filter(Boolean).join(' | ');
      if (title) children.push(new Paragraph({ children:[new TextRun({ text: title, bold:true })], spacing:{ after: 40 } }));
      if (meta) children.push(Psmall(meta));
      if (pj.bullets?.length) children.push(...bullets(pj.bullets));
      children.push(new Paragraph({ text:'', spacing:{ after: 120 } }));
    });
  }

  // education
  if (blocks.education.length) {
    children.push(H('Formação'));
    blocks.education.forEach(ed => {
      const title = [ed.course, ed.school].filter(Boolean).join(' — ');
      const meta = [ed.period, ed.details].filter(Boolean).join(' | ');
      if (title) children.push(new Paragraph({ children:[new TextRun({ text: title, bold:true })], spacing:{ after: 40 } }));
      if (meta) children.push(Psmall(meta));
      children.push(new Paragraph({ text:'', spacing:{ after: 120 } }));
    });
  }

  // certs
  if (blocks.certifications.length) {
    children.push(H('Certificações'));
    blocks.certifications.forEach(c => {
      const title = [c.name, c.issuer].filter(Boolean).join(' — ');
      const meta = [c.year, c.link].filter(Boolean).join(' | ');
      if (title) children.push(new Paragraph({ children:[new TextRun({ text: title, bold:true })], spacing:{ after: 40 } }));
      if (meta) children.push(Psmall(meta));
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      },
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  const filename = (blocks.name ? blocks.name.replace(/\s+/g,'-').toLowerCase() : 'curriculo') + '.docx';
  saveAs(blob, filename);
}

// init
function hydrateLists(){
  renderExperienceEditor();
  renderProjectEditor();
  renderEducationEditor();
  renderCertEditor();
}

hydrateAll();
bindInputs();
hydrateLists();
syncPreview();
