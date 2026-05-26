
const OPENAI_API_KEY = "BURAYA_KENDI_API_KEYINI_YAZ";
// UI locale for formatting dates in tooltips/sparklines (mutable)
let UI_LOCALE = (function(){ try { return localStorage.getItem('sipUiLocale') || 'tr-TR'; } catch(e){ return 'tr-TR'; } })();

// Simple i18n translations map (keys used via data-i18n attributes)
const I18N = {
    'tr-TR': {
        landing_title: 'Eğitim Ekosistemi',
        landing_sub: "Öğrenme DNA'nı analiz eden, sana özel yol haritaları çizen ve yapay zeka ile desteklenen dünyanın en akıllı eğitim asistanı.",
        landing_cta: 'Sisteme Giriş Yap',
        auth_title: 'S.I.P. Core',
        auth_sub: 'Mobil öğrenme platformu',
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
        post_choice_title: 'Hoşgeldin! Nereden başlamak istersin?',
        post_choice_english: 'English Hub',
        post_choice_sip: 'SIP Dashboard',
        gateway_heading: 'Eğitim Ekosistemi',
        gateway_sub: 'Lütfen hedefine uygun modülü seç',
        english_hub: 'English Hub',
        sip_dashboard: 'SIP Dashboard',
        choose_level_title: 'İngilizce Eğitim: Seviyeni Seç',
        back_to_gate: 'Ana Kapıya Dön'
    },
    'en-US': {
        landing_title: 'Education Ecosystem',
        landing_sub: "The world's smartest learning assistant — analyzes your learning DNA, crafts a personalized roadmap, and supports you with AI.",
        landing_cta: 'Sign In',
        auth_title: 'S.I.P. Core',
        auth_sub: 'Mobile learning platform',
        login: 'Sign In',
        register: 'Register',
        post_choice_title: 'Welcome! Where would you like to start?',
        post_choice_english: 'English Hub',
        post_choice_sip: 'SIP Dashboard',
        gateway_heading: 'Education Ecosystem',
        gateway_sub: 'Please choose the module that fits your goal',
        english_hub: 'English Hub',
        sip_dashboard: 'SIP Dashboard',
        choose_level_title: 'English Learning: Choose Your Level',
        back_to_gate: 'Back to Gate'
    }
};

function setLocale(locale) {
    try {
        UI_LOCALE = locale;
        localStorage.setItem('sipUiLocale', UI_LOCALE);
    } catch(e){}
    translatePage();
}

function translatePage() {
    try {
        const map = I18N[UI_LOCALE] || I18N['tr-TR'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            const val = map[key];
            if (val === undefined) return;
            if (el.placeholder !== undefined && el.tagName.toLowerCase() === 'input') {
                el.placeholder = val;
            } else if (el.tagName.toLowerCase() === 'input' && el.type === 'button') {
                el.value = val;
            } else {
                el.innerText = val;
            }
        });
        // update locale toggle button label
        const btn = document.getElementById('localeToggleBtn');
        if (btn) btn.innerHTML = `<i class="fa-solid fa-globe"></i> ${UI_LOCALE === 'tr-TR' ? 'TR' : 'EN'}`;
    } catch(e) { console.warn('translatePage failed', e); }
}
const JAVA_API_URL = "http://localhost:8080";
let stompClient = null;
let wsConnecting = false;
let wsReconnectTimer = null;
const wsDesiredClasses = new Set();
const wsSubscribedTopics = new Set();

function isWsReady() {
    return !!(stompClient && stompClient.connected);
}

function scheduleWsReconnect() {
    if (wsReconnectTimer) return;
    wsReconnectTimer = setTimeout(() => {
        wsReconnectTimer = null;
        connectWebSocket();
    }, 2000);
}

function connectWebSocket() {
    if (wsConnecting || isWsReady()) return;
    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
        console.warn('WS libs not ready yet, retrying...');
        scheduleWsReconnect();
        return;
    }

    wsConnecting = true;
    try {
        const socket = new SockJS(JAVA_API_URL + '/ws');
        stompClient = Stomp.over(socket);
        stompClient.debug = null;
        stompClient.connect({}, function () {
            console.log('WebSocket connected');
            wsConnecting = false;
            wsSubscribedTopics.clear();
            // subscribe to student's class if logged in
            const profile = teacherHubGetStudentProfile(localOgrenci.email) || {};
            const classCode = profile.classId || localOgrenci.classId || localOgrenci.teacherCode || '';
            if (classCode) subscribeToClass(classCode);
            wsDesiredClasses.forEach(cc => subscribeToClass(cc));
        }, function(err){
            wsConnecting = false;
            console.warn('WebSocket error', err);
            scheduleWsReconnect();
        });
    } catch (e) {
        wsConnecting = false;
        console.warn('WS init failed', e);
        scheduleWsReconnect();
    }
}

function subscribeToClass(classCode) {
    if (!classCode) return;
    const normalizedClassCode = classCode.toUpperCase();
    wsDesiredClasses.add(normalizedClassCode);
    if (!isWsReady()) {
        connectWebSocket();
        return;
    }

    const topic = '/topic/chat.' + normalizedClassCode;
    if (wsSubscribedTopics.has(topic)) return;

    try {
        stompClient.subscribe(topic, function(message) {
            try {
                const m = JSON.parse(message.body);
                // append to student or teacher views if present
                const profile = teacherHubGetStudentProfile(localOgrenci.email) || {};
                const myClass = (profile.classId || '').toUpperCase();
                if (myClass === (m.classCode || '').toUpperCase()) {
                    const area = document.getElementById('studentChatList');
                    if (area) {
                        area.insertAdjacentHTML('beforeend', renderChatMessageHtml(m, false));
                        area.scrollTop = area.scrollHeight;
                        sesEfektiCal('click');
                    }
                }
                const teacherArea = document.getElementById('teacherChatArea');
                if (teacherArea && document.getElementById('teacherChatTarget') && document.getElementById('teacherChatTarget').value.toUpperCase() === (m.classCode || '').toUpperCase()) {
                    teacherArea.insertAdjacentHTML('beforeend', renderChatMessageHtml(m, true));
                    teacherArea.scrollTop = teacherArea.scrollHeight;
                }
            } catch (e) { console.warn('WS message parse', e); }
        });
        wsSubscribedTopics.add(topic);
    } catch (e) { console.warn('subscribe failed', e); }
}
 
// ------- GİRİŞ -------
// --- ROL YÖNETİMİ ---
let aktifRol = 'student'; // Varsayılan olarak Öğrenci seçili gelir

function rolSec(rol) {
    aktifRol = rol;
    const btnStudent = document.getElementById('roleStudent');
    const btnTeacher = document.getElementById('roleTeacher');

    // Renkleri "glass-card" temasına uygun değiştiriyoruz
    if (rol === 'student') {
        btnStudent.style.backgroundColor = '#4f46e5';
        btnStudent.style.color = 'white';
        btnTeacher.style.backgroundColor = 'transparent';
        btnTeacher.style.color = '#6b7280'; // veya temanın pasif metin rengi
    } else {
        btnTeacher.style.backgroundColor = '#4f46e5';
        btnTeacher.style.color = 'white';
        btnStudent.style.backgroundColor = 'transparent';
        btnStudent.style.color = '#6b7280';
    }
}

// --- GÜNCELLENMİŞ GİRİŞ YAP FONKSİYONU ---
/** E-posta formatı doğrulama (JavaScript form validation) */
function validateEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || '').trim());
}

/** Şifre uzunluk doğrulama */
function validatePasswordMin(password, minLen = 6) {
    return typeof password === 'string' && password.length >= minLen;
}

/** Giriş formu JS doğrulaması */
function validateLoginForm() {
    const email = document.getElementById('loginEmail')?.value.trim() || '';
    const sifre = document.getElementById('loginSifre')?.value || '';
    const errors = [];
    if (!email) errors.push('E-posta alanı zorunludur.');
    else if (!validateEmailFormat(email)) errors.push('Geçerli bir e-posta adresi girin.');
    if (!sifre) errors.push('Şifre alanı zorunludur.');
    else if (!validatePasswordMin(sifre, 6)) errors.push('Şifre en az 6 karakter olmalıdır.');
    return errors;
}

/** Kayıt formu JS doğrulaması */
function validateRegisterForm() {
    const isim = document.getElementById('regIsim')?.value.trim() || '';
    const email = document.getElementById('regEmail')?.value.trim() || '';
    const sifre = document.getElementById('regSifre')?.value || '';
    const errors = [];
    if (!isim || isim.length < 2) errors.push('Ad soyad en az 2 karakter olmalıdır.');
    if (!email) errors.push('E-posta alanı zorunludur.');
    else if (!validateEmailFormat(email)) errors.push('Geçerli bir e-posta adresi girin.');
    if (!sifre) errors.push('Şifre alanı zorunludur.');
    else if (!validatePasswordMin(sifre, 6)) errors.push('Şifre en az 6 karakter olmalıdır.');
    return errors;
}

function showAuthErrors(boxId, errors) {
    const box = document.getElementById(boxId);
    if (!box) return;
    if (!errors.length) {
        box.style.display = 'none';
        box.innerText = '';
        return;
    }
    box.style.display = 'block';
    box.innerText = errors.join(' ');
}

async function girisYap(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const sifre = document.getElementById('loginSifre').value.trim();
    const hataKutusu = document.getElementById('loginHata');

    const validationErrors = validateLoginForm();
    if (validationErrors.length) {
        showAuthErrors('loginHata', validationErrors);
        return;
    }
    showAuthErrors('loginHata', []);
    
    // 🛡️ BURASI KRİTİK: Doğru API endpoint'ine gitmesi için
    let apiUrl;
    if (aktifRol === 'student') {
        apiUrl = JAVA_API_URL + "/api/students/login";
    } else {
        apiUrl = JAVA_API_URL + "/teacher/login";
    }
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, sifre: sifre })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (aktifRol === 'student') {
                // Öğrenci giriş işlemleri
                Object.assign(localOgrenci, data);
                // Remember-me handling
                try {
                    const remember = document.getElementById('rememberMeCb') && document.getElementById('rememberMeCb').checked;
                    if (remember) localStorage.setItem('sipRememberEmail', email);
                    else localStorage.removeItem('sipRememberEmail');
                } catch(e) {}
                girisSonrasiVeriYukle();
                try { showPostLoginChoice(); } catch(e) { ekranGoster('anaKapiEkrani'); }
                console.log("Öğrenci girişi başarılı");
            } else {
                // Öğretmen giriş işlemleri
                Object.assign(aktifOgretmen, data);
                alert("Öğretmen Paneline Hoş Geldiniz!");
                ekranGoster('adminPaneliEkrani');
                adminSekmeGoster('ogrenciTakip');
                console.log("Öğretmen girişi başarılı");
            }
        } else {
            const errorText = await response.text();
            hataKutusu.style.display = 'block';
            hataKutusu.innerText = errorText || "E-posta veya şifre hatalı!";
        }
    } catch (e) {
        hataKutusu.style.display = 'block';
        hataKutusu.innerText = "Java Sunucusuna bağlanılamadı! Lütfen Backend'in (8080 portu) çalıştığından emin ol.";
        console.error("Hata:", e);
    }
}

// --- GÜNCELLENMİŞ KAYIT OL FONKSİYONU ---
async function kayitOl(event) {
    event.preventDefault();
    const isim = document.getElementById('regIsim').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const sifre = document.getElementById('regSifre').value.trim();

    const validationErrors = validateRegisterForm();
    if (validationErrors.length) {
        showAuthErrors('regHata', validationErrors);
        return;
    }
    showAuthErrors('regHata', []);
    
    // 🛡️ Kayıt olurken de doğru tabloya gitmesi için dinamik URL kullanıyoruz
    let apiUrl;
    if (aktifRol === 'student') {
        apiUrl = JAVA_API_URL + "/api/students/register";
    } else {
        apiUrl = JAVA_API_URL + "/teacher/register";
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isim: isim, email: email, sifre: sifre })
        });

        if (response.ok) {
            alert(aktifRol === 'student' ? "Öğrenci kaydı tamam!" : "Öğretmen kaydı tamam!");
            authModDegistir('giris');
        } else {
            const errorData = await response.text();
            document.getElementById('regHata').style.display = 'block';
            document.getElementById('regHata').innerText = errorData || "Kayıt başarısız!";
        }
    } catch (e) {
        document.getElementById('regHata').style.display = 'block';
        document.getElementById('regHata').innerText = "Java Sunucusuna bağlanılamadı! Lütfen Backend'in (8080 portu) çalıştığından emin ol.";
        console.error("Hata:", e);
    }
}
// ------- İNGİLİZCE XP KAYDET -------
async function verileriKaydetEng() {
    if (!localOgrenci.id) return; // id yoksa (mock) kaydetme
    try {
        await fetch(JAVA_API_URL + "/update-eng", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id:    localOgrenci.id,
                xp:    localOgrenci.engXp,
                level: localOgrenci.engLevel
            })
        });
    } catch (e) {
        // Sessizce localStorage'a düş
        verileriKaydetSip();
    }
}
 
// ------- SIP XP/LEVEL/STREAK KAYDET -------
// İNGİLİZCE XP GÜNCELLENDİĞİNDE JAVA'YA GİDECEK İSTEK
async function javaUpdateSip() {
    if (!localOgrenci.id) return;
    try {
        await fetch(JAVA_API_URL + "/update-sip", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: localOgrenci.id, 
                sipXp: localOgrenci.sipXp, 
                sipLevel: localOgrenci.sipLevel,
                sipStreak: localOgrenci.sipStreak,
                sipLastDate: localOgrenci.sipLastDate
            })
        });
    } catch(e) { console.warn("SIP XP güncellenemedi."); }
}

// SIP (AKADEMİK) XP GÜNCELLENDİĞİNDE JAVA'YA GİDECEK İSTEK
async function javaUpdateSip() {
    if (!localOgrenci.id) return;
    try {
        await fetch(JAVA_API_URL + "/update-sip", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: localOgrenci.id, 
                sipXp: localOgrenci.sipXp, 
                sipLevel: localOgrenci.sipLevel,
                sipStreak: localOgrenci.sipStreak,
                sipLastDate: localOgrenci.sipLastDate
            })
        });
    } catch(e) { console.warn("SIP XP güncellenemedi."); }
}

// POMODORO SEANSI BİTİNCE YENİ TABLOYA (StudyHistory) KAYIT İSTEĞİ
async function javaSaveHistory(logObj) {
    if (!localOgrenci.id) return;
    try {
        const historyData = {
            studentId: localOgrenci.id,
            tarih: logObj.tarih,
            saat: logObj.saat,
            sure: logObj.sure, 
            sinav: logObj.sinav,
            ders: logObj.ders,
            konu: logObj.konu,
            soruSayisi: logObj.soruSayisi
        };

        await fetch(JAVA_API_URL + "/save-history", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historyData)
        });
    } catch(e) { console.warn("Çalışma geçmişi kaydedilemedi."); }
}
 
// ------- ÇALIŞMA GEÇMİŞİ KAYDET -------
async function gecmisKaydetDB(logObj) {
    if (!localOgrenci.id) return;
    try {
        await fetch(JAVA_API_URL + "/save-history", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId:  localOgrenci.id,
                tarih:      logObj.tarih,
                saat:       logObj.saat,
                sure:       logObj.sure,
                sinav:      logObj.sinav,
                ders:       logObj.ders,
                konu:       logObj.konu,
                soruSayisi: parseInt(logObj.soruSayisi) || 0
            })
        });
    } catch (e) {}
}
 
// ------- GEÇMİŞİ DB'DEN YÜKLEa -------
async function gecmisiDBdenYukle() {
    if (!localOgrenci.id) return;
    try {
        const response = await fetch(JAVA_API_URL + "/history/" + localOgrenci.id);
        if (response.ok) {
            const data = await response.json();
            // DB formatını localOgrenci formatına çevir
            localOgrenci.sipHistory = data.map(h => ({
                id:         h.id,
                tarih:      h.tarih,
                saat:       h.saat,
                sure:       h.sure,
                sinav:      h.sinav,
                ders:       h.ders,
                konu:       h.konu,
                soruSayisi: h.soruSayisi
            }));
        }
    } catch (e) {}
}

let seciliGenelSeviye = "A1"; 
let flashcardKelimeleri = []; let aktifKelimeler =[];
let oyunZamanlayici;
let oyunDurumu = { takim1: { ad: "", puan: 0 }, takim2: { ad: "", puan: 0 }, siraKimde: 1, mevcutTur: 1, toplamTur: 4, sure: 60, kalanSure: 60, oyunAktif: false, kacirilanKelimeler: [], dogruKelimeler:[] };
let sentezleyici = window.speechSynthesis;

// Öğrenci verisi
let localOgrenci = { 
    id: null, isim: "", email: "", 
    engXp: 0, engLevel: 1, ogrenilenKelimeler:[], kacirilanlar: [], dna: null, kampanyalar:[],
    sipXp: 0, sipLevel: 1, sipStreak: 0, sipLastDate: "", sipHistory:[]
};

let aktifSoruHavuzu = {
    sinav: "",
    yil: "",
    konu: "",
    soruIndex: 0,
    dogruSayisi: 0,
    sonCevaplandi: false
};

let aktifOgretmen = {
    id: null,
    isim: "Öğretmen",
    email: "",
    brans: "",
    kurum: ""
};

const TEACHER_HUB_KEY = 'sipTeacherHubState';
const TEACHER_STUDENT_KEY = 'sipTeacherStudentProfiles';
const TEACHER_NOTICE_PREFIX = 'sipTeacherNotices_';

function teacherHubReadState() {
    const defaults = { classes: [], messages: [], announcements: [], classFeed: [] };
    try {
        const parsed = JSON.parse(localStorage.getItem(TEACHER_HUB_KEY));
        return parsed && typeof parsed === 'object' ? { ...defaults, ...parsed } : defaults;
    } catch (e) {
        return defaults;
    }
}

function teacherHubWriteState(state) {
    localStorage.setItem(TEACHER_HUB_KEY, JSON.stringify(state));
}

function teacherHubReadProfiles() {
    try {
        const parsed = JSON.parse(localStorage.getItem(TEACHER_STUDENT_KEY));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
        return {};
    }
}

function teacherHubFindClass(state, classId) {
    return (state.classes || []).find(item => item.id === classId) || null;
}

function teacherHubIsClassActive(classItem) {
    return classItem ? classItem.active !== false : false;
}

function teacherHubGetRelevantTeachersForStudent(email) {
    const profile = teacherHubGetStudentProfile(email) || {};
    const state = teacherHubReadState();
    const classIds = new Set();
    if (profile.classId) classIds.add(String(profile.classId).toUpperCase());
    if (profile.teacherCode) classIds.add(String(profile.teacherCode).toUpperCase());

    (state.classes || []).forEach(classItem => {
        const classId = String(classItem.id || '').toUpperCase();
        const belongsById = classIds.has(classId);
        const belongsByRoster = Array.isArray(classItem.students) && classItem.students.includes(email.toLowerCase());
        if (belongsById || belongsByRoster) {
            const teacherEmail = String(classItem.ownerEmail || classItem.teacherEmail || '').toLowerCase();
            const teacherName = classItem.owner || classItem.teacherName || teacherEmail || 'Öğretmen';
            if (teacherEmail || teacherName) {
                classIds.add(classId);
            }
        }
    });

    const teachers = [];
    (state.classes || []).forEach(classItem => {
        const classId = String(classItem.id || '').toUpperCase();
        const belongsById = classIds.has(classId);
        const belongsByRoster = Array.isArray(classItem.students) && classItem.students.includes(email.toLowerCase());
        if (!belongsById && !belongsByRoster) return;

        const teacherEmail = String(classItem.ownerEmail || classItem.teacherEmail || '').toLowerCase();
        const teacherName = classItem.owner || classItem.teacherName || teacherEmail || 'Öğretmen';
        const classTitle = teacherHubResolveClassTitle(classId);
        teachers.push({
            classId,
            classTitle,
            teacherEmail,
            teacherName,
            label: teacherHubFormatTeacherDisplayName(teacherName, teacherEmail)
        });
    });

    const unique = [];
    const seen = new Set();
    teachers.forEach(item => {
        const key = `${item.teacherEmail || item.teacherName}__${item.classId}`.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        unique.push(item);
    });

    return unique;
}

function teacherHubFormatTeacherDisplayName(name, email) {
    const baseName = String(name || '').trim() || String(email || '').trim() || 'Öğretmen';
    if (baseName.includes('@')) return 'Öğretmen';
    if (/\bhoca\b/i.test(baseName)) return baseName;
    return `${baseName} Hoca`;
}

function teacherHubResolveClassTitle(classId) {
    const normalizedClassId = String(classId || '').trim().toUpperCase();
    if (!normalizedClassId) return '';
    const state = teacherHubReadState();
    const classItem = (state.classes || []).find(item => String(item.id || '').trim().toUpperCase() === normalizedClassId);
    return String(classItem?.name || classItem?.title || classItem?.label || normalizedClassId).trim();
}

function teacherHubRenderReplyComposer(notice, teachers) {
    const teacherOptions = Array.isArray(teachers) && teachers.length > 0
        ? teachers.map((teacher, index) => `
            <label class="reply-teacher-option" style="display:flex; gap:8px; align-items:center; padding:6px 8px; border:1px solid #dbe4ff; border-radius:10px; background:#f8fbff; cursor:pointer;">
                <input type="checkbox" class="reply-teacher-cb" data-notice-id="${notice.id}" data-email="${escapeHtml(teacher.teacherEmail || '')}" data-class-id="${escapeHtml(teacher.classId || '')}" ${index === 0 ? 'checked' : ''}>
                <span>
                    ${escapeHtml(teacher.label)}
                    ${teacher.classTitle ? `<small style="display:block; color:#64748b; margin-top:2px;">${escapeHtml(teacher.classTitle)}</small>` : ''}
                </span>
            </label>
        `).join('')
        : '<div class="empty-state" style="padding:10px;">Bu bildirim için sınıf öğretmeni bulunamadı.</div>';

    return `
        <div class="reply-composer" style="margin-top:10px; border-top:1px solid #e2e8f0; padding-top:10px;">
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">Yanıtlayacağın öğretmeni seç:</div>
            <div style="display:grid; gap:8px; margin-bottom:10px;">${teacherOptions}</div>
            <textarea id="replyText_${notice.id}" class="modern-textarea" rows="3" placeholder="Cevabını yaz..." style="width:100%;"></textarea>
            <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
                <label for="replyFile_${notice.id}" class="btn btn-secondary" title="Dosya Ekle"><i class="fa-solid fa-paperclip"></i></label>
                <input type="file" id="replyFile_${notice.id}" accept="image/*,application/pdf" capture="camera" style="display:none;">
                <div id="replyFileName_${notice.id}" style="font-size:12px; color:var(--text-muted);">Dosya seçilmedi</div>
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px;">
                <button class="btn btn-secondary btn-small" data-action="teacher-clear-reply" data-id="${notice.id}">Temizle</button>
                <button class="btn btn-primary btn-small" data-action="teacher-send-reply" data-id="${notice.id}">Cevabı Gönder</button>
            </div>
        </div>
    `;
}

function teacherHubClearReplyComposer(noticeId) {
    const textEl = document.getElementById(`replyText_${noticeId}`);
    if (textEl) textEl.value = '';
    const fileEl = document.getElementById(`replyFile_${noticeId}`);
    if (fileEl) fileEl.value = '';
    const fileNameEl = document.getElementById(`replyFileName_${noticeId}`);
    if (fileNameEl) fileNameEl.textContent = 'Dosya seçilmedi';
    document.querySelectorAll(`.reply-teacher-cb[data-notice-id="${noticeId}"]`).forEach(cb => { cb.checked = false; });
}

function openStudentReplyComposer(noticeId) {
    studentChatMode = 'reply';
    studentReplyNoticeId = noticeId;
    const widget = document.getElementById('studentChatWidget');
    if (widget) widget.style.display = 'block';
    renderStudentChatComposer();
    teacherHubRenderStudentNotices();
}

function openStudentClassChatComposer() {
    studentChatMode = 'class';
    studentReplyNoticeId = null;
    renderStudentChatComposer();
    teacherHubRenderStudentNotices();
}

function openStudentReplyComposerFromLastNotice() {
    const email = (localOgrenci.email || '').toLowerCase();
    if (!email) return;
    let notices = [];
    try { notices = JSON.parse(localStorage.getItem(`${TEACHER_NOTICE_PREFIX}${email}`)) || []; } catch (e) { notices = []; }
    const firstUnread = notices.find(item => !item.read) || notices[0];
    if (!firstUnread) {
        alert('Cevaplanacak bildirim yok.');
        return;
    }
    openStudentReplyComposer(firstUnread.id);
}

