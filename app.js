"use strict";

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const choice = a => a[rnd(0, a.length - 1)];
const nonzero = (limit = 5) => choice(Array.from({length: 2 * limit}, (_, i) => i < limit ? i - limit : i - limit + 1));
const EPS = 1e-9;
const trim = p => { while (p.length > 1 && Math.abs(p[p.length - 1]) < EPS) p.pop(); return p; };
const add = (a, b) => trim(Array.from({length: Math.max(a.length, b.length)}, (_, i) => (a[i] || 0) + (b[i] || 0)));
const scale = (a, c) => trim(a.map(x => x * c));
const mul = (a, b) => {
  const out = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => out[i + j] += x * y));
  return trim(out);
};
const pow = (p, n) => { let out = [1]; for (let i = 0; i < n; i++) out = mul(out, p); return out; };
const evalPoly = (p, x) => p.reduceRight((acc, c) => acc * x + c, 0);
const product = xs => xs.reduce((a, b) => mul(a, b), [1]);

function factorPoly(f) {
  return f.type === "real" ? pow([-f.r, 1], f.mult) : pow([f.a * f.a + f.b * f.b, -2 * f.a, 1], f.mult || 1);
}

function denominatorPoly(factors) { return product(factors.map(factorPoly)); }

function divideExact(a, b) {
  const r = a.slice(), q = Array(Math.max(1, a.length - b.length + 1)).fill(0);
  for (let k = a.length - b.length; k >= 0; k--) {
    q[k] = r[k + b.length - 1] / b[b.length - 1];
    for (let j = 0; j < b.length; j++) r[j + k] -= q[k] * b[j];
  }
  if (r.some(x => Math.abs(x) > 1e-9)) throw new Error("Polynomdivision nicht exakt");
  return trim(q);
}

function termDenominator(term) {
  return term.type === "real" ? pow([-term.r, 1], term.power) : [term.a * term.a + term.b * term.b, -2 * term.a, 1];
}

function combineTerms(terms) {
  const factors = [];
  for (const t of terms) {
    const key = t.type === "real" ? `r${t.r}` : `q${t.a},${t.b}`;
    const old = factors.find(f => f.key === key);
    const m = t.type === "real" ? t.power : 1;
    if (old) old.mult = Math.max(old.mult, m);
    else factors.push(t.type === "real" ? {key, type:"real", r:t.r, mult:m} : {key, type:"complex", a:t.a, b:t.b, mult:1});
  }
  const den = denominatorPoly(factors);
  let num = [0];
  for (const t of terms) {
    const td = termDenominator(t);
    const quotient = divideExact(den, td);
    const tn = t.type === "real" ? [t.c] : [t.d, t.c];
    num = add(num, mul(tn, quotient));
  }
  return {num: trim(num), den, factors};
}

// Rationale Zahl x als [Zähler, Nenner] (Kettenbruch, kleine Nenner).
function frac(x) {
  const sign = x < 0 ? -1 : 1; let v = Math.abs(x);
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  for (let i = 0; i < 20; i++) {
    const a = Math.floor(v);
    [h0, h1] = [h1, a * h1 + h0]; [k0, k1] = [k1, a * k1 + k0];
    if (Math.abs(Math.abs(x) - h1 / k1) < EPS || v - a < EPS) break;
    v = 1 / (v - a);
  }
  return [sign * h1, k1];
}
function numTex(x) {
  const [p, q] = frac(x);
  return q === 1 ? String(p) : `${p < 0 ? "-" : ""}\\frac{${Math.abs(p)}}{${q}}`;
}
const gcd = (a, b) => b ? gcd(b, a % b) : a;
// Hauptnenner der Koeffizienten, damit Zähler ganzzahlig geschrieben werden.
function commonDen(p) { return p.reduce((l, c) => { const q = frac(c)[1]; return l * q / gcd(l, q); }, 1); }

function realFactorTex(r, power = 1) {
  if (r === 0) return power === 1 ? "s" : `s^{${power}}`;
  const core = r >= 0 ? `(s-${r})` : `(s+${-r})`;
  return power === 1 ? core : `${core}^{${power}}`;
}
function quadFactorTex(a, b) {
  if (a === 0) return `(s^2+${numTex(b*b)})`;
  if (Number.isInteger(a)) return `((s-${a})^2+${numTex(b*b)})`;
  return `(${polyText([a*a+b*b, -2*a, 1])})`;
}
function realFactorWL(r, power = 1) { const core = `(s-${r})`; return power === 1 ? core : `${core}^${power}`; }
function quadFactorWL(a, b) { return `((s-${a})^2+${b*b})`; }

