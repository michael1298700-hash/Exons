const $ = (s) => document.querySelector(s),
  uid = () => Math.random().toString(36).slice(2, 9);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const seed = {
  settings: {
    name: "jassemine",
    email: "jassemine@mail.com",
    theme: "light",
    lang: "id",
    nd: true,
    na: true,
  },
  members: [
    { id: "m1", name: "jassemine", email: "jassemine@mail.com", role: "Admin" },
    { id: "m2", name: "shawn", email: "shawn@mail.com", role: "Project Manager" },
    { id: "m3", name: "michael", email: "michael@mail.com", role: "Member" },
  ],
  projects: [
    {
      id: "p1",
      name: "Create task management site",
      desc: "Tugas kelompok mata kuliah Pemrograman Web",
      start: d(-7),
      deadline: d(14),
      status: "Active",
    },
  ], 
  tasks: [
    {
      id: "t1",
      name: "Update Shawn's landing page",
      desc: "Add beneficiary icons.",
      status: "In Progress",
      priority: "High",
      due: d(2),
      project: "p1",
      who: "m2",
      upd: 2,
    },
    {
      id: "t2",
      name: "Code review",
      desc: "Review pull requests for new feature branch.",
      status: "Completed",
      priority: "Medium",
      due: d(-1),
      project: "p1",
      who: "m1",
      upd: 1,
    },
    {
      id: "t3",
      name: "Laporan Basis Data",
      desc: "Kerjakan bab 3 dan 4.",
      status: "Todo",
      priority: "Low",
      due: d(5),
      project: "",
      who: "m1",
      upd: 3,
    },
  ],
};
let S;
try {
  S = JSON.parse(localStorage.getItem("exons"));
} catch (e) {}
S = S || seed;
const save = () => {
  try {
    localStorage.setItem("exons", JSON.stringify(S));
  } catch (e) {}
};
const T = {
  id: {
    index: "Dashboard",
    tasks: "Tugas",
    projects: "Proyek",
    teams: "Tim",
    settings: "Pengaturan",
    hi: "Selamat datang kembali,",
    sub: "Ini yang terjadi dengan tugas Anda hari ini.",
    nt: "Tugas Baru",
    np: "Proyek Baru",
  },
  en: {
    index: "Dashboard",
    tasks: "Tasks",
    projects: "Projects",
    teams: "Teams",
    settings: "Settings",
    hi: "Welcome back,",
    sub: "Here's what's happening with your tasks today.",
    nt: "New Task",
    np: "New Project",
  },
}; //onos
const t = (k) => T[S.settings.lang][k];
const ST = ["Todo", "In Progress", "Completed"],
  PR = ["Low", "Medium", "High"],
  RL = ["Admin", "Project Manager", "Member"];
const BC = {
  Todo: "b1",
  "In Progress": "b2",
  Completed: "b3",
  Low: "b3",
  Medium: "b2",
  High: "b4",
  Active: "b2",
  Archived: "b1",
};
const bd = (x) => `<span class="bd ${BC[x]}">${x}</span>`;
const pn = (id) => esc(S.projects.find((p) => p.id == id)?.name || "-"),
  mn = (id) => esc(S.members.find((m) => m.id == id)?.name || "-");
const prog = (id) => {
  const k = S.tasks.filter((x) => x.project == id);
  return k.length
    ? Math.round(
        (k.filter((x) => x.status == "Completed").length / k.length) * 100,
      )
    : 0;
};
const toast = (m) => {
  const e = document.createElement("div");
  e.id = "toast";
  e.textContent = m;
  document.body.append(e);
  setTimeout(() => e.remove(), 2200);
};
const opts = (a, v) =>
  a
    .map((x) => {
      const [k, l] = Array.isArray(x) ? x : [x, x];
      return `<option value="${esc(k)}"${k == v ? " selected" : ""}>${esc(l)}</option>`;
    })
    .join("");