function renderStudentChatComposer() {
    const container = document.getElementById('studentChatComposer');
    if (!container) return;

    const profile = teacherHubGetStudentProfile(localOgrenci.email) || {};
    const teachers = teacherHubGetRelevantTeachersForStudent(localOgrenci.email || '');
    const classTitle = teacherHubResolveClassTitle(profile.classId || localOgrenci.teacherCode || '');
    const selectedNotice = (() => {
        const email = (localOgrenci.email || '').toLowerCase();
        let notices = [];
        try { notices = JSON.parse(localStorage.getItem(`${TEACHER_NOTICE_PREFIX}${email}`)) || []; } catch (e) { notices = []; }
        return notices.find(item => String(item.id) === String(studentReplyNoticeId)) || null;
    })();

    const teacherCheckboxes = teachers.length > 0
        ? teachers.map((teacher, index) => `
            <label style="display:flex; gap:8px; align-items:center; padding:6px 8px; border:1px solid #dbe4ff; border-radius:10px; background:#f8fbff; cursor:pointer;">
                <input type="checkbox" class="reply-teacher-cb" data-notice-id="${studentReplyNoticeId || ''}" data-email="${escapeHtml(teacher.teacherEmail || '')}" data-class-id="${escapeHtml(teacher.classId || '')}" ${index === 0 ? 'checked' : ''}>
                <span>
                    ${escapeHtml(teacher.label)}
                    ${teacher.classTitle ? `<small style="display:block; color:#64748b; margin-top:2px;">${escapeHtml(teacher.classTitle)}</small>` : ''}
                </span>
            </label>
        `).join('')
        : '<div class="empty-state" style="padding:10px;">Kayıtlı öğretmen bulunamadı.</div>';

    if (studentChatMode === 'reply') {
        container.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px;">
                <div>
                    <div style="font-size:12px; color:var(--text-muted);">Cevap Ver</div>
                    <strong>${escapeHtml(selectedNotice?.subject || 'Bildirim')}</strong>
                </div>
                <button class="btn btn-secondary btn-small" data-action="open-student-class-chat">Sınıf Sohbeti</button>
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">
                ${selectedNotice ? `Gönderen: ${escapeHtml(selectedNotice.sender || selectedNotice.senderEmail || 'Öğretmen')}${selectedNotice.classId ? ' · Sınıf: ' + escapeHtml(teacherHubResolveClassTitle(selectedNotice.classId) || selectedNotice.classId) : ''}` : ''}
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">Yanıtlayacağın öğretmeni seç:</div>
            <div style="display:grid; gap:8px; margin-bottom:10px; max-height:120px; overflow:auto;">${teacherCheckboxes}</div>
            <textarea id="replyText_${studentReplyNoticeId}" class="modern-textarea" rows="3" placeholder="Cevabını yaz..." style="width:100%;"></textarea>
            <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
                <label for="replyFile_${studentReplyNoticeId}" class="btn btn-secondary" title="Dosya Ekle"><i class="fa-solid fa-paperclip"></i></label>
                <input type="file" id="replyFile_${studentReplyNoticeId}" accept="image/*,application/pdf" capture="camera" style="display:none;">
                <div id="replyFileName_${studentReplyNoticeId}" style="font-size:12px; color:var(--text-muted);">Dosya seçilmedi</div>
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px;">
                <button class="btn btn-secondary btn-small" data-action="teacher-clear-reply" data-id="${studentReplyNoticeId}">Temizle</button>
                <button class="btn btn-primary btn-small" data-action="teacher-send-reply" data-id="${studentReplyNoticeId}">Cevabı Gönder</button>
            </div>
        `;
        bindFileInputLabel(`replyFile_${studentReplyNoticeId}`, `replyFileName_${studentReplyNoticeId}`);
        return;
    }

    container.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px;">
            <div>
                <div style="font-size:12px; color:var(--text-muted);">Sınıf Sohbeti</div>
                    <strong>${escapeHtml(classTitle || 'Sınıf Yok')}</strong>
            </div>
            <button class="btn btn-secondary btn-small" data-action="open-student-reply-last">Hocaya Cevap</button>
        </div>
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">${teachers.length ? 'Sınıfındaki hocalar:' : 'Kayıtlı öğretmen bulunamadı.'}</div>
        <div style="display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap;">${teachers.length ? teachers.map(t => `
            <span class="class-pill" style="background:#eef2ff; color:#1e3a8a;">${escapeHtml(t.classTitle || classTitle || 'Sınıf')}</span>
            <span class="class-pill" style="background:#e2e8f0; color:#0f172a;">${escapeHtml(t.label)}</span>
        `).join('') : ''}</div>
        <div style="display:flex; gap:8px;">
            <input id="studentChatInput" placeholder="Mesaj yazın..." class="modern-input" style="flex:1;">
            <label for="studentChatFile" class="btn btn-secondary" title="Dosya Ekle"><i class="fa-solid fa-paperclip"></i></label>
            <input type="file" id="studentChatFile" accept="image/*,application/pdf" capture="camera" style="display:none;">
            <button class="btn btn-primary" data-action="student-chat-send"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
        <div id="studentChatFileName" style="font-size:12px; color:var(--text-muted); margin-top:6px;">Dosya seçilmedi</div>
    `;
    bindFileInputLabel('studentChatFile', 'studentChatFileName');
}

function teacherHubWriteProfiles(profiles) {
    localStorage.setItem(TEACHER_STUDENT_KEY, JSON.stringify(profiles));
}

function teacherHubGenerateClassId() {
    return `SP-${Math.random().toString(36).slice(2, 5).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function teacherHubGetStudentProfile(email) {
    if (!email) return null;
    const profiles = teacherHubReadProfiles();
    return profiles[email.toLowerCase()] || null;
}

function teacherHubAppendNotice(email, notice) {
    if (!email) return;
    const key = `${TEACHER_NOTICE_PREFIX}${email.toLowerCase()}`;
    let notices = [];
    try { notices = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { notices = []; }
    notices.unshift({ id: Date.now(), read: false, ...notice });
    localStorage.setItem(key, JSON.stringify(notices.slice(0, 20)));

    const profiles = teacherHubReadProfiles();
    const profileKey = email.toLowerCase();
    const profile = profiles[profileKey] || { email: profileKey };
    profile.notifications = Array.isArray(profile.notifications) ? profile.notifications : [];
    profile.notifications.unshift({ id: notice.id, read: false, ...notice });
    profile.notifications = profile.notifications.slice(0, 20);
    profiles[profileKey] = profile;
    teacherHubWriteProfiles(profiles);
}

function teacherHubInferClassIdFromNotices(email) {
    if (!email) return '';
    const key = `${TEACHER_NOTICE_PREFIX}${email.toLowerCase()}`;
    let notices = [];
    try { notices = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { notices = []; }
    for (const notice of notices) {
        if (notice.classId) return String(notice.classId).trim().toUpperCase();
        const body = String(notice.body || '');
        const match = body.match(/Kod:\s*(SP-[A-Z0-9-]+)/i);
        if (match) return match[1].toUpperCase();
    }
    return '';
}

function studentChatGetClassCode() {
    const profile = teacherHubGetStudentProfile(localOgrenci.email) || {};
    return (profile.classId || localOgrenci.teacherCode || localOgrenci.classId || teacherHubInferClassIdFromNotices(localOgrenci.email) || '').toUpperCase();
}

function studentChatLocalKey(classCode) {
    return `student_chat_local_${(classCode || '').toUpperCase()}`;
}

function studentChatReadLocal(classCode) {
    if (!classCode) return [];
    try { return JSON.parse(localStorage.getItem(studentChatLocalKey(classCode))) || []; } catch (e) { return []; }
}

function studentChatSaveLocal(classCode, msg) {
    if (!classCode) return;
    const list = studentChatReadLocal(classCode);
    list.push(msg);
    try { localStorage.setItem(studentChatLocalKey(classCode), JSON.stringify(list.slice(-80))); } catch (e) { /* ignore */ }
}

function studentChatAppendToList(m, showSender) {
    const area = document.getElementById('studentChatList');
    if (!area) return;
    area.insertAdjacentHTML('beforeend', renderChatMessageHtml(m, showSender));
    area.scrollTop = area.scrollHeight;
}

function teacherHubSeedStudentProfile(snapshot) {
    const email = (snapshot.email || localOgrenci.email || '').toLowerCase();
    if (!email) return null;
    const profiles = teacherHubReadProfiles();
    const mevcut = profiles[email] || {};
    const inferredClass = teacherHubInferClassIdFromNotices(email);
    const history = Array.isArray(snapshot.sipHistory)
        ? snapshot.sipHistory
        : Array.isArray(localOgrenci.sipHistory)
            ? localOgrenci.sipHistory
            : Array.isArray(mevcut.sipHistory)
                ? mevcut.sipHistory
                : [];

    profiles[email] = {
        id: snapshot.id || localOgrenci.id || mevcut.id || null,
        name: snapshot.isim || localOgrenci.isim || mevcut.name || '',
        email,
        classId: snapshot.classId || snapshot.teacherCode || localOgrenci.teacherCode || inferredClass || mevcut.classId || '',
        teacherName: snapshot.teacherName || mevcut.teacherName || aktifOgretmen.isim || '',
        engXp: snapshot.engXp ?? localOgrenci.engXp ?? mevcut.engXp ?? 0,
        engLevel: snapshot.engLevel ?? localOgrenci.engLevel ?? mevcut.engLevel ?? 1,
        sipXp: snapshot.sipXp ?? localOgrenci.sipXp ?? mevcut.sipXp ?? 0,
        sipLevel: snapshot.sipLevel ?? localOgrenci.sipLevel ?? mevcut.sipLevel ?? 1,
        sipStreak: snapshot.sipStreak ?? localOgrenci.sipStreak ?? mevcut.sipStreak ?? 0,
        sipLastDate: (snapshot.sipLastDate ?? localOgrenci.sipLastDate ?? mevcut.sipLastDate) || '',
        ogrenilenKelimeler: Array.isArray(snapshot.ogrenilenKelimeler) ? snapshot.ogrenilenKelimeler : (localOgrenci.ogrenilenKelimeler || mevcut.ogrenilenKelimeler || []),
        kacirilanlar: Array.isArray(snapshot.kacirilanlar) ? snapshot.kacirilanlar : (localOgrenci.kacirilanlar || mevcut.kacirilanlar || []),
        sipHistory: Array.isArray(history) ? history : [],
        notifications: Array.isArray(mevcut.notifications) ? mevcut.notifications : [],
        updatedAt: new Date().toISOString()
    };

    teacherHubWriteProfiles(profiles);
    return profiles[email];
}

function teacherHubResolveDates(entry) {
    if (entry && entry.isoTarih) return new Date(entry.isoTarih);
    if (!entry || !entry.tarih) return null;
    const parts = entry.tarih.split('.');
    if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00`);
    }
    const parsed = new Date(entry.tarih);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function teacherHubBuildReport(profile, days = 30) {
    const history = Array.isArray(profile?.sipHistory) ? profile.sipHistory : [];
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recent = history.filter(entry => {
        const date = teacherHubResolveDates(entry);
        return !date || date.getTime() >= cutoff;
    });

    const byExam = {};
    const byTopic = {};
    let totalMinutes = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    recent.forEach(entry => {
        const minutes = Math.max(0, Math.round((entry.sure || 0) / 60));
        const questions = parseInt(entry.soruSayisi, 10) || 0;
        const correct = parseInt(entry.dogruSayisi, 10) || 0;
        const wrong = parseInt(entry.yanlisSayisi, 10) || 0;
        totalMinutes += minutes;
        totalQuestions += questions;
        totalCorrect += correct;
        totalWrong += wrong;
        if (entry.sinav) byExam[entry.sinav] = (byExam[entry.sinav] || 0) + 1;
        const topics = String(entry.konu || '').split(',').map(item => item.trim()).filter(Boolean);
        topics.forEach(topic => { byTopic[topic] = (byTopic[topic] || 0) + 1; });
    });

    const strongest = Object.entries(byTopic).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const weakSubjects = Object.entries(byTopic).sort((a, b) => a[1] - b[1]).slice(0, 3);

    return {
        profile,
        recent,
        totalMinutes,
        totalQuestions,
        totalCorrect,
        totalWrong,
        sessions: recent.length,
        exams: byExam,
        strongest,
        weakSubjects,
        monthlyXp: recent.reduce((sum, entry) => sum + ((parseInt(entry.soruSayisi, 10) || 0) + Math.round((entry.sure || 0) / 120)), 0)
    };
}

function teacherHubSendNotice(targetType, targetValue, subject, body, classId) {
    const state = teacherHubReadState();
    const notice = {
        id: Date.now(),
        targetType,
        targetValue,
        classId: classId || '',
        subject: subject || 'Bildirim',
        body: body || '',
        sender: aktifOgretmen.isim || 'Öğretmen',
        senderEmail: (aktifOgretmen.email || '').toLowerCase(),
        teacherEmail: (aktifOgretmen.email || '').toLowerCase(),
        createdAt: new Date().toISOString()
    };

    state.messages.unshift(notice);
    if (state.messages.length > 50) state.messages = state.messages.slice(0, 50);

    if (targetType === 'class') {
        const profiles = teacherHubReadProfiles();
        Object.values(profiles).forEach(profile => {
            if (profile.classId === targetValue) {
                teacherHubAppendNotice(profile.email, notice);
            }
        });
    } else if (targetType === 'email') {
        teacherHubAppendNotice(targetValue, notice);
    }

    teacherHubWriteState(state);
    return notice;
}

function teacherHubAppendReplyNotice(targetEmail, replyNotice) {
    if (!targetEmail) return;
    teacherHubAppendNotice(targetEmail, replyNotice);
}

function teacherHubBuildClassSummary(classItem, profiles) {
    const memberProfiles = Object.values(profiles).filter(profile => profile.classId === classItem.id || (classItem.students || []).includes(profile.email));
    const reportTotals = memberProfiles.reduce((totals, profile) => {
        const report = teacherHubBuildReport(profile, 30);
        totals.sessions += report.sessions;
        totals.minutes += report.totalMinutes;
        totals.questions += report.totalQuestions;
        totals.correct += report.totalCorrect;
        totals.wrong += report.totalWrong;
        return totals;
    }, { sessions: 0, minutes: 0, questions: 0, correct: 0, wrong: 0 });

    return { memberProfiles, reportTotals };
}

function teacherHubRenderStudentNotices() {
    const panel = document.getElementById('ogrenciBildirimPaneli');
    const list = document.getElementById('ogrenciBildirimListesi');
    if (!panel || !list) return;

    const email = (localOgrenci.email || '').toLowerCase();
    if (!email) {
        panel.style.display = 'none';
        return;
    }

    let notices = [];
    try { notices = JSON.parse(localStorage.getItem(`${TEACHER_NOTICE_PREFIX}${email}`)) || []; } catch (e) { notices = []; }
    const unread = notices.filter(notice => !notice.read);
    if (notices.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    list.innerHTML = notices.slice(0, 4).map(notice => `
        <div class="student-notice ${notice.read ? 'read' : 'unread'}">
            <div class="student-notice-top">
                <strong>${notice.subject}</strong>
                <span>${new Date(notice.createdAt).toLocaleString('tr-TR')}</span>
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:6px; display:flex; gap:10px; flex-wrap:wrap;">
                <span>Gönderen: ${escapeHtml(notice.sender || notice.senderEmail || 'Öğretmen')}</span>
                ${notice.classId ? `<span>Sınıf: ${escapeHtml(teacherHubResolveClassTitle(notice.classId) || notice.classId)}</span>` : ''}
            </div>
            <p>${notice.body}</p>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
                <button class="btn btn-secondary btn-small" data-action="open-student-reply" data-id="${notice.id}">Cevap Ver</button>
            </div>
        </div>
    `).join('');

    const badge = document.getElementById('ogrenciBildirimSayisi');
    if (badge) badge.textContent = unread.length;
}

async function teacherHubSendStudentReply(noticeId) {
    const email = (localOgrenci.email || '').toLowerCase();
    if (!email) return;
    const noticesKey = `${TEACHER_NOTICE_PREFIX}${email}`;
    let notices = [];
    try { notices = JSON.parse(localStorage.getItem(noticesKey)) || []; } catch (e) { notices = []; }
    const notice = notices.find(item => String(item.id) === String(noticeId));
    if (!notice) {
        alert('Bu bildirime cevap verilemedi.');
        return;
    }

    const replyTextEl = document.getElementById(`replyText_${noticeId}`);
    const replyText = (replyTextEl && replyTextEl.value ? replyTextEl.value : '').trim();
    if (!replyText) {
        alert('Önce cevap metni yaz.');
        return;
    }

    const fileEl = document.getElementById(`replyFile_${noticeId}`);
    const uploaded = [];
    if (fileEl && fileEl.files && fileEl.files.length > 0) {
        for (const file of fileEl.files) {
            const url = await uploadAttachment(file);
            if (url) uploaded.push(url);
        }
    }

    const selectedTeachers = Array.from(document.querySelectorAll(`.reply-teacher-cb[data-notice-id="${noticeId}"]:checked`)).map(cb => ({
        email: (cb.getAttribute('data-email') || '').toLowerCase(),
        classId: (cb.getAttribute('data-class-id') || '').toUpperCase()
    })).filter(item => item.email || item.classId);

    if (selectedTeachers.length === 0) {
        alert('En az bir öğretmen seç.');
        return;
    }

    const replyNoticeBase = {
        id: Date.now(),
        targetType: 'email',
        classId: notice.classId || localOgrenci.teacherCode || '',
        subject: `Cevap: ${notice.subject}`,
        body: replyText,
        sender: localOgrenci.isim || email,
        senderEmail: email,
        replyTo: notice.id,
        createdAt: new Date().toISOString()
    };

    for (const teacher of selectedTeachers) {
        const targetEmail = teacher.email || teacher.classId;
        if (!targetEmail) continue;

        const replyNotice = {
            ...replyNoticeBase,
            id: Date.now() + Math.floor(Math.random() * 1000),
            targetValue: targetEmail,
            teacherEmail: targetEmail
        };
        teacherHubAppendReplyNotice(targetEmail, replyNotice);

        try {
            await fetch(JAVA_API_URL + '/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail: email,
                    recipientEmail: targetEmail,
                    classCode: teacher.classId || notice.classId || localOgrenci.teacherCode || '',
                    text: replyText,
                    attachmentUrlsJson: JSON.stringify(uploaded)
                })
            });
        } catch (e) {
            console.warn('Reply chat save failed', e);
        }
    }

    if (replyTextEl) replyTextEl.value = '';
    if (fileEl) fileEl.value = '';
    const fileNameEl = document.getElementById(`replyFileName_${noticeId}`);
    if (fileNameEl) fileNameEl.textContent = 'Dosya seçilmedi';
    studentChatMode = 'class';
    studentReplyNoticeId = null;
    renderStudentChatComposer();
    teacherHubRenderStudentNotices();
    teacherHubRenderTeacherInbox();
    alert('Cevabın seçilen öğretmen(ler)e gönderildi.');
}

const MOTIVATIONAL_QUOTES =[
    "Harika gidiyorsun, başarı sabrın çocuğudur!", 
    "Her saniye hedefine bir adım daha yaklaşıyorsun!", 
    "Bugün döktüğün ter, yarınki zaferindir!", 
    "Disiplin, hedeflerinle başarı arasındaki köprüdür!", 
    "Asla pes etme, efsaneler böyle doğar!"
];

const FUNNY_BREAK_QUOTES =[
    "Süre doldu! Kalk bir su iç, böbreklerin bayram etsin. 🚰",
    "Telefonuna 2 dakika bakabilirsin ama kaybolma! 📱",
    "Hadi ayağa kalk ve biraz esne, kambur oturmaktan sırtın ağrıyacak! 🧘",
    "Gözlerini ekrandan al ve uzaklara bak. Ufku gör! 🌅",
    "Biraz yürüyüş yap, kan dolaşımın hızlansın! 🚶"
];

let aktifHoca = { isim: "Bozkurt", ikon: "<i class='fa-solid fa-dog'></i>" };
let aktifSipSinav = '';
let sipSinavZamanlayici; let sipKalanSaniye = 0;

// YENİ POMODORO DEĞİŞKENLERİ
let pomoMode = { w: 25, b: 5, lb: 20, cycles: 4 }; // Çalışma, Kısa Mola, Uzun Mola, Toplam Döngü
let pomoPhase = 'work'; // 'work', 'shortBreak', 'longBreak'
let pomoCurrentCycle = 1;
let pomoTimeLeft = 0;
let pomoTotalWorkSeconds = 0; // Masadan kalkana kadarki toplam net çalışma (XP için)
let pomoTimerInterval = null;
let isPomoPaused = false;
let studentChatMode = 'class';
let studentReplyNoticeId = null;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function initSiteNavbar() {
    document.querySelectorAll('[data-nav-target]').forEach(el => {
        el.addEventListener('click', (event) => {
            event.preventDefault();
            const target = el.getAttribute('data-nav-target');
            if (target) ekranGoster(target);
        });
    });
    const brand = document.getElementById('navBrandHome');
    if (brand) {
        brand.addEventListener('click', (event) => {
            event.preventDefault();
            ekranGoster('landingEkrani');
        });
    }
}

/** Kart ve panel tıklamaları — inline handler kaybında da çalışır */
function initAppClickDelegation() {
    if (window._sipClickDelegationReady) return;
    window._sipClickDelegationReady = true;

    const sipActionHandlers = {
        sipActionPomodoro: () => pomodoroEkraniAc(),
        sipActionCore: () => ekranGoster('sipCoreEkrani'),
        sipActionGecmis: () => sipGecmisAc(),
        sipActionSinav: () => ekranGoster('sipSinavEkrani'),
        sipActionPuan: () => sipPuanEkraniAc(),
        sipActionWorkspace: () => sipWorkspaceAc(),
        sipActionRoad: () => sipYolHaritasiAc()
    };

    const premiumShortcutHandlers = {
        premiumShortcutPomodoro: () => pomodoroEkraniAc(),
        premiumShortcutSinav: () => ekranGoster('sipSinavEkrani'),
        premiumShortcutGecmis: () => sipGecmisAc(),
        premiumShortcutWorkspace: () => sipWorkspaceAc()
    };

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;

        const sipCard = target.closest('.sip-action-card');
        if (sipCard && sipCard.id && sipActionHandlers[sipCard.id]) {
            event.preventDefault();
            sipActionHandlers[sipCard.id]();
            return;
        }

        const shortcut = target.closest('.premium-shortcut-btn');
        if (shortcut && shortcut.id && premiumShortcutHandlers[shortcut.id]) {
            event.preventDefault();
            premiumShortcutHandlers[shortcut.id]();
            return;
        }

        if (target.closest('#gatewayEnglishCard')) {
            event.preventDefault();
            ekranGoster('seviyeSecimEkrani');
            return;
        }
        if (target.closest('#gatewaySipCard')) {
            event.preventDefault();
            sipDashboardHazirla();
            return;
        }

        const levelCard = target.closest('.gateway-level');
        if (levelCard) {
            const level = levelCard.getAttribute('data-level');
            if (level) {
                event.preventDefault();
                seviyeSec(level);
                return;
            }
        }

        const feature = target.closest('.gateway-feature');
        if (feature) {
            const action = feature.getAttribute('data-action');
            if (action && typeof window[action] === 'function') {
                event.preventDefault();
                window[action]();
                return;
            }
        }

        const goScreen = target.closest('.go-to-screen');
        if (goScreen) {
            const screenId = goScreen.getAttribute('data-target');
            if (screenId) {
                event.preventDefault();
                ekranGoster(screenId, true);
                return;
            }
        }

        if (target.closest('.back-to-dashboard')) {
            event.preventDefault();
            sipDashboardHazirla();
            return;
        }

        if (target.closest('.btn-go-back')) {
            event.preventDefault();
            goBack();
            return;
        }

        if (target.closest('#initPomodoroBtn')) {
            event.preventDefault();
            initPomodoroSession();
            return;
        }
        if (target.closest('#btnPomoPause')) {
            event.preventDefault();
            togglePomoPause();
            return;
        }
        if (target.closest('#btnPomoStop')) {
            event.preventDefault();
            finishPomodoroSession();
            return;
        }
        if (target.closest('#pomoFocusBannerDismiss') || target.closest('#pomoModalStartBtn')) {
            event.preventDefault();
            dismissPomoFocusBanner();
            return;
        }
        if (target.closest('#pomoModalStartBreakBtn')) {
            event.preventDefault();
            startBreakTimerFromModal();
            return;
        }
        if (target.closest('#pomodoroBackBtn')) {
            event.preventDefault();
            stopPomoTimer();
            sipDashboardHazirla();
            return;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => { 
    initSiteNavbar();
    initAppClickDelegation();
    ekranGoster('landingEkrani'); 
    englishHubVerileriYukle();
    workspaceYukle(); 
    connectWebSocket();
    bindFileInputLabel('teacherMessageFile', 'teacherMessageFileName');
    bindFileInputLabel('teacherChatFile', 'teacherChatFileName');
    bindFileInputLabel('studentChatFile', 'studentChatFileName');
    todoListele(); 
    document.addEventListener('click', (event) => {
        const hedef = event.target.closest('button, [onclick], .gateway-card, .sip-action-card, .solid-card, .mascot-option, .mm-node, .lecture-list button, .action-btns button');
        if (hedef) sesEfektiCal('click');
    });
    // Demo butonu bağlama — backend yoksa hızlı deneme için
    const demoBtn = document.getElementById('demoContinueBtn'); if (demoBtn) demoBtn.addEventListener('click', ()=> demoContinue());
});

function bindFileInputLabel(inputId, labelId) {
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);
    if (!input || !label) return;
    input.addEventListener('change', () => {
        const files = input.files;
        if (!files || files.length === 0) {
            label.textContent = 'Dosya seçilmedi';
            return;
        }
        if (files.length === 1) {
            label.textContent = files[0].name;
            return;
        }
        label.textContent = files.length + ' dosya seçildi';
    });
}