function polyText(p, mode = "tex") {
  let out = "";
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i]; if (Math.abs(c) < EPS) continue;
    const sign = c < 0 ? "-" : "+", n = Math.abs(c);
    const variable = i === 0 ? "" : i === 1 ? "s" : mode === "tex" ? `s^{${i}}` : `s^${i}`;
    const [pn, qn] = frac(n);
    const coeff = variable && Math.abs(n - 1) < EPS ? "" : mode === "tex" ? numTex(n) : qn === 1 ? String(pn) : `(${pn}/${qn})`;
    out += (out ? sign : c < 0 ? "-" : "") + coeff + variable;
  }
  return out || "0";
}

function factorListTex(factors) {
  return factors.map(f => f.type === "real" ? realFactorTex(f.r, f.mult) : quadFactorTex(f.a, f.b)).join("");
}
function factorListWL(factors) {
  return factors.map(f => f.type === "real" ? realFactorWL(f.r, f.mult) : quadFactorWL(f.a, f.b)).join("*");
}
function expressionTex(combined) {
  const L = commonDen(combined.num);
  return `\\frac{${polyText(scale(combined.num.slice(), L))}}{${L > 1 ? L : ""}${factorListTex(combined.factors)}}`;
}
function expressionWL(combined) { return `(${polyText(combined.num, "wl")})/(${factorListWL(combined.factors)})`; }

function termTex(t) {
  if (t.type === "real") {
    const [p, q] = frac(t.c);
    return `\\frac{${p}}{${q > 1 ? q : ""}${realFactorTex(t.r, t.power)}}`;
  }
  const L = commonDen([t.d, t.c]);
  return `\\frac{${polyText([t.d * L, t.c * L])}}{${L > 1 ? L : ""}${quadFactorTex(t.a, t.b)}}`;
}
const isZeroTerm = t => Math.abs(t.c) < EPS && (t.type === "real" || Math.abs(t.d) < EPS);
function termWL(t) {
  if (t.type === "real") return `(${t.c})/${realFactorWL(t.r, t.power)}`;
  return `(${t.c}*s+${t.d})/${quadFactorWL(t.a, t.b)}`;
}
function sumTex(terms) {
  return terms.filter(t => !isZeroTerm(t)).map((t, i) => {
    const neg = t.type === "real" ? t.c < 0 : (t.c < 0 || (t.c === 0 && t.d < 0));
    const normalized = neg ? {...t, c:-t.c, d:t.type === "complex" ? -t.d : t.d} : t;
    const raw = termTex(normalized);
    return i === 0 ? (neg ? `-${raw}` : raw) : `${neg ? "-" : "+"}${raw}`;
  }).join("");
}
const sumWL = terms => terms.map(termWL).join("+");

function uniqueIntegers(n) {
  const pool = [1,2,3,4,5], out = [];
  while (out.length < n) out.push(...pool.splice(rnd(0, pool.length - 1), 1));
  return out;
}

function makeStructure(kind) {
  const factors = [];
  if (kind === "simple") {
    for (const r of uniqueIntegers(rnd(2, 5))) factors.push({type:"real", r, mult:1});
  } else if (kind === "multiple") {
    const total = rnd(2, 5), roots = uniqueIntegers(rnd(1, Math.min(3, total - 1)));
    const mults = Array(roots.length).fill(1); mults[0] = 2;
    while (mults.reduce((a,b)=>a+b,0) < total) mults[rnd(0,mults.length-1)]++;
    roots.forEach((r,i)=>factors.push({type:"real",r,mult:mults[i]}));
  } else if (kind === "complex") {
    const pairs = rnd(1,2), used = new Set();
    while (factors.length < pairs) {
      const a=rnd(1,5), b=rnd(1,5), key=`${a},${b}`;
      if (!used.has(key)) { used.add(key); factors.push({type:"complex",a,b,mult:1}); }
    }
  } else {
    const pairs = rnd(1,2), realSlots = 5 - 2*pairs;
    const realCount = rnd(1, realSlots), roots = uniqueIntegers(rnd(1,realCount));
    const mults = Array(roots.length).fill(1);
    while (mults.reduce((a,b)=>a+b,0) < realCount) mults[rnd(0,mults.length-1)]++;
    roots.forEach((r,i)=>factors.push({type:"real",r,mult:mults[i]}));
    const used = new Set();
    while (used.size < pairs) { const a=rnd(1,5),b=rnd(1,5),key=`${a},${b}`; if(!used.has(key)){used.add(key);factors.push({type:"complex",a,b,mult:1});} }
  }
  return factors;
}