const fld = (k, l, v = "", ty = "text", o = []) =>
  `<label>${l}${ty == "select" ? `<select name="${k}">${opts(o, v)}</select>` : ty == "textarea" ? `<textarea name="${k}" rows="3">${esc(v)}</textarea>` : `<input name="${k}" type="${ty}" value="${esc(v)}"${k == "name" ? " required" : ""}>`}</label>`;
function modal(title, body, ok) {
  $("#m").innerHTML =
    `<div class="ov"><form class="md"><h3>${title}</h3>${body}<div class="ft"><button type="button" class="btn" data-a="close">${ok ? "Batal" : "Tutup"}</button>${ok ? '<button class="btn pri">Simpan</button>' : ""}</div></form></div>`;
  if (ok)
    $(".md").onsubmit = (e) => {
      e.preventDefault();
      ok(Object.fromEntries(new FormData(e.target)));
      $("#m").innerHTML = "";
      save();
      go();
    };
}
const F = { q: "", s: "", pr: "", p: "" };
const tcard = (x) =>
  `<div class="card tk ${x.status == "Completed" ? "dn" : ""}"><button class="chk" data-a="toggle" data-id="${x.id}" title="Selesai / belum">${x.status == "Completed" ? "✓" : ""}</button><div class="gr"><b class="nm">${esc(x.name)}</b><p class="mu">${esc(x.desc)}</p><div class="meta">${bd(x.status)}${bd(x.priority)}<span>📅 ${x.due || "-"}</span><span>📁 ${pn(x.project)}</span><span>👤 ${mn(x.who)}</span></div></div><div class="acts"><button class="ib" data-a="viewTask" data-id="${x.id}" title="Detail">👁</button><button class="ib" data-a="editTask" data-id="${x.id}" title="Edit">✏️</button><button class="ib" data-a="delTask" data-id="${x.id}" title="Hapus">🗑</button></div></div>`;
const mini = (x) =>
  `<div class="mini"><span><b>${esc(x.name)}</b><br><span class="mu">${x.due || "-"}</span></span>${bd(x.status)}</div>`;
const listT = () => {
  const q = F.q.toLowerCase(),
    r = S.tasks.filter(
      (x) =>
        (!q || (x.name + x.desc).toLowerCase().includes(q)) &&
        (!F.s || x.status == F.s) &&
        (!F.pr || x.priority == F.pr) &&
        (!F.p || x.project == F.p),
    );
  return r.length
    ? r.map(tcard).join("")
    : '<p class="mu ctr">Tidak ada tugas. Klik "Tugas Baru" untuk menambahkan.</p>';
};
const taskForm = (x = {}) =>
  modal(
    x.id ? "Edit Tugas" : "Tugas Baru",
    fld("name", "Nama tugas", x.name) +
      fld("desc", "Deskripsi", x.desc, "textarea") +
      `<div class="row2">${fld("status", "Status", x.status, "select", ST)}${fld("priority", "Prioritas", x.priority || "Medium", "select", PR)}</div><div class="row2">${fld("due", "Tenggat", x.due, "date")}${fld("project", "Proyek", x.project, "select", [["", "-"], ...S.projects.map((p) => [p.id, p.name])])}</div>` +
      fld("who", "Ditugaskan ke", x.who, "select", [
        ["", "-"],
        ...S.members.map((m) => [m.id, m.name]),
      ]),
    (o) => {
      o.upd = Date.now();
      x.id ? Object.assign(x, o) : S.tasks.push({ id: uid(), ...o });
    },
  );
const projForm = (x = {}) =>
  modal(
    x.id ? "Edit Proyek" : "Proyek Baru",
    fld("name", "Nama proyek", x.name) +
      fld("desc", "Deskripsi", x.desc, "textarea") +
      `<div class="row2">${fld("start", "Mulai", x.start, "date")}${fld("deadline", "Deadline", x.deadline, "date")}</div>` +
      fld("status", "Status", x.status, "select", [
        "Active",
        "Completed",
        "Archived",
      ]),
    (o) => (x.id ? Object.assign(x, o) : S.projects.push({ id: uid(), ...o })),
  );