function englishHubGetDefaultWords() {
    return typeof KELIME_HAVUZU !== 'undefined' ? KELIME_HAVUZU : { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] };
}

function englishHubGetDefaultNotes() {
    return typeof DERS_NOTLARI !== 'undefined' ? DERS_NOTLARI : {};
}

function englishHubGetDefaultCurriculum() {
    return typeof AI_MUFREDAT !== 'undefined' ? AI_MUFREDAT : {};
}

function englishHubEnsureState() {
    if (!window.KELIME_HAVUZU) window.KELIME_HAVUZU = JSON.parse(JSON.stringify(englishHubGetDefaultWords()));
    if (!window.DERS_NOTLARI) window.DERS_NOTLARI = JSON.parse(JSON.stringify(englishHubGetDefaultNotes()));
    if (!window.AI_MUFREDAT) window.AI_MUFREDAT = JSON.parse(JSON.stringify(englishHubGetDefaultCurriculum()));
}

function englishHubGetWords() {
    englishHubEnsureState();
    return window.KELIME_HAVUZU;
}

function englishHubGetNotes() {
    englishHubEnsureState();
    return window.DERS_NOTLARI;
}

function englishHubGetCurriculum() {
    englishHubEnsureState();
    return window.AI_MUFREDAT;
}

function englishHubLevelHasItems(levelData) {
    return Array.isArray(levelData) && levelData.length > 0;
}

function englishHubWordsHaveContent(words) {
    if (!words || typeof words !== 'object') return false;
    return Object.values(words).some(englishHubLevelHasItems);
}

function englishHubNotesHaveContent(notes) {
    if (!notes || typeof notes !== 'object') return false;
    return Object.keys(notes).length > 0;
}

function englishHubCurriculumHaveContent(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') return false;
    return Object.values(curriculum).some(levelMap =>
        levelMap && typeof levelMap === 'object' &&
        Object.values(levelMap).some(topics => Array.isArray(topics) && topics.length > 0)
    );
}

function englishHubMergeWords(remoteWords) {
    const merged = JSON.parse(JSON.stringify(englishHubGetDefaultWords()));
    if (!remoteWords || typeof remoteWords !== 'object') return merged;
    Object.keys(remoteWords).forEach(level => {
        if (englishHubLevelHasItems(remoteWords[level])) {
            merged[level] = JSON.parse(JSON.stringify(remoteWords[level]));
        }
    });
    return merged;
}

function englishHubMergeNotes(remoteNotes) {
    const merged = JSON.parse(JSON.stringify(englishHubGetDefaultNotes()));
    if (!remoteNotes || typeof remoteNotes !== 'object') return merged;
    Object.assign(merged, remoteNotes);
    return merged;
}

function englishHubMergeCurriculum(remoteCurriculum) {
    const merged = JSON.parse(JSON.stringify(englishHubGetDefaultCurriculum()));
    if (!remoteCurriculum || typeof remoteCurriculum !== 'object') return merged;
    Object.keys(remoteCurriculum).forEach(level => {
        const remoteLevel = remoteCurriculum[level];
        if (!remoteLevel || typeof remoteLevel !== 'object') return;
        merged[level] = merged[level] || {};
        Object.keys(remoteLevel).forEach(category => {
            const topics = remoteLevel[category];
            if (Array.isArray(topics) && topics.length > 0) {
                merged[level][category] = [...topics];
            }
        });
    });
    return merged;
}

function englishHubApplyState(state) {
    englishHubEnsureState();
    if (!state || typeof state !== 'object') return;
    if (state.words && typeof state.words === 'object') {
        window.KELIME_HAVUZU = englishHubMergeWords(state.words);
    }
    if (state.notes && typeof state.notes === 'object') {
        window.DERS_NOTLARI = englishHubMergeNotes(state.notes);
    }
    if (state.curriculum && typeof state.curriculum === 'object') {
        window.AI_MUFREDAT = englishHubMergeCurriculum(state.curriculum);
    }
}

function englishHubHasRemoteContent(state) {
    if (!state || typeof state !== 'object') return false;
    return Boolean(
        englishHubWordsHaveContent(state.words) ||
        englishHubNotesHaveContent(state.notes) ||
        englishHubCurriculumHaveContent(state.curriculum)
    );
}

async function englishHubSyncState() {
    const payload = {
        words: englishHubGetWords(),
        notes: englishHubGetNotes(),
        curriculum: englishHubGetCurriculum()
    };

    const res = await fetch(JAVA_API_URL + '/api/english-hub/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error('English Hub verisi kaydedilemedi');
    }

    const saved = await res.json();
    englishHubApplyState(saved);
    return saved;
}

function authModDegistir(mod) {
    document.getElementById('girisFormu').classList.remove('active');
    document.getElementById('kayitFormu').classList.remove('active');
    document.getElementById('btnGirisToggle').classList.remove('active');
    document.getElementById('btnKayitToggle').classList.remove('active');
    document.getElementById('loginHata').style.display = 'none';
    document.getElementById('regHata').style.display = 'none';

    if(mod === 'giris') {
        document.getElementById('girisFormu').classList.add('active');
        document.getElementById('btnGirisToggle').classList.add('active');
    } else {
        document.getElementById('kayitFormu').classList.add('active');
        document.getElementById('btnKayitToggle').classList.add('active');
    }
}

function authModDegistir(mod) {
    document.getElementById('girisFormu').classList.remove('active');
    document.getElementById('kayitFormu').classList.remove('active');
    document.getElementById('btnGirisToggle').classList.remove('active');
    document.getElementById('btnKayitToggle').classList.remove('active');
    document.getElementById('loginHata').style.display = 'none';
    document.getElementById('regHata').style.display = 'none';

    if(mod === 'giris') {
        document.getElementById('girisFormu').classList.add('active');
        document.getElementById('btnGirisToggle').classList.add('active');
    } else {
        document.getElementById('kayitFormu').classList.add('active');
        document.getElementById('btnKayitToggle').classList.add('active');
    }
}

function girisSonrasiVeriYukle() {
    // MySQL'den gelen String (metin) formatındaki listeleri tekrar Array'e (diziye) çeviriyoruz
    try { localOgrenci.ogrenilenKelimeler = localOgrenci.ogrenilenKelimeler ? JSON.parse(localOgrenci.ogrenilenKelimeler) : []; } catch(e) { localOgrenci.ogrenilenKelimeler = []; }
    try { localOgrenci.kacirilanlar = localOgrenci.kacirilanlar ? JSON.parse(localOgrenci.kacirilanlar) : []; } catch(e) { localOgrenci.kacirilanlar = []; }
    try { localOgrenci.sipHistory = localOgrenci.sipHistory ? JSON.parse(localOgrenci.sipHistory) : []; } catch(e) { localOgrenci.sipHistory = []; }
    try { localOgrenci.dna = localOgrenci.dna ? JSON.parse(localOgrenci.dna) : null; } catch(e) { localOgrenci.dna = null; }

    const seededProfile = teacherHubSeedStudentProfile(localOgrenci);
    if (seededProfile && seededProfile.classId) {
        localOgrenci.teacherCode = seededProfile.classId;
    }

    arayuzXpGuncelle();
    ekranGoster('anaKapiEkrani');
    
    // Ekrana Java'dan gelen gerçek ismini yazdırıyoruz
    document.querySelector('#anaKapiEkrani h1').innerHTML = `Hoş Geldin, <span style="color:#60a5fa;">${localOgrenci.isim}</span>`;
    teacherHubRenderStudentNotices();
    sesEfektiCal('dogru');
    // Öğrenci girişinde sohbet widget'ını göster
    if (aktifRol === 'student') {
        showStudentChatToggle();
        // Subscribe to student's class topic for real-time chat
        const profile = teacherHubGetStudentProfile(localOgrenci.email) || {};
        const classCode = studentChatGetClassCode();
        if (classCode) subscribeToClass(classCode);
    }

    // fill remembered email if present
    try {
        const remembered = localStorage.getItem('sipRememberEmail');
        if (remembered && document.getElementById('loginEmail')) document.getElementById('loginEmail').value = remembered;
    } catch(e) {}
}

// Post-login seçim modalını gösterir
function showPostLoginChoice() {
    try {
        const modal = document.getElementById('postLoginChoiceModal');
        if (!modal) return ekranGoster('anaKapiEkrani');
        modal.style.display = 'flex';
        // focus first button for accessibility
        const btn = document.getElementById('chooseSipBtn') || document.getElementById('chooseEnglishBtn');
        if (btn) btn.focus();
    } catch (e) { console.warn('showPostLoginChoice failed', e); ekranGoster('anaKapiEkrani'); }
}

function chooseEnglish() {
    try { localStorage.setItem('sipPreferredModule', 'english'); } catch(e){}
    document.getElementById('postLoginChoiceModal').style.display = 'none';
    ekranGoster('seviyeSecimEkrani');
}

function chooseSIP() {
    try { localStorage.setItem('sipPreferredModule', 'sip'); } catch(e){}
    document.getElementById('postLoginChoiceModal').style.display = 'none';
    // prepare dashboard then show
    try { sipDashboardHazirla(); } catch(e) { }
    ekranGoster('anaKapiEkrani');
}

async function verileriKaydetSip() {
    // Çevrimdışı durumlara karşı yedek
    localStorage.setItem('sipData_' + localOgrenci.isim, JSON.stringify(localOgrenci));
    teacherHubSeedStudentProfile(localOgrenci);

    if (!localOgrenci.id) return; // Öğrenci ID'si yoksa veritabanına yollama

    // Veritabanına gidecek paketi hazırlıyoruz (Listeler String olmak zorunda)
    const payload = {
        engXp: localOgrenci.engXp,
        engLevel: localOgrenci.engLevel,
        sipXp: localOgrenci.sipXp,
        sipLevel: localOgrenci.sipLevel,
        sipStreak: localOgrenci.sipStreak,
        sipLastDate: localOgrenci.sipLastDate,
        ogrenilenKelimeler: JSON.stringify(localOgrenci.ogrenilenKelimeler),
        kacirilanlar: JSON.stringify(localOgrenci.kacirilanlar),
        sipHistory: JSON.stringify(localOgrenci.sipHistory),
        dna: JSON.stringify(localOgrenci.dna)
    };

    try {
        const response = await fetch(JAVA_API_URL + "/update/" + localOgrenci.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(response.ok) {
            console.log("Veritabanı başarıyla güncellendi!");
        }
    } catch (e) {
        console.warn("Sunucuya bağlanılamadı, veriler sadece yerelde saklandı.", e);
    }
}
function ekranGoster(id, pushHistory = true) {
    // safety: ensure target exists
    const target = document.getElementById(id);
    if (!target) return;
    if (id !== 'sipPomodoroEkrani') {
        const activePomo = document.getElementById('sipPomodoroEkrani');
        if (activePomo && activePomo.classList.contains('active')) {
            stopPomoTimer();
            hidePomoModals();
        }
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    target.classList.add('active');
    // small auth-card entrance animation
    if (id === 'authEkrani') {
        try {
            const card = document.querySelector('#authEkrani .auth-card');
            if (card) { card.classList.remove('show'); setTimeout(() => card.classList.add('show'), 40); }
        } catch (e) {}
    }
    if (typeof mobileQuickNavSetActive === 'function') mobileQuickNavSetActive(id);
    if (typeof mobileQuickNavRefreshBadges === 'function') mobileQuickNavRefreshBadges(id);
    if (id === 'adminPaneliEkrani') {
        if (typeof renderTeacherHub === 'function') renderTeacherHub();
    }
    if (id === 'sipSinavEkrani') {
        if (typeof sipSoruHavuzuHazirla === 'function') sipSoruHavuzuHazirla();
    }
    if (id === 'anaKapiEkrani') {
        if (typeof teacherHubRenderStudentNotices === 'function') teacherHubRenderStudentNotices();
    }
    // push history state so mobile browser Back works
    try {
        if (pushHistory) {
            history.pushState({ screen: id }, '', '#' + id);
            // also maintain an internal navigation stack for WebViews where history.back() is unreliable
            try { window._sipNavStack = window._sipNavStack || []; window._sipNavStack.push(id); } catch(e) {}
        }
    } catch (e) { /* ignore */ }
    bozkurtSustur();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function (ev) {
    try {
        const state = ev.state && ev.state.screen ? ev.state.screen : null;
        if (state) {
            // do not push a new history entry when responding to popstate
            ekranGoster(state, false);
        } else {
            // no state -> fall back to landing or first .screen
            const active = document.querySelector('.screen.active');
            if (!active) {
                const first = document.querySelector('.screen');
                if (first && first.id) ekranGoster(first.id, false);
            }
        }
    } catch (e) { console.warn('popstate handling failed', e); }
});

// Generic goBack helper: prefer history.back(), otherwise fallback to a safe screen
function goBack() {
    // Prefer internal navigation stack (more reliable in WebViews). If absent, fall back to history.back().
    try {
        window._sipNavStack = window._sipNavStack || [];
        const stack = window._sipNavStack;
        if (stack.length > 1) {
            // pop current and navigate to previous
            stack.pop();
            const prev = stack[stack.length - 1];
            if (prev) { ekranGoster(prev, false); return; }
        }
    } catch (e) { /* ignore */ }
    try {
        if (window.history && history.length > 1) {
            history.back();
            return;
        }
    } catch (e) {}
    // final fallback: show main gate
    try { ekranGoster('anaKapiEkrani', false); } catch (e) {}
}

// Helper: close post-login choice modal and go to main gate
function closePostLoginChoiceAndGoToGate() {
    try { const m = document.getElementById('postLoginChoiceModal'); if (m) m.style.display = 'none'; } catch(e){}
    try { ekranGoster('anaKapiEkrani'); } catch(e){}
}

// Helper: close pomodoro log modal without saving and return to dashboard
function closePomodoroLogNoSave() {
    hideOverlayModal('pomodoroLogModal');
    try { sipDashboardHazirla(); } catch(e) { ekranGoster('sipDashboardEkrani'); }
}

// Attach manual listeners for elements we replaced inline handlers for
window.addEventListener('DOMContentLoaded', () => {
    try {
        const btn = document.getElementById('postLoginChoiceLaterBtn');
        if (btn) btn.addEventListener('click', closePostLoginChoiceAndGoToGate);
    } catch(e){}
    try {
        const btn2 = document.getElementById('pomodoroLogCloseNoSaveBtn');
        if (btn2) btn2.addEventListener('click', closePomodoroLogNoSave);
    } catch(e){}
    // Bind migrated static handlers
    try {
        const landingBtn = document.getElementById('landingCtaBtn'); if (landingBtn) landingBtn.addEventListener('click', ()=> ekranGoster('authEkrani'));
        const gatewayEnglish = document.getElementById('gatewayEnglishCard'); if (gatewayEnglish) gatewayEnglish.addEventListener('click', ()=> ekranGoster('seviyeSecimEkrani'));
        const gatewaySip = document.getElementById('gatewaySipCard'); if (gatewaySip) gatewaySip.addEventListener('click', ()=> sipDashboardHazirla());
        const btnToGate = document.getElementById('btnToGate'); if (btnToGate) btnToGate.addEventListener('click', ()=> ekranGoster('anaKapiEkrani'));

        const pPom = document.getElementById('premiumShortcutPomodoro'); if (pPom) pPom.addEventListener('click', ()=> pomodoroEkraniAc());
        const pSin = document.getElementById('premiumShortcutSinav'); if (pSin) pSin.addEventListener('click', ()=> ekranGoster('sipSinavEkrani'));
        const pGec = document.getElementById('premiumShortcutGecmis'); if (pGec) pGec.addEventListener('click', ()=> sipGecmisAc());
        const pWs = document.getElementById('premiumShortcutWorkspace'); if (pWs) pWs.addEventListener('click', ()=> sipWorkspaceAc());

        const aPom = document.getElementById('sipActionPomodoro'); if (aPom) aPom.addEventListener('click', ()=> pomodoroEkraniAc());
        const aCore = document.getElementById('sipActionCore'); if (aCore) aCore.addEventListener('click', ()=> ekranGoster('sipCoreEkrani'));
        const aGec = document.getElementById('sipActionGecmis'); if (aGec) aGec.addEventListener('click', ()=> sipGecmisAc());
        const aSin = document.getElementById('sipActionSinav'); if (aSin) aSin.addEventListener('click', ()=> ekranGoster('sipSinavEkrani'));
        const aPuan = document.getElementById('sipActionPuan'); if (aPuan) aPuan.addEventListener('click', ()=> sipPuanEkraniAc());
        const aWs = document.getElementById('sipActionWorkspace'); if (aWs) aWs.addEventListener('click', ()=> sipWorkspaceAc());
        const aRoad = document.getElementById('sipActionRoad'); if (aRoad) aRoad.addEventListener('click', ()=> sipYolHaritasiAc());
    } catch(e) { console.warn('Binding migrated handlers failed', e); }
    // Bind other migrated/auth/pomodoro buttons
    try {
        const rStudent = document.getElementById('roleStudent'); if (rStudent) rStudent.addEventListener('click', ()=> rolSec('student'));
        const rTeacher = document.getElementById('roleTeacher'); if (rTeacher) rTeacher.addEventListener('click', ()=> rolSec('teacher'));
        const btnGirisT = document.getElementById('btnGirisToggle'); if (btnGirisT) btnGirisT.addEventListener('click', ()=> authModDegistir('giris'));
        const btnKayitT = document.getElementById('btnKayitToggle'); if (btnKayitT) btnKayitT.addEventListener('click', ()=> authModDegistir('kayit'));
        const chooseEng = document.getElementById('chooseEnglishBtn'); if (chooseEng) chooseEng.addEventListener('click', ()=> chooseEnglish());
        const chooseSip = document.getElementById('chooseSipBtn'); if (chooseSip) chooseSip.addEventListener('click', ()=> chooseSIP());
        const localeBtn = document.getElementById('localeToggleBtn'); if (localeBtn) localeBtn.addEventListener('click', ()=> toggleUiLocale());

        const initPomo = document.getElementById('initPomodoroBtn'); if (initPomo) initPomo.addEventListener('click', ()=> initPomodoroSession());
        const pomoBack = document.getElementById('pomodoroBackBtn'); if (pomoBack) pomoBack.addEventListener('click', ()=> sipDashboardHazirla());
        const pomoPause = document.getElementById('btnPomoPause'); if (pomoPause) pomoPause.addEventListener('click', ()=> togglePomoPause());
        const pomoStop = document.getElementById('btnPomoStop'); if (pomoStop) pomoStop.addEventListener('click', ()=> finishPomodoroSession());
        const pomoModalStart = document.getElementById('pomoModalStartBtn'); if (pomoModalStart) pomoModalStart.addEventListener('click', ()=> startPomoTimerFromModal());
        const pomoModalBreak = document.getElementById('pomoModalStartBreakBtn'); if (pomoModalBreak) pomoModalBreak.addEventListener('click', ()=> startBreakTimerFromModal());
        const pomoSave = document.getElementById('pomoSaveBtn'); if (pomoSave) pomoSave.addEventListener('click', ()=> savePomodoroSession());
        const levelContinue = document.getElementById('levelUpContinueBtn'); if (levelContinue) levelContinue.addEventListener('click', ()=> closeLevelUpModal());
        const chatToggle = document.getElementById('toggleStudentChatBtn'); if (chatToggle) chatToggle.addEventListener('click', toggleStudentChat);
    } catch(e) { console.warn('Binding other migrated handlers failed', e); }
    // Delegated bindings for level cards, dynamic-map buttons and back-to-dashboard
    try {
        document.querySelectorAll('.gateway-level').forEach(el => el.addEventListener('click', (ev) => {
            const lvl = el.getAttribute('data-level'); if (lvl) seviyeSec(lvl);
        }));

        document.querySelectorAll('.dynamic-map-btn').forEach(btn => btn.addEventListener('click', ()=> {
            const m = btn.getAttribute('data-map'); if (m) try { dinamikHaritaOlustur(m); } catch(e) { console.warn(e); }
        }));

        document.querySelectorAll('.back-to-dashboard').forEach(b => b.addEventListener('click', ()=> sipDashboardHazirla()));

        const btnChangeLevel = document.getElementById('btnChangeLevel'); if (btnChangeLevel) btnChangeLevel.addEventListener('click', ()=> ekranGoster('seviyeSecimEkrani'));
        const btnHoca = document.getElementById('btnHocaDegistir'); if (btnHoca) btnHoca.addEventListener('click', ()=> ekranGoster('hocaSecimEkrani'));
    } catch(e) { console.warn('Delegated bindings failed', e); }
    // Handle core-tab and core-action delegation
    try {
        document.querySelectorAll('.core-tab-btn').forEach(btn => btn.addEventListener('click', ()=> {
            const t = btn.getAttribute('data-tab'); if (t) try { coreSekmeGoster(t); } catch(e){}
        }));
        document.querySelectorAll('.core-action').forEach(btn => btn.addEventListener('click', ()=> {
            const a = btn.getAttribute('data-action'); if (a && typeof window[a] === 'function') window[a]();
        }));

        document.querySelectorAll('.gateway-feature').forEach(el => el.addEventListener('click', ()=> {
            const act = el.getAttribute('data-action'); if (act && typeof window[act] === 'function') window[act]();
        }));

        const todoBtn = document.getElementById('todoAddBtn'); if (todoBtn) todoBtn.addEventListener('click', ()=> todoEkle());
        const wsSave = document.getElementById('workspaceSaveBtn'); if (wsSave) wsSave.addEventListener('click', ()=> workspaceKaydet());
        document.querySelectorAll('.back-to-dashboard').forEach(b => b.addEventListener('click', ()=> sipDashboardHazirla()));
    } catch(e) { console.warn('Core delegation binding failed', e); }
    try {
        const sipPuanBtn = document.getElementById('sipPuanHesaplaBtn'); if (sipPuanBtn) sipPuanBtn.addEventListener('click', ()=> sipPuanHesapla());
        document.querySelectorAll('.btn-go-back').forEach(b => b.addEventListener('click', ()=> goBack()));
    } catch(e) { console.warn('Binding sipPuan/goBack failed', e); }

    try {
        const sinavBaslat = document.getElementById('sinavBaslatBtn'); if (sinavBaslat) sinavBaslat.addEventListener('click', ()=> sipSinavBaslat());
        const sinavBitir = document.getElementById('sinavBitirBtn'); if (sinavBitir) sinavBitir.addEventListener('click', ()=> sipSinavBitir());
        const sinavGeri = document.getElementById('sinavGeriBtn'); if (sinavGeri) sinavGeri.addEventListener('click', ()=> sipDashboardHazirla());

        // Mascot options (data attributes)
        document.querySelectorAll('.mascot-option').forEach(el => el.addEventListener('click', ()=> {
            const name = el.getAttribute('data-mascot'); const icon = el.getAttribute('data-mascot-icon'); if (name) hocaAyarla(name, icon||'');
        }));

        // go-to-screen links
        document.querySelectorAll('.go-to-screen').forEach(b => b.addEventListener('click', ()=> {
            const t = b.getAttribute('data-target'); if (t) ekranGoster(t, true);
        }));

        // Flashcard bindings
        const speakBtns = document.querySelectorAll('[data-speak-target]'); speakBtns.forEach(sb => sb.addEventListener('click', (e)=> {
            const tgt = sb.getAttribute('data-speak-target'); if (tgt) telaffuzEt(e, tgt);
        }));
        const fcMain = document.getElementById('fcIngilizce'); const fcTurk = document.getElementById('fcTurkce');
        if (fcMain) fcMain.addEventListener('click', ()=> flashcardCevir());
        document.querySelectorAll('.flashcard-toggle').forEach(el => el.addEventListener('click', ()=> flashcardCevir()));
        const sonrakiFc = document.getElementById('sonrakiFlashcardBtn'); if (sonrakiFc) sonrakiFc.addEventListener('click', ()=> sonrakiFlashcard());

        // Yazma kontrol
        const yzk = document.getElementById('yazmaKontrolBtn'); if (yzk) yzk.addEventListener('click', ()=> yazmaKontrolEt());

        // Mascot container and mic
        const mascotCont = document.getElementById('mascotContainer'); if (mascotCont) mascotCont.addEventListener('click', ()=> bozkurtSustur());
        const micBtn = document.getElementById('micButton'); if (micBtn) micBtn.addEventListener('click', ()=> sesliDinle());

        // Game bindings
        const oyunuBaslatBtn = document.getElementById('oyunuBaslatBtn'); if (oyunuBaslatBtn) oyunuBaslatBtn.addEventListener('click', ()=> oyunuBaslat());
        const kelimeKarti = document.getElementById('kelimeKarti'); if (kelimeKarti) kelimeKarti.addEventListener('click', ()=> oyunKartiCevir());
        const dogruBtn = document.getElementById('dogruTahminBtn'); if (dogruBtn) dogruBtn.addEventListener('click', ()=> dogruTahmin());
        const tabuBtn = document.getElementById('tabuKullandiBtn'); if (tabuBtn) tabuBtn.addEventListener('click', ()=> tabuKullandi());
        const turBitirBtn = document.getElementById('turBitirBtn'); if (turBitirBtn) turBitirBtn.addEventListener('click', ()=> turBitir());
    } catch(e) { console.warn('Advanced bindings failed', e); }

    try {
        const modalOverlay = document.getElementById('modalOverlay'); if (modalOverlay) modalOverlay.addEventListener('click', ()=> haritaModalKapat());
        const haritaClose = document.getElementById('haritaModalCloseBtn'); if (haritaClose) haritaClose.addEventListener('click', ()=> haritaModalKapat());

        document.querySelectorAll('.mobile-nav-toggle').forEach(b => b.addEventListener('click', ()=> mobileQuickNavToggle()));
        document.querySelectorAll('.mobile-quick-nav-item').forEach(b => b.addEventListener('click', ()=> {
            const tgt = b.getAttribute('data-target'); const act = b.getAttribute('data-action');
            if (tgt) ekranGoster(tgt, true); else if (act && typeof window[act] === 'function') window[act]();
        }));
    } catch(e) { console.warn('Modal/mobile nav bindings failed', e); }
});

function sesEfektiCal(tip) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
    if (tip === 'dogru') { oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.3); } 
    else if (tip === 'yanlis') { oscillator.type = 'sawtooth'; oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2); gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2); oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.2); } 
    else if (tip === 'pas') { oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(400, audioCtx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2); gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2); oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.2); } 
    else if (tip === 'sure') { oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.1); } 
    else if (tip === 'click') { oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.05); gainNode.gain.setValueAtTime(0.035, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08); oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.08); }
    else if (tip === 'oyunbitti' || tip === 'levelup') { oscillator.type = 'square'; oscillator.frequency.setValueAtTime(400, audioCtx.currentTime); oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.2); oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.4); oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.6); gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8); oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.8); }
}