function makeTerms(factors) {
  const terms=[];
  for (const f of factors) {
    if (f.type === "real") for(let p=f.mult;p>=1;p--) terms.push({type:"real",r:f.r,power:p,c:nonzero(4)});
    else terms.push({type:"complex",a:f.a,b:f.b,c:nonzero(4),d:nonzero(5)});
  }
  return terms;
}

function generateTask(kind) {
  for (let tries=0; tries<300; tries++) {
    const factors=makeStructure(kind), terms=makeTerms(factors), combined=combineTerms(terms);
    const rootCount=factors.reduce((n,f)=>n+(f.type==="real"?f.mult:2*f.mult),0);
    if(rootCount<=5 && Math.max(...combined.num.map(Math.abs))<=650) return {kind,factors,terms,combined,rootCount};
  }
  throw new Error("Keine passende Aufgabe gefunden");
}

// Aufgabentyp aus der Nennerstruktur ablesen (für feste Aufgaben).
function kindOf(factors) {
  const hasComplex=factors.some(f=>f.type==="complex"), hasReal=factors.some(f=>f.type==="real");
  if (hasComplex) return hasReal ? "mixed" : "complex";
  return factors.some(f=>f.mult>1) ? "multiple" : "simple";
}

function recipeHtml(kind) {
  if (kind === "simple") return `<ol><li><strong>Ansatz:</strong> Für jeden einfachen Linearfaktor einen Bruch ansetzen.</li><li><strong>Abdecken:</strong> Den zugehörigen Nennerfaktor abdecken.</li><li><strong>Einsetzen:</strong> Die Nullstelle einsetzen und den Koeffizienten ablesen.</li></ol>`;
  if (kind === "multiple") return `<ol><li><strong>Alle Potenzen</strong> eines mehrfachen Faktors in den Ansatz aufnehmen.</li><li>Mit der höchsten Potenz beginnen: abdecken und einsetzen.</li><li>Den gefundenen Bruch abziehen, kürzen und die Regel wiederholen.</li><li>Bleibt nur noch ein einzelner Partialbruch übrig, den Koeffizienten direkt ablesen – fertig.</li></ol>`;
  if (kind === "complex") return `<ol><li>Zu jedem quadratischen Faktor einen linearen Zähler ansetzen.</li><li>Nenner beseitigen.</li><li>Die Koeffizienten der Potenzen von <em>s</em> vergleichen.</li></ol>`;
  return `<ol><li>Für reelle Faktoren alle erforderlichen Partialbrüche ansetzen.</li><li>Reelle Nullstellen durch Abdecken, Einsetzen, Abziehen und Kürzen bearbeiten.</li><li>Für komplexe Paare lineare Zähler ansetzen und die Koeffizienten vergleichen.</li></ol>`;
}

function buildAnsatzLabels(terms) {
  const labels=new Map(); let realIdx=0, complexIdx=0;
  for (const t of terms) {
    if (t.type==="real") { realIdx++; labels.set(t,{num:`A_{${realIdx}}`}); }
    else { complexIdx++; labels.set(t,{c:`C_{${complexIdx}}`,d:`D_{${complexIdx}}`}); }
  }
  return labels;
}
function ansatzTermTex(t, labels) {
  const l=labels.get(t);
  return t.type==="real" ? `\\frac{${l.num}}{${realFactorTex(t.r,t.power)}}` : `\\frac{${l.c}s+${l.d}}{${quadFactorTex(t.a,t.b)}}`;
}
function ansatzSumTex(terms, labels) {
  return terms.map((t,i)=> i===0 ? ansatzTermTex(t,labels) : `+${ansatzTermTex(t,labels)}`).join("");
}