const A = {
  close: () => ($("#m").innerHTML = ""),
  newTask: () => taskForm(),
  editTask: (id) => taskForm(S.tasks.find((x) => x.id == id)),
  toggle: (id) => {
    const x = S.tasks.find((x) => x.id == id);
    x.status = x.status == "Completed" ? "Todo" : "Completed";
    x.upd = Date.now();
    save();
    go();
  },
  delTask: (id) => {
    if (confirm("Hapus tugas ini?")) {
      S.tasks = S.tasks.filter((x) => x.id != id);
      save();
      go();
    }
  },
  viewTask: (id) => {
    const x = S.tasks.find((x) => x.id == id);
    modal(
      esc(x.name),
      `<p>${esc(x.desc) || '<i class="mu">Tanpa deskripsi</i>'}</p><div class="meta">${bd(x.status)}${bd(x.priority)}</div><p class="mu" style="margin-top:12px">📅 Tenggat: ${x.due || "-"}<br>📁 Proyek: ${pn(x.project)}<br>👤 Ditugaskan: ${mn(x.who)}</p>`,
    );
  },
  newProj: () => projForm(),
  editProj: (id) => projForm(S.projects.find((x) => x.id == id)),
  delProj: (id) => {
    if (confirm("Hapus proyek ini?")) {
      S.projects = S.projects.filter((x) => x.id != id);
      S.tasks.forEach((x) => {
        if (x.project == id) x.project = "";
      });
      save();
      go();
    }
  },
  projTasks: (id) => {
    const k = S.tasks.filter((x) => x.project == id);
    modal(
      "Tugas proyek",
      k.length
        ? k.map(mini).join("")
        : '<p class="mu">Belum ada tugas di proyek ini.</p>',
    );
  },
  newMem: () =>
    modal(
      "Tambah Anggota",
      fld("name", "Nama") +
        fld("email", "Email", "", "email") +
        fld("role", "Peran", "Member", "select", RL),
      (o) => S.members.push({ id: uid(), ...o }),
    ),
  delMem: (id) => {
    if (confirm("Hapus anggota ini?")) {
      S.members = S.members.filter((x) => x.id != id);
      S.tasks.forEach((x) => {
        if (x.who == id) x.who = "";
      });
      save();
      go();
    }
  },
};
const P = {
  index: () => {
    const k = S.tasks,
      c = (n) => k.filter((x) => x.status == n).length,
      done = c("Completed"),
      pct = k.length ? Math.round((done / k.length) * 100) : 0;
    const rec = [...k].sort((a, b) => b.upd - a.upd).slice(0, 5),
      up = k
        .filter((x) => x.status != "Completed" && x.due)
        .sort((a, b) => a.due.localeCompare(b.due))
        .slice(0, 5);
    return `<div class="hd"><div><h1>${t("hi")} <span class="ac">${esc(S.settings.name)}</span>!</h1><p class="mu">${t("sub")}</p></div><button class="btn pri" data-a="newTask">+ ${t("nt")}</button></div>
 <div class="grid4">${[
   ["Total Tasks", k.length],
   ["Completed", done],
   ["Pending", c("Todo")],
   ["In Progress", c("In Progress")],
 ]
   .map(
     ([a, b]) =>
       `<div class="card"><span class="mu">${a}</span><b class="big">${b}</b></div>`,
   )
   .join("")}</div>
 <div class="grid2"><div class="card"><h3>Task Progress</h3><b class="big">${pct}%</b><div class="bar"><i style="width:${pct}%"></i></div><p class="mu" style="margin-top:8px">${done} dari ${k.length} tugas selesai</p></div>
 <div class="card"><h3>Upcoming Deadlines</h3>${up.map(mini).join("") || '<p class="mu">Tidak ada tenggat.</p>'}</div>
 <div class="card"><h3>Recent Tasks</h3>${rec.map(mini).join("") || '<p class="mu">Belum ada tugas.</p>'}</div></div>`;
  },
  tasks:
    () => `<div class="hd"><div><h1>${t("tasks")}</h1><p class="mu">Kelola seluruh tugas kuliah Anda.</p></div><button class="btn pri" data-a="newTask">+ ${t("nt")}</button></div>
 <div class="tools"><input data-q="q" placeholder="Cari tugas..." value="${esc(F.q)}"><select data-q="s"><option value="">Semua status</option>${opts(ST, F.s)}</select><select data-q="pr"><option value="">Semua prioritas</option>${opts(PR, F.pr)}</select><select data-q="p"><option value="">Semua proyek</option>${opts(
   S.projects.map((p) => [p.id, p.name]),
   F.p,
 )}</select></div><div id="list">${listT()}</div>`,
  projects:
    () => `<div class="hd"><div><h1>${t("projects")}</h1><p class="mu">Kelompokkan tugas berdasarkan proyek.</p></div><button class="btn pri" data-a="newProj">+ ${t("np")}</button></div>
 <div class="grid2">${
   S.projects
     .map((p) => {
       const n = S.tasks.filter((x) => x.project == p.id).length,
         g = prog(p.id);
       return `<div class="card"><div class="mini" style="border:0;padding:0"><h3>${esc(p.name)}</h3>${bd(p.status)}</div><p class="mu">${esc(p.desc) || "Tanpa deskripsi"}</p><p class="mu" style="margin:8px 0">📅 ${p.start || "-"} → ${p.deadline || "-"} · ${n} tugas</p><div class="bar"><i style="width:${g}%"></i></div><p class="mu">${g}% selesai</p><div class="ft"><button class="btn" data-a="projTasks" data-id="${p.id}">Lihat tugas</button><button class="btn" data-a="editProj" data-id="${p.id}">Edit</button><button class="btn dg" data-a="delProj" data-id="${p.id}">Hapus</button></div></div>`;
     })
     .join("") || '<p class="mu">Belum ada proyek.</p>'
 }</div>`,
  teams: () => {
    const k = S.tasks;
    return `<div class="hd"><div><h1>${t("teams")}</h1><p class="mu">Kelola anggota dan pembagian tugas.</p></div><button class="btn pri" data-a="newMem">+ Tambah Anggota</button></div>
 <div class="grid4">${[
   ["Anggota", S.members.length],
   ["Tugas aktif", k.filter((x) => x.status != "Completed").length],
   ["Tugas selesai", k.filter((x) => x.status == "Completed").length],
 ]
   .map(
     ([a, b]) =>
       `<div class="card"><span class="mu">${a}</span><b class="big">${b}</b></div>`,
   )
   .join("")}</div>
 <div class="grid2">${S.members
   .map((m) => {
     const mt = k.filter((x) => x.who == m.id);
     return `<div class="card"><div class="mem"><div class="av">${esc(m.name[0] || "?").toUpperCase()}</div><div style="flex:1"><b>${esc(m.name)}</b><br><span class="mu">${esc(m.email)}</span></div><select data-role="${m.id}">${opts(RL, m.role)}</select></div><p class="mu" style="margin:12px 0 6px">Assigned Tasks (${mt.length})</p>${mt.map(mini).join("") || '<p class="mu">Belum ada tugas.</p>'}<div class="ft"><button class="btn dg" data-a="delMem" data-id="${m.id}">Hapus</button></div></div>`;
   })
   .join("")}</div>`;
  },
  settings: () => {
    const s = S.settings;
    return `<div class="hd"><div><h1>${t("settings")}</h1><p class="mu">Atur profil, tampilan, dan notifikasi.</p></div></div>
 <form class="card sf" data-f="profile"><h3>Profil & Akun</h3>${fld("name", "Nama", s.name)}${fld("email", "Email", s.email, "email")}<button class="btn pri">Simpan profil</button></form>
 <form class="card sf" data-f="pass"><h3>Ubah Kata Sandi</h3>${fld("old", "Kata sandi saat ini", "", "password")}${fld("n1", "Kata sandi baru (min. 6 karakter)", "", "password")}${fld("n2", "Ulangi kata sandi baru", "", "password")}<button class="btn pri">Ubah kata sandi</button></form>
 <form class="card sf" data-f="look"><h3>Tampilan</h3>${fld(
   "theme",
   "Tema",
   s.theme,
   "select",
   [
     ["light", "Light Mode"],
     ["dark", "Dark Mode"],
   ],
 )}<button class="btn pri">Terapkan</button></form>
 <form class="card sf" data-f="notif"><h3>Notifikasi</h3><label class="ck"><input type="checkbox" name="nd" ${s.nd ? "checked" : ""}> Pengingat tenggat waktu</label><label class="ck"><input type="checkbox" name="na" ${s.na ? "checked" : ""}> Aktivitas tugas</label><button class="btn pri">Simpan notifikasi</button></form>
 <form class="card sf" data-f="lang"><h3>Bahasa</h3>${fld(
   "lang",
   "Bahasa aplikasi",
   s.lang,
   "select",
   [
     ["id", "Bahasa Indonesia"],
     ["en", "English"],
   ],
 )}<button class="btn pri">Simpan bahasa</button></form>`;
  },
};
const page = document.body.dataset.page,
  go = () => {
    $("#v").innerHTML = P[page]();
  };