function patlatKonfeti() {
    var duration = 3 * 1000; var animationEnd = Date.now() + duration; var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }
    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now(); if (timeLeft <= 0) return clearInterval(interval);
        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

function xpGuncelle(kazanilanXP) {
    localOgrenci.engXp += kazanilanXP;
    if(localOgrenci.engXp >= 100) { 
        localOgrenci.engLevel += Math.floor(localOgrenci.engXp / 100); 
        localOgrenci.engXp = localOgrenci.engXp % 100; 
        if(kazanilanXP > 0) { 
            sesEfektiCal('oyunbitti'); 
            alert(`Tebrikler! İngilizce Level ${localOgrenci.engLevel} oldun! 🎉`); 
        } 
    }
    arayuzXpGuncelle();
    
    // YENİ EKLENEN KISIM: XP artar artmaz Java'ya (Veritabanına) yolla!
    javaUpdateEng(); 
}
function arayuzXpGuncelle() {
    if(document.getElementById('userLevelTxt')) {
        document.getElementById('userLevelTxt').textContent = `Level ${localOgrenci.engLevel} Öğrenci`; 
        document.getElementById('userXpTxt').textContent = `${localOgrenci.engXp} / 100 XP`; 
        document.getElementById('xpBarFill').style.width = `${localOgrenci.engXp}%`;
    }
}

function hocaAyarla(isim, ikon) { aktifHoca = { isim: isim, ikon: ikon }; document.getElementById('aiHocaIcon').innerHTML = ikon; document.getElementById('aiHocaIsim').textContent = isim; document.getElementById('oyunMiniHoca').innerHTML = ikon; ekranGoster('seviyeDashboard'); }
function hocaReaksiyon(tip) { const miniHoca = document.getElementById('oyunMiniHoca'); miniHoca.className = 'mini-hoca'; void miniHoca.offsetWidth; if(tip === 'dogru') miniHoca.classList.add('anim-correct'); else if(tip === 'yanlis') miniHoca.classList.add('anim-wrong'); }
function seviyeSec(seviye) { 
    sesEfektiCal('dogru'); 
    seciliGenelSeviye = seviye; 
    document.getElementById('seciliSeviyeBaslik').textContent = seviye + " Seviyesi"; 
    
    // Hata verse bile sistemin çökmesini engeller
    ekranGoster('seviyeDashboard'); 
    arayuzXpGuncelle(); 
}

// Hızlı demo: login olmadan demo verileriyle devam et
function demoContinue() {
    try {
        localOgrenci = { id: null, isim: 'Demo Kullanıcı', email: 'demo@local', engXp: 10, engLevel: 1, ogrenilenKelimeler: [], kacirilanlar: [], dna: null, kampanyalar: [], sipXp: 5, sipLevel: 1, sipStreak: 0, sipLastDate: '', sipHistory: [] };
        // Ensure at least minimal english hub data exists so UI shows modules
        if (!window.KELIME_HAVUZU || Object.keys(window.KELIME_HAVUZU).length === 0) {
            window.KELIME_HAVUZU = window.KELIME_HAVUZU || {};
            window.KELIME_HAVUZU['A1'] = window.KELIME_HAVUZU['A1'] || [ { eng: 'EMERGENCY', tr: 'Acil Durum' }, { eng: 'HUNGRY', tr: 'Aç' }, { eng: 'CLEAR', tr: 'Açık, Net' } ];
        }
        arayuzXpGuncelle();
        ekranGoster('seviyeSecimEkrani');
    } catch(e) { console.warn('demoContinue failed', e); ekranGoster('anaKapiEkrani'); }
}

/* --- YENİ POMODORO & AKADEMİK GEÇMİŞ (DÖNGÜLÜ SİSTEM) --- */

function sipDashboardHazirla() {
    const todayStr = new Date().toLocaleDateString('tr-TR');
    if (!Array.isArray(localOgrenci.sipHistory)) {
        try { localOgrenci.sipHistory = localOgrenci.sipHistory ? JSON.parse(localOgrenci.sipHistory) : []; } catch (e) { localOgrenci.sipHistory = []; }
    }
    if (typeof localOgrenci.sipStreak !== 'number') localOgrenci.sipStreak = parseInt(localOgrenci.sipStreak) || 0;
    if(localOgrenci.sipLastDate && localOgrenci.sipLastDate !== todayStr) {
        let yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (localOgrenci.sipLastDate !== yesterday.toLocaleDateString('tr-TR')) { localOgrenci.sipStreak = 0; }
    }
    let bugunSureDk = 0; let bugunSoru = 0;
    localOgrenci.sipHistory.forEach(h => {
        if(h.tarih === todayStr) { bugunSureDk += Math.floor(h.sure / 60); bugunSoru += parseInt(h.soruSayisi) || 0; }
    });
    document.getElementById('sipGunlukSureTxt').textContent = `${Math.floor(bugunSureDk/60)}s ${bugunSureDk%60}dk`;
    document.getElementById('sipGunlukSoruTxt').textContent = bugunSoru;
    document.getElementById('sipStreakTxt').textContent = `${localOgrenci.sipStreak} Gün`;
    document.getElementById('sipLevelTxtTxt').textContent = `Level ${localOgrenci.sipLevel} Akademik Başarı`;
    document.getElementById('sipXpTxt').textContent = `${localOgrenci.sipXp} / 100 XP`;
    document.getElementById('sipXpBarFill').style.width = `${localOgrenci.sipXp}%`;
    const sipGunlukSureTxtMini = document.getElementById('sipGunlukSureTxtMini');
    const sipGunlukSoruTxtMini = document.getElementById('sipGunlukSoruTxtMini');
    const sipStreakTxtMini = document.getElementById('sipStreakTxtMini');
    if (sipGunlukSureTxtMini) sipGunlukSureTxtMini.textContent = `${Math.floor(bugunSureDk/60)}s ${bugunSureDk%60}dk`;
    if (sipGunlukSoruTxtMini) sipGunlukSoruTxtMini.textContent = String(bugunSoru);
    if (sipStreakTxtMini) sipStreakTxtMini.textContent = `${localOgrenci.sipStreak} Gün`;
    ekranGoster('sipDashboardEkrani');

    // Render sparklines for last 7 days (minutes, questions, streak)
    try {
        // build last 7 days arrays: fullDateStrings for comparisons and labels for display
        const last7Dates = [];
        const last7Labels = [];
        const labelFmt = new Intl.DateTimeFormat(UI_LOCALE, { day: '2-digit', month: 'short' });
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            last7Dates.push(d.toLocaleDateString('tr-TR'));
            last7Labels.push(labelFmt.format(d));
        }
        const minutesData = last7Dates.map(day => {
            const total = (localOgrenci.sipHistory || []).reduce((s, entry) => (entry.tarih === day ? s + Math.floor((entry.sure || 0) / 60) : s), 0);
            return total;
        });
        const questionsData = last7Dates.map(day => {
            return (localOgrenci.sipHistory || []).reduce((s, entry) => (entry.tarih === day ? s + (parseInt(entry.soruSayisi,10)||0) : s), 0);
        });
        const streakData = last7Dates.map(day => {
            return ((localOgrenci.sipHistory || []).some(e => e.tarih === day) ? 1 : 0);
        });

        renderSparkline('sipSparklineSure', minutesData, {stroke:'#4f46e5'});
        renderSparkline('sipSparklineSoru', questionsData, {stroke:'#0ea5a1'});
        renderSparkline('sipSparklineStreak', streakData, {stroke:'#ef4444'});
        // attach tooltip handlers with localized labels
        try { attachSparklineTooltip(document.getElementById('sipSparklineSure'), minutesData, { labels: last7Labels, type: 'minutes' }); } catch(e){}
        try { attachSparklineTooltip(document.getElementById('sipSparklineSoru'), questionsData, { labels: last7Labels, type: 'questions' }); } catch(e){}
        try { attachSparklineTooltip(document.getElementById('sipSparklineStreak'), streakData, { labels: last7Labels, type: 'streak' }); } catch(e){}
            try { attachSparklineTooltip(document.getElementById('sipSparklineSure'), minutesData, { labels: last7, type: 'minutes' }); } catch(e){}
            try { attachSparklineTooltip(document.getElementById('sipSparklineSoru'), questionsData, { labels: last7, type: 'questions' }); } catch(e){}
            try { attachSparklineTooltip(document.getElementById('sipSparklineStreak'), streakData, { labels: last7, type: 'streak' }); } catch(e){}
    } catch (e) { console.warn('Sparkline render error', e); }

    // Mobile accessibility: focus and nav helpers
    try {
        if (typeof mobileQuickNavSetActive === 'function') mobileQuickNavSetActive('sipDashboardEkrani');
        // ensure quick nav shows active and is visible on small screens
        const nav = document.querySelector('.mobile-quick-nav');
        if (nav && window.innerWidth <= 768) nav.classList.add('expanded');
        // add tabindex/aria to actionable items for screen readers and keyboard navigation
        document.querySelectorAll('.premium-shortcut-btn, .sip-action-card, .gateway-card, .sip-action-grid .premium-shortcut-btn').forEach((el, idx) => {
            try { el.setAttribute('tabindex', '0'); } catch (e) {}
            try { if (!el.getAttribute('role')) el.setAttribute('role', 'button'); } catch(e){}
            try { if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', (el.innerText || el.textContent || 'Action').trim()); } catch(e){}
        });
        // focus first primary action for easier reach
        const firstAction = document.querySelector('.premium-shortcut-btn, .sip-action-card, .gateway-card');
        if (firstAction && typeof firstAction.focus === 'function') firstAction.focus();
    } catch(e) { /* non-fatal */ }
}

function renderSparkline(svgId, dataArr, opts = {}) {
    const svg = document.getElementById(svgId);
    if (!svg || !Array.isArray(dataArr) || dataArr.length === 0) return;
    const w = svg.viewBox.baseVal.width || svg.getAttribute('width') || 120;
    const h = svg.viewBox.baseVal.height || svg.getAttribute('height') || 30;
    const pad = 4;
    const max = Math.max(...dataArr, 1);
    const min = Math.min(...dataArr, 0);
    const len = dataArr.length;
    const step = (w - pad*2) / Math.max(len - 1, 1);
    const points = dataArr.map((v, i) => {
        const x = pad + (i * step);
        const norm = (v - min) / Math.max((max - min), 1);
        const y = h - pad - (norm * (h - pad*2));
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    const d = points.map((p, i) => (i === 0 ? 'M ' + p : 'L ' + p)).join(' ');

    // main line path
    let path = svg.querySelector('path.sparkline-line');
    if (!path) {
        path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.classList.add('sparkline-line');
        svg.appendChild(path);
    }
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', opts.stroke || '#4f46e5');
    path.setAttribute('stroke-width', opts.width || 1.6);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    // optional filled area under the line
    if (opts.fill) {
        let area = svg.querySelector('path.sparkline-area');
        const baseline = `${(pad)},${h - pad}`;
        const areaD = d + ' L ' + (pad + (len - 1) * step).toFixed(2) + ',' + (h - pad).toFixed(2) + ' L ' + baseline + ' Z';
        if (!area) {
            area = document.createElementNS('http://www.w3.org/2000/svg','path');
            area.classList.add('sparkline-area');
            svg.insertBefore(area, path);
        }
        area.setAttribute('d', areaD);
        area.setAttribute('fill', opts.fill === true ? (opts.stroke || '#4f46e5') + '33' : opts.fill);
        area.setAttribute('stroke', 'none');
    } else {
        const oldArea = svg.querySelector('path.sparkline-area'); if (oldArea) oldArea.remove();
    }

    // optional dots
    const showDots = opts.dots === undefined ? true : Boolean(opts.dots);
    // remove existing dots group
    const oldGroup = svg.querySelector('g.spark-dots'); if (oldGroup) oldGroup.remove();
    if (showDots) {
        const g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.classList.add('spark-dots');
        dataArr.forEach((v, i) => {
            const [x,y] = points[i].split(',').map(Number);
            const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
            c.setAttribute('cx', x.toFixed(2)); c.setAttribute('cy', y.toFixed(2)); c.setAttribute('r', opts.dotRadius || 1.6);
            c.setAttribute('fill', opts.dotFill || (opts.stroke || '#4f46e5'));
            c.setAttribute('opacity', opts.dotOpacity || 0.95);
            g.appendChild(c);
        });
        svg.appendChild(g);
    }
}

// Mobile quick nav compact toggle
function mobileQuickNavToggle() {
    const nav = document.querySelector('.mobile-quick-nav');
    if (!nav) return;
    if (!nav.classList.contains('compact')) nav.classList.add('compact');
    const isExpanded = nav.classList.toggle('expanded');
    try { localStorage.setItem('sipMobileNavExpanded', isExpanded ? '1' : '0'); } catch (e) {}
}

// initialize mobile nav state on load
window.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.mobile-quick-nav');
    if (!nav) return;
    if (!nav.classList.contains('compact')) nav.classList.add('compact');
    try {
        const pref = localStorage.getItem('sipMobileNavExpanded');
        if (pref === '1') nav.classList.add('expanded');
        else nav.classList.remove('expanded');
    } catch (e) {}
});

// Toggle UI locale between TR and EN
function toggleUiLocale() {
    try {
        const newLocale = (UI_LOCALE === 'tr-TR') ? 'en-US' : 'tr-TR';
        setLocale(newLocale);
        // re-render dashboard sparklines and texts
        try { sipDashboardHazirla(); } catch(e){}
    } catch(e){ console.warn('toggleUiLocale failed', e); }
}

// set initial locale button label
window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('localeToggleBtn');
    if (btn) btn.innerHTML = `<i class="fa-solid fa-globe"></i> ${UI_LOCALE === 'tr-TR' ? 'TR' : 'EN'}`;
});