function buildSteps(task) {
  const steps=[];
  const labels=buildAnsatzLabels(task.terms);
  steps.push({title:"1 Ansatz aufschreiben", html:`<div class="math-line" data-tex="${escapeAttr(`F(s)=${ansatzSumTex(task.terms,labels)}`)}"></div>`});
  let remaining=task.terms.slice(), number=2;
  const realTerms=task.terms.filter(t=>t.type==="real");
  const multiTerms=realTerms.filter(t=>t.power>1);
  const simpleTerms=realTerms.filter(t=>t.power===1);

  function coverStep(current, target) {
    const targetFactor=pow([-target.r,1],target.power);
    const restDen=divideExact(current.den,targetFactor);
    const L=commonDen(current.num);
    const top=evalPoly(scale(current.num.slice(),L),target.r), bottom=L*evalPoly(restDen,target.r);
    const value=top/bottom, [vp,vq]=frac(value);
    const reduced=vq>1 && vp===top && vq===bottom; // Bruch ist schon gekürzt
    const covered=realFactorTex(target.r,target.power);
    const label=labels.get(target).num;
    const denOthers=(L>1?L:"")+current.factors.map(f => {
      if(f.type==="real"&&f.r===target.r) return f.mult===target.power ? `\\underbrace{\\color{teal}\\cancel{${covered}}}_{\\text{\\scriptsize abdecken}}` : realFactorTex(f.r,f.mult);
      return f.type==="real"?realFactorTex(f.r,f.mult):quadFactorTex(f.a,f.b);
    }).join("");
    steps.push({title:`${number++} Faktor ${covered} abdecken und s=${target.r} einsetzen`, html:
      `<div class="math-line" data-tex="\\frac{${polyText(scale(current.num.slice(),L))}}{${denOthers}}\\;\\color{blue}\\xrightarrow{\\;s=${target.r}\\;}\\;\\frac{${numTex(top)}}{${numTex(bottom)}}${reduced?"":`=${numTex(value)}`}"></div><p>Damit ist der zugehörige Koeffizient <span class="katex-slot" data-tex="${label}=${numTex(value)}"></span>.</p>`});
  }

  for (const target of multiTerms) {
    if (!remaining.includes(target)) continue;
    const current=combineTerms(remaining);
    coverStep(current, target);
    remaining.splice(remaining.indexOf(target),1);
    const rem=combineTerms(remaining);
    let html=`<div class="math-line" data-tex="R(s)=${expressionTex(current)}${target.c<0?`+${termTex({...target,c:-target.c})}`:`-${termTex(target)}`}=${expressionTex(rem)}"></div>`;
    // Bleibt nur ein einziger Ansatzterm übrig, steht dessen Koeffizient bereits im Rest.
    if (remaining.length===1) {
      const last=remaining[0], l=labels.get(last);
      const readOff=last.type==="real" ? `${l.num}=${numTex(last.c)}` : `${l.c}=${numTex(last.c)},\\;${l.d}=${numTex(last.d)}`;
      html+=`<p>Der Rest hat bereits die Form des letzten Ansatzterms. Der Koeffizient lässt sich direkt ablesen: <span class="katex-slot" data-tex="${readOff}"></span>. Damit sind wir fertig – kein weiterer Schritt nötig.</p>`;
      remaining=[];
    }
    steps.push({title:`${number++} Gefundenen Anteil abziehen und kürzen`,html});
  }

  const openSimple=simpleTerms.filter(t=>remaining.includes(t));
  if (openSimple.length) {
    const current=combineTerms(remaining);
    for (const target of openSimple) coverStep(current, target);
    remaining=remaining.filter(t=>!(t.type==="real"&&t.power===1));
  }

  const complexTerms=remaining.filter(t=>t.type==="complex");
  if(complexTerms.length) {
    const remCombined=combineTerms(complexTerms);
    const ansatzSymbolic=complexTerms.map(t=>{const l=labels.get(t); return `\\frac{${l.c}s+${l.d}}{${quadFactorTex(t.a,t.b)}}`;}).join("+");
    const knownTex=realTerms.some(t=>!isZeroTerm(t)) ? `${sumTex(realTerms)}+` : "";
    steps.push({title:`${number++} Restglied R(s) bestimmen`, html:
      `<div class="math-line" data-tex="F(s)=${knownTex}R(s)"></div>`+
      `<div class="math-line" data-tex="R(s)=${expressionTex(remCombined)}=${ansatzSymbolic}"></div>`});

    const quotients=complexTerms.map(t=>divideExact(remCombined.den,termDenominator(t)));
    const L=commonDen(remCombined.num);
    const rhsNumerator=complexTerms.map((t,i)=>{
      const l=labels.get(t), q=quotients[i];
      const trivial=q.length===1 && q[0]===1;
      return trivial ? `(${l.c}s+${l.d})` : `(${l.c}s+${l.d})(${polyText(q)})`;
    }).join("+");
    const rhs=L===1 ? rhsNumerator : complexTerms.length===1 ? `${L}${rhsNumerator}` : `${L}\\left[${rhsNumerator}\\right]`;
    steps.push({title:`${number++} Nenner beseitigen`, html:
      `<div class="math-line" data-tex="${polyText(scale(remCombined.num.slice(),L))}=${rhs}"></div>`});

    const results=complexTerms.map(t=>{const l=labels.get(t); return `${l.c}=${numTex(t.c)},\\;${l.d}=${numTex(t.d)}`;}).join(",\\qquad ");
    steps.push({title:`${number++} Koeffizientenvergleich`, html:
      `<p>Koeffizienten gleicher Potenzen von <em>s</em> vergleichen liefert:</p><div class="math-line" data-tex="${results}"></div>`});
  }
  steps.push({title:`${number} Zusammensetzen`,html:`<div class="math-line final-line" data-tex="F(s)=${sumTex(task.terms)}"></div>`});
  return steps;
}