function shell() {
  const nav = [
    ["index", "📊"],
    ["tasks", "✅"],
    ["projects", "📁"],
    ["teams", "👥"],
    ["settings", "⚙️"],
  ];
  document.body.innerHTML = `<aside id="sb"><div class="logo">◩ exons</div>${nav.map(([p, i]) => `<a href="${p}.html" class="${p == page ? "on" : ""}"><span>${i}</span>${t(p)}</a>`).join("")}</aside><div class="main"><header><button class="ib menu" data-a="menu" aria-label="Menu">☰</button><span></span><div class="av">${esc(S.settings.name[0] || "?").toUpperCase()}</div></header><main id="v"></main></div><div id="m"></div>`;
}
A.menu = () => $("#sb").classList.toggle("open");
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-a]");
  if (b) A[b.dataset.a]?.(b.dataset.id);
  else if (e.target.classList.contains("ov")) A.close();
});
document.addEventListener("input", (e) => {
  const k = e.target.dataset.q;
  if (k) {
    F[k] = e.target.value;
    $("#list").innerHTML = listT();
  }
});
document.addEventListener("change", (e) => {
  const id = e.target.dataset.role;
  if (id) {
    S.members.find((m) => m.id == id).role = e.target.value;
    save();
    toast("Peran diperbarui");
  }
});
document.addEventListener("submit", (e) => {
  const f = e.target.dataset.f;
  if (!f) return;
  e.preventDefault();
  const o = Object.fromEntries(new FormData(e.target)),
    s = S.settings;
  if (f == "pass") {
    if (o.n1.length < 6 || o.n1 != o.n2)
      return toast("Kata sandi baru minimal 6 karakter dan harus sama");
    e.target.reset();
    return toast("Kata sandi diubah");
  }
  if (f == "profile") {
    s.name = o.name;
    s.email = o.email;
  }
  if (f == "look") s.theme = o.theme;
  if (f == "lang") s.lang = o.lang;
  if (f == "notif") {
    s.nd = !!o.nd;
    s.na = !!o.na;
  }
  save();
  document.documentElement.dataset.theme = s.theme;
  shell();
  go();
  toast("Pengaturan disimpan");
});
document.documentElement.dataset.theme = S.settings.theme;
shell();
go();
if (page == "index" && S.settings.nd) {
  const n = S.tasks.filter(
    (x) => x.status != "Completed" && x.due && x.due <= d(0),
  ).length;
  if (n) toast(n + " tugas jatuh tempo / terlambat");
}