// Ensure all onclick handlers referenced in markup have a safe global function
function ensureOnclickHandlers() {
    try {
        const eventAttrMap = { onclick: 'click', onchange: 'change', oninput: 'input', onkeyup: 'keyup', onkeydown: 'keydown' };
        const selector = Object.keys(eventAttrMap).map(a => '['+a+']').join(',');
        document.querySelectorAll(selector).forEach(el => {
            for (const attrName in eventAttrMap) {
                if (!el.hasAttribute(attrName)) continue;
                const attr = el.getAttribute(attrName) || '';
                const fnCallMatch = attr.trim().match(/^([a-zA-Z0-9_\$]+)\s*\(([\s\S]*)\)\s*;?$/);
                if (!fnCallMatch) {
                    console.warn('Skipped complex inline handler (manual review recommended):', attrName, attr, el);
                    continue;
                }
                const name = fnCallMatch[1];
                const argsRaw = fnCallMatch[2].trim();

                function splitArgs(str) {
                    const out = [];
                    let cur = '';
                    let inQuote = false;
                    let quoteChar = '';
                    for (let i=0;i<str.length;i++) {
                        const ch = str[i];
                        if (inQuote) {
                            if (ch === quoteChar && str[i-1] !== '\\') { inQuote = false; cur += ch; }
                            else cur += ch;
                        } else {
                            if ((ch === '"' || ch === "'") ) { inQuote = true; quoteChar = ch; cur += ch; }
                            else if (ch === ',') { out.push(cur.trim()); cur = ''; }
                            else cur += ch;
                        }
                    }
                    if (cur.trim() !== '') out.push(cur.trim());
                    return out.filter(x=>x!=="");
                }

                const tokens = argsRaw === '' ? [] : splitArgs(argsRaw).map(t => {
                    if (/^['\"]([\s\S]*)['\"]$/.test(t)) return t.slice(1, -1).replace(/\\(['\"])/g, "$1");
                    if (/^\d+(?:\.\d+)?$/.test(t)) return Number(t);
                    if (t === 'true') return true;
                    if (t === 'false') return false;
                    if (t === 'null') return null;
                    if (t === 'event') return '__EVENT__';
                    try { return window[t] !== undefined ? window[t] : t; } catch(e) { return t; }
                });

                // attach safe listener and remove inline attribute
                try {
                    const evName = eventAttrMap[attrName];
                    el.addEventListener(evName, function(ev){
                        try {
                            const fn = window[name];
                            if (typeof fn === 'function') {
                                const finalArgs = tokens.map(a => a === '__EVENT__' ? ev : a);
                                return fn.apply(el, finalArgs);
                            } else {
                                console.warn('Expected function not found on window:', name, attr);
                            }
                        } catch(e) { console.warn('Error running migrated handler', e); }
                    });
                    // Keyboard accessibility for click-like handlers
                    if (evName === 'click') el.addEventListener('keydown', function(ev){ if (ev.key === 'Enter') ev.currentTarget.click(); });
                    el.removeAttribute(attrName);
                } catch(e) { console.warn('Failed to migrate inline handler for', el, attrName, e); }
            }
        });
    } catch(e){ console.warn('ensureOnclickHandlers failed', e); }
}

// Run immediately (in case DOMContentLoaded already fired) and also attach to event
try { ensureOnclickHandlers(); } catch(e) {}
window.addEventListener('DOMContentLoaded', ensureOnclickHandlers);

// Developer utility: produce audit report of onclick handlers and missing functions
function generateOnclickAuditReport(showOverlay = true) {
    try {
        const names = new Set();
        document.querySelectorAll('[onclick]').forEach(el => {
            const attr = el.getAttribute('onclick') || '';
            // naive extract of function name at start
            const m = attr.trim().match(/^([a-zA-Z0-9_\$]+)\s*\(/);
            if (m) names.add(m[1]);
        });

        const report = [];
        names.forEach(name => {
            report.push({ name, exists: typeof window[name] === 'function' });
        });

        console.group('SIP Frontend onclick audit');
        console.table(report);
        console.groupEnd();

        if (showOverlay) {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed'; overlay.style.left = '8px'; overlay.style.top = '8px'; overlay.style.right = '8px'; overlay.style.maxHeight = '60vh'; overlay.style.overflow = 'auto'; overlay.style.zIndex = 999999; overlay.style.background = 'rgba(0,0,0,0.7)'; overlay.style.color = '#fff'; overlay.style.padding = '12px'; overlay.style.borderRadius = '8px';
            overlay.id = 'sipOnclickAuditOverlay';
            overlay.innerHTML = `<strong>Onclick Audit</strong><div style="font-size:0.9rem; margin-top:8px;">${report.map(r=> `${r.exists ? '✅' : '❌'} ${r.name}`).join('<br>')}</div><div style="margin-top:8px; text-align:right;"><button id="closeAuditOverlay" class="btn btn-secondary">Kapat</button></div>`;
            document.body.appendChild(overlay);
            document.getElementById('closeAuditOverlay').addEventListener('click', ()=> overlay.remove());
        }

        return report;
    } catch(e) { console.warn('generateOnclickAuditReport error', e); return []; }
}

// Run a silent audit on load (no overlay) and log results
// Geliştirici denetimi yalnızca ?debug=1 ile (konsol gürültüsünü azaltır)
window.addEventListener('DOMContentLoaded', () => {
    try {
        if (new URLSearchParams(location.search).get('debug') === '1') {
            generateOnclickAuditReport(false);
        }
    } catch (e) { /* ignore */ }
});

// Watch for dynamic DOM insertions that include inline onclick attributes and migrate them automatically
try {
    const mo = new MutationObserver(mutations => {
        let found = false;
        for (const m of mutations) {
            for (const node of m.addedNodes || []) {
                if (!(node instanceof HTMLElement)) continue;
                if (node.querySelector && node.querySelector('[onclick]')) found = true;
                if (node.hasAttribute && node.hasAttribute('onclick')) found = true;
            }
        }
        if (found) {
            try { ensureOnclickHandlers(); } catch(e){ console.warn('MO: ensureOnclickHandlers failed', e); }
        }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
} catch(e) { console.warn('Failed to initialize MutationObserver for onclick migration', e); }

// Delegated click handler for templates using data-action attributes
document.addEventListener('click', (ev) => {
    const el = ev.target instanceof Element ? ev.target.closest('[data-action]') : null;
    if (!el) return;
    const action = el.dataset.action;
    try {
        switch(action) {
            case 'todo-toggle': return todoDegistir(Number(el.dataset.index));
            case 'todo-sil': return todoSil(Number(el.dataset.index));
            case 'open-question': return sipSoruHavuzuSoruyuAc(Number(el.dataset.index));
            case 'answer-option': return sipSoruHavuzuCevapla(Number(el.dataset.index), Number(el.dataset.option));
            case 'question-next': return sipSoruHavuzuSonraki();
            case 'toggle-node': return toggleNode(el);
            case 'open-map-modal': return haritaModalAc(el.dataset.name, el.dataset.note, el.dataset.video);
            case 'teacher-send-reply': return teacherHubSendStudentReply(el.dataset.id);
            case 'teacher-clear-reply': return teacherHubClearReplyComposer(el.dataset.id);
            case 'copy-class-code': try { navigator.clipboard.writeText(el.dataset.id); return; } catch(e){ console.warn('clipboard copy failed', e); }
            case 'toggle-class-active': return teacherHubToggleClassActive(el.dataset.id);
            case 'open-student-reply': return openStudentReplyComposer(Number(el.dataset.id));
            case 'open-student-reply-last': return openStudentReplyComposerFromLastNotice();
            case 'open-student-class-chat': return openStudentClassChatComposer();
            case 'student-chat-send': return studentChatSend();
            case 'pomodoro-log-close': return closePomodoroLogNoSave();
        }
    } catch(err) { console.warn('delegated action error', action, err); }
});

// Initialize internal nav stack for environments without reliable history (mobile WebView)
window.addEventListener('DOMContentLoaded', () => {
    try {
        window._sipNavStack = window._sipNavStack || [];
        const hash = location.hash && location.hash.replace('#','');
        const active = document.querySelector('.screen.active');
        const start = hash || (active && active.id) || (document.querySelector('.screen') && document.querySelector('.screen').id) || 'anaKapiEkrani';
        if (window._sipNavStack.length === 0) window._sipNavStack.push(start);
    } catch(e) { /* ignore */ }
});

// Apply translations on initial load
window.addEventListener('DOMContentLoaded', () => {
    try { translatePage(); } catch(e) {}
});

// attach previously-inline onchange handlers
window.addEventListener('DOMContentLoaded', () => {
    const logSinav = document.getElementById('logSinav'); if (logSinav) logSinav.addEventListener('change', pomoSinavSecildi);
    const logDers = document.getElementById('logDers'); if (logDers) logDers.addEventListener('change', pomoDersSecildi);
    const hesaplamaTuru = document.getElementById('hesaplamaTuru'); if (hesaplamaTuru) hesaplamaTuru.addEventListener('change', hesaplamaArayuzuGuncelle);
    const sinavTuru = document.getElementById('sinavTuru'); if (sinavTuru) sinavTuru.addEventListener('change', sipSoruHavuzuHazirla);
    const soruYil = document.getElementById('soruHavuzuYilSelect'); if (soruYil) soruYil.addEventListener('change', sipSoruHavuzuYilDegistir);
    const soruKonu = document.getElementById('soruHavuzuKonuSelect'); if (soruKonu) soruKonu.addEventListener('change', sipSoruHavuzuKonuDegistir);
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    const target = event.target;
    if (!target || target.id !== 'studentChatInput') return;
    event.preventDefault();
    studentChatSend();
});

// Attach pointer tooltip handlers to a sparkline svg
function attachSparklineTooltip(svg, dataArr, opts={}) {
    if (!svg) return;
    svg._sparkData = dataArr.slice();
    svg._sparkLabels = Array.isArray(opts.labels) ? opts.labels.slice() : null;
    svg._sparkType = opts.type || '';
    const w = svg.viewBox.baseVal.width || parseFloat(svg.getAttribute('width')) || svg.clientWidth || 120;
    const h = svg.viewBox.baseVal.height || parseFloat(svg.getAttribute('height')) || svg.clientHeight || 30;
    const pad = 4;
    const len = dataArr.length;
    const step = (w - pad*2) / Math.max(len - 1, 1);

    let tip = document.getElementById('sparkTooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'sparkTooltip';
        tip.className = 'spark-tooltip';
        tip.style.display = 'none';
        document.body.appendChild(tip);
    }

    function formatValue(val, idx) {
        if (svg._sparkType === 'minutes') return `${val} dk`;
        if (svg._sparkType === 'questions') return `${val} soru`;
        if (svg._sparkType === 'streak') return val ? 'Çalışma Var' : 'Yok';
        return String(val);
    }

    function onMove(e) {
        const rect = svg.getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const idx = Math.max(0, Math.min(len-1, Math.round((x - pad) / step)));
        const value = svg._sparkData[idx];
        const label = svg._sparkLabels && svg._sparkLabels[idx] ? svg._sparkLabels[idx] : null;
        const px = rect.left + pad + (idx * step);
        tip.textContent = label ? `${label} · ${formatValue(value, idx)}` : formatValue(value, idx);
        tip.style.left = `${px}px`;
        tip.style.top = `${rect.top}px`;
        tip.style.display = 'block';
    }
    function onLeave() { const tipEl = document.getElementById('sparkTooltip'); if (tipEl) tipEl.style.display = 'none'; }

    if (svg._sparkHandlers) {
        svg.removeEventListener('pointermove', svg._sparkHandlers.move);
        svg.removeEventListener('pointerleave', svg._sparkHandlers.leave);
    }
    svg._sparkHandlers = { move: onMove, leave: onLeave };
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerleave', onLeave);
}

function stopPomoTimer() {
    if (pomoTimerInterval) {
        clearInterval(pomoTimerInterval);
        pomoTimerInterval = null;
    }
}

function showOverlayModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.parentElement !== document.body) document.body.appendChild(el);
    el.style.display = 'flex';
    el.classList.add('show');
}

function hideOverlayModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    el.style.display = 'none';
}

function hidePomoOverlayModals() {
    ['pomoFocusModal', 'pomoBreakModal', 'modalOverlay'].forEach((id) => hideOverlayModal(id));
    const banner = document.getElementById('pomoFocusBanner');
    if (banner) banner.style.display = 'none';
}

function hidePomoModals() {
    hidePomoOverlayModals();
    hideOverlayModal('pomodoroLogModal');
}

function pomodoroEkraniAc() {
    stopPomoTimer();
    hidePomoModals();
    isPomoPaused = false;
    const setup = document.getElementById('pomoSetupDiv');
    const active = document.getElementById('pomoActiveDiv');
    if (setup) setup.style.display = 'block';
    if (active) active.style.display = 'none';
    ekranGoster('sipPomodoroEkrani');
}

function formatPomoTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60); const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function initPomodoroSession() {
    const select = document.getElementById('pomoModeSelect');
    if (!select) return;
    const vals = select.value.split(',');
    pomoMode.w = parseInt(vals[0], 10) || 25;
    pomoMode.b = parseInt(vals[1], 10) || 5;
    pomoMode.lb = parseInt(vals[2], 10) || 20;
    pomoMode.cycles = parseInt(vals[3], 10) || 4;

    pomoPhase = 'work';
    pomoCurrentCycle = 1;
    pomoTotalWorkSeconds = 0;
    isPomoPaused = false;

    hidePomoModals();
    const setup = document.getElementById('pomoSetupDiv');
    const active = document.getElementById('pomoActiveDiv');
    if (setup) setup.style.display = 'none';
    if (active) active.style.display = 'block';

    startFocusPhase();
}

function dismissPomoFocusBanner() {
    const cb = document.getElementById('pomoHideFocusCb');
    if (cb && cb.checked) {
        try {
            localStorage.setItem('pomoHideFocusDate', new Date().toLocaleDateString('tr-TR'));
        } catch (e) { /* ignore */ }
    }
    const banner = document.getElementById('pomoFocusBanner');
    if (banner) banner.style.display = 'none';
}

function startFocusPhase() {
    hidePomoModals();
    pomoPhase = 'work';
    pomoTimeLeft = pomoMode.w * 60;

    const phaseEl = document.getElementById('pomoPhaseText');
    const cycleEl = document.getElementById('pomoCycleText');
    const timerEl = document.getElementById('pomodoroTimerDisplay');
    if (phaseEl) {
        phaseEl.textContent = 'ÇALIŞMA ZAMANI (ODAK)';
        phaseEl.style.color = 'var(--primary)';
    }
    if (cycleEl) cycleEl.textContent = `Döngü: ${pomoCurrentCycle} / ${pomoMode.cycles}`;
    if (timerEl) timerEl.textContent = formatPomoTime(pomoTimeLeft);

    const todayStr = new Date().toLocaleDateString('tr-TR');
    const hideDate = localStorage.getItem('pomoHideFocusDate');
    const banner = document.getElementById('pomoFocusBanner');
    if (banner) {
        banner.style.display = hideDate === todayStr ? 'none' : 'flex';
    }

    runPomoTimer();
}

function startPomoTimerFromModal() {
    dismissPomoFocusBanner();
    runPomoTimer();
}

function runPomoTimer() {
    stopPomoTimer();
    const pauseBtn = document.getElementById('btnPomoPause');
    if (pauseBtn) {
        pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Duraklat';
        pauseBtn.className = 'btn btn-warning modern-shadow pomo-ctrl-btn';
    }
    isPomoPaused = false;

    pomoTimerInterval = setInterval(() => {
        if (isPomoPaused) return;

        pomoTimeLeft--;
        const timerEl = document.getElementById('pomodoroTimerDisplay');
        if (timerEl) timerEl.textContent = formatPomoTime(Math.max(0, pomoTimeLeft));

        if (pomoPhase === 'work') {
            pomoTotalWorkSeconds++;
            const workLbl = document.getElementById('pomoTotalWorkLabel');
            if (workLbl) workLbl.textContent = `${Math.floor(pomoTotalWorkSeconds / 60)} dk`;
        }

        if (pomoTimeLeft <= 0) {
            stopPomoTimer();
            sesEfektiCal('sure');
            handlePhaseEnd();
        }
    }, 1000);
}

function togglePomoPause() {
    hidePomoOverlayModals();
    const pauseBtn = document.getElementById('btnPomoPause');
    if (isPomoPaused) {
        runPomoTimer();
        return;
    }
    stopPomoTimer();
    isPomoPaused = true;
    if (pauseBtn) {
        pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> Devam Et';
        pauseBtn.className = 'btn btn-success modern-shadow pulse pomo-ctrl-btn';
    }
}

function handlePhaseEnd() {
    if(pomoPhase === 'work') {
        if(pomoCurrentCycle % pomoMode.cycles === 0) {
            pomoPhase = 'longBreak';
            pomoTimeLeft = pomoMode.lb * 60;
        } else {
            pomoPhase = 'shortBreak';
            pomoTimeLeft = pomoMode.b * 60;
        }
        showBreakModal();
    } else {
        // Mola bitti, yeni çalışmaya geç
        pomoCurrentCycle++;
        startFocusPhase();
    }
}

function showBreakModal() {
    const quote = FUNNY_BREAK_QUOTES[Math.floor(Math.random() * FUNNY_BREAK_QUOTES.length)];
    document.getElementById('pomoBreakQuote').textContent = `"${quote}"`;
    showOverlayModal('pomoBreakModal');
}

function startBreakTimerFromModal() {
    hideOverlayModal('pomoBreakModal');
    document.getElementById('pomoPhaseText').textContent = pomoPhase === 'longBreak' ? "UZUN MOLA" : "KISA MOLA";
    document.getElementById('pomoPhaseText').style.color = "var(--success)";
    document.getElementById('pomodoroTimerDisplay').textContent = formatPomoTime(pomoTimeLeft);
    runPomoTimer();
}

function finishPomodoroSession() {
    stopPomoTimer();
    isPomoPaused = false;
    hidePomoOverlayModals();
    const timeTxt = document.getElementById('logModalTimeTxt');
    if (timeTxt) timeTxt.textContent = `${Math.floor(pomoTotalWorkSeconds / 60)} Dakika`;
    initPomodoroModal();
    showOverlayModal('pomodoroLogModal');
}

function initPomodoroModal() {
    const sinavSelect = document.getElementById('logSinav');
    if (!sinavSelect) return;
    const haritalar = (typeof SINAV_HARITALARI !== 'undefined' && SINAV_HARITALARI) ? SINAV_HARITALARI : {};
    sinavSelect.innerHTML = '<option value="">-- Hangi Sınava Çalıştın? --</option>';
    Object.keys(haritalar).forEach(sinav => {
        sinavSelect.innerHTML += `<option value="${sinav}">${sinav}</option>`;
    });
    document.getElementById('logDers').innerHTML = '<option value="">Önce Sınav Seçin</option>';
    document.getElementById('logKonuContainer').innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem;">Önce ders seçin.</div>';
    document.getElementById('logSoru').value = '';
}

function pomoSinavSecildi() {
    const sinav = document.getElementById('logSinav').value;
    const dersSelect = document.getElementById('logDers');
    if(!sinav || !SINAV_HARITALARI[sinav]) {
        dersSelect.innerHTML = '<option value="">Önce Sınav Seçin</option>';
        document.getElementById('logKonuContainer').innerHTML = '';
        return;
    }
    dersSelect.innerHTML = '<option value="">-- Hangi Derse Çalıştın? --</option>';
    SINAV_HARITALARI[sinav].children.forEach((ders, index) => {
        dersSelect.innerHTML += `<option value="${index}">${ders.name}</option>`;
    });
    document.getElementById('logKonuContainer').innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem;">Önce ders seçin.</div>';
}

function pomoDersSecildi() {
    const sinav = document.getElementById('logSinav').value;
    const dersIndex = document.getElementById('logDers').value;
    const konuContainer = document.getElementById('logKonuContainer');
    
    if(!sinav || dersIndex === "") { konuContainer.innerHTML = ''; return; }
    
    const konular = SINAV_HARITALARI[sinav].children[dersIndex].children;
    konuContainer.innerHTML = '';
    konular.forEach((konu) => {
        konuContainer.innerHTML += `
            <label class="checkbox-item">
                <input type="checkbox" class="pomo-topic-cb" value="${konu.name}">
                <span>${konu.name}</span>
            </label>
        `;
    });
}

async function savePomodoroSession() {
    const sinav = document.getElementById('logSinav').value;
    const dersIndex = document.getElementById('logDers').value;
    
    if(!sinav) { alert("Lütfen hangi sınava çalıştığını seç."); return; }
    
    let dersAd = "Genel Tekrar";
    if(dersIndex !== "") { dersAd = SINAV_HARITALARI[sinav].children[dersIndex].name; }
 
    const checkedTopics = Array.from(document.querySelectorAll('.pomo-topic-cb:checked')).map(cb => cb.value);
    const konu = checkedTopics.length > 0 ? checkedTopics.join(', ') : 'Genel Çalışma';
    const soru = document.getElementById('logSoru').value.trim() || 0;
    const dogru = parseInt(document.getElementById('logDogru').value, 10) || 0;
    const yanlis = parseInt(document.getElementById('logYanlis').value, 10) || 0;
    
    if(pomoTotalWorkSeconds < 60 && soru == 0 && dogru === 0 && yanlis === 0) { alert("Süreyi kaydetmek için en az 1 dakika çalışmalı veya sayı girmen gerekiyor."); return; }
 
    const todayStr = new Date().toLocaleDateString('tr-TR');
    if(localOgrenci.sipLastDate !== todayStr) { 
        localOgrenci.sipStreak++; 
        localOgrenci.sipLastDate = todayStr; 
    }
 
    const logObj = { 
        id: Date.now(), 
        tarih: todayStr, 
        saat: new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}), 
        sure: pomoTotalWorkSeconds, 
        sinav: sinav, 
        ders: dersAd, 
        konu: konu, 
        soruSayisi: soru,
        dogruSayisi: dogru,
        yanlisSayisi: yanlis,
        isoTarih: new Date().toISOString()
    };
 
    localOgrenci.sipHistory.push(logObj);
 
    const dk = Math.floor(pomoTotalWorkSeconds / 60); 
    const kazanilanXp = Math.max(0, (dk * 2) + (dogru * 2) + parseInt(soru, 10) - yanlis); 
    sipXpEkle(kazanilanXp);
 
    // ✅ MySQL'e kaydet
    await gecmisKaydetDB(logObj);
    await verileriKaydetSip();
 
    hideOverlayModal('pomodoroLogModal');
    patlatKonfeti(); 
    sesEfektiCal('dogru');
    setTimeout(() => { sipDashboardHazirla(); }, 1500);
    javaSaveHistory(logObj); // Java'daki StudyHistory tablosuna yazar
    javaUpdateSip();         // Java'daki Student tablosunda sipXp'yi günceller
}
function sipXpEkle(xpAmount) {
    if(xpAmount <= 0) return;
    localOgrenci.sipXp += xpAmount;
    let leveledUp = false;
    while(localOgrenci.sipXp >= 100) { localOgrenci.sipLevel++; localOgrenci.sipXp -= 100; leveledUp = true; }
    if(leveledUp) {
        setTimeout(() => {
            sesEfektiCal('levelup');
            document.getElementById('yeniLevelTxt').textContent = localOgrenci.sipLevel;
            document.getElementById('motivationalQuote').textContent = `"${MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]}"`;
            showOverlayModal('levelUpModal');
            patlatKonfeti();
        }, 500);
    }
}

function closeLevelUpModal() { hideOverlayModal('levelUpModal'); sipDashboardHazirla(); }

function sipGecmisAc() {
    const listArea = document.getElementById('gecmisListeAlani'); listArea.innerHTML = '';
    if(localOgrenci.sipHistory.length === 0) {
        listArea.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted);">Henüz kaydedilmiş bir çalışma yok. Pomodoro masasına geç!</div>';
    } else {
        const sorted =[...localOgrenci.sipHistory].reverse();
        sorted.forEach(log => {
            const dk = Math.floor(log.sure / 60);
            const dogru = parseInt(log.dogruSayisi, 10) || 0;
            const yanlis = parseInt(log.yanlisSayisi, 10) || 0;
            listArea.innerHTML += `
                <div class="history-item">
                    <div class="hist-date"><i class="fa-regular fa-calendar"></i> ${log.tarih} - ${log.saat}</div>
                    <div class="hist-details"><strong>${log.sinav} / ${log.ders}</strong><br><span style="font-size:0.9rem; color:var(--text-muted);">${log.konu}</span></div>
                    <div class="hist-stats">
                        <span><i class="fa-solid fa-stopwatch text-primary"></i> ${dk} Dk</span>
                        <span><i class="fa-solid fa-check-double text-success"></i> ${log.soruSayisi} Soru</span>
                        <span><i class="fa-solid fa-circle-check text-success"></i> ${dogru} D</span>
                        <span><i class="fa-solid fa-circle-xmark text-danger"></i> ${yanlis} Y</span>
                    </div>
                </div>
            `;
        });
    }
    ekranGoster('sipGecmisEkrani');
}

/* --- DİĞER MODÜLLER (Aynı Kalmıştır) --- */
function sipWorkspaceAc() { document.getElementById('wsTitle').value = localStorage.getItem('sipWsTitle') || ""; document.getElementById('wsEditor').innerHTML = localStorage.getItem('sipWsContent') || ""; ekranGoster('sipWorkspaceEkrani'); }
function workspaceKaydet() { localStorage.setItem('sipWsTitle', document.getElementById('wsTitle').value); localStorage.setItem('sipWsContent', document.getElementById('wsEditor').innerHTML); alert("Çalışma alanın başarıyla kaydedildi!"); }
function workspaceYukle() { document.getElementById('wsTitle').value = localStorage.getItem('sipWsTitle') || ""; document.getElementById('wsEditor').innerHTML = localStorage.getItem('sipWsContent') || ""; }
function todoEkle() { const val = document.getElementById('todoInput').value.trim(); if(!val) return; let todos; try { todos = JSON.parse(localStorage.getItem('sipTodos')); if(!Array.isArray(todos)) todos = []; } catch(e){ todos =[]; } todos.push({ text: val, done: false }); localStorage.setItem('sipTodos', JSON.stringify(todos)); document.getElementById('todoInput').value = ""; todoListele(); }
function todoListele() {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    let todos;
    try { todos = JSON.parse(localStorage.getItem('sipTodos')); if(!Array.isArray(todos)) todos =[]; } catch(e){ todos =[]; }
    todos.forEach((t, i) => {
        const li = document.createElement('li');
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        if (t.done) chk.checked = true;
        chk.dataset.action = 'todo-toggle';
        chk.dataset.index = String(i);
        const span = document.createElement('span');
        span.className = t.done ? 'todo-done' : '';
        span.textContent = t.text;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn btn-small btn-icon';
        del.style.background = 'none';
        del.style.border = 'none';
        del.style.color = 'var(--danger)';
        del.dataset.action = 'todo-sil';
        del.dataset.index = String(i);
        del.innerHTML = '<i class="fa-solid fa-trash"></i>';
        li.appendChild(chk);
        li.appendChild(span);
        li.appendChild(del);
        list.appendChild(li);
    });
}
function todoDegistir(i) { let todos = JSON.parse(localStorage.getItem('sipTodos')) ||[]; todos[i].done = !todos[i].done; localStorage.setItem('sipTodos', JSON.stringify(todos)); todoListele(); }
function todoSil(i) { let todos = JSON.parse(localStorage.getItem('sipTodos')) ||[]; todos.splice(i, 1); localStorage.setItem('sipTodos', JSON.stringify(todos)); todoListele(); }

function sipPuanEkraniAc() { ekranGoster('sipPuanEkrani'); hesaplamaArayuzuGuncelle(); }
function hesaplamaArayuzuGuncelle() { 
    const tur = document.getElementById('hesaplamaTuru').value; 
    const alan = document.getElementById('hesaplamaAlanlari'); 
    document.getElementById('puanSonuc').style.display = 'none'; 
    
    if(tur === 'tyt') { 
        alan.innerHTML = `<div><label class="input-label">Türkçe (40 Soru)</label><div class="input-group-row"><input type="number" id="tD" placeholder="D" class="modern-input"><input type="number" id="tY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Matematik (40 Soru)</label><div class="input-group-row"><input type="number" id="mD" placeholder="D" class="modern-input"><input type="number" id="mY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Sosyal (20 Soru)</label><div class="input-group-row"><input type="number" id="sD" placeholder="D" class="modern-input"><input type="number" id="sY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Fen (20 Soru)</label><div class="input-group-row"><input type="number" id="fD" placeholder="D" class="modern-input"><input type="number" id="fY" placeholder="Y" class="modern-input"></div></div>`; 
    } else if(tur === 'ayt_say') { 
        alan.innerHTML = `<div><label class="input-label">Matematik (40 Soru)</label><div class="input-group-row"><input type="number" id="aMatD" placeholder="D" class="modern-input"><input type="number" id="aMatY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Fizik (14 Soru)</label><div class="input-group-row"><input type="number" id="fizD" placeholder="D" class="modern-input"><input type="number" id="fizY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Kimya (13 Soru)</label><div class="input-group-row"><input type="number" id="kimD" placeholder="D" class="modern-input"><input type="number" id="kimY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Biyoloji (13 Soru)</label><div class="input-group-row"><input type="number" id="biyoD" placeholder="D" class="modern-input"><input type="number" id="biyoY" placeholder="Y" class="modern-input"></div></div>`; 
    } else if(tur === 'ayt_ea') { 
        alan.innerHTML = `<div><label class="input-label">Matematik (40 Soru)</label><div class="input-group-row"><input type="number" id="aMatD" placeholder="D" class="modern-input"><input type="number" id="aMatY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Edebiyat (24 Soru)</label><div class="input-group-row"><input type="number" id="edbD" placeholder="D" class="modern-input"><input type="number" id="edbY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Tarih-1 (10 Soru)</label><div class="input-group-row"><input type="number" id="tarD" placeholder="D" class="modern-input"><input type="number" id="tarY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Coğrafya-1 (6 Soru)</label><div class="input-group-row"><input type="number" id="cogD" placeholder="D" class="modern-input"><input type="number" id="cogY" placeholder="Y" class="modern-input"></div></div>`; 
    } else if(tur === 'kpss') { 
        alan.innerHTML = `<div><label class="input-label">Genel Yetenek (60 Soru)</label><div class="input-group-row"><input type="number" id="gyD" placeholder="D" class="modern-input"><input type="number" id="gyY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Genel Kültür (60 Soru)</label><div class="input-group-row"><input type="number" id="gkD" placeholder="D" class="modern-input"><input type="number" id="gkY" placeholder="Y" class="modern-input"></div></div>`; 
    } else if(tur === 'ales') { 
        alan.innerHTML = `<div><label class="input-label">Sayısal (50 Soru)</label><div class="input-group-row"><input type="number" id="alSayD" placeholder="D" class="modern-input"><input type="number" id="alSayY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Sözel (50 Soru)</label><div class="input-group-row"><input type="number" id="alSozD" placeholder="D" class="modern-input"><input type="number" id="alSozY" placeholder="Y" class="modern-input"></div></div>`; 
    } else if(tur === 'dgs') { 
        alan.innerHTML = `<div><label class="input-label">Sayısal (50 Soru)</label><div class="input-group-row"><input type="number" id="dgSayD" placeholder="D" class="modern-input"><input type="number" id="dgSayY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Sözel (50 Soru)</label><div class="input-group-row"><input type="number" id="dgSozD" placeholder="D" class="modern-input"><input type="number" id="dgSozY" placeholder="Y" class="modern-input"></div></div>`; 
    } else if(tur === 'lgs') { 
        alan.innerHTML = `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><label class="input-label">Türkçe (20)</label><div class="input-group-row"><input type="number" id="lTurD" placeholder="D" class="modern-input"><input type="number" id="lTurY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Matematik (20)</label><div class="input-group-row"><input type="number" id="lMatD" placeholder="D" class="modern-input"><input type="number" id="lMatY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Fen (20)</label><div class="input-group-row"><input type="number" id="lFenD" placeholder="D" class="modern-input"><input type="number" id="lFenY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">İnkılap (10)</label><div class="input-group-row"><input type="number" id="lInkD" placeholder="D" class="modern-input"><input type="number" id="lInkY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">Din (10)</label><div class="input-group-row"><input type="number" id="lDinD" placeholder="D" class="modern-input"><input type="number" id="lDinY" placeholder="Y" class="modern-input"></div></div><div><label class="input-label">İngilizce (10)</label><div class="input-group-row"><input type="number" id="lIngD" placeholder="D" class="modern-input"><input type="number" id="lIngY" placeholder="Y" class="modern-input"></div></div></div>`; 
    }
}

function siralamaHesapla(puan) { 
    if(puan < 150) return "> 3.000.000"; 
    let base = 3000000 - Math.pow((puan - 100), 2.5) * 0.9; 
    if(base < 100) base = 100; 
    return { "2025": Math.floor(Math.max(100, base * 0.85)).toLocaleString('tr-TR'), "2024": Math.floor(Math.max(100, base * 0.95)).toLocaleString('tr-TR') }; 
}

