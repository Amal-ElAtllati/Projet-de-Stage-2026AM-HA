import { useState, useEffect, useRef } from "react";

const TEMPLATES = [
  { id: "moderne", label: "✨ Moderne", desc: "Cards avec ombre, dégradé" },
  { id: "classique", label: "📰 Classique", desc: "Sobre et élégant" },
  { id: "colore", label: "🎨 Coloré", desc: "Sections alternées, vif" },
  { id: "minimaliste", label: "⬜ Minimaliste", desc: "Épuré, beaucoup d'espace" },
  { id: "journal", label: "🗞️ Journal", desc: "Magazine pro avec image" },
  { id: "magazine_bleu", label: "🔵 Magazine", desc: "Corporate bleu avec colonnes" },
  { id: "breaking_news", label: "📣 Breaking News", desc: "Journal noir et blanc" },
  { id: "latest_news", label: "📋 Latest News", desc: "Élégant classique centré" },
  { id: "company_pro", label: "🏢 Company Pro", desc: "2 colonnes corporate" },
  { id: "eco_colore", label: "🌿 Éco Coloré", desc: "Vif avec stats et emojis" },
];

const FONTS = [
  { id: "Arial", label: "Arial" },
  { id: "Georgia", label: "Georgia" },
  { id: "Times New Roman", label: "Times New Roman" },
  { id: "Verdana", label: "Verdana" },
  { id: "Trebuchet MS", label: "Trebuchet MS" },
  { id: "Courier New", label: "Courier New" },
  { id: "Palatino", label: "Palatino" },
];

const SUGGESTIONS = [
  "Newsletter sur le football ⚽",
  "Newsletter éducation 📚",
  "Newsletter actualité Maroc 🇲🇦",
  "Newsletter IA en 2026 🤖",
  "Newsletter sport en anglais 🏆",
  "Newsletter rouge et noir, 5 paragraphes 🎨",
];