function escapeAttr(s) { return s.replaceAll("&","&amp;").replaceAll('"',"&quot;"); }
function renderMath(root=document) {
  root.querySelectorAll("[data-tex]").forEach(el => {
    katex.render(el.dataset.tex, el, {displayMode:el.classList.contains("display-math")||el.classList.contains("math-line"),throwOnError:false,strict:false});
  });
}

const WOLFRAM_ENDPOINT = "https://www.wolframcloud.com/obj/mauricevenutti/partialbruch-check";

async function verifyWithWolfram(task) {
  const body=new URLSearchParams({original:expressionWL(task.combined),decomposition:sumWL(task.terms)});
  const response=await fetch(WOLFRAM_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body});
  if(!response.ok) throw new Error(`Wolfram Cloud antwortet mit Status ${response.status}`);
  const data=await response.json();
  if(data.valid!==true) throw new Error(data.message||"Die Identität wurde nicht bestätigt.");
  return data;
}

function init() {
  const $=id=>document.getElementById(id);
  const kind=$("kind"), problem=$("problem-math"), solution=$("solution"), stepsEl=$("steps");
  const show=$("show-solution"), status=$("verification-status");
  const scriptSelect=$("script-example");
  scriptSelect.innerHTML=SCRIPT_EXAMPLES.map((ex,i)=>`<option value="${i}">${ex.source} (S. ${ex.page})</option>`).join("");
  let task, steps=[], shown=0;
  function newTask(){
    const isScript=kind.value==="script";
    scriptSelect.hidden=!isScript;
    if(isScript) {
      const terms=SCRIPT_EXAMPLES[scriptSelect.value].terms, combined=combineTerms(terms);
      task={kind:kindOf(combined.factors),fixed:true,terms,combined,factors:combined.factors};
    } else {
      task=generateTask(kind.value);
    }
    problem.dataset.tex=`F(s)=${expressionTex(task.combined)}`;
    steps=[]; shown=0; solution.hidden=true; status.textContent=""; status.className="verification-status";
    renderMath(problem.parentElement);
    show.disabled=false;
  }
  function displaySteps(){
    stepsEl.innerHTML=steps.slice(0,shown).map(s=>`<article class="step"><h4>${s.title}</h4>${s.html}</article>`).join("");
    renderMath(stepsEl); $("previous-step").disabled=shown<=1; $("next-step").disabled=shown>=steps.length;
    $("step-counter").textContent=`${shown} / ${steps.length}`;
  }
  function revealSolution(recipeKind){
    shown=1; $("recipe-content").innerHTML=recipeHtml(recipeKind); solution.hidden=false; displaySteps();
    solution.scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("new-task").addEventListener("click",()=>{
    // Bei Skript-Beispielen springt „Neue Aufgabe“ zum nächsten Beispiel der Liste.
    if(kind.value==="script") scriptSelect.value=String((Number(scriptSelect.value)+1)%SCRIPT_EXAMPLES.length);
    newTask();
  });
  kind.addEventListener("change",newTask); scriptSelect.addEventListener("change",newTask);
  show.addEventListener("click",async()=>{
    show.disabled=true;
    if(task.fixed) { steps=buildSteps(task); revealSolution(task.kind); return; }
    status.textContent="Prüfung mit Wolfram Cloud läuft …"; status.className="verification-status";
    try {
      await verifyWithWolfram(task);
      status.textContent="Mit Wolfram Cloud geprüft ✓"; status.className="verification-status ok";
      steps=buildSteps(task); revealSolution(task.kind);
    } catch(e) {
      status.textContent=`Prüfung fehlgeschlagen: ${e.message}`; status.className="verification-status error"; show.disabled=false;
    }
  });
  $("next-step").addEventListener("click",()=>{if(shown<steps.length){shown++;displaySteps();}});
  $("previous-step").addEventListener("click",()=>{if(shown>1){shown--;displaySteps();}});
  newTask();
}

if(typeof document!=="undefined") window.addEventListener("DOMContentLoaded",init);
if(typeof module!=="undefined") module.exports={generateTask,combineTerms,expressionWL,sumWL,evalPoly};