function sipPuanHesapla() { 
    const tur = document.getElementById('hesaplamaTuru').value; 
    const sonucDiv = document.getElementById('puanSonuc'); 
    let toplamNet = 0; let puan = 0; let siralamaHTML = ""; 
    
    if(tur === 'tyt') { 
        const tNet = (parseFloat(document.getElementById('tD').value)||0) - ((parseFloat(document.getElementById('tY').value)||0)*0.25); 
        const mNet = (parseFloat(document.getElementById('mD').value)||0) - ((parseFloat(document.getElementById('mY').value)||0)*0.25); 
        const sNet = (parseFloat(document.getElementById('sD').value)||0) - ((parseFloat(document.getElementById('sY').value)||0)*0.25); 
        const fNet = (parseFloat(document.getElementById('fD').value)||0) - ((parseFloat(document.getElementById('fY').value)||0)*0.25); 
        toplamNet = Math.max(0, tNet + mNet + sNet + fNet); 
        puan = 100 + (tNet*3.3) + (mNet*3.3) + (sNet*3.4) + (fNet*3.4); 
        const siralamalar = siralamaHesapla(puan); 
        siralamaHTML = `<div class="ranking-box"><h4 style="color:var(--text-main); margin-bottom:10px; font-size:1rem;"><i class="fa-solid fa-ranking-star"></i> Tahmini Sıralama</h4><div class="ranking-grid"><div class="rank-item"><span>2024 (Normal):</span> <strong>${siralamalar["2024"]}</strong></div></div></div>`; 
    } 
    else if(tur === 'ayt_say') { 
        const mNet = (parseFloat(document.getElementById('aMatD').value)||0) - ((parseFloat(document.getElementById('aMatY').value)||0)*0.25); 
        const fNet = (parseFloat(document.getElementById('fizD').value)||0) - ((parseFloat(document.getElementById('fizY').value)||0)*0.25); 
        const kNet = (parseFloat(document.getElementById('kimD').value)||0) - ((parseFloat(document.getElementById('kimY').value)||0)*0.25); 
        const bNet = (parseFloat(document.getElementById('biyoD').value)||0) - ((parseFloat(document.getElementById('biyoY').value)||0)*0.25); 
        toplamNet = Math.max(0, mNet + fNet + kNet + bNet); 
        puan = 100 + (mNet*3) + (fNet*3) + (kNet*3) + (bNet*3); 
    } 
    else if(tur === 'ayt_ea') { 
        const mNet = (parseFloat(document.getElementById('aMatD').value)||0) - ((parseFloat(document.getElementById('aMatY').value)||0)*0.25); 
        const eNet = (parseFloat(document.getElementById('edbD').value)||0) - ((parseFloat(document.getElementById('edbY').value)||0)*0.25); 
        const tNet = (parseFloat(document.getElementById('tarD').value)||0) - ((parseFloat(document.getElementById('tarY').value)||0)*0.25); 
        const cNet = (parseFloat(document.getElementById('cogD').value)||0) - ((parseFloat(document.getElementById('cogY').value)||0)*0.25); 
        toplamNet = Math.max(0, mNet + eNet + tNet + cNet); 
        puan = 100 + (mNet*3) + (eNet*3) + (tNet*2.8) + (cNet*3.3); 
    } 
    else if(tur === 'kpss') { 
        const gyNet = (parseFloat(document.getElementById('gyD').value)||0) - ((parseFloat(document.getElementById('gyY').value)||0)*0.25); 
        const gkNet = (parseFloat(document.getElementById('gkD').value)||0) - ((parseFloat(document.getElementById('gkY').value)||0)*0.25); 
        toplamNet = Math.max(0, gyNet + gkNet); 
        puan = 50 + (gyNet*0.4) + (gkNet*0.4); 
    } 
    else if(tur === 'ales') { 
        const sayNet = (parseFloat(document.getElementById('alSayD').value)||0) - ((parseFloat(document.getElementById('alSayY').value)||0)*0.25); 
        const sozNet = (parseFloat(document.getElementById('alSozD').value)||0) - ((parseFloat(document.getElementById('alSozY').value)||0)*0.25); 
        toplamNet = Math.max(0, sayNet + sozNet); 
        puan = 50 + (sayNet*0.5) + (sozNet*0.5); 
    } 
    else if(tur === 'dgs') { 
        const sayNet = (parseFloat(document.getElementById('dgSayD').value)||0) - ((parseFloat(document.getElementById('dgSayY').value)||0)*0.25); 
        const sozNet = (parseFloat(document.getElementById('dgSozD').value)||0) - ((parseFloat(document.getElementById('dgSozY').value)||0)*0.25); 
        toplamNet = Math.max(0, sayNet + sozNet); 
        puan = 120 + (sayNet*3) + (sozNet*3); 
    } 
    else if(tur === 'lgs') { 
        const tNet = (parseFloat(document.getElementById('lTurD').value)||0) - ((parseFloat(document.getElementById('lTurY').value)||0)*0.33); 
        const mNet = (parseFloat(document.getElementById('lMatD').value)||0) - ((parseFloat(document.getElementById('lMatY').value)||0)*0.33); 
        const fNet = (parseFloat(document.getElementById('lFenD').value)||0) - ((parseFloat(document.getElementById('lFenY').value)||0)*0.33); 
        const iNet = (parseFloat(document.getElementById('lInkD').value)||0) - ((parseFloat(document.getElementById('lInkY').value)||0)*0.33); 
        const dNet = (parseFloat(document.getElementById('lDinD').value)||0) - ((parseFloat(document.getElementById('lDinY').value)||0)*0.33); 
        const inNet = (parseFloat(document.getElementById('lIngD').value)||0) - ((parseFloat(document.getElementById('lIngY').value)||0)*0.33); 
        toplamNet = Math.max(0, tNet + mNet + fNet + iNet + dNet + inNet); 
        puan = 100 + (tNet*4) + (mNet*4) + (fNet*4) + (iNet*1) + (dNet*1) + (inNet*1); 
    }
    
    sonucDiv.style.display = 'flex'; 
    sonucDiv.innerHTML = `<span style="font-size:1.2rem;"><strong>Toplam Net:</strong> ${toplamNet.toFixed(2)}</span><span style="font-size:2rem; color:var(--primary); font-weight:800; margin-bottom:10px;">Tahmini Puan: ${puan.toFixed(2)}</span> ${siralamaHTML}`; 
    patlatKonfeti(); 
    sesEfektiCal('oyunbitti'); 
}

function sipSinavBaslat() { 
    const selectEl = document.getElementById('sinavTuru'); 
    aktifSipSinav = selectEl.value; 
    const dk = parseInt(selectEl.options[selectEl.selectedIndex].getAttribute('data-sure')); 
    sipKalanSaniye = dk * 60; 
    document.getElementById('sinavKurulum').style.display = 'none'; 
    document.getElementById('sinavAktif').style.display = 'block'; 
    document.getElementById('sinavGeriBtn').style.display = 'none'; 
    sinavZamanGuncelle(); 
    sipSinavZamanlayici = setInterval(() => { 
        sipKalanSaniye--; 
        sinavZamanGuncelle(); 
        if(sipKalanSaniye <= 0) sipSinavBitir(); 
    }, 1000); 
}
function sinavZamanGuncelle() { 
    const dk = Math.floor(sipKalanSaniye / 60); 
    let sn = sipKalanSaniye % 60; 
    if(sn < 10) sn = '0' + sn; 
    document.getElementById('sinavKalanSure').textContent = `${dk}:${sn}`; 
}
function sipSinavBitir() { 
    clearInterval(sipSinavZamanlayici); 
    document.getElementById('sinavAktif').style.display = 'none'; 
    document.getElementById('sinavKurulum').style.display = 'block'; 
    document.getElementById('sinavGeriBtn').style.display = 'block'; 
    alert("Sınav tamamlandı!"); 
    sipPuanEkraniAc(); 
}

function sipSoruHavuzuAnahtar(sinav) {
    if (!sinav) return '';
    if (sinav.startsWith('kpss')) return 'kpss';
    if (sinav.startsWith('lgs')) return 'lgs';
    if (sinav === 'yds') return 'ydt';
    return sinav;
}

function sipSoruHavuzuVerisi() {
    return typeof SORU_HAVUZU !== 'undefined' ? SORU_HAVUZU : {};
}

function sipSoruHavuzuHazirla() {
    const sinavSelect = document.getElementById('sinavTuru');
    const yilSelect = document.getElementById('soruHavuzuYilSelect');
    const konuSelect = document.getElementById('soruHavuzuKonuSelect');
    if (!sinavSelect || !yilSelect || !konuSelect) return;

    const sinav = sinavSelect.value;
    const havuz = sipSoruHavuzuVerisi();
    const anahtar = sipSoruHavuzuAnahtar(sinav);
    const sinavHavuzu = havuz[anahtar] || {};
    const yillar = Object.keys(sinavHavuzu).sort((a, b) => Number(b) - Number(a));

    aktifSoruHavuzu.sinav = anahtar;
    aktifSoruHavuzu.yil = yillar[0] || '';
    aktifSoruHavuzu.konu = '';
    aktifSoruHavuzu.soruIndex = 0;
    aktifSoruHavuzu.dogruSayisi = 0;
    aktifSoruHavuzu.sonCevaplandi = false;

    yilSelect.innerHTML = yillar.length
        ? yillar.map(yil => `<option value="${yil}">${yil}</option>`).join('')
        : '<option value="">Veri yok</option>';
    yilSelect.value = aktifSoruHavuzu.yil;

    sipSoruHavuzuYilDegistir();
}

function sipSoruHavuzuKonuListesi() {
    const havuz = sipSoruHavuzuVerisi();
    const yil = aktifSoruHavuzu.yil;
    const sinavHavuzu = havuz[aktifSoruHavuzu.sinav] || {};
    const soruListesi = Array.isArray(sinavHavuzu[yil]) ? sinavHavuzu[yil] : [];
    const konular = [...new Set(soruListesi.map(item => item.konu))].filter(Boolean);
    return konular;
}

function sipSoruHavuzuYilDegistir() {
    const yilSelect = document.getElementById('soruHavuzuYilSelect');
    const konuSelect = document.getElementById('soruHavuzuKonuSelect');
    if (!yilSelect || !konuSelect) return;

    aktifSoruHavuzu.yil = yilSelect.value;
    aktifSoruHavuzu.dogruSayisi = 0;
    const konular = sipSoruHavuzuKonuListesi();

    konuSelect.innerHTML = konular.length
        ? ['<option value="">Tüm Konular</option>'].concat(konular.map(konu => `<option value="${konu}">${konu}</option>`)).join('')
        : '<option value="">Veri yok</option>';
    aktifSoruHavuzu.konu = '';
    konuSelect.value = '';
    sipSoruHavuzuGuncelle();
}

function sipSoruHavuzuKonuDegistir() {
    const konuSelect = document.getElementById('soruHavuzuKonuSelect');
    aktifSoruHavuzu.konu = konuSelect ? konuSelect.value : '';
    sipSoruHavuzuGuncelle();
}

function sipSoruHavuzuFiltreliListe() {
    const havuz = sipSoruHavuzuVerisi();
    const sinavHavuzu = havuz[aktifSoruHavuzu.sinav] || {};
    const yilSorulari = Array.isArray(sinavHavuzu[aktifSoruHavuzu.yil]) ? sinavHavuzu[aktifSoruHavuzu.yil] : [];
    return yilSorulari.filter(item => !aktifSoruHavuzu.konu || item.konu === aktifSoruHavuzu.konu);
}

function sipSoruHavuzuGuncelle() {
    const listArea = document.getElementById('soruHavuzuListe');
    const detailArea = document.getElementById('soruHavuzuDetay');
    const info = document.getElementById('soruHavuzuIstatistik');
    if (!listArea || !detailArea || !info) return;

    const list = sipSoruHavuzuFiltreliListe();
    info.textContent = `${list.length} soru`;

    if (!list.length) {
        listArea.innerHTML = '<div class="empty-state" style="margin-top:20px;"><p>Seçilen yıl için soru bulunamadı.</p></div>';
        detailArea.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-question fa-3x"></i><p>Başka bir yıl veya konu seç.</p></div>';
        return;
    }

    if (aktifSoruHavuzu.soruIndex >= list.length) aktifSoruHavuzu.soruIndex = 0;
    listArea.innerHTML = list.map((item, index) => `
        <button type="button" class="question-list-item ${index === aktifSoruHavuzu.soruIndex ? 'active' : ''}" data-action="open-question" data-index="${index}">
            <span class="question-item-year">${item.yil}</span>
            <strong>${item.konu}</strong>
            <small>${item.soru}</small>
        </button>
    `).join('');

    sipSoruHavuzuSoruyuAc(aktifSoruHavuzu.soruIndex);
}

function sipSoruHavuzuSoruyuAc(index) {
    const list = sipSoruHavuzuFiltreliListe();
    if (!list.length) return;
    const secureIndex = Math.max(0, Math.min(index, list.length - 1));
    aktifSoruHavuzu.soruIndex = secureIndex;
    aktifSoruHavuzu.sonCevaplandi = false;

    const soru = list[secureIndex];
    const detailArea = document.getElementById('soruHavuzuDetay');
    if (!detailArea) return;

    detailArea.innerHTML = `
        <div class="question-detail-card">
            <div class="question-detail-top">
                <span class="question-detail-badge">${soru.yil}</span>
                <span class="question-detail-badge soft">${soru.konu}</span>
            </div>
            <h4>${soru.soru}</h4>
            <div class="question-option-grid">
                ${soru.secenekler.map((secenek, secenekIndex) => `
                    <button type="button" class="question-option-btn" data-action="answer-option" data-index="${secureIndex}" data-option="${secenekIndex}">
                        <span>${String.fromCharCode(65 + secenekIndex)})</span>
                        <strong>${secenek}</strong>
                    </button>
                `).join('')}
            </div>
            <div id="soruHavuzuFeedback" class="question-feedback" style="display:none;"></div>
            <div class="question-detail-actions">
                <button type="button" class="btn btn-secondary modern-shadow" data-action="question-next">Sonraki Soru</button>
            </div>
        </div>
    `;
}

function sipSoruHavuzuCevapla(index, secenekIndex) {
    const list = sipSoruHavuzuFiltreliListe();
    const soru = list[index];
    const detailArea = document.getElementById('soruHavuzuDetay');
    const feedback = document.getElementById('soruHavuzuFeedback');
    if (!soru || !detailArea || !feedback) return;

    const optionButtons = detailArea.querySelectorAll('.question-option-btn');
    optionButtons.forEach((btn, optionIndex) => {
        btn.disabled = true;
        if (optionIndex === soru.dogruIndex) btn.classList.add('correct');
        if (optionIndex === secenekIndex && secenekIndex !== soru.dogruIndex) btn.classList.add('wrong');
    });

    const dogru = secenekIndex === soru.dogruIndex;
    if (dogru) aktifSoruHavuzu.dogruSayisi += 1;
    aktifSoruHavuzu.sonCevaplandi = true;

    feedback.style.display = 'block';
    feedback.className = `question-feedback ${dogru ? 'success' : 'error'}`;
    feedback.innerHTML = dogru
        ? `<strong>Doğru.</strong> ${soru.aciklama}`
        : `<strong>Yanlış.</strong> Doğru cevap: ${String.fromCharCode(65 + soru.dogruIndex)}) ${soru.secenekler[soru.dogruIndex]}. ${soru.aciklama}`;

    const info = document.getElementById('soruHavuzuIstatistik');
    if (info) info.textContent = `${list.length} soru · ${aktifSoruHavuzu.dogruSayisi} doğru`;
}

function sipSoruHavuzuSonraki() {
    const list = sipSoruHavuzuFiltreliListe();
    if (!list.length) return;
    const nextIndex = (aktifSoruHavuzu.soruIndex + 1) % list.length;
    sipSoruHavuzuSoruyuAc(nextIndex);
    const listItems = document.querySelectorAll('.question-list-item');
    listItems.forEach((item, index) => {
        item.classList.toggle('active', index === nextIndex);
    });
}

function sipYolHaritasiAc() { 
    document.getElementById('aiTopicInput').value = ''; 
    document.getElementById('mindmapAlan').innerHTML = '<div class="empty-state"><i class="fa-solid fa-map-location-dot fa-3x"></i><p>Sınav seçerek veya konu yazarak haritanı oluştur.</p></div>'; 
    ekranGoster('sipYolHaritasiEkrani'); 
}
async function dinamikHaritaOlustur(istek) {
    const alan = document.getElementById('mindmapAlan'); const loading = document.getElementById('aiLoadingMap'); alan.innerHTML = ''; loading.style.display = 'block';
    let konuUpper = istek;
    if(istek === 'custom') { konuUpper = document.getElementById('aiTopicInput').value.trim(); if(!konuUpper) { loading.style.display = 'none'; return; } konuUpper = konuUpper.charAt(0).toUpperCase() + konuUpper.slice(1); }
    const fallbackData = {
        root: `🧠 ${konuUpper} Çalışma Planı`,
        children:[
            { name: `1. ${konuUpper} Temelleri`, children:[ { name: `Nedir bu ${konuUpper}?`, note: `${konuUpper} dünyasına giriş.`, video: `https://www.youtube.com/results?search_query=${encodeURIComponent(konuUpper)}+konu+anlatımı` }, { name: `Sık Çıkan Soru Tipleri`, note: `En çok çıkan sorular.`, video: `https://www.youtube.com/results?search_query=${encodeURIComponent(konuUpper)}+çıkmış+sorular` } ] },
            { name: `2. Gelişim ve Pratik`, children:[ { name: `Soru Çözüm Taktikleri`, note: `Hızlı çözme yolları.`, video: `https://www.youtube.com/results?search_query=${encodeURIComponent(konuUpper)}+soru+çözümü+taktikleri` }, { name: `Deneme Analizi`, note: `Hatalardan ders çıkar.`, video: `https://www.youtube.com/results?search_query=${encodeURIComponent(konuUpper)}+deneme+analizi+nasıl+yapılır` } ] }
        ]
    };
    setTimeout(() => { loading.style.display = 'none'; haritaCizRekursif(fallbackData); }, 800);
}
function haritaCizRekursif(data) { const alan = document.getElementById('mindmapAlan'); alan.innerHTML = ''; const rootDiv = document.createElement('div'); rootDiv.className = 'mm-node-wrapper'; let html = `<div class="mm-root"><i class="fa-solid fa-brain"></i> ${data.root}</div><div class="mm-children">`; data.children.forEach(child => { html += olusturDugumHTML(child); }); html += `</div>`; rootDiv.innerHTML = html; alan.appendChild(rootDiv); sesEfektiCal('dogru'); }
function olusturDugumHTML(node) {
    let html = `<div class="mm-node-wrapper"><div class="mm-connector"></div>`;
    if (node.children && node.children.length > 0) {
        html += `<div class="mm-node expandable" data-action="toggle-node"><i class="fa-solid fa-chevron-down"></i> ${node.name}</div><div class="mm-children">`;
        node.children.forEach(child => { html += olusturDugumHTML(child); });
        html += `</div>`;
    } else {
        let note = node.note || "Pratik yap.";
        let video = node.video || `https://www.youtube.com/results?search_query=${encodeURIComponent(node.name)}`;
        const safeName = escapeHtml(node.name || '');
        const safeNote = escapeHtml(note);
        const safeVideo = escapeHtml(video);
        html += `<div class="mm-node leaf-node" data-action="open-map-modal" data-name="${safeName}" data-note="${safeNote}" data-video="${safeVideo}"><i class="fa-solid fa-play" style="font-size:0.8rem; opacity:0.7;"></i> ${safeName}</div>`;
    }
    html += `</div>`;
    return html;
}
function toggleNode(el) { const childrenContainer = el.nextElementSibling; const icon = el.querySelector('i'); if (childrenContainer.style.display === 'none') { childrenContainer.style.display = 'flex'; icon.className = 'fa-solid fa-chevron-down'; } else { childrenContainer.style.display = 'none'; icon.className = 'fa-solid fa-chevron-right'; } }
function haritaModalAc(baslik, not, video) { document.getElementById('modalTitle').textContent = baslik; document.getElementById('modalNote').textContent = not; document.getElementById('modalLink').href = video; document.getElementById('modalOverlay').style.display = 'block'; document.getElementById('haritaModal').style.display = 'block'; }
function haritaModalKapat() { document.getElementById('modalOverlay').style.display = 'none'; document.getElementById('haritaModal').style.display = 'none'; }
/* =======================================================
   ENGLISH HUB MODÜLLERİ (KART BUTONLARININ FONKSİYONLARI)
   ======================================================= */

// 1. DERS NOTLARI BUTONU
function konuAnlatimiAc() {
    try {
        const level = seciliGenelSeviye;
        const listeDiv = document.getElementById('dersNotlariListesi');
        const icerikDiv = document.getElementById('dersNotuIcerik');

        if (document.getElementById('dersNotuSeviyeBaslik')) {
            document.getElementById('dersNotuSeviyeBaslik').textContent = level;
        }

        if (listeDiv) {
            listeDiv.innerHTML = '';
            const mufredat = englishHubGetCurriculum()[level] || null;

            if (mufredat && Object.keys(mufredat).length > 0) {
                Object.keys(mufredat).forEach(kategori => {
                    const catTitle = document.createElement('div');
                    catTitle.className = 'sidebar-title';
                    catTitle.style.fontWeight = '800';
                    catTitle.style.marginTop = '15px';
                    catTitle.style.color = 'var(--primary)';
                    catTitle.textContent = kategori;
                    listeDiv.appendChild(catTitle);

                    (mufredat[kategori] || []).forEach(konu => {
                        const btn = document.createElement('button');
                        btn.textContent = konu;
                        btn.className = 'btn btn-secondary w-100';
                        btn.style.marginBottom = '5px';
                        btn.style.textAlign = 'left';
                        btn.onclick = () => dersNotuGoster(konu);
                        listeDiv.appendChild(btn);
                    });
                });
            } else {
                listeDiv.innerHTML = '<div class="empty-state" style="padding:12px;"><p>Bu seviye için ders başlığı bulunamadı. Veriyi <code>data.js</code> içindeki <code>AI_MUFREDAT</code> bölümünden yönet.</p></div>';
            }
        }

        if (icerikDiv) {
            icerikDiv.innerHTML = '<div class="empty-state"><i class="fa-solid fa-hand-pointer fa-3x mb-10"></i><p>Sol menüden çalışmak istediğin konuyu seç.</p></div>';
        }
    } catch(e) { console.warn("Ders notları açılırken hata:", e); }
    
    ekranGoster('konuAnlatimiEkrani');
}

// 1.1 Seçilen Ders Notunu Ekrana Yazdırma
function dersNotuGoster(konuIsmi) { 
    const icerikDiv = document.getElementById('dersNotuIcerik');
    if (!icerikDiv) return;

    const notes = englishHubGetNotes();
    const icerikHTML = notes[konuIsmi]
        ? notes[konuIsmi]
        : `<h4 style="color:var(--primary); font-size:1.5rem; margin-bottom:15px;">${konuIsmi}</h4><p style="color:var(--danger); background:#fee2e2; padding:15px; border-radius:12px;"><em>Bu konu için ders notu henüz sisteme eklenmemiştir. Bunu öğretmen panelinden ekleyebilirsin.</em></p>`;

    icerikDiv.innerHTML = icerikHTML;
}

// 2. ÖĞRENME MODU (KELİME EZBERİ) BUTONU
function ogrenmeModunuAc() {
    try {
        let hamKelimeler = englishHubGetWords()[seciliGenelSeviye] ? [...englishHubGetWords()[seciliGenelSeviye]] : []; 
        flashcardKelimeleri = hamKelimeler.filter(k => !localOgrenci.ogrenilenKelimeler.includes(k.ana));
        
        if(flashcardKelimeleri.length === 0) { 
            alert("Harika! Bu seviyedeki tüm kelimeleri ezberlemişsin veya havuza henüz kelime eklenmemiş."); 
            return; 
        }
        ekranGoster('ogrenmeEkrani'); 
        if(typeof sonrakiFlashcardSadeceAyarla === "function") sonrakiFlashcardSadeceAyarla();
    } catch(e) { 
        console.warn("Öğrenme modu hatası:", e); 
        ekranGoster('ogrenmeEkrani'); 
    }
}

// 3. TABU OYUNU BUTONU
function oyunAyarlariniAc() { 
    ekranGoster('oyunAyarlari'); 
}

// 4. AI ASİSTAN BUTONU
function aiAsistaniAc() { 
    ekranGoster('aiEkrani'); 
    if(document.getElementById('aiKonusmaBalonu')) {
        document.getElementById('aiKonusmaBalonu').innerHTML = `Sana nasıl yardımcı olabilirim? İstersen mikrofona basıp sor!`;
    }
}