const API_KEY = "code";
const API_URL = "http://127.0.0.1:8000";
const SUBJECT_COLORS = { sport: "#059669", education: "#7c3aed", actualite: "#d97706" };
const SUBJECT_LABELS = { sport: "⚽ Sport", education: "📚 Éducation", actualite: "📰 Actualité" };
const LANG_LABELS = { fr: "🇫🇷 Français", en: "🇬🇧 English", ar: "🇲🇦 العربية" };

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const injectAssetsIntoHTML = (html, { logoBase64, imageBase64, font }) => {
  let result = html.replace(/```html|```/g, "");
  if (font && font !== "Arial") {
    result = result.replace(/font-family:[^;"]*/g, `font-family: '${font}', sans-serif`);
  }
  if (logoBase64) {
    const logoTag = `<div style="text-align:center;padding:10px 0;"><img src="${logoBase64}" alt="Logo" style="max-height:80px;max-width:200px;object-fit:contain;" /></div>`;
    result = result.replace(/(<body[^>]*>)/i, `$1${logoTag}`);
  }
  if (imageBase64) {
    const imgTag = `<div style="text-align:center;margin:16px 0;"><img src="${imageBase64}" alt="Image" style="max-width:100%;border-radius:8px;" /></div>`;
    result = result.replace(/(<\/h[1-3][^>]*>)/i, `$1${imgTag}`);
  }
  return result;
};

// ── Toast ────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div style={{ position: "fixed", bottom: "80px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600",
          background: t.type === "success" ? "#059669" : t.type === "error" ? "#dc2626" : "#6366f1",
          color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: "8px", minWidth: "250px"
        }}>
          <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          {t.message}
          <button onClick={() => removeToast(t.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// ── Favoris Page ─────────────────────────────────────────────────
function FavorisPage({ onBack, darkMode }) {
  const [favoris, setFavoris] = useState(() => {
    try { return JSON.parse(localStorage.getItem("favoris") || "[]"); } catch { return []; }
  });
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const deleteFavori = (id) => {
    const updated = favoris.filter(f => f.id !== id);
    setFavoris(updated);
    localStorage.setItem("favoris", JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = favoris.filter(f =>
    f.title?.toLowerCase().includes(search.toLowerCase())
  );

  const bg = darkMode ? "linear-gradient(135deg, #0f0c29, #302b63)" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(255,255,255,0.03)" : "#fff";
  const textColor = darkMode ? "#fff" : "#1e293b";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textColor, fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: darkMode ? "rgba(15,12,41,0.95)" : "#fff", borderBottom: "1px solid rgba(99,102,241,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "14px" }}>← Retour</button>
        <h2 style={{ margin: 0, fontSize: "20px", color: darkMode ? "#fff" : "#1e293b" }}>⭐ Mes Favoris</h2>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b" }}>{favoris.length} favori(s)</span>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
        <div style={{ width: "380px", borderRight: "1px solid rgba(99,102,241,0.2)", overflowY: "auto", padding: "16px" }}>
          <input placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(99,102,241,0.3)", background: darkMode ? "rgba(255,255,255,0.05)" : "#f8fafc", color: darkMode ? "#fff" : "#1e293b", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", outline: "none" }} />

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "40px", color: "#64748b" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⭐</div>
              <p>{search ? "Aucun résultat" : "Aucun favori sauvegardé"}</p>
              <p style={{ fontSize: "12px" }}>Clique sur ⭐ sur une newsletter pour l'ajouter</p>
            </div>
          )}

          {filtered.map(f => (
            <div key={f.id} onClick={() => setSelected(f)}
              style={{ background: selected?.id === f.id ? "rgba(99,102,241,0.2)" : cardBg, border: `1px solid ${selected?.id === f.id ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "14px", marginBottom: "10px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "14px", color: darkMode ? "#e2e8f0" : "#1e293b" }}>⭐ {f.title || "Sans titre"}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
                    {new Date(f.savedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteFavori(f.id); }}
                  style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {!selected ? (
            <div style={{ textAlign: "center", marginTop: "100px", color: "#475569" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>👈</div>
              <p>Clique sur un favori pour le voir</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: darkMode ? "#e2e8f0" : "#1e293b", fontSize: "18px" }}>⭐ {selected.title}</h3>
                <button onClick={() => {
                  const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${selected.title}</title></head><body>${selected.content}</body></html>`], { type: "text/html" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = `${selected.title}.html`; a.click();
                }} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" }}>📥 Download</button>
              </div>
              <div dangerouslySetInnerHTML={{ __html: selected.content?.replace(/```html|```/g, "") || "" }}
                style={{ background: "#ffffff", borderRadius: "12px", padding: "8px", zoom: 0.85, overflowX: "hidden", color: "#333" }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────
function BarChart({ data, colorKey, labelKey, countKey, colors }) {
  const max = Math.max(...data.map(d => d[countKey]), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{labelKey(item)}</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: colors?.[item[colorKey]] || "#6366f1" }}>{item[countKey]}</span>
          </div>
          <div style={{ height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(item[countKey] / max) * 100}%`, background: colors?.[item[colorKey]] || `hsl(${240 + i * 40}, 70%, 60%)`, borderRadius: "6px", transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────
function DonutChart({ data, colorKey, labelKey, countKey, colors }) {
  const total = data.reduce((s, d) => s + d[countKey], 0);
  if (total === 0) return <p style={{ color: "#475569", textAlign: "center" }}>Aucune donnée</p>;
  let cumulative = 0;
  const radius = 60, cx = 80, cy = 80, strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {data.map((item, i) => {
          const pct = item[countKey] / total;
          const dash = pct * circumference;
          const offset = circumference - cumulative * circumference;
          cumulative += pct;
          const color = colors?.[item[colorKey]] || `hsl(${240 + i * 40}, 70%, 60%)`;
          return <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`} />;
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="20" fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#94a3b8" fontSize="10">total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.map((item, i) => {
          const color = colors?.[item[colorKey]] || `hsl(${240 + i * 40}, 70%, 60%)`;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{labelKey(item)}</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", marginLeft: "auto" }}>{Math.round(item[countKey] / total * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────
function DashboardPage({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadStats = () => {
    setLoading(true);
    fetch(`${API_URL}/stats`, { headers: { "X-API-Key": API_KEY } })
      .then(r => r.json()).then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { loadStats(); }, []);
  const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px", padding: "24px" };
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63)", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "rgba(15,12,41,0.95)", borderBottom: "1px solid rgba(99,102,241,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "14px" }}>← Retour</button>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#fff" }}>📊 Dashboard</h2>
        <button onClick={loadStats} style={{ marginLeft: "auto", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "13px" }}>🔄 Actualiser</button>
      </div>
      {loading ? <div style={{ textAlign: "center", marginTop: "120px" }}><div style={{ fontSize: "48px" }}>⏳</div><p style={{ color: "#64748b" }}>Chargement...</p></div> : stats && (
        <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {[
              { icon: "📧", label: "Total newsletters", value: stats.total, color: "#6366f1" },
              { icon: "⚽", label: "Sujet populaire", value: stats.by_subject?.[0] ? SUBJECT_LABELS[stats.by_subject[0].subject] || stats.by_subject[0].subject : "—", color: "#059669" },
              { icon: "🌍", label: "Langue principale", value: stats.by_language?.[0] ? LANG_LABELS[stats.by_language[0].language] || stats.by_language[0].language : "—", color: "#d97706" },
              { icon: "🕐", label: "Dernière générée", value: stats.recent?.[0] ? new Date(stats.recent[0].created_at).toLocaleDateString("fr-FR") : "—", color: "#7c3aed" },
            ].map((kpi, i) => (
              <div key={i} style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{kpi.icon}</div>
                <div style={{ fontSize: "22px", fontWeight: "900", color: kpi.color, marginBottom: "4px" }}>{kpi.value}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{kpi.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: "#a5b4fc" }}>📂 Par sujet</h3>
              {stats.by_subject?.length > 0 ? <BarChart data={stats.by_subject} colorKey="subject" labelKey={d => SUBJECT_LABELS[d.subject] || d.subject} countKey="count" colors={SUBJECT_COLORS} /> : <p style={{ color: "#475569" }}>Aucune donnée</p>}
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: "#a5b4fc" }}>🌍 Par langue</h3>
              {stats.by_language?.length > 0 ? <DonutChart data={stats.by_language} colorKey="language" labelKey={d => LANG_LABELS[d.language] || d.language} countKey="count" colors={{ fr: "#6366f1", en: "#059669", ar: "#d97706" }} /> : <p style={{ color: "#475569" }}>Aucune donnée</p>}
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: "#a5b4fc" }}>🕐 5 dernières newsletters</h3>
            {stats.recent?.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "#a5b4fc", flexShrink: 0 }}>{i + 1}</div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#e2e8f0", flex: 1 }}>{n.title || "Sans titre"}</p>
                <div style={{ fontSize: "12px", color: "#475569" }}>{new Date(n.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>
          {stats.total > 0 && (
            <div style={{ ...cardStyle, marginTop: "20px", textAlign: "center" }}>
              <p style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: "14px" }}>🎯 Progression vers 100 newsletters</p>
              <div style={{ height: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ height: "100%", width: `${Math.min(stats.total, 100)}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6, #c084fc)", borderRadius: "8px", transition: "width 1s ease" }} />
              </div>
              <span style={{ fontSize: "13px", color: "#a5b4fc", fontWeight: "700" }}>{stats.total}/100</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── useTypewriter Hook ────────────────────────────────────────────
function useTypewriter(words, typingSpeed = 100, deletingSpeed = 60, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex % words.length];

    if (isPausing) {
      const pauseTimer = setTimeout(() => {
        setIsPausing(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setWordIndex(prev => (prev + 1) % words.length);
        return;
      }
      const timer = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(timer);
    }

    if (displayText.length < currentWord.length) {
      const timer = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timer);
    }

    // Word complete — pause before deleting
    setIsPausing(true);
  }, [displayText, isDeleting, isPausing, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return displayText;
}

// ── useAnimatedCounter Hook ───────────────────────────────────────
function useAnimatedCounter(target, duration = 2000, startDelay = 0) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(delayTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return count;
}

// ── Landing Page ──────────────────────────────────────────────────
function LandingPage({ onStart }) {
  const canvasRef = useRef(null);

  // 🎬 Typewriter — cycles through multiple phrases
  const typewriterText = useTypewriter(
    ["AI Newsletter ChatBot", "Newsletters en secondes", "IA Agentique 2026", "Génère. Partage. Brille."],
    90,
    50,
    2200
  );

  // 📊 Animated counters
  const count1 = useAnimatedCounter(50, 2000, 800);
  const count2 = useAnimatedCounter(10, 1500, 1000);
  const count3 = useAnimatedCounter(3, 1200, 1200);
  const count4 = useAnimatedCounter(100, 2500, 600);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: Math.random() * 2.5 + 1,
      color: ["#6366f1", "#8b5cf6", "#c084fc", "#f472b6", "#38bdf8"][Math.floor(Math.random() * 5)]
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        });
      });
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "Arial, sans-serif" }}>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0a0118, #0f0c29, #1a0533, #0f172a)", zIndex: 0 }} />

      {/* Glowing orbs */}
      <div style={{ position: "absolute", top: "15%", left: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", filter: "blur(40px)", zIndex: 1, animation: "pulse 4s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(192,132,252,0.2) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 1, animation: "pulse 6s ease-in-out infinite reverse" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 1 }} />

      {/* Canvas particles */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 2 }} />

      {/* CSS animations */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 60px rgba(99,102,241,0.8), 0 0 100px rgba(139,92,246,0.4)} }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes countUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes stepFadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .btn-main:hover { transform: scale(1.05) translateY(-2px) !important; box-shadow: 0 0 60px rgba(99,102,241,0.8) !important; }
        .feature-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.08) !important; border-color: rgba(99,102,241,0.5) !important; }
        .stat-card-anim:hover { transform: translateY(-4px) scale(1.03); border-color: rgba(99,102,241,0.5) !important; }
        .step-card-anim { animation: stepFadeIn 0.6s ease forwards; opacity: 0; }
        .step-card-anim:nth-child(1) { animation-delay: 0.1s; }
        .step-card-anim:nth-child(2) { animation-delay: 0.25s; }
        .step-card-anim:nth-child(3) { animation-delay: 0.4s; }
        .step-card-anim:hover { transform: translateY(-6px) !important; border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 12px 40px rgba(99,102,241,0.2) !important; }
        .cursor-blink { display:inline-block; width:3px; height:1em; background:#c084fc; margin-left:3px; vertical-align:text-bottom; animation:cursorBlink 0.8s steps(1) infinite; border-radius:1px; }
      `}</style>

      {/* Floating icons */}
      {["✉️", "📧", "📨", "📩", "🤖", "⚡", "💌", "📰"].map((icon, i) => (
        <div key={i} style={{
          position: "absolute", left: `${10 + (i * 12)}%`,
          top: `${Math.random() * 80 + 10}%`,
          fontSize: `${Math.random() * 20 + 16}px`, opacity: 0.15, zIndex: 2,
          animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`, pointerEvents: "none"
        }}>{icon}</div>
      ))}

      {/* ── CONTENT ── */}
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>

        {/* Logo */}
        <div style={{ marginBottom: "24px", animation: "slideUp 0.4s ease forwards" }}>
          <img src="/logo-sat.png" alt="Smart Automation Technologies" style={{ height: "80px", objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(99,102,241,0.4))", borderRadius: "12px", background: "rgba(255,255,255,0.05)", padding: "10px 20px" }} />
        </div>

        {/* Top badge */}
        <div style={{ animation: "slideUp 0.6s ease forwards", marginBottom: "24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: "50px", padding: "8px 20px", fontSize: "13px", color: "#a5b4fc", letterSpacing: "2px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6ee7b7", display: "inline-block", animation: "pulse 2s infinite" }} />
            IA AGENTIQUE — NEWSLETTER GENERATOR 2026
          </div>
        </div>

        {/* 🎬 Typewriter Title */}
        <div style={{ animation: "slideUp 0.8s ease forwards", marginBottom: "24px", minHeight: "130px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 80px)", fontWeight: "900", margin: 0, lineHeight: 1.1, letterSpacing: "-2px" }}>
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #818cf8 70%, #6366f1 100%)",
              backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 4s ease infinite"
            }}>
              {typewriterText}
            </span>
            <span className="cursor-blink" />
          </h1>
          <div style={{ marginTop: "10px" }}>
            <span style={{
              fontSize: "clamp(28px, 5vw, 60px)", fontWeight: "900",
              background: "linear-gradient(135deg, #f472b6 0%, #c084fc 40%, #818cf8 70%, #38bdf8 100%)",
              backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 4s ease infinite reverse"
            }}>ChatBot</span>
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ animation: "slideUp 1s ease forwards" }}>
          <p style={{ fontSize: "clamp(16px, 2.2vw, 22px)", color: "#94a3b8", maxWidth: "650px", margin: "0 0 48px", lineHeight: 1.7 }}>
            Génère des newsletters <span style={{ color: "#c084fc", fontWeight: "700" }}>professionnelles</span> en quelques secondes grâce à l'<span style={{ color: "#38bdf8", fontWeight: "700" }}>intelligence artificielle agentique</span>.
          </p>
        </div>

        {/* 📊 Animated Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "14px", width: "100%", maxWidth: "640px", marginBottom: "40px", animation: "slideUp 1.1s ease forwards" }}>
          {[
            { count: count1, suffix: "+", label: "Newsletters générées", color: "#c084fc", icon: "📧" },
            { count: count2, suffix: "", label: "Templates disponibles", color: "#38bdf8", icon: "🎨" },
            { count: count3, suffix: "", label: "Langues supportées", color: "#6ee7b7", icon: "🌍" },
            { count: count4, suffix: "%", label: "IA Générative", color: "#f472b6", icon: "🤖" },
          ].map((s, i) => (
            <div key={i} className="stat-card-anim"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px 12px", textAlign: "center", transition: "all 0.3s ease", cursor: "default" }}>
              <div style={{ fontSize: "22px", marginBottom: "6px" }}>{s.icon}</div>
              <div style={{ fontSize: "32px", fontWeight: "900", color: s.color, lineHeight: 1, marginBottom: "6px", animation: "countUp 0.5s ease forwards" }}>
                {s.count}{s.suffix}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center", animation: "slideUp 1.15s ease forwards" }}>
          {[
            { icon: "🧠", label: "IA Agentique", color: "#818cf8" },
            { icon: "🎨", label: "10 Templates", color: "#c084fc" },
            { icon: "🌍", label: "3 Langues", color: "#38bdf8" },
            { icon: "⭐", label: "Favoris", color: "#fbbf24" },
            { icon: "🎙️", label: "Voice Input", color: "#f472b6" },
            { icon: "📊", label: "Dashboard", color: "#6ee7b7" },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px", padding: "12px 20px", fontSize: "14px", color: "#cbd5e1",
              display: "flex", alignItems: "center", gap: "10px", transition: "all 0.3s ease", cursor: "default"
            }}>
              <span style={{ fontSize: "20px" }}>{f.icon}</span>
              <span style={{ color: f.color, fontWeight: "600" }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ animation: "slideUp 1.2s ease forwards", marginBottom: "60px" }}>
          <button className="btn-main" onClick={onStart} style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #c084fc)",
            color: "#fff", border: "none", borderRadius: "50px",
            padding: "20px 60px", fontSize: "20px", fontWeight: "800",
            cursor: "pointer", letterSpacing: "1px",
            boxShadow: "0 0 30px rgba(99,102,241,0.5)",
            transition: "all 0.3s ease", animation: "glow 3s ease-in-out infinite"
          }}>
            🚀 Commencer maintenant
          </button>
          <p style={{ marginTop: "14px", fontSize: "13px", color: "#475569" }}>Gratuit • Rapide • Professionnel</p>
        </div>

        {/* 🎯 Comment ça marche — HOW IT WORKS */}
        <div style={{ width: "100%", maxWidth: "860px", animation: "slideUp 1.3s ease forwards" }}>
          {/* Section header */}
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "50px", padding: "6px 18px", fontSize: "12px", color: "#818cf8", letterSpacing: "2px", marginBottom: "16px" }}>
              🎯 COMMENT ÇA MARCHE
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 36px)", fontWeight: "900", background: "linear-gradient(135deg, #fff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              3 étapes. C'est tout.
            </h2>
          </div>

          {/* Steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", position: "relative" }}>

            {/* Connector line (desktop only) */}
            <div style={{ position: "absolute", top: "52px", left: "20%", right: "20%", height: "2px", background: "linear-gradient(90deg, rgba(99,102,241,0.6), rgba(192,132,252,0.6), rgba(56,189,248,0.6))", zIndex: 0, display: "none" }} />

            {[
              {
                num: "01",
                icon: "✍️",
                title: "Décris",
                desc: "Tape ton sujet, la langue, les couleurs ou le ton souhaité. Ex: \"Newsletter IA, 3 paragraphes, bleu et violet\"",
                color: "#6366f1",
                glow: "rgba(99,102,241,0.3)",
                border: "rgba(99,102,241,0.4)"
              },
              {
                num: "02",
                icon: "⚡",
                title: "Génère",
                desc: "L'IA agentique rédige une newsletter complète et professionnelle en quelques secondes, prête à l'emploi.",
                color: "#c084fc",
                glow: "rgba(192,132,252,0.3)",
                border: "rgba(192,132,252,0.4)"
              },
              {
                num: "03",
                icon: "📤",
                title: "Télécharge",
                desc: "Exporte en HTML ou PDF, envoie par email, partage sur les réseaux ou sauvegarde dans tes favoris.",
                color: "#38bdf8",
                glow: "rgba(56,189,248,0.3)",
                border: "rgba(56,189,248,0.4)"
              },
            ].map((step, i) => (
              <div key={i} className="step-card-anim" style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${step.border}`,
                borderRadius: "20px", padding: "28px 24px",
                textAlign: "center", position: "relative", zIndex: 1,
                transition: "all 0.3s ease", cursor: "default",
                boxShadow: `0 4px 24px ${step.glow}`
              }}>
                {/* Number badge */}
                <div style={{
                  position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                  background: `linear-gradient(135deg, ${step.color}, #0f0c29)`,
                  border: `2px solid ${step.border}`,
                  borderRadius: "50%", width: "30px", height: "30px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "900", color: "#fff",
                  boxShadow: `0 0 16px ${step.glow}`
                }}>{step.num}</div>

                <div style={{ fontSize: "40px", marginBottom: "12px", marginTop: "8px" }}>{step.icon}</div>
                <h3 style={{ margin: "0 0 12px", fontSize: "22px", fontWeight: "900", color: step.color }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: 1.7 }}>{step.desc}</p>

                {/* Arrow between steps */}
                {i < 2 && (
                  <div style={{ display: "none", position: "absolute", right: "-18px", top: "50%", transform: "translateY(-50%)", fontSize: "20px", color: "#475569", zIndex: 2 }}>→</div>
                )}
              </div>
            ))}
          </div>

          {/* Arrows between steps for visual flow */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "24px" }}>
            {["✍️ Décris", "→", "⚡ Génère", "→", "📤 Télécharge"].map((item, i) => (
              <span key={i} style={{ fontSize: item === "→" ? "18px" : "13px", color: item === "→" ? "#6366f1" : "#64748b", fontWeight: item === "→" ? "900" : "500" }}>{item}</span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "64px", marginTop: "64px", flexWrap: "wrap", justifyContent: "center", animation: "slideUp 1.4s ease forwards" }}>
          {[
            { num: "10+", label: "Templates", color: "#818cf8" },
            { num: "3", label: "Langues", color: "#c084fc" },
            { num: "100%", label: "IA Générative", color: "#38bdf8" },
            { num: "∞", label: "Newsletters", color: "#f472b6" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", fontWeight: "900", color: s.color, marginBottom: "4px" }}>{s.num}</div>
              <div style={{ color: "#64748b", fontSize: "13px", letterSpacing: "1px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "32px", color: "#334155", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo-sat.png" alt="SAT" style={{ height: "24px", opacity: 0.4 }} />
          <span>© 2026 Smart Automation Technologies</span>
        </div>

        {/* Scroll hint */}
        <div style={{ marginTop: "48px", color: "#334155", fontSize: "13px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, transparent, rgba(99,102,241,0.4))" }} />
          <span>scroll</span>
        </div>

      </div>
    </div>
  );
}

// ── Historique Page ───────────────────────────────────────────────
function HistoriquePage({ onBack }) {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/history`, { headers: { "X-API-Key": API_KEY } })
      .then(res => res.json())
      .then(data => { setNewsletters(data.newsletters || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const deleteNewsletter = async (id) => {
    if (!window.confirm("Supprimer?")) return;
    await fetch(`${API_URL}/history/${id}`, { method: "DELETE", headers: { "X-API-Key": API_KEY } });
    setNewsletters(prev => prev.filter(n => n.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const viewNewsletter = async (id) => {
    const res = await fetch(`${API_URL}/history/${id}`, { headers: { "X-API-Key": API_KEY } });
    setSelected(await res.json());
  };

  const filtered = newsletters.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63)", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "rgba(15,12,41,0.95)", borderBottom: "1px solid rgba(99,102,241,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "14px" }}>← Retour</button>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#fff" }}>📜 Historique</h2>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b" }}>{newsletters.length} newsletter(s)</span>
      </div>
      <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
        <div style={{ width: "380px", borderRight: "1px solid rgba(99,102,241,0.2)", overflowY: "auto", padding: "16px" }}>
          <input placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(99,102,241,0.3)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", outline: "none" }} />
          {loading && <p style={{ color: "#64748b", textAlign: "center" }}>⏳ Chargement...</p>}
          {!loading && filtered.length === 0 && <p style={{ color: "#64748b", textAlign: "center" }}>Aucune newsletter</p>}
          {filtered.map(n => (
            <div key={n.id} onClick={() => viewNewsletter(n.id)}
              style={{ background: selected?.id === n.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${selected?.id === n.id ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "14px", marginBottom: "10px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: "600", fontSize: "14px", color: "#e2e8f0" }}>{n.title || "Sans titre"}</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ background: SUBJECT_COLORS[n.subject] || "#6366f1", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", color: "#fff" }}>{n.subject}</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{n.language?.toUpperCase()}</span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#475569" }}>
                    {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteNewsletter(n.id); }}
                  style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {!selected ? (
            <div style={{ textAlign: "center", marginTop: "100px", color: "#475569" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>👈</div>
              <p>Clique sur une newsletter pour la voir</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: "#e2e8f0", fontSize: "18px" }}>{selected.title}</h3>
                <button onClick={() => {
                  const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${selected.title}</title></head><body>${selected.content}</body></html>`], { type: "text/html" });
                  const url = window.URL.createObjectURL(blob); const a = document.createElement("a");
                  a.href = url; a.download = `${selected.title}.html`; a.click();
                }} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" }}>📥 Download</button>
              </div>
              <div dangerouslySetInnerHTML={{ __html: selected.content?.replace(/```html|```/g, "") || "" }}
                style={{ background: "#ffffff", borderRadius: "12px", padding: "8px", zoom: 0.85, overflowX: "hidden", color: "#333" }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ChatBot ───────────────────────────────────────────────────────
function ChatBot({ onHistory, onDashboard, onFavoris }) {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("chat_messages") || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [emailModal, setEmailModal] = useState(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [shareLinks, setShareLinks] = useState({});
  const [editModal, setEditModal] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editParagraphs, setEditParagraphs] = useState(3);
  const [editColors, setEditColors] = useState("");
  const [editTemplate, setEditTemplate] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [logoBase64, setLogoBase64] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [logoName, setLogoName] = useState("");
  const [imageName, setImageName] = useState("");

  const [darkMode, setDarkMode] = useState(true);

  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const [favoris, setFavoris] = useState(() => {
    try { return JSON.parse(localStorage.getItem("favoris") || "[]"); } catch { return []; }
  });
  const addFavori = (msg) => {
    const fav = { id: Date.now(), title: msg.title || "Sans titre", content: msg.text, savedAt: new Date().toISOString() };
    const updated = [fav, ...favoris];
    setFavoris(updated);
    localStorage.setItem("favoris", JSON.stringify(updated));
    addToast("⭐ Ajouté aux favoris!");
  };
  const isFavori = (msg) => favoris.some(f => f.title === msg.title && f.content === msg.text);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { addToast("Voice non supporté sur ce navigateur", "error"); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => { setIsListening(false); addToast("Erreur microphone", "error"); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };
  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

  useEffect(() => {
    try { localStorage.setItem("chat_messages", JSON.stringify(messages)); } catch {}
  }, [messages]);

  const handleLogoUpload = async (e) => { const f = e.target.files[0]; if (!f) return; setLogoBase64(await fileToBase64(f)); setLogoName(f.name); };
  const handleImageUpload = async (e) => { const f = e.target.files[0]; if (!f) return; setImageBase64(await fileToBase64(f)); setImageName(f.name); };

  const sendMessage = async (customInput) => {
    const text = customInput || input;
    if (!text.trim()) return;
    const templateInfo = selectedTemplate ? ` [template: ${selectedTemplate}]` : "";
    setMessages(prev => [...prev, { sender: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
        body: JSON.stringify({ message: text + templateInfo })
      });
      const data = await res.json();
      if (data.chat_response && !data.content) {
        setMessages(prev => [...prev, { sender: "bot", text: data.chat_response, isChat: true }]);
      } else {
        const enrichedHtml = injectAssetsIntoHTML(data.content || "Erreur", { logoBase64, imageBase64, font: selectedFont });
        setMessages(prev => [...prev, { sender: "bot", text: enrichedHtml, title: data.title || text, rawInput: text }]);
        addToast("✅ Newsletter générée avec succès!");
      }
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "Erreur connexion ❌", isChat: true }]);
      addToast("Erreur connexion backend", "error");
    }
    if (!customInput) setInput("");
    setLoading(false);
  };

  const clearMessages = () => { setMessages([]); localStorage.removeItem("chat_messages"); };

  const regenerer = async () => {
    setEditLoading(true);
    const parts = [];
    if (editTitle) parts.push(`titre: ${editTitle}`);
    if (editParagraphs) parts.push(`${editParagraphs} paragraphes`);
    if (editColors) parts.push(`couleurs: ${editColors}`);
    const templatePart = editTemplate ? ` [template: ${editTemplate}]` : "";
    const msg = `Newsletter ${parts.join(", ")}${templatePart}`;
    try {
      const res = await fetch(`${API_URL}/chat`, { method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": API_KEY }, body: JSON.stringify({ message: msg }) });
      const data = await res.json();
      const enrichedHtml = injectAssetsIntoHTML(data.content || "Erreur", { logoBase64, imageBase64, font: selectedFont });
      setMessages(prev => [...prev, { sender: "user", text: `✏️ Régénéré: ${parts.join(", ")}` }]);
      setMessages(prev => [...prev, { sender: "bot", text: enrichedHtml, title: data.title || editTitle, rawInput: msg }]);
      addToast("🔄 Newsletter régénérée!");
    } catch { addToast("Erreur régénération", "error"); }
    setEditLoading(false); setEditModal(null);
  };

  const downloadHTML = (html, title) => {
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${html.replace(/```html|```/g, "")}</body></html>`], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${title}.html`; a.click();
    window.URL.revokeObjectURL(url);
    addToast("📥 Téléchargement lancé!");
  };

  const copyNewsletter = (html) => { navigator.clipboard.writeText(html.replace(/```html|```/g, "")); addToast("📋 Newsletter copiée!"); };

  const exportPDF = async (msg) => {
    try {
      const res = await fetch(`${API_URL}/export/pdf-html`, { method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": API_KEY }, body: JSON.stringify({ html_content: msg.text.replace(/```html|```/g, ""), title: msg.title || "newsletter" }) });
      if (!res.ok) { addToast("Erreur PDF", "error"); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${msg.title || "newsletter"}.pdf`; a.click();
      addToast("📄 PDF téléchargé!");
    } catch { addToast("Erreur PDF", "error"); }
  };

  const shareNewsletter = (msg) => {
    const title = encodeURIComponent(msg.title || "Newsletter");
    const preview = encodeURIComponent(msg.text.replace(/<[^>]*>/g, "").substring(0, 200));
    setShareLinks({
      whatsapp: `https://wa.me/?text=${title}%0A${preview}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}%0A${preview}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://monsite.com`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=https://monsite.com`,
    });
    setShareModal(msg.title);
  };

  const sendEmail = async (msg) => {
    if (!emailTo.trim()) { setEmailStatus("⚠️ Email requis."); return; }
    setEmailStatus("⏳ Envoi...");
    try {
      const res = await fetch(`${API_URL}/send-content-email`, { method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": API_KEY }, body: JSON.stringify({ to_email: emailTo, subject: msg.title || "Newsletter", html_content: msg.text.replace(/```html|```/g, "") }) });
      if (!res.ok) { const e = await res.json(); setEmailStatus("❌ " + (e.detail || "Erreur.")); return; }
      setEmailStatus("✅ Envoyé!"); addToast("✉️ Email envoyé avec succès!");
      setTimeout(() => { setEmailModal(null); setEmailTo(""); setEmailStatus(""); }, 2000);
    } catch { setEmailStatus("❌ Erreur."); }
  };

  const theme = {
    bg: darkMode ? "#0f0c29" : "#f1f5f9",
    headerBg: darkMode ? "linear-gradient(135deg, #0f0c29, #302b63)" : "#ffffff",
    headerBorder: darkMode ? "rgba(99,102,241,0.3)" : "#e2e8f0",
    sectionBg: darkMode ? "rgba(15,12,41,0.95)" : "#ffffff",
    sectionBorder: darkMode ? "rgba(99,102,241,0.2)" : "#e2e8f0",
    textPrimary: darkMode ? "#ffffff" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    userBubble: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    botBubble: darkMode ? "rgba(255,255,255,0.05)" : "#ffffff",
    botBorder: darkMode ? "rgba(99,102,241,0.2)" : "#e2e8f0",
    inputBg: darkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
    inputBorder: darkMode ? "rgba(99,102,241,0.4)" : "#cbd5e1",
    inputColor: darkMode ? "#ffffff" : "#1e293b",
  };

  const btnStyle = (color) => ({ padding: "7px 14px", background: color, color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" });
  const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
  const modalStyle = { background: "#1e1b4b", borderRadius: "16px", padding: "28px", width: "460px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", border: "1px solid rgba(99,102,241,0.3)" };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: theme.bg }}>

      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.headerBorder}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "28px" }}>🤖</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: theme.textPrimary, fontSize: "18px", fontWeight: "700" }}>AI Newsletter ChatBot</h2>
          <span style={{ fontSize: "12px", color: "#818cf8" }}>Propulsé par Groq ⚡</span>
        </div>
        <button onClick={() => setDarkMode(!darkMode)}
          style={{ background: darkMode ? "rgba(255,255,255,0.1)" : "rgba(15,12,41,0.1)", border: `1px solid ${darkMode ? "rgba(255,255,255,0.2)" : "rgba(15,12,41,0.2)"}`, color: theme.textPrimary, borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "16px" }}>
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button onClick={() => setSettingsModal(true)} style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "18px" }}>⚙️</button>
        <button onClick={onDashboard} style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px" }}>📊 Stats</button>
        <button onClick={onFavoris} style={{ background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.4)", color: "#fde047", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px" }}>
          ⭐ Favoris {favoris.length > 0 && <span style={{ background: "#eab308", color: "#000", borderRadius: "10px", padding: "1px 6px", fontSize: "11px", marginLeft: "4px" }}>{favoris.length}</span>}
        </button>
        <button onClick={clearMessages} style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px" }}>🗑️</button>
        <button onClick={onHistory} style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px" }}>📜</button>
      </div>

      {/* Templates */}
      <div style={{ padding: "10px 16px", background: theme.sectionBg, borderBottom: `1px solid ${theme.sectionBorder}` }}>
        <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#818cf8", fontWeight: "600", letterSpacing: "1px" }}>🎨 TEMPLATE</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelectedTemplate(selectedTemplate === t.id ? null : t.id)} title={t.desc}
              style={{ padding: "5px 12px", borderRadius: "20px", border: `1px solid ${selectedTemplate === t.id ? "#6366f1" : "rgba(255,255,255,0.1)"}`, background: selectedTemplate === t.id ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)", color: selectedTemplate === t.id ? "#a5b4fc" : "#94a3b8", cursor: "pointer", fontSize: "12px", fontWeight: selectedTemplate === t.id ? "700" : "400" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div style={{ padding: "12px 16px", background: darkMode ? "rgba(15,12,41,0.8)" : "#f8fafc", borderBottom: `1px solid ${theme.sectionBorder}` }}>
          <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#818cf8", fontWeight: "600", letterSpacing: "1px" }}>💡 SUGGESTIONS</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => setInput(s)}
                style={{ padding: "7px 14px", borderRadius: "20px", border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", cursor: "pointer", fontSize: "13px" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(99,102,241,0.25)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#475569", marginTop: "40px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✉️</div>
            <p style={{ fontSize: "18px", color: "#64748b" }}>Décris ta newsletter et je la génère!</p>
            <p style={{ fontSize: "13px", color: "#475569" }}>Ex: "Newsletter football, 3 paragraphes, rouge et noir"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ padding: "12px", margin: "8px 0", borderRadius: "12px", maxWidth: msg.sender === "bot" ? "92%" : "60%", background: msg.sender === "user" ? theme.userBubble : theme.botBubble, border: msg.sender === "bot" ? `1px solid ${theme.botBorder}` : "none", color: msg.sender === "user" ? "#fff" : theme.textPrimary, marginLeft: msg.sender === "user" ? "auto" : "0" }}>
            {msg.sender === "bot" ? (
              msg.isChat ? (
                <span style={{ fontSize: "15px", lineHeight: "1.6" }}>{msg.text}</span>
              ) : (
                <>
                  <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/```html|```/g, "") }}
                    style={{ overflowX: "hidden", maxWidth: "100%", zoom: 0.8, background: "#ffffff", borderRadius: "8px", padding: "8px", color: "#333" }} />
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                    <button onClick={() => downloadHTML(msg.text, msg.title)} style={btnStyle("#059669")}>📥 Download</button>
                    <button onClick={() => exportPDF(msg)} style={btnStyle("#dc2626")}>📄 PDF</button>
                    <button onClick={() => shareNewsletter(msg)} style={btnStyle("#7c3aed")}>🔗 Partager</button>
                    <button onClick={() => { setEmailModal(msg); setEmailStatus(""); }} style={btnStyle("#d97706")}>✉️ Email</button>
                    <button onClick={() => copyNewsletter(msg.text)} style={btnStyle("#0891b2")}>📋 Copier</button>
                    <button onClick={() => { setEditModal(msg); setEditTitle(msg.title || ""); setEditParagraphs(3); setEditColors(""); setEditTemplate(""); }} style={btnStyle("#6366f1")}>✏️ Modifier</button>
                    <button onClick={() => isFavori(msg) ? addToast("Déjà dans les favoris", "info") : addFavori(msg)}
                      style={{ ...btnStyle(isFavori(msg) ? "#eab308" : "rgba(234,179,8,0.3)"), border: "1px solid rgba(234,179,8,0.5)", color: "#fde047" }}>
                      {isFavori(msg) ? "⭐" : "☆"} Favori
                    </button>
                  </div>
                </>
              )
            ) : (
              <span style={{ fontSize: "15px" }}>{msg.text}</span>
            )}
          </div>
        ))}
        {loading && <div style={{ padding: "10px", color: "#818cf8", fontStyle: "italic", fontSize: "14px" }}>⏳ Génération en cours...</div>}
      </div>

      {/* Input */}
      <div style={{ display: "flex", padding: "12px 16px", background: theme.sectionBg, borderTop: `1px solid ${theme.sectionBorder}`, gap: "10px" }}>
        <button onClick={isListening ? stopVoice : startVoice}
          style={{ padding: "12px 16px", borderRadius: "25px", background: isListening ? "#dc2626" : "rgba(99,102,241,0.2)", border: `1px solid ${isListening ? "#dc2626" : "rgba(99,102,241,0.4)"}`, color: isListening ? "#fff" : "#a5b4fc", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>
          {isListening ? "🔴" : "🎙️"}
        </button>
        <input style={{ flex: 1, padding: "12px 16px", borderRadius: "25px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputColor, fontSize: "15px", outline: "none" }}
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={isListening ? "🎙️ En écoute..." : "Décris ta newsletter..."}
          disabled={loading} />
        <button onClick={() => sendMessage()} disabled={loading}
          style={{ padding: "12px 24px", borderRadius: "25px", background: loading ? "#374151" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600", flexShrink: 0 }}>
          {loading ? "⏳" : "Envoyer"}
        </button>
      </div>

      {/* Settings Modal */}
      {settingsModal && (
        <div style={overlayStyle} onClick={() => setSettingsModal(false)}>
          <div style={{ ...modalStyle, width: "500px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 24px", color: "#fff", fontSize: "20px" }}>⚙️ Personnalisation</h3>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#a5b4fc", fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>🔤 Police</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {FONTS.map(f => (
                  <button key={f.id} onClick={() => setSelectedFont(f.id)}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: `2px solid ${selectedFont === f.id ? "#6366f1" : "rgba(255,255,255,0.1)"}`, background: selectedFont === f.id ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)", color: selectedFont === f.id ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: f.id }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#a5b4fc", fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>🖼️ Logo</label>
              <div style={{ border: "2px dashed rgba(99,102,241,0.4)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                {logoBase64 ? (
                  <div><img src={logoBase64} alt="Logo" style={{ maxHeight: "60px", maxWidth: "150px", objectFit: "contain", marginBottom: "8px" }} />
                    <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#6ee7b7" }}>✅ {logoName}</p>
                    <button onClick={() => { setLogoBase64(null); setLogoName(""); }} style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontSize: "12px" }}>🗑️ Supprimer</button>
                  </div>
                ) : (
                  <label style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", borderRadius: "8px", padding: "8px 20px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                    📁 Choisir un logo<input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#a5b4fc", fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>📸 Image principale</label>
              <div style={{ border: "2px dashed rgba(99,102,241,0.4)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                {imageBase64 ? (
                  <div><img src={imageBase64} alt="Image" style={{ maxHeight: "80px", maxWidth: "200px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }} />
                    <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#6ee7b7" }}>✅ {imageName}</p>
                    <button onClick={() => { setImageBase64(null); setImageName(""); }} style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontSize: "12px" }}>🗑️ Supprimer</button>
                  </div>
                ) : (
                  <label style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", color: "#fff", borderRadius: "8px", padding: "8px 20px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                    📁 Choisir une image<input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            </div>
            <button onClick={() => setSettingsModal(false)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>✅ Fermer</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div style={overlayStyle} onClick={() => setEditModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px", color: "#fff", fontSize: "18px" }}>✏️ Modifier</h3>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: "#a5b4fc", fontSize: "13px", marginBottom: "6px" }}>📝 Titre</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(99,102,241,0.3)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: "#a5b4fc", fontSize: "13px", marginBottom: "6px" }}>📄 Paragraphes: {editParagraphs}</label>
              <input type="range" min="1" max="10" value={editParagraphs} onChange={e => setEditParagraphs(e.target.value)} style={{ width: "100%", accentColor: "#6366f1" }} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: "#a5b4fc", fontSize: "13px", marginBottom: "6px" }}>🎨 Couleurs</label>
              <input value={editColors} onChange={e => setEditColors(e.target.value)} placeholder="rouge et noir..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(99,102,241,0.3)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#a5b4fc", fontSize: "13px", marginBottom: "6px" }}>🗞️ Template</label>
              <select value={editTemplate} onChange={e => setEditTemplate(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(99,102,241,0.3)", background: "#1e1b4b", color: "#fff", fontSize: "14px" }}>
                <option value="">Auto</option>
                {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={regenerer} disabled={editLoading} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: "8px", cursor: editLoading ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: "600" }}>
                {editLoading ? "⏳" : "🔄 Régénérer"}
              </button>
              <button onClick={() => setEditModal(null)} style={{ padding: "12px 20px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div style={overlayStyle} onClick={() => setShareModal(null)}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "400px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px" }}>🔗 Partager</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {shareLinks.whatsapp && <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" style={{ padding: "10px", background: "#25D366", color: "#fff", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontWeight: "600" }}>💬 WhatsApp</a>}
              {shareLinks.twitter && <a href={shareLinks.twitter} target="_blank" rel="noreferrer" style={{ padding: "10px", background: "#1DA1F2", color: "#fff", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontWeight: "600" }}>🐦 Twitter</a>}
              {shareLinks.linkedin && <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" style={{ padding: "10px", background: "#0077B5", color: "#fff", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontWeight: "600" }}>💼 LinkedIn</a>}
              {shareLinks.facebook && <a href={shareLinks.facebook} target="_blank" rel="noreferrer" style={{ padding: "10px", background: "#1877F2", color: "#fff", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontWeight: "600" }}>📘 Facebook</a>}
            </div>
            <button onClick={() => setShareModal(null)} style={{ marginTop: "16px", width: "100%", padding: "10px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Fermer</button>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div style={overlayStyle} onClick={() => setEmailModal(null)}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "400px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px" }}>✉️ Envoyer par email</h3>
            <input type="email" placeholder="destinataire@email.com" value={emailTo} onChange={e => setEmailTo(e.target.value)}
              style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} />
            {emailStatus && <p style={{ margin: "10px 0 0", fontSize: "13px", color: emailStatus.startsWith("✅") ? "green" : "red" }}>{emailStatus}</p>}
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button onClick={() => sendEmail(emailModal)} style={{ padding: "9px 20px", background: "#d97706", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>✉️ Envoyer</button>
              <button onClick={() => { setEmailModal(null); setEmailTo(""); setEmailStatus(""); }} style={{ padding: "9px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── App Router ────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState("landing");
  const [darkMode, setDarkMode] = useState(true);
  return (
    page === "landing"   ? <LandingPage onStart={() => setPage("chat")} /> :
    page === "history"   ? <HistoriquePage onBack={() => setPage("chat")} /> :
    page === "dashboard" ? <DashboardPage onBack={() => setPage("chat")} /> :
    page === "favoris"   ? <FavorisPage onBack={() => setPage("chat")} darkMode={darkMode} /> :
    <ChatBot
      onHistory={() => setPage("history")}
      onDashboard={() => setPage("dashboard")}
      onFavoris={() => setPage("favoris")}
    />
  );
}

export default App;