// 5. YAZMA PRATİĞİ BUTONU
function yazmaModunuAc() {
    const konuAlani = document.getElementById('yazmaKonusu');
    if(konuAlani) {
        if(seciliGenelSeviye === "A1") konuAlani.textContent = "Kendini, aileni ve günlük rutinini İngilizce olarak anlat. (Hedef: 20 kelime)"; 
        else if(seciliGenelSeviye === "A2") konuAlani.textContent = "Geçen yaz tatilinde neler yaptığını detaylıca anlat. (Hedef: 40 kelime)"; 
        else if(seciliGenelSeviye === "B1") konuAlani.textContent = "Teknolojinin hayatımızdaki faydaları ve zararları hakkında düşüncelerini yaz. (Hedef: 60 kelime)"; 
        else konuAlani.textContent = "Otonom sistemlerin savunma sanayisine etkilerini akademik bir dille açıkla. (Hedef: 80 kelime)";
    }
    
    if(document.getElementById('yazmaAlani')) document.getElementById('yazmaAlani').value = ""; 
    if(document.getElementById('kelimeSayaci')) document.getElementById('kelimeSayaci').textContent = "Kelime: 0"; 
    if(document.getElementById('yazmaGeriBildirim')) document.getElementById('yazmaGeriBildirim').style.display = "none"; 
    
    ekranGoster('yazmaEkrani');
}

// --- 1. KELİME ÖĞRENME MODU İÇ FONKSİYONLARI ---
function sonrakiFlashcardSadeceAyarla() {
    if(!flashcardKelimeleri || flashcardKelimeleri.length === 0) { 
        alert("Bu seanstaki kelimeler bitti!"); 
        ekranGoster('seviyeDashboard'); 
        return; 
    }
    const fc = document.getElementById('flashcard');
    if(fc) fc.classList.remove('flipped');
    
    const kelime = flashcardKelimeleri[Math.floor(Math.random() * flashcardKelimeleri.length)];
    if(fc) fc.dataset.aktifKelime = kelime.ana;
    
    setTimeout(() => { 
        if(document.getElementById('fcIngilizce')) document.getElementById('fcIngilizce').textContent = kelime.ana; 
        if(document.getElementById('fcTurkce')) document.getElementById('fcTurkce').textContent = kelime.turkce; 
    }, 150);
}

function sonrakiFlashcard() {
    sesEfektiCal('dogru'); 
    const fc = document.getElementById('flashcard');
    if(!fc) return;
    
    const ogrenilenKelime = fc.dataset.aktifKelime;
    if(!localOgrenci.ogrenilenKelimeler.includes(ogrenilenKelime)) { 
        localOgrenci.ogrenilenKelimeler.push(ogrenilenKelime); 
    }
    flashcardKelimeleri = flashcardKelimeleri.filter(k => k.ana !== ogrenilenKelime); 
    
    // İngilizce XP'sini artır
    localOgrenci.engXp += 10;
    
    // Level atlama kontrolü
    if(localOgrenci.engXp >= 100) { 
        localOgrenci.engLevel++; 
        localOgrenci.engXp -= 100; 
        patlatKonfeti(); 
    }
    
    arayuzXpGuncelle();
    
    // İŞTE EKSİK OLAN SİHİRLİ DOKUNUŞ BURASI! XP artar artmaz Java'ya yolla:
    javaUpdateEng(); 
    
    sonrakiFlashcardSadeceAyarla();
}

function flashcardCevir() { 
    const fc = document.getElementById('flashcard');
    if(fc) fc.classList.toggle('flipped'); 
}

function telaffuzEt(event, elementId) { 
    event.stopPropagation(); // Kartın dönmesini engeller
    const metin = document.getElementById(elementId).textContent; 
    const msg = new SpeechSynthesisUtterance(metin); 
    msg.lang = 'en-US'; 
    window.speechSynthesis.speak(msg); 
}


// --- 2. YAZMA ÇALIŞMASI İÇ FONKSİYONLARI ---
async function yazmaKontrolEt() {
    const metin = document.getElementById('yazmaAlani').value.trim(); 
    const kelimeSayisi = metin === "" ? 0 : metin.split(/\s+/).length; 
    const bildirim = document.getElementById('yazmaGeriBildirim');
    
    if(kelimeSayisi < 5) { alert("Lütfen biraz daha uzun bir şeyler yaz!"); return; }
    
    bildirim.style.display = "block"; 
    bildirim.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yapay zeka yazını analiz ediyor...`;
    
    setTimeout(() => {
        let analiz = `<strong>Asistan Analizi:</strong> Toplam ${kelimeSayisi} kelime yazmışsın. `; 
        if(metin.toLowerCase().includes("am") || metin.toLowerCase().includes("is") || metin.toLowerCase().includes("are")) analiz += "Temel fiilleri kullanman harika. ";
        
        if(kelimeSayisi > 15) { 
            analiz += "<br><span style='color:var(--success);'>Yeterli uzunluğa ulaştın. +20 XP kazandın!</span>"; 
            localOgrenci.engXp += 20;
            
            // Level kontrolü
            if(localOgrenci.engXp >= 100) {
                localOgrenci.engLevel++;
                localOgrenci.engXp -= 100;
                patlatKonfeti();
            }
            
            arayuzXpGuncelle();
            sesEfektiCal('dogru'); 
            
            // İŞTE EKSİK OLAN SİHİRLİ DOKUNUŞ BURASI!
            javaUpdateEng(); 
            
        } else { 
            analiz += "<br>Biraz daha detay vermelisin."; 
            sesEfektiCal('pas'); 
        } 
        bildirim.innerHTML = analiz;
    }, 1000);
}


// --- 3. AI ASİSTAN İÇ FONKSİYONLARI ---
function sesliDinle() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; 
    if(!SpeechRecognition) { alert("Tarayıcın ses tanımayı desteklemiyor. Lütfen Chrome kullan."); return; }
    
    const recognition = new SpeechRecognition(); 
    recognition.lang = 'tr-TR'; 
    const balon = document.getElementById('aiKonusmaBalonu');
    
    recognition.onstart = function() { 
        balon.innerHTML = "<i class='fa-solid fa-ear-listen'></i> Seni dinliyorum..."; 
        bozkurtSustur(); 
    }; 
    recognition.onresult = function(event) { 
        const soru = event.results[0][0].transcript;
        balon.innerHTML = `<strong>Sen:</strong> ${soru} <br><br> <strong>AI:</strong> Harika bir soru! (API bağlı değilse otomatik yanıttır)`;
        sesEfektiCal('dogru');
    }; 
    recognition.start();
}

function bozkurtSustur() { 
    if(window.speechSynthesis.speaking) window.speechSynthesis.cancel(); 
}


// --- 4. TABU OYUNU İÇ FONKSİYONLARI ---
function oyunuBaslat() {
    oyunDurumu.takim1.ad = document.getElementById('takim1Adi') ? document.getElementById('takim1Adi').value || "Mavi Takım" : "Mavi Takım"; 
    oyunDurumu.takim2.ad = document.getElementById('takim2Adi') ? document.getElementById('takim2Adi').value || "Kırmızı Takım" : "Kırmızı Takım"; 
    oyunDurumu.sure = document.getElementById('turSuresiInput') ? parseInt(document.getElementById('turSuresiInput').value) : 60; 
    
    let hamKelimeler = englishHubGetWords()[seciliGenelSeviye] ? [...englishHubGetWords()[seciliGenelSeviye]] : [];
    if (hamKelimeler.length < 5) { alert("Bu seviyede yeterli kelime yok! Öğretmen panelinden kelime ekleyin."); return; }
    
    aktifKelimeler = hamKelimeler.sort(() => Math.random() - 0.5); // Kelimeleri karıştır
    
    oyunDurumu.takim1.puan = 0; oyunDurumu.takim2.puan = 0; 
    oyunDurumu.mevcutTur = 1; oyunDurumu.siraKimde = 1; 
    
    ekranGoster('oyunEkrani'); 
    arayuzuGuncelleTabu(); 
    yeniOyunKelimesiGetir(); 
    
    // Sayacı başlat
    oyunDurumu.kalanSure = oyunDurumu.sure;
    oyunDurumu.oyunAktif = true;
    clearInterval(oyunZamanlayici);
    oyunZamanlayici = setInterval(() => { 
        oyunDurumu.kalanSure--; 
        if(document.getElementById('kalanSure')) document.getElementById('kalanSure').textContent = oyunDurumu.kalanSure; 
        if (oyunDurumu.kalanSure <= 0) turBitir(); 
    }, 1000);
}

function yeniOyunKelimesiGetir() {
    if (aktifKelimeler.length === 0) { alert("Kelimeler bitti!"); turBitir(); return; }
    const kelime = aktifKelimeler.pop(); 
    suAnkiOyunKelimesi = kelime.ana; 
    
    const fc = document.getElementById('kelimeKarti');
    if(fc) fc.classList.remove('flipped'); 
    
    if(document.getElementById('anaKelime')) document.getElementById('anaKelime').textContent = kelime.ana; 
    if(document.getElementById('kelimeAnlami')) document.getElementById('kelimeAnlami').textContent = kelime.turkce;
    
    const tabuListesi = document.getElementById('tabuKelimeler'); 
    if(tabuListesi) {
        tabuListesi.innerHTML = ''; 
        if(kelime.tabu) kelime.tabu.forEach(t => { 
            const div = document.createElement('div'); div.className = 'tabu-word'; div.textContent = t; tabuListesi.appendChild(div); 
        });
    }
}

function dogruTahmin() { puanGuncelleTabu(1, 'dogru'); } 
function pasVer() { puanGuncelleTabu(0, 'pas'); } 
function tabuKullandi() { puanGuncelleTabu(-1, 'yanlis'); }
function oyunKartiCevir() { const fc = document.getElementById('kelimeKarti'); if(fc) fc.classList.toggle('flipped'); }

function puanGuncelleTabu(miktar, islemTip) {
    if (!oyunDurumu.oyunAktif) return;
    if (islemTip === 'dogru') sesEfektiCal('dogru'); 
    else if (islemTip === 'yanlis') sesEfektiCal('yanlis'); 
    else if (islemTip === 'pas') sesEfektiCal('pas'); 
    
    if (oyunDurumu.siraKimde === 1) oyunDurumu.takim1.puan += miktar; 
    else oyunDurumu.takim2.puan += miktar; 
    
    arayuzuGuncelleTabu(); 
    yeniOyunKelimesiGetir();
}

function arayuzuGuncelleTabu() {
    if(document.getElementById('takim1Isim')) document.getElementById('takim1Isim').textContent = oyunDurumu.takim1.ad; 
    if(document.getElementById('takim1Puan')) document.getElementById('takim1Puan').textContent = oyunDurumu.takim1.puan; 
    if(document.getElementById('takim2Isim')) document.getElementById('takim2Isim').textContent = oyunDurumu.takim2.ad;
    if(document.getElementById('takim2Puan')) document.getElementById('takim2Puan').textContent = oyunDurumu.takim2.puan; 
}


function turBitir() { 
    clearInterval(oyunZamanlayici); 
    oyunDurumu.oyunAktif = false; 
    alert("Süre Doldu!"); 
    ekranGoster('seviyeDashboard'); // Şimdilik ana ekrana atsın
}
// İNGİLİZCE XP GÜNCELLENDİĞİNDE JAVA'YA GİDECEK İSTEK
async function javaUpdateEng() {
    if (!localOgrenci.id) return;
    try {
        await fetch(JAVA_API_URL + "/update-eng", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: localOgrenci.id, 
                engXp: localOgrenci.engXp, 
                engLevel: localOgrenci.engLevel,
                // YENİ EKLENEN KISIM: Kelimeleri Java'ya yolluyoruz
                ogrenilenKelimeler: JSON.stringify(localOgrenci.ogrenilenKelimeler),
                kacirilanlar: JSON.stringify(localOgrenci.kacirilanlar)
            })
        });
        console.log("☁️ İngilizce verileri ve Kelimeler MySQL'e kaydedildi!");
    } catch(e) { console.warn("İngilizce verileri güncellenemedi."); }
}

// ==========================================
// 2. KELİME ÖĞRENİNCE XP'Yİ ARTIRAN VE YUKARIDAKİ FONKSİYONU TETİKLEYEN KISIM
// ==========================================
function xpGuncelle(kazanilanXP) {
    localOgrenci.engXp += kazanilanXP;
    
    // Level atlama kontrolü
    if(localOgrenci.engXp >= 100) { 
        localOgrenci.engLevel += Math.floor(localOgrenci.engXp / 100); 
        localOgrenci.engXp = localOgrenci.engXp % 100; 
        
        if(kazanilanXP > 0) { 
            sesEfektiCal('oyunbitti'); 
            alert(`Tebrikler! İngilizce Level ${localOgrenci.engLevel} oldun! 🎉`); 
        } 
    }
    
    // Arayüzdeki çubuğu (barı) güncelle
    arayuzXpGuncelle();
    
    // YENİ EKLENEN KISIM: XP artar artmaz Java'ya (Veritabanına) yolla!
    javaUpdateEng(); 
}

function adminSekmeGoster(sekmeId) {
    document.querySelectorAll('#adminPaneliEkrani .admin-tab-content').forEach(sekme => {
        sekme.style.display = sekme.id === sekmeId ? 'block' : 'none';
    });
    const butonlar = document.querySelectorAll('#adminPaneliEkrani .admin-tabs button');
    butonlar.forEach(btn => btn.classList.remove('active-tab'));
    const seciliButon = Array.from(butonlar).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(sekmeId));
    if (seciliButon) seciliButon.classList.add('active-tab');
    if (sekmeId === 'kelimeYonetim') renderEnglishHubAdminPanel();
}

function coreSekmeGoster(sekmeId) {
    document.querySelectorAll('#sipCoreEkrani .core-tab-content').forEach(sekme => {
        sekme.style.display = sekme.id === sekmeId ? 'block' : 'none';
    });
    const butonlar = document.querySelectorAll('#sipCoreEkrani .admin-tabs button');
    butonlar.forEach(btn => btn.classList.remove('active-tab'));
    const seciliButon = Array.from(butonlar).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(sekmeId));
    if (seciliButon) seciliButon.classList.add('active-tab');
}

function notDuzenleIptal() {
    const seviyeEl = document.getElementById('yeniNotSeviye');
    if (seviyeEl) seviyeEl.value = 'A1';
    const kategoriEl = document.getElementById('yeniNotKategori');
    if (kategoriEl) kategoriEl.value = 'Grammar';
    document.getElementById('yeniNotBaslik').value = '';
    document.getElementById('yeniNotIcerik').value = '';
    document.getElementById('notKaydetBtn').style.display = 'block';
    document.getElementById('notIptalBtn').style.display = 'none';
}

async function englishHubVerileriYukle() {
    englishHubEnsureState();
    try {
        const res = await fetch(JAVA_API_URL + '/api/english-hub/state');
        if (res.ok) {
            const remoteState = await res.json();
            if (englishHubHasRemoteContent(remoteState)) {
                englishHubApplyState(remoteState);
            } else {
                try { await englishHubSyncState(); } catch (syncErr) {
                    console.warn('English Hub yerel veri sunucuya yazılamadı:', syncErr);
                }
            }
        } else {
            try { await englishHubSyncState(); } catch (syncErr) {
                console.warn('English Hub sync atlandı:', syncErr);
            }
        }
    } catch (e) {
        console.warn('English Hub verileri yüklenemedi, yerel data.js kullanılıyor:', e);
        englishHubEnsureState();
    }

    englishHubEnsureState();
    renderEnglishHubAdminPanel();
}

function englishHubKaydetKelimeler() {
    return englishHubSyncState();
}

function englishHubKaydetNotlar() {
    return englishHubSyncState();
}

function englishHubKaydetMufredat() {
    return englishHubSyncState();
}

async function englishHubKelimeSil(seviye, index) {
    if (!window.KELIME_HAVUZU || !Array.isArray(window.KELIME_HAVUZU[seviye])) return;
    window.KELIME_HAVUZU[seviye].splice(index, 1);
    await englishHubKaydetKelimeler();
    renderEnglishHubAdminPanel();
    sesEfektiCal('click');
}

async function englishHubNotSil(baslik) {
    if (window.DERS_NOTLARI && window.DERS_NOTLARI[baslik]) {
        delete window.DERS_NOTLARI[baslik];
        await englishHubKaydetNotlar();
    }

    if (window.AI_MUFREDAT) {
        Object.keys(window.AI_MUFREDAT).forEach(level => {
            Object.keys(window.AI_MUFREDAT[level] || {}).forEach(category => {
                window.AI_MUFREDAT[level][category] = (window.AI_MUFREDAT[level][category] || []).filter(topic => topic !== baslik);
            });
        });
        await englishHubKaydetMufredat();
    }

    renderEnglishHubAdminPanel();
    sesEfektiCal('click');
}

function englishHubRenderKelimeListesi() {
    const list = document.getElementById('tumKelimelerListesi');
    if (!list) return;

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const html = levels.map(level => {
        const items = Array.isArray(window.KELIME_HAVUZU?.[level]) ? window.KELIME_HAVUZU[level] : [];
        if (items.length === 0) return `<div class="empty-state" style="padding:12px;"><strong>${level}</strong><p>Bu seviyede kelime yok.</p></div>`;

        return `
            <div style="border:1px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><strong>${level}</strong><span style="font-size:12px; color:var(--text-muted);">${items.length} kelime</span></div>
                <div style="display:grid; gap:8px;">
                    ${items.map((item, index) => `
                        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start; border:1px solid #edf2f7; border-radius:12px; padding:8px 10px; background:#f8fafc;">
                            <div>
                                <strong>${escapeHtml(item.ana || '')}</strong>
                                <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(item.turkce || '')}</div>
                            </div>
                            <button class="btn btn-danger btn-small" data-action="english-kelime-sil" data-level="${escapeHtml(level)}" data-index="${index}">Sil</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    list.innerHTML = html || '<div class="empty-state">Kelime bulunamadı.</div>';
}

function englishHubRenderNotListesi() {
    const list = document.getElementById('tumNotlarListesi');
    if (!list) return;

    const usedTopics = new Set();
    const blocks = [];
    const levels = Object.keys(window.AI_MUFREDAT || {});

    levels.forEach(level => {
        const curriculum = window.AI_MUFREDAT[level] || {};
        Object.keys(curriculum).forEach(category => {
            const topics = Array.isArray(curriculum[category]) ? curriculum[category] : [];
            if (topics.length === 0) return;

            blocks.push(`
                <div style="border:1px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><strong>${escapeHtml(level)} · ${escapeHtml(category)}</strong><span style="font-size:12px; color:var(--text-muted);">${topics.length} başlık</span></div>
                    <div style="display:grid; gap:8px;">
                        ${topics.map(topic => {
                            usedTopics.add(topic);
                            return `
                                <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start; border:1px solid #edf2f7; border-radius:12px; padding:8px 10px; background:#f8fafc;">
                                    <div>
                                        <strong>${escapeHtml(topic)}</strong>
                                        <div style="font-size:12px; color:var(--text-muted);">${window.DERS_NOTLARI?.[topic] ? 'İçerik hazır' : 'İçerik yok'}</div>
                                    </div>
                                    <button class="btn btn-danger btn-small" data-action="english-not-sil" data-topic="${escapeHtml(topic)}">Sil</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `);
        });
    });

    const extraNotes = Object.keys(window.DERS_NOTLARI || {}).filter(topic => !usedTopics.has(topic));
    if (extraNotes.length > 0) {
        blocks.push(`
            <div style="border:1px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><strong>Ek Notlar</strong><span style="font-size:12px; color:var(--text-muted);">${extraNotes.length} başlık</span></div>
                <div style="display:grid; gap:8px;">
                    ${extraNotes.map(topic => `
                        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start; border:1px solid #edf2f7; border-radius:12px; padding:8px 10px; background:#f8fafc;">
                            <div><strong>${escapeHtml(topic)}</strong></div>
                                <button class="btn btn-danger btn-small" data-action="english-not-sil" data-topic="${escapeHtml(topic)}">Sil</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
    }

    list.innerHTML = blocks.join('') || '<div class="empty-state">Ders notu bulunamadı.</div>';
}

function renderEnglishHubAdminPanel() {
    const levelSelect = document.getElementById('yeniNotSeviye');
    const categoryInput = document.getElementById('yeniNotKategori');
    if (levelSelect && !levelSelect.value) levelSelect.value = 'A1';
    if (categoryInput && !categoryInput.value) categoryInput.value = 'Grammar';
    englishHubRenderKelimeListesi();
    englishHubRenderNotListesi();
}

async function yeniKelimeKaydet() {
    const seviye = document.getElementById('yeniKelimeSeviye').value;
    const ana = document.getElementById('yeniAnaKelime').value.trim();
    const turkce = document.getElementById('yeniTurkceAnlam').value.trim();
    if (!ana || !turkce) { alert('Lütfen kelime ve anlam gir.'); return; }
    const tabu = ['tabu1', 'tabu2', 'tabu3', 'tabu4', 'tabu5'].map(id => document.getElementById(id).value.trim()).filter(Boolean);
    if (!window.KELIME_HAVUZU) window.KELIME_HAVUZU = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] };
    if (!Array.isArray(window.KELIME_HAVUZU[seviye])) window.KELIME_HAVUZU[seviye] = [];
    window.KELIME_HAVUZU[seviye].push({ ana, turkce, tabu });
    await englishHubKaydetKelimeler();
    renderEnglishHubAdminPanel();
    document.getElementById('yeniAnaKelime').value = '';
    document.getElementById('yeniTurkceAnlam').value = '';
    ['tabu1','tabu2','tabu3','tabu4','tabu5'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    sesEfektiCal('dogru');
}

async function yeniDersNotuKaydet() {
    const seviye = document.getElementById('yeniNotSeviye').value;
    const kategori = document.getElementById('yeniNotKategori').value.trim() || 'Grammar';
    const baslik = document.getElementById('yeniNotBaslik').value.trim();
    const icerik = document.getElementById('yeniNotIcerik').value.trim();
    if (!baslik || !icerik) { alert('Lütfen başlık ve içerik gir.'); return; }
    if (!window.DERS_NOTLARI) window.DERS_NOTLARI = {};
    window.DERS_NOTLARI[baslik] = `<h4 style="color:var(--primary); margin-bottom:10px;">${baslik}</h4><p style="white-space:pre-wrap; line-height:1.7;">${icerik}</p>`;
    if (!window.AI_MUFREDAT) window.AI_MUFREDAT = {};
    if (!window.AI_MUFREDAT[seviye]) window.AI_MUFREDAT[seviye] = {};
    if (!Array.isArray(window.AI_MUFREDAT[seviye][kategori])) window.AI_MUFREDAT[seviye][kategori] = [];
    if (!window.AI_MUFREDAT[seviye][kategori].includes(baslik)) window.AI_MUFREDAT[seviye][kategori].push(baslik);
    await englishHubKaydetNotlar();
    await englishHubKaydetMufredat();
    renderEnglishHubAdminPanel();
    document.getElementById('yeniNotBaslik').value = '';
    document.getElementById('yeniNotIcerik').value = '';
    document.getElementById('notKaydetBtn').style.display = 'block';
    document.getElementById('notIptalBtn').style.display = 'none';
    sesEfektiCal('dogru');
}

function coreDnaUret() {
    const yukleniyor = document.getElementById('dnaYukleniyor');
    const sonuc = document.getElementById('dnaSonucAlani');
    yukleniyor.style.display = 'block';
    setTimeout(() => {
        yukleniyor.style.display = 'none';
        sonuc.style.display = 'block';
        sonuc.innerHTML = '<strong>Öğrenme DNA’sı hazır.</strong><p>Hedeflerini küçük parçalara bölerek ilerlemeni öneriyorum.</p>';
        sesEfektiCal('dogru');
    }, 600);
}

function coreKampanyaUret() {
    const yukleniyor = document.getElementById('kampanyaYukleniyor');
    const sonuc = document.getElementById('kampanyaSonucAlani');
    yukleniyor.style.display = 'block';
    setTimeout(() => {
        yukleniyor.style.display = 'none';
        sonuc.style.display = 'block';
        sonuc.innerHTML = '<div class="camp-day"><div class="camp-day-num">1</div><div class="camp-day-desc">Konu tekrar + kısa test</div></div><div class="camp-day"><div class="camp-day-num">2</div><div class="camp-day-desc">Zayıf noktaları güçlendirme</div></div>';
        sesEfektiCal('dogru');
    }, 600);
}

function coreMateryalUret() {
    const yukleniyor = document.getElementById('materyalYukleniyor');
    const sonuc = document.getElementById('materyalSonucAlani');
    yukleniyor.style.display = 'block';
    setTimeout(() => {
        yukleniyor.style.display = 'none';
        sonuc.style.display = 'block';
        sonuc.innerHTML = '<h3>Özel Materyal</h3><p>Özet not + soru seti + mini tekrar planı hazırlandı.</p>';
        sesEfektiCal('dogru');
    }, 600);
}

function coreDersPlaniUret() {
    const sonuc = document.getElementById('coreOgretmenSonuc');
    const yukleniyor = document.getElementById('coreOgretmenYukleniyor');
    yukleniyor.style.display = 'block';
    setTimeout(() => {
        yukleniyor.style.display = 'none';
        sonuc.style.display = 'block';
        sonuc.innerHTML = '<strong>Ders planı hazır.</strong><p>Konuyu giriş, örnek, uygulama ve mini değerlendirme olarak ayırabilirsin.</p>';
        sesEfektiCal('dogru');
    }, 600);
}

function teacherHubRender() {
    const state = teacherHubReadState();
    const profiles = teacherHubReadProfiles();
    const classCount = state.classes.length;
    const studentCount = Object.keys(profiles).length;
    const unreadNoticeCount = Object.values(profiles).reduce((sum, profile) => sum + (profile.notifications || []).filter(item => !item.read).length, 0);
    const messageCount = state.messages.length;

    const metricMap = {
        teacherMetricSinif: classCount,
        teacherMetricOgrenci: studentCount,
        teacherMetricMesaj: messageCount,
        teacherMetricBildirim: unreadNoticeCount
    };
    Object.entries(metricMap).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    const teacherName = document.getElementById('teacherHeroName');
    if (teacherName) teacherName.textContent = aktifOgretmen.isim || 'Öğretmen';

    const classList = document.getElementById('teacherClassList');
    if (classList) {
        classList.innerHTML = state.classes.length === 0 ? '<div class="empty-state"><p>Henüz sınıf yok. İlk sınıf kodunu şimdi üret.</p></div>' : state.classes.map(classItem => {
            const summary = teacherHubBuildClassSummary(classItem, profiles);
            return `
                <div class="class-card">
                    <div class="class-card-top">
                        <div>
                            <div class="class-pill">${classItem.id}</div>
                            <h4>${classItem.name}</h4>
                            <p>${classItem.focus || 'Genel takip sınıfı'}</p>
                        </div>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <span class="class-pill" style="background:${classItem.active === false ? '#fef2f2' : '#ecfdf3'}; color:${classItem.active === false ? '#b91c1c' : '#047857'};">${classItem.active === false ? 'Kapalı' : 'Açık'}</span>
                            <button class="btn btn-secondary btn-small" data-action="copy-class-code" data-id="${classItem.id}">Kodu Kopyala</button>
                            <button class="btn btn-danger btn-small" data-action="toggle-class-active" data-id="${classItem.id}">${classItem.active === false ? 'Aç' : 'Kapat'}</button>
                        </div>
                    </div>
                    <div class="class-card-stats">
                        <span><strong>${summary.memberProfiles.length}</strong> öğrenci</span>
                        <span><strong>${summary.reportTotals.sessions}</strong> oturum</span>
                        <span><strong>${summary.reportTotals.minutes}</strong> dk</span>
                        <span><strong>${summary.reportTotals.questions}</strong> soru</span>
                    </div>
                    <div class="class-card-note">${classItem.note || 'Sınıf özelleştirilmiş takip için hazır.'}</div>
                    ${classItem.active === false ? '<div style="padding:8px; color:var(--danger); font-size:12px;">Bu sınıf kapatılmıştır.</div>' : ''}
                </div>
            `;
        }).join('');
    }

    const messageList = document.getElementById('teacherMessageList');
    if (messageList) {
        messageList.innerHTML = state.messages.length === 0 ? '<div class="empty-state"><p>Henüz gönderilmiş mesaj yok.</p></div>' : state.messages.slice(0, 6).map(message => `
            <div class="message-card">
                <div class="message-card-head">
                    <strong>${message.subject}</strong>
                    <span>${new Date(message.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <p>${message.body}</p>
                <div class="message-card-foot">Hedef: ${message.targetType === 'class' ? 'Sınıf ' + message.targetValue : message.targetValue}</div>
            </div>
        `).join('');
    }

    teacherHubRenderTeacherInbox();

    const reportList = document.getElementById('teacherReportList');
    if (reportList) {
        const orderedProfiles = Object.values(profiles).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        reportList.innerHTML = orderedProfiles.length === 0 ? '<div class="empty-state"><p>Henüz kayıtlı öğrenci profili yok.</p></div>' : orderedProfiles.slice(0, 6).map(profile => {
            const report = teacherHubBuildReport(profile, 30);
            const topTopic = report.strongest[0]?.[0] || 'Veri yok';
            const weakTopic = report.weakSubjects[0]?.[0] || 'Veri yok';
            return `
                <div class="student-snapshot">
                    <div class="student-snapshot-head">
                        <strong>${profile.name || 'İsimsiz Öğrenci'}</strong>
                        <span>${profile.classId || 'Sınıfsız'}</span>
                    </div>
                    <div class="student-snapshot-stats">
                        <span>${report.totalMinutes} dk</span>
                        <span>${report.totalQuestions} soru</span>
                        <span>${report.totalCorrect} D / ${report.totalWrong} Y</span>
                        <span>${report.sessions} oturum</span>
                    </div>
                    <div class="student-snapshot-tags">
                        <span class="tag tag-strong">Güçlü: ${topTopic}</span>
                        <span class="tag tag-weak">Zorlandığı: ${weakTopic}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function teacherHubRenderTeacherInbox() {
    const inbox = document.getElementById('teacherReplyList');
    if (!inbox) return;

    const teacherEmail = (aktifOgretmen.email || '').toLowerCase();
    if (!teacherEmail) {
        inbox.innerHTML = '<div class="empty-state"><p>Önce öğretmen girişi yapın.</p></div>';
        return;
    }

    let notices = [];
    try { notices = JSON.parse(localStorage.getItem(`${TEACHER_NOTICE_PREFIX}${teacherEmail}`)) || []; } catch (e) { notices = []; }
    const replies = notices.filter(item => item.replyTo || item.targetType === 'email');

    if (replies.length === 0) {
        inbox.innerHTML = '<div class="empty-state"><p>Henüz gelen yanıt yok.</p></div>';
        return;
    }

    inbox.innerHTML = replies.slice(0, 10).map(reply => `
        <div class="message-card">
            <div class="message-card-head">
                <strong>${reply.subject || 'Yanıt'}</strong>
                <span>${new Date(reply.createdAt).toLocaleString('tr-TR')}</span>
            </div>
            <p>${reply.body || ''}</p>
            <div class="message-card-foot">Gönderen: ${reply.sender || reply.senderEmail || 'Bilinmiyor'}${reply.classId ? ' · Sınıf: ' + reply.classId : ''}</div>
        </div>
    `).join('');
}

function teacherHubCreateClass() {
    const name = document.getElementById('teacherClassName').value.trim();
    const focus = document.getElementById('teacherClassFocus').value.trim();
    const note = document.getElementById('teacherClassNote').value.trim();
    if (!name) { alert('Sınıf adı gir.'); return; }

    const state = teacherHubReadState();
    const classItem = {
        id: teacherHubGenerateClassId(),
        name,
        focus,
        note,
        owner: aktifOgretmen.isim || 'Öğretmen',
        ownerEmail: (aktifOgretmen.email || '').toLowerCase(),
        createdAt: new Date().toISOString(),
        students: [],
        active: true
    };
    state.classes.unshift(classItem);
    teacherHubWriteState(state);
    document.getElementById('teacherClassName').value = '';
    document.getElementById('teacherClassFocus').value = '';
    document.getElementById('teacherClassNote').value = '';
    teacherHubRender();
    sesEfektiCal('dogru');
}

async function teacherHubToggleClassActive(classId) {
    const state = teacherHubReadState();
    const classItem = teacherHubFindClass(state, classId);
    if (!classItem) { alert('Sınıf bulunamadı.'); return; }

    const wasActive = teacherHubIsClassActive(classItem);
    classItem.active = !wasActive;
    teacherHubWriteState(state);
    teacherHubRender();

    try {
        const endpoint = JAVA_API_URL + '/teacher/class/' + encodeURIComponent(classId) + (classItem.active === false ? '/close' : '/open');
        const res = await fetch(endpoint, { method: 'POST' });
        if (!res.ok) {
            const txt = await res.text();
            console.warn('Sınıf durumu backend senkronize edilemedi:', txt);
        }
    } catch (e) {
        console.warn('Sınıf durumu backend senkronize edilemedi', e);
    }
}

async function teacherHubAssignStudentToClass() {
    const email = document.getElementById('teacherAssignEmail').value.trim().toLowerCase();
    const classId = document.getElementById('teacherAssignClassId').value.trim().toUpperCase();
    if (!email || !classId) { alert('Öğrenci e-postası ve sınıf kodu gerekli.'); return; }

    const state = teacherHubReadState();
    const classItem = teacherHubFindClass(state, classId);
    if (!classItem) { alert('Sınıf kodu bulunamadı.'); return; }
    if (!teacherHubIsClassActive(classItem)) { alert('Bu sınıf kapalı. Önce sınıfı açın.'); return; }

    if (!classItem.students.includes(email)) classItem.students.push(email);
    teacherHubWriteState(state);

    const profiles = teacherHubReadProfiles();
    profiles[email] = profiles[email] || { email, name: email.split('@')[0] };
    profiles[email].classId = classId;
    profiles[email].teacherCode = classId;
    profiles[email].teacherName = aktifOgretmen.isim || 'Öğretmen';
    teacherHubWriteProfiles(profiles);

    try {
        const res = await fetch(JAVA_API_URL + '/api/students/join-class-by-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, classCode: classId })
        });
        if (!res.ok) {
            const msg = await res.text();
            console.warn('Backend sınıf ataması başarısız:', msg);
        }
    } catch (e) {
        console.warn('Backend sınıf ataması hatası', e);
    }

    teacherHubSendNotice('email', email, 'Sınıf Ataması', `${classItem.name} sınıfına atandın. Kod: ${classId}`, classId);
    teacherHubRender();
    sesEfektiCal('dogru');
}

function teacherHubFindProfileKey(query) {
    const normalized = query.trim().toLowerCase();
    const profiles = teacherHubReadProfiles();
    return Object.keys(profiles).find(email => email.toLowerCase() === normalized || profiles[email].classId?.toLowerCase() === normalized) || '';
}

function teacherHubOpenReport() {
    const query = document.getElementById('teacherReportQuery').value.trim();
    const days = parseInt(document.getElementById('teacherReportDays').value, 10) || 30;
    const output = document.getElementById('teacherReportOutput');
    const profiles = teacherHubReadProfiles();
    const state = teacherHubReadState();

    if (!query) {
        output.innerHTML = '<div class="empty-state"><p>Rapor için öğrenci e-postası veya sınıf kodu gir.</p></div>';
        return;
    }

    const classItem = state.classes.find(item => item.id.toLowerCase() === query.toLowerCase());
    if (classItem) {
        const summary = teacherHubBuildClassSummary(classItem, profiles);
        output.innerHTML = `
            <div class="report-shell">
                <div class="report-shell-head">
                    <div>
                        <h4>${classItem.name}</h4>
                        <p>${classItem.id} · ${summary.memberProfiles.length} öğrenci</p>
                    </div>
                    <div class="report-shell-kpi">${days} günlük sınıf görünümü</div>
                </div>
                <div class="report-metrics">
                    <div><span>Oturum</span><strong>${summary.reportTotals.sessions}</strong></div>
                    <div><span>Dakika</span><strong>${summary.reportTotals.minutes}</strong></div>
                    <div><span>Soru</span><strong>${summary.reportTotals.questions}</strong></div>
                    <div><span>Doğru / Yanlış</span><strong>${summary.reportTotals.correct} / ${summary.reportTotals.wrong}</strong></div>
                </div>
                <div class="report-note">Sınıfa bağlı öğrencilerin son ${days} günlük verileri toplu görünümde gösterilir.</div>
            </div>
        `;
        return;
    }

    const profileKey = teacherHubFindProfileKey(query);
    const profile = profileKey ? profiles[profileKey] : null;
    if (!profile) {
        output.innerHTML = '<div class="empty-state"><p>Öğrenci veya sınıf bulunamadı.</p></div>';
        return;
    }

    const report = teacherHubBuildReport(profile, days);
    const strongTopics = report.strongest.length === 0 ? '<span class="tag">Veri yok</span>' : report.strongest.map(([topic, count]) => `<span class="tag tag-strong">${topic} · ${count}</span>`).join('');
    const weakTopics = report.weakSubjects.length === 0 ? '<span class="tag">Veri yok</span>' : report.weakSubjects.map(([topic, count]) => `<span class="tag tag-weak">${topic} · ${count}</span>`).join('');
    const recentFeed = report.recent.slice(0, 8).map(item => `
        <div class="report-session">
            <div>
                <strong>${item.sinav}</strong>
                <span>${item.ders}</span>
            </div>
            <div>
                <strong>${Math.floor((item.sure || 0) / 60)} dk</strong>
                <span>${parseInt(item.soruSayisi, 10) || 0} soru · ${parseInt(item.dogruSayisi, 10) || 0} D / ${parseInt(item.yanlisSayisi, 10) || 0} Y</span>
            </div>
        </div>
    `).join('');

    output.innerHTML = `
        <div class="report-shell">
            <div class="report-shell-head">
                <div>
                    <h4>${profile.name || 'Öğrenci'}</h4>
                    <p>${profile.email} · ${profile.classId || 'Sınıfsız'}</p>
                </div>
                <div class="report-shell-kpi">${days} günlük görünüm</div>
            </div>
            <div class="report-metrics">
                <div><span>Oturum</span><strong>${report.sessions}</strong></div>
                <div><span>Dakika</span><strong>${report.totalMinutes}</strong></div>
                <div><span>Soru</span><strong>${report.totalQuestions}</strong></div>
                <div><span>Doğru / Yanlış</span><strong>${report.totalCorrect} / ${report.totalWrong}</strong></div>
            </div>
            <div class="report-note">En güçlü konular</div>
            <div class="tag-row">${strongTopics}</div>
            <div class="report-note">Dikkat edilmesi gereken konular</div>
            <div class="tag-row">${weakTopics}</div>
            <div class="report-feed">${recentFeed || '<div class="empty-state"><p>Bu aralıkta oturum yok.</p></div>'}</div>
        </div>
    `;
    teacherHubRender();
}

// ----------------- Chat & Attachments -----------------
async function uploadAttachment(file) {
    try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(JAVA_API_URL + '/api/chat/upload', { method: 'POST', body: fd });
        if (!res.ok) return null;
        const data = await res.json();
        return data.url || null;
    } catch (e) { console.error('Upload failed', e); return null; }
}

async function teacherHubSendMessage() {
    const targetType = document.getElementById('teacherMessageTargetType').value;
    const targetValue = document.getElementById('teacherMessageTarget').value.trim();
    const subject = document.getElementById('teacherMessageSubject').value.trim();
    const body = document.getElementById('teacherMessageBody').value.trim();
    if (!targetValue || !subject || !body) { alert('Mesaj hedefi, konu ve içerik gerekli.'); return; }

    // Upload attachments if any
    const fileInput = document.getElementById('teacherMessageFile');
    const uploaded = [];
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (let f of fileInput.files) {
            const url = await uploadAttachment(f);
            if (url) uploaded.push(url);
        }
    }

    // Persist local notice as before
    const normalizedTarget = targetType === 'class' ? targetValue.toUpperCase() : targetValue.toLowerCase();
    if (targetType === 'class') {
        const state = teacherHubReadState();
        const classItem = teacherHubFindClass(state, normalizedTarget);
        if (!classItem) { alert('Sınıf kodu bulunamadı.'); return; }
        if (!teacherHubIsClassActive(classItem)) { alert('Bu sınıf kapalı. Mesaj gönderemezsiniz.'); return; }
    }
    teacherHubSendNotice(targetType, normalizedTarget, subject, body, targetType === 'class' ? normalizedTarget : '');
    teacherHubRender(); sesEfektiCal('dogru');

    // Send email via backend if target is email
    if (targetType === 'email') {
        try {
            await fetch(JAVA_API_URL + '/api/chat/send-email', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: normalizedTarget, subject, body, attachments: uploaded })
            });
        } catch (e) { console.warn('Email send failed', e); }
    }

    // Also create a chat message record for persistence
    try {
        await fetch(JAVA_API_URL + '/api/chat/message', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderEmail: aktifOgretmen.email || aktifOgretmen.isim || 'ogretmen@local', recipientEmail: targetType === 'email' ? normalizedTarget : null, classCode: targetType === 'class' ? normalizedTarget : null, text: body, attachmentUrlsJson: JSON.stringify(uploaded) })
        });
    } catch (e) { console.warn('Chat message save failed', e); }

    // clear inputs
    document.getElementById('teacherMessageSubject').value = '';
    document.getElementById('teacherMessageBody').value = '';
    if (fileInput) {
        fileInput.value = null;
        const nameEl = document.getElementById('teacherMessageFileName');
        if (nameEl) nameEl.textContent = 'Dosya seçilmedi';
    }
}

async function teacherChatSend() {
    const target = document.getElementById('teacherChatTarget').value.trim();
    const text = document.getElementById('teacherChatText').value.trim();
    if (!target || !text) { alert('Hedef ve mesaj gerekli'); return; }
    const state = teacherHubReadState();
    const classItem = teacherHubFindClass(state, target.toUpperCase());
    if (classItem && !teacherHubIsClassActive(classItem)) { alert('Bu sınıf kapalı. Mesaj gönderemezsiniz.'); return; }
    const fileEl = document.getElementById('teacherChatFile');
    let uploaded = [];
    if (fileEl && fileEl.files && fileEl.files.length > 0) {
        for (let f of fileEl.files) {
            const u = await uploadAttachment(f); if (u) uploaded.push(u);
        }
    }
    const dto = { senderEmail: aktifOgretmen.email || aktifOgretmen.isim || 'ogretmen@local', recipientEmail: null, classCode: target.toUpperCase(), text, attachmentUrls: uploaded };
    if (stompClient) {
        try {
            stompClient.send('/app/chat.send', {}, JSON.stringify(dto));
        } catch (e) {
            console.warn('WS send failed, falling back to REST', e);
            try { await fetch(JAVA_API_URL + '/api/chat/message', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ...dto, attachmentUrlsJson: JSON.stringify(uploaded) }) }); } catch(e){console.warn(e)}
        }
    } else {
        try { await fetch(JAVA_API_URL + '/api/chat/message', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ...dto, attachmentUrlsJson: JSON.stringify(uploaded) }) }); } catch(e){console.warn(e)}
    }
    document.getElementById('teacherChatText').value='';
    if (fileEl) {
        fileEl.value = null;
        const nameEl = document.getElementById('teacherChatFileName');
        if (nameEl) nameEl.textContent = 'Dosya seçilmedi';
    }
    await refreshTeacherChat(target);
}

async function studentChatSend() {
    if (!localOgrenci.email) { alert('Önce giriş yapın.'); return; }
    if (studentChatMode === 'reply') {
        if (!studentReplyNoticeId) {
            alert('Önce bir bildirim seç.');
            return;
        }
        await teacherHubSendStudentReply(studentReplyNoticeId);
        return;
    }
    const inputEl = document.getElementById('studentChatInput');
    const text = (inputEl && inputEl.value ? inputEl.value : '').trim();
    if (!text) { alert('Mesaj yazın.'); return; }
    const classCode = studentChatGetClassCode();
    if (!classCode) { alert('Sınıf kodunuz yok. Öğretmenin gönderdiği sınıf ataması bildirimini kontrol edin.'); return; }
    const state = teacherHubReadState();
    const classItem = teacherHubFindClass(state, classCode);
    if (classItem && !teacherHubIsClassActive(classItem)) { alert('Sınıfınız öğretmen tarafından kapatıldı.'); return; }
    const fileEl = document.getElementById('studentChatFile'); let uploaded = [];
    if (fileEl && fileEl.files && fileEl.files.length > 0) {
        for (let f of fileEl.files) { const u = await uploadAttachment(f); if (u) uploaded.push(u); }
    }
    const dto = { senderEmail: localOgrenci.email, recipientEmail: null, classCode, text, attachmentUrls: uploaded };
    const optimistic = { senderEmail: localOgrenci.email, classCode, text, createdAt: new Date().toISOString(), attachmentUrlsJson: JSON.stringify(uploaded), _local: true };
    studentChatSaveLocal(classCode, optimistic);
    studentChatAppendToList(optimistic, false);
    let sent = false;
    if (stompClient) {
        try { stompClient.send('/app/chat.send', {}, JSON.stringify(dto)); sent = true; } catch(e){ console.warn('WS send failed, falling back to REST', e); }
    }
    if (!sent) {
        try {
            const res = await fetch(JAVA_API_URL + '/api/chat/message', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ...dto, attachmentUrlsJson: JSON.stringify(uploaded) }) });
            sent = res.ok;
        } catch(e) { console.warn(e); }
    }
    if (!sent) console.warn('Mesaj sunucuya iletilemedi; yerel kopyada görünüyor.');
    if (inputEl) inputEl.value = '';
    if (fileEl) {
        fileEl.value = null;
        const nameEl = document.getElementById('studentChatFileName');
        if (nameEl) nameEl.textContent = 'Dosya seçilmedi';
    }
    await refreshStudentChat();
}

let teacherChatInterval = null; let studentChatInterval = null;
async function refreshTeacherChat(target) {
    try {
        const classCode = target.toUpperCase();
        const res = await fetch(JAVA_API_URL + '/api/chat/messages?classCode=' + encodeURIComponent(classCode));
        if (!res.ok) return;
        const list = await res.json();
        const area = document.getElementById('teacherChatArea');
        area.innerHTML = list.map(m => renderChatMessageHtml(m, true)).join('');
        area.scrollTop = area.scrollHeight;
    } catch(e) { console.warn(e); }
}

async function refreshStudentChat() {
    const area = document.getElementById('studentChatList');
    if (!area) return;
    const classCode = studentChatGetClassCode();
    if (!classCode) {
        area.innerHTML = '<div style="padding:10px;color:#64748b;font-size:12px;">Sınıf kodu bulunamadı.</div>';
        return;
    }
    const local = studentChatReadLocal(classCode);
    let remote = [];
    try {
        const res = await fetch(JAVA_API_URL + '/api/chat/messages?classCode=' + encodeURIComponent(classCode));
        if (res.ok) remote = await res.json();
    } catch(e) { console.warn(e); }
    const merged = [...remote, ...local.filter(lm => !remote.some(rm => rm.text === lm.text && (rm.senderEmail || '') === (lm.senderEmail || '')))];
    merged.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    if (merged.length === 0) {
        area.innerHTML = '<div style="padding:10px;color:#64748b;font-size:12px;">Henüz mesaj yok. İlk mesajı sen yaz.</div>';
    } else {
        area.innerHTML = merged.map(m => renderChatMessageHtml(m, false)).join('');
    }
    area.scrollTop = area.scrollHeight;
}

function renderChatMessageHtml(m, showSender) {
    const time = new Date(m.createdAt || m.createdAt).toLocaleString('tr-TR');
    const attach = (m.attachmentUrlsJson && m.attachmentUrlsJson !== '[]') ? JSON.parse(m.attachmentUrlsJson) : [];
    const attachHtml = attach.length ? '<div class="chat-attachments">' + attach.map(u => `<div><a href="${u}" target="_blank">Dosya</a></div>`).join('') + '</div>' : '';
    return `<div class="chat-msg" style="padding:6px 8px; border-bottom:1px solid #f1f5f9;"><div style="font-size:12px;color:#475569;">${showSender?('<strong>'+ (m.senderEmail||'') +'</strong> · '):''}<span style="font-size:11px;color:#94a3b8;">${time}</span></div><div style="margin-top:6px;">${escapeHtml(m.text||'')}</div>${attachHtml}</div>`;
}

function escapeHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

function toggleStudentChat() {
    const w = document.getElementById('studentChatWidget');
    if (!w) return;
    if (w.style.display === 'none' || w.style.display === '') {
        w.style.display = 'block'; renderStudentChatComposer(); refreshStudentChat();
        if (studentChatInterval) clearInterval(studentChatInterval);
        studentChatInterval = setInterval(refreshStudentChat, 3000);
    } else {
        w.style.display = 'none'; if (studentChatInterval) clearInterval(studentChatInterval);
    }
}

// Auto-open small chat toggle button (visible after login)
function showStudentChatToggle() {
    const w = document.getElementById('studentChatWidget');
    if (!w) return;
    w.style.display = 'block';
    if (studentChatMode !== 'reply') studentChatMode = 'class';
    renderStudentChatComposer();
    refreshStudentChat();
    if (studentChatInterval) clearInterval(studentChatInterval);
    studentChatInterval = setInterval(refreshStudentChat, 4000);
}
