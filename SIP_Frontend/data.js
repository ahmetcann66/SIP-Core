const KELIME_HAVUZU = {
    "A1":[
        { ana: "EMERGENCY", turkce: "Acil Durum", tabu:["Hospital", "Police", "Ambulance", "Help", "Call"] },
        { ana: "HUNGRY", turkce: "Aç", tabu:["Food", "Eat", "Stomach", "Meal", "Lunch"] },
        { ana: "CLEAR", turkce: "Açık, Net", tabu: ["Understand", "See", "Glass", "Clean", "Window"] },
        { ana: "TREE", turkce: "Ağaç", tabu:["Green", "Leaf", "Wood", "Forest", "Apple"] },
        { ana: "HEAVY", turkce: "Ağır", tabu: ["Weight", "Carry", "Lift", "Fat", "Big"] },
        { ana: "CRY", turkce: "Ağlamak", tabu:["Tears", "Sad", "Baby", "Eye", "Unhappy"] },
        { ana: "HABIT", turkce: "Alışkanlık", tabu: ["Always", "Do", "Routine", "Everyday", "Usually"] },
        { ana: "UNCLE", turkce: "Amca", tabu:["Father", "Brother", "Aunt", "Family", "Man"] },
        { ana: "MAIN", turkce: "Ana", tabu: ["Important", "First", "Street", "Big", "Primary"] },
        { ana: "UNDERSTAND", turkce: "Anlamak", tabu:["Know", "Think", "Clear", "Meaning", "Yes"] },
        { ana: "CALL", turkce: "Arama", tabu: ["Phone", "Speak", "Name", "Number", "Ring"] },
        { ana: "FIRE", turkce: "Ateş", tabu:["Hot", "Burn", "Red", "Water", "Camp"] },
        { ana: "LAWYER", turkce: "Avukat", tabu: ["Court", "Judge", "Law", "Police", "Suit"] },
        { ana: "MONTH", turkce: "Ay", tabu:["Year", "Week", "Day", "January", "Calendar"] },
        { ana: "SHOE", turkce: "Ayakkabı", tabu: ["Foot", "Wear", "Walk", "Sock", "Run"] },
        { ana: "MIRROR", turkce: "Ayna", tabu:["Look", "Face", "Glass", "See", "Reflection"] },
        { ana: "SAME", turkce: "Aynı", tabu: ["Different", "Like", "Twin", "Match", "Equal"] },
        { ana: "LEAVE", turkce: "Ayrılmak", tabu:["Go", "Stay", "Depart", "Exit", "House"] },
        { ana: "GARDEN", turkce: "Bahçe", tabu: ["Flower", "Tree", "House", "Grass", "Outside"] },
        { ana: "BATH", turkce: "Banyo", tabu:["Water", "Wash", "Clean", "Room", "Soap"] },
        { ana: "GLASS", turkce: "Bardak", tabu: ["Water", "Drink", "Cup", "Window", "Break"] },
        { ana: "SUCCESSFUL", turkce: "Başarılı", tabu:["Win", "Good", "Job", "Money", "Fail"] },
        { ana: "TICKET", turkce: "Bilet", tabu: ["Bus", "Plane", "Cinema", "Buy", "Paper"] },
        { ana: "EMPTY", turkce: "Boş", tabu:["Full", "Nothing", "Glass", "Box", "Room"] },
        { ana: "PAINT", turkce: "Boya", tabu: ["Color", "Wall", "Art", "Picture", "Brush"] },
        { ana: "CLOUD", turkce: "Bulut", tabu:["Sky", "Rain", "White", "Weather", "Sun"] },
        { ana: "NOSE", turkce: "Burun", tabu: ["Face", "Smell", "Eye", "Mouth", "Breathe"] },
        { ana: "LARGE", turkce: "Büyük", tabu:["Big", "Small", "Huge", "Size", "Clothes"] },
        { ana: "BRAVE", turkce: "Cesur", tabu: ["Afraid", "Hero", "Strong", "Fear", "Man"] },
        { ana: "ANSWER", turkce: "Cevap", tabu:["Question", "Ask", "Reply", "Test", "Know"] },
        { ana: "BAG", turkce: "Çanta", tabu: ["Carry", "School", "Books", "Money", "Women"] },
        { ana: "DRAW", turkce: "Çizmek", tabu:["Picture", "Pen", "Paper", "Art", "Paint"] },
        { ana: "MINUTE", turkce: "Dakika", tabu: ["Time", "Hour", "Second", "Clock", "Wait"] },
        { ana: "I", turkce: "Ben", tabu:["Me", "Myself", "Person", "You", "Am"] },
        { ana: "YOU", turkce: "Sen", tabu: ["Me", "Person", "Are", "We", "They"] },
        { ana: "HE", turkce: "O (Erkek)", tabu:["Man", "Boy", "Male", "She", "His"] },
        { ana: "SHE", turkce: "O (Kadın)", tabu: ["Woman", "Girl", "Female", "He", "Her"] },
        { ana: "WE", turkce: "Biz", tabu:["Us", "Together", "Group", "I", "You"] },
        { ana: "THEY", turkce: "Onlar", tabu:["Them", "People", "Group", "We", "Those"] },
        { ana: "MOTHER", turkce: "Anne", tabu:["Father", "Parent", "Woman", "Birth", "Family"] },
        { ana: "FATHER", turkce: "Baba", tabu:["Mother", "Parent", "Man", "Dad", "Family"] },
        { ana: "SISTER", turkce: "Kız Kardeş", tabu:["Brother", "Girl", "Family", "Sibling", "Daughter"] },
        { ana: "BROTHER", turkce: "Erkek Kardeş", tabu: ["Sister", "Boy", "Family", "Sibling", "Son"] },
        { ana: "FAMILY", turkce: "Aile", tabu:["Mother", "Father", "Children", "Home", "Together"] },
        { ana: "GO", turkce: "Gitmek", tabu: ["Come", "Walk", "Leave", "Travel", "Move"] },
        { ana: "COME", turkce: "Gelmek", tabu:["Go", "Here", "Arrive", "Move", "Walk"] },
        { ana: "EAT", turkce: "Yemek Yemek", tabu: ["Food", "Hungry", "Mouth", "Drink", "Meal"] },
        { ana: "DRINK", turkce: "İçmek", tabu:["Water", "Thirsty", "Glass", "Liquid", "Milk"] },
        { ana: "SLEEP", turkce: "Uyumak", tabu: ["Bed", "Night", "Tired", "Rest", "Dream"] },
        { ana: "TABLE", turkce: "Masa", tabu:["Chair", "Eat", "Wood", "Furniture", "Desk"] },
        { ana: "DOOR", turkce: "Kapı", tabu: ["Open", "Close", "Room", "Wood", "Enter"] },
        { ana: "WINDOW", turkce: "Pencere", tabu:["Glass", "Look", "Outside", "Open", "Wall"] },
        { ana: "BREAD", turkce: "Ekmek", tabu: ["Eat", "Food", "Butter", "Bakery", "Slice"] },
        { ana: "CHEESE", turkce: "Peynir", tabu:["Milk", "Mouse", "Eat", "Yellow", "Food"] },
        { ana: "MILK", turkce: "Süt", tabu:["Cow", "Drink", "White", "Glass", "Water"] }
    ],
    "A2":[
        { ana: "ROUTINE", turkce: "Rutin", tabu:["Everyday", "Habit", "Same", "Morning", "Daily"] },
        { ana: "WAKE UP", turkce: "Uyanmak", tabu: ["Sleep", "Morning", "Bed", "Eye", "Alarm"] },
        { ana: "GET DRESSED", turkce: "Giyinmek", tabu:["Clothes", "Wear", "Morning", "Shirt", "Pants"] },
        { ana: "HAPPY", turkce: "Mutlu", tabu: ["Smile", "Glad", "Good", "Sad", "Laugh"] },
        { ana: "SAD", turkce: "Üzgün", tabu:["Cry", "Unhappy", "Bad", "Tears", "Happy"] },
        { ana: "ANGRY", turkce: "Kızgın", tabu:["Mad", "Red", "Shout", "Bad", "Calm"] },
        { ana: "AFRAID", turkce: "Korkmuş", tabu: ["Scared", "Fear", "Horror", "Dark", "Monster"] },
        { ana: "KIND", turkce: "Nazik", tabu:["Nice", "Good", "Help", "Polite", "Rude"] },
        { ana: "FRIENDLY", turkce: "Arkadaş Canlısı", tabu:["Friend", "Nice", "Smile", "Talk", "Good"] },
        { ana: "HONEST", turkce: "Dürüst", tabu:["Truth", "Lie", "Good", "Tell", "Person"] },
        { ana: "HOSPITAL", turkce: "Hastane", tabu:["Doctor", "Nurse", "Sick", "Medicine", "Bed"] },
        { ana: "UNIVERSITY", turkce: "Üniversite", tabu: ["School", "Student", "Study", "Professor", "Degree"] },
        { ana: "BANK", turkce: "Banka", tabu:["Money", "Save", "Pay", "Cash", "Account"] },
        { ana: "RESTAURANT", turkce: "Restoran", tabu: ["Eat", "Food", "Menu", "Waiter", "Table"] },
        { ana: "AIRPORT", turkce: "Havaalanı", tabu:["Plane", "Fly", "Travel", "Ticket", "Wait"] }
    ],
    "B1":[
        { ana: "JOB", turkce: "İş", tabu:["Work", "Money", "Career", "Office", "Do"] },
        { ana: "COMPANY", turkce: "Şirket", tabu: ["Business", "Work", "Office", "Boss", "Firm"] },
        { ana: "EMPLOYEE", turkce: "Çalışan", tabu:["Work", "Job", "Boss", "Company", "Staff"] },
        { ana: "MANAGER", turkce: "Yönetici", tabu: ["Boss", "Lead", "Team", "Office", "Director"] },
        { ana: "SALARY", turkce: "Maaş", tabu:["Money", "Pay", "Month", "Work", "Earn"] },
        { ana: "EDUCATION", turkce: "Eğitim", tabu: ["School", "Learn", "Teach", "University", "Student"] },
        { ana: "LECTURE", turkce: "Konferans", tabu:["Listen", "Speak", "University", "Professor", "Note"] },
        { ana: "RESEARCH", turkce: "Araştırma", tabu: ["Find", "Study", "Science", "Information", "Internet"] },
        { ana: "EXAM", turkce: "Sınav", tabu:["Test", "School", "Pass", "Fail", "Paper"] },
        { ana: "DISEASE", turkce: "Hastalık", tabu: ["Sick", "Illness", "Doctor", "Health", "Hospital"] },
        { ana: "MEDICINE", turkce: "İlaç", tabu:["Pill", "Doctor", "Sick", "Pharmacy", "Water"] },
        { ana: "TECHNOLOGY", turkce: "Teknoloji", tabu:["Computer", "Internet", "Future", "Smart", "Device"] },
        { ana: "SOFTWARE", turkce: "Yazılım", tabu:["Computer", "Program", "Code", "App", "Hardware"] }
    ],
    "B2": [
        { ana: "ANALYSIS", turkce: "Analiz", tabu:["Data", "Study", "Research", "Look", "Result"] },
        { ana: "CONCEPT", turkce: "Kavram", tabu: ["Idea", "Thought", "Mind", "Theory", "Abstract"] },
        { ana: "THEORY", turkce: "Teori", tabu:["Idea", "Science", "Prove", "Fact", "Hypothesis"] },
        { ana: "METHOD", turkce: "Yöntem", tabu:["Way", "How", "Process", "System", "Technique"] },
        { ana: "STRUCTURE", turkce: "Yapı", tabu:["Build", "Form", "Organize", "Base", "Design"] },
        { ana: "ECONOMY", turkce: "Ekonomi", tabu:["Money", "Country", "Finance", "Market", "Bank"] },
        { ana: "BUDGET", turkce: "Bütçe", tabu: ["Money", "Plan", "Spend", "Cost", "Finance"] },
        { ana: "INVESTMENT", turkce: "Yatırım", tabu:["Money", "Future", "Buy", "Return", "Bank"] },
        { ana: "GOVERNMENT", turkce: "Hükümet", tabu: ["Country", "Rule", "Law", "Politics", "President"] },
        { ana: "DEMOCRACY", turkce: "Demokrasi", tabu:["Vote", "People", "Freedom", "Government", "Election"] }
    ],
    "C1":[
        { ana: "HYPOTHESIS", turkce: "Hipotez", tabu:["Theory", "Guess", "Science", "Test", "Idea"] },
        { ana: "METHODOLOGY", turkce: "Metodoloji", tabu: ["Method", "Research", "System", "Way", "Study"] },
        { ana: "FRAMEWORK", turkce: "Çerçeve", tabu:["Structure", "Base", "Plan", "Support", "System"] },
        { ana: "PARADIGM", turkce: "Paradigma", tabu:["Model", "Pattern", "Example", "Shift", "View"] },
        { ana: "EMPIRICAL", turkce: "Deneysel", tabu: ["Data", "Observe", "Science", "Prove", "Experience"] },
        { ana: "IMPLEMENT", turkce: "Uygulamak", tabu:["Do", "Start", "Action", "Put", "System"] },
        { ana: "EVALUATE", turkce: "Değerlendirmek", tabu: ["Judge", "Test", "Assess", "Value", "Check"] },
        { ana: "ESTABLISH", turkce: "Kurmak", tabu:["Set up", "Start", "Create", "Found", "Build"] }
    ],
    "C2":[
        { ana: "UBIQUITOUS", turkce: "Her Yerde", tabu:["Everywhere", "Common", "All", "Place", "Present"] },
        { ana: "METICULOUS", turkce: "Çok Titiz", tabu:["Careful", "Detail", "Perfect", "Exact", "Thorough"] },
        { ana: "PRAGMATIC", turkce: "Pragmatik", tabu: ["Practical", "Real", "Logic", "Useful", "Sensible"] },
        { ana: "AMBIGUOUS", turkce: "Belirsiz", tabu:["Unclear", "Vague", "Meaning", "Confuse", "Doubt"] },
        { ana: "COHERENT", turkce: "Tutarlı", tabu:["Logical", "Clear", "Together", "Make sense", "Consistent"] },
        { ana: "INEVITABLE", turkce: "Kaçınılmaz", tabu: ["Sure", "Certain", "Avoid", "Happen", "Fate"] }
    ]
};

const AI_MUFREDAT = {
    "A1": { "Grammar":["Pronouns", "To Be", "There is are", "Have got", "Syntax", "Would like", "Present Simple", "Prepositions", "Articles", "Irregular Verbs"], "Vocabulary":["Family", "Daily Verbs", "House Items", "Food"], "Skills":["Kendini Tanitma", "Telaffuz"] },
    "A2": { "Grammar":["Past Simple", "Past Continuous", "Future Structures", "Comparative Superlative", "Quantifiers", "Basic Phrasal Verbs"], "Vocabulary": ["Travel", "Weather", "Health", "Shopping"], "Skills":["Gecmis Deneyim Anlatma", "Yol Tarifi Sorma"] },
    "B1": { "Grammar":["Present Perfect", "Conditionals", "Relative Clauses", "Passive Voice", "Modal Verbs", "Gerund Infinitive"], "Vocabulary": ["Business", "Academic Words", "Environment", "Technology"], "Skills":["Essay Yazma", "Sunum Yapma"] },
    "B2": { "Grammar":["Perfect Continuous Tenses", "Reported Speech", "Advanced Passive", "Noun Clauses"], "Vocabulary":["AWL List", "Economy", "Politics"], "Skills": ["Research Paper Reading", "Defense Industry English"] },
    "C1": { "Grammar": ["Inversion", "Ellipsis", "Subjunctive Mood", "Nominalisation"], "Akademik": ["Argumentative Essay", "Analytical Essay", "Literature Review"], "Native Level":["Advanced Idioms", "Advanced Phrasal Verbs"] },
    "C2": { "Mastery":["Nuances of Meaning", "Complex Collocations", "Cultural References"], "Professional": ["Executive Presentations", "Scientific Publications"] }
};

const AI_ICERIK = {
    "default": "Ben buradayım! Bu konuyu senin için analiz ediyorum. Lütfen ders notlarına da göz at."
};

const DERS_NOTLARI = {
    "Kendini Tanitma": `<h4>Kendini Tanıtma</h4><p>İngilizce’de adını, yaşını, yaşadığın yeri ve ilgi alanlarını kısa cümlelerle anlatmayı öğrenirsin.</p><ul><li><strong>My name is ...</strong> → Benim adım ...</li><li><strong>I am ... years old.</strong> → ... yaşındayım.</li><li><strong>I live in ...</strong> → ...'da yaşıyorum.</li></ul>`,
    "Telaffuz": `<h4>Telaffuz (Pronunciation)</h4><p>İngilizce kelimeleri doğru seslendirme pratiğidir. Sesli harfler, vurgu ve hece yapısı önemlidir.</p><ul><li>Kelimeleri yavaşça heceleyerek oku.</li><li>İlk hece vurgusunu fark etmeye çalış.</li><li>Kısa tekrarlarla dinle ve taklit et.</li></ul>`,
    "Pronouns": `<h4>Zamirler (Pronouns)</h4><p>İngilizce A1 konularının başında yer alır. Kişi zamirleri:</p><ul><li><strong>I</strong> (Ben), <strong>You</strong> (Sen/Siz), <strong>He</strong> (O - Erkek), <strong>She</strong> (O - Kadın), <strong>It</strong> (O - Cansız/Hayvan)</li><li><strong>We</strong> (Biz), <strong>They</strong> (Onlar)</li></ul><p>Nesne zamirleri: me, you, him, her, it, us, them.</p>`,
    "To Be": `<h4>“Be” Fiilinin Çekimleri (Am, Is, Are)</h4><p>Durum bildirmek için kullanılır.</p><ul><li>I ➔ <strong>am</strong> (I am a student)</li><li>He, She, It ➔ <strong>is</strong> (She is happy)</li><li>We, You, They ➔ <strong>are</strong> (They are ready)</li></ul>`,
    "There is are": `<h4>There is / There are</h4><p>Bir nesnenin varlığını ifade etmek için kullanılır.</p><ul><li><strong>There is:</strong> Tekil nesneler için. (There is a pen)</li><li><strong>There are:</strong> Çoğul nesneler için. (There are two apples)</li></ul>`,
    "Have got": `<h4>Sahiplik: Have got / Has got</h4><p>Sahip olunan bir şeyi ifade etmek için kullanılır.</p><ul><li>I, We, You, They ➔ <strong>have got</strong> (I have got a car)</li><li>He, She, It ➔ <strong>has got</strong> (He has got a dog)</li></ul>`,
    "Syntax": `<h4>Cümle Dizimi (Sentaks)</h4><p>Türkçeden farklı olarak İngilizcede cümle dizilimi şu şekildedir:</p><p><strong>Özne (Subject) + Yüklem (Verb) + Nesne (Object)</strong></p><p>Örnek: I (Özne) play (Yüklem) football (Nesne).</p>`,
    "Would like": `<h4>“Would like” Kalıbı</h4><p>İstek ve arzuları kibarca ifade etmek için kullanılır. Zamanlara göre çekimlenmez.</p><p>Örnek: <em>I would like to have a coffee.</em> (Bir kahve almak isterim.)</p>`,
    "Present Simple": `<h4>Geniş Zaman (Present Simple)</h4><p>Düzenli yapılan işleri, alışkanlıkları anlatır.</p><ul><li>I/You/We/They: Fiil yalın. (I play)</li><li>He/She/It: Fiil -s takısı alır. (He plays)</li></ul><p>Zaman zarfları: always, usually, often, sometimes, never.</p>`,
    "Prepositions": `<h4>Edatlar (Prepositions: in, on, at)</h4><ul><li><strong>In:</strong> İçinde. Geniş yerler. (in the room, in London)</li><li><strong>On:</strong> Üstünde, yüzeyde. (on the table)</li><li><strong>At:</strong> Belirli, spesifik bir nokta. (at the door, at 5 o'clock)</li></ul>`,
    "Articles": `<h4>A, An, The (Articles)</h4><ul><li><strong>A/An:</strong> Herhangi bir tekil nesne. Sessiz harfle başlarsa 'a' (a car), sesli ile başlarsa 'an' (an apple).</li><li><strong>The:</strong> Bilinen, belirli bir nesne. (The car is red).</li></ul>`,
    "Irregular Verbs": `<h4>Düzensiz Fiiller (Irregular Verbs)</h4><p>Zamana göre çekimlenirken biçim değiştiren fiillerdir.</p><p>Örnek: Go ➔ Went, See ➔ Saw, Eat ➔ Ate, Buy ➔ Bought.</p>`,
    "Past Simple": `<h4>Past Simple (Geçmiş Zaman)</h4><p>Geçmişte bitmiş eylemler. Düzenli fiiller -ed alır (work ➔ worked). Düzensizler tamamen değişir (go ➔ went). Was/Were durum cümlelerinde kullanılır.</p>`,
    "Past Continuous": `<h4>Past Continuous</h4><p>Geçmişte devam eden eylem. Yapı: was / were + verb-ing. Örnek: She was reading a book when I called.</p>`,
    "Future Structures": `<h4>Future Structures</h4><p><strong>Will:</strong> Ani kararlar ve tahminler (I will help you).</p><p><strong>Going To:</strong> Önceden planlanmış eylemler (I am going to travel to Paris).</p>`,
    "Comparative Superlative": `<h4>Karşılaştırma (Comparatives / Superlatives)</h4><p><strong>Comparative:</strong> İki şeyi karşılaştırır. (Taller, More beautiful).</p><p><strong>Superlative:</strong> En üstünlük. (The tallest, The most beautiful).</p>`,
    "Quantifiers": `<h4>Quantifiers (Miktar Belirleyiciler)</h4><p>Some (biraz), Any (hiç), Much (sayılamayan çok), Many (sayılabilen çok), A lot of (çok).</p>`,
    "Basic Phrasal Verbs": `<h4>Basic Phrasal Verbs</h4><p>Fiil + edat birleşimiyle yeni anlam kazanan kelimeler. Örnek: wake up (uyanmak), get up (kalkmak), turn on (açmak).</p>`,
    "Present Perfect": `<h4>Present Perfect</h4><p>Geçmişte olmuş ama etkisi devam eden olaylar. Yapı: have / has + past participle (V3). Örnek: I have finished my homework.</p>`,
    "Conditionals": `<h4>Conditionals (If Clauses)</h4><ul><li>Zero: Genel gerçekler (If you heat ice, it melts).</li><li>First: Gelecek ihtimal (If it rains, we will cancel).</li><li>Second: Hayali durum (If I were rich, I would buy a yacht).</li><li>Third: Geçmiş pişmanlık (If I had studied, I would have passed).</li></ul>`,
    "Passive Voice": `<h4>Passive Voice (Edilgen Yapı)</h4><p>Eylemi yapan değil, eylemden etkilenen önemlidir. Active: The engineer designed the system. Passive: The system was designed by the engineer.</p>`,
    "Relative Clauses": `<h4>Relative Clauses</h4><p>İsimleri niteleyen cümlecikler. (who, which, that, whose, where). Örnek: The student who won the prize is my friend.</p>`,
    "Modal Verbs": `<h4>Modal Verbs</h4><p>Yetenek (can/could), zorunluluk (must/have to) ve ihtimal (may/might/should) bildirir.</p>`,
    "Gerund Infinitive": `<h4>Gerund & Infinitive</h4><p>Gerund: fiil+ing (I enjoy reading). Infinitive: to+fiil (I want to read).</p>`,
    "Reported Speech": `<h4>Reported Speech (Dolaylı Anlatım)</h4><p>Başkasının söylediği cümleyi aktarmak. Direct: She said: "I am tired." Reported: She said that she was tired.</p>`,
    "Inversion": `<h4>Inversion (Devrik Yapı)</h4><p>Vurguyu artırmak için yardımcı fiilin başa gelmesi. Normal: I have never seen such beauty. Inversion: Never have I seen such beauty.</p>`,
    "Defense Industry English": `<h4>Defense Industry English</h4><p>Savunma sanayii ve bilişim projelerinde kullanılan teknik terimler:</p><ul><li><strong>UAV (Unmanned Aerial Vehicle):</strong> İnsansız Hava Aracı.</li><li><strong>Payload:</strong> Faydalı yük (Kamera, radar).</li><li><strong>Telemetry:</strong> Veri aktarımı.</li><li><strong>Autonomous:</strong> Otonom, bağımsız sistem.</li><li><strong>Target Tracking:</strong> Hedef takibi (Görüntü işleme).</li></ul>`
};

const SINAV_HARITALARI = {
    "ALES": {
        root: "ALES Yol Haritası",
        children:[
            {
                name: "Matematik (Sayısal)",
                children:[
                    { name: "Problemler", note: "ALES matematiğinin en büyük kısmı buradan gelir.", video: "https://www.youtube.com/results?search_query=ALES+Problemler" },
                    { name: "Sayısal Mantık", note: "Tablo ve şekil yorumlama becerini test eder.", video: "https://www.youtube.com/results?search_query=ALES+Sayısal+Mantık" },
                    { name: "Grafik ve Tablo", note: "Veri analizi ve karşılaştırma soruları.", video: "https://www.youtube.com/results?search_query=ALES+Grafik+Tablo" },
                    { name: "Temel Matematik", note: "Bölme, asal sayılar, EBOB-EKOK gibi temel konular.", video: "https://www.youtube.com/results?search_query=ALES+Temel+Matematik" },
                    { name: "Cebir", note: "Denklem kurma, eşitsizlikler ve mutlak değer.", video: "https://www.youtube.com/results?search_query=ALES+Cebir" },
                    { name: "Fonksiyon Mantığı", note: "Fonksiyon kavramı ve grafik yorumlama.", video: "https://www.youtube.com/results?search_query=ALES+Fonksiyon" },
                    { name: "Sayısal Akıl Yürütme", note: "Şekil ve sayı örüntülerini çözme.", video: "https://www.youtube.com/results?search_query=ALES+Sayısal+Akıl+Yürütme" }
                ]
            },
            {
                name: "Türkçe (Sözel)",
                children:[
                    { name: "Paragraf", note: "ALES Türkçenin %70'i paragraf sorularıdır.", video: "https://www.youtube.com/results?search_query=ALES+Paragraf" },
                    { name: "Cümlede Anlam", note: "Cümlede çıkarım ve ana düşünce.", video: "https://www.youtube.com/results?search_query=ALES+Cümlede+Anlam" },
                    { name: "Sözcükte Anlam", note: "Eş/Zıt anlam, mecaz ve terim kullanımları.", video: "https://www.youtube.com/results?search_query=ALES+Sözcükte+Anlam" },
                    { name: "Mantık Soruları", note: "Grup oluşturma ve tablo mantığı soruları.", video: "https://www.youtube.com/results?search_query=ALES+Sözel+Mantık" },
                    { name: "Metin Analizi", note: "Akademik ve bilimsel metin yorumlama.", video: "https://www.youtube.com/results?search_query=ALES+Metin+Analizi" }
                ]
            }
        ]
    },
    "YKS": {
        root: "YKS Yol Haritası",
        children:[
            {
                name: "TYT Matematik",
                children:[
                    { name: "Temel Kavramlar", note: "Matematiğin temeli, işlem önceliği ve sayı kümeleri.", video: "https://www.youtube.com/results?search_query=TYT+Temel+Kavramlar" },
                    { name: "Problemler", note: "Sınavın en belirleyici, en çok soru çıkan kısmı.", video: "https://www.youtube.com/results?search_query=TYT+Problemler" },
                    { name: "Fonksiyonlar", note: "AYT'nin de temelini oluşturan kritik konu.", video: "https://www.youtube.com/results?search_query=TYT+Fonksiyonlar" },
                    { name: "Geometri", note: "Üçgenler başta olmak üzere temel şekil bilgisi.", video: "https://www.youtube.com/results?search_query=TYT+Geometri" },
                    { name: "Oran-Orantı", note: "Problemleri hızlı çözmek için çok önemlidir.", video: "https://www.youtube.com/results?search_query=TYT+Oran+Orantı" },
                    { name: "Veri Yorumlama", note: "İstatistik, mod, medyan ve grafik okuma.", video: "https://www.youtube.com/results?search_query=TYT+Veri+Yorumlama" }
                ]
            },
            {
                name: "TYT Türkçe",
                children:[
                    { name: "Paragraf", note: "Hızlı okuma ve okuduğunu anlama pratiği gerektirir.", video: "https://www.youtube.com/results?search_query=TYT+Paragraf" },
                    { name: "Sözcük Anlamı", note: "Kelimelerin cümleye kattığı anlamlar.", video: "https://www.youtube.com/results?search_query=TYT+Sözcük+Anlamı" },
                    { name: "Cümle Anlamı", note: "Cümleler arası ilişki ve yargı bildiren cümleler.", video: "https://www.youtube.com/results?search_query=TYT+Cümle+Anlamı" },
                    { name: "Dil Bilgisi", note: "Ses bilgisi, sözcük türleri ve cümlenin öğeleri.", video: "https://www.youtube.com/results?search_query=TYT+Dil+Bilgisi" },
                    { name: "Yazım Kuralları", note: "Noktalama işaretleri ve doğru yazım kuralları.", video: "https://www.youtube.com/results?search_query=TYT+Yazım+Kuralları" }
                ]
            },
            {
                name: "AYT Matematik",
                children:[
                    { name: "Fonksiyonlar", note: "İleri düzey fonksiyon grafikleri ve uygulamaları.", video: "https://www.youtube.com/results?search_query=AYT+Fonksiyonlar" },
                    { name: "Polinomlar", note: "Bölme kuralı ve derece bulma işlemleri.", video: "https://www.youtube.com/results?search_query=AYT+Polinomlar" },
                    { name: "Türev-İntegral", note: "Limit ile başlayıp alan hesaplamaya uzanan en zorlu kısım.", video: "https://www.youtube.com/results?search_query=AYT+Türev+İntegral" },
                    { name: "Olasılık", note: "Permütasyon, kombinasyon, olasılık ve binom.", video: "https://www.youtube.com/results?search_query=AYT+Olasılık" },
                    { name: "Analitik Geometri", note: "Noktanın ve doğrunun analitik incelenmesi.", video: "https://www.youtube.com/results?search_query=AYT+Analitik+Geometri" }
                ]
            },
            {
                name: "AYT Edebiyat",
                children:[
                    { name: "Cumhuriyet Dönemi", note: "Yazar-eser eşleştirmeleri ve akımlar.", video: "https://www.youtube.com/results?search_query=AYT+Cumhuriyet+Dönemi+Edebiyatı" },
                    { name: "Tanzimat Edebiyatı", note: "1. ve 2. dönem farklılıkları, ilk edebi eserler.", video: "https://www.youtube.com/results?search_query=AYT+Tanzimat+Edebiyatı" },
                    { name: "Servet-i Fünun", note: "Ağır dil, salon edebiyatı ve önemli temsilciler.", video: "https://www.youtube.com/results?search_query=AYT+Servet-i+Fünun" },
                    { name: "Milli Edebiyat", note: "Sade dil ve memleket edebiyatı akımı.", video: "https://www.youtube.com/results?search_query=AYT+Milli+Edebiyat" },
                    { name: "Şiir ve Roman Analizi", note: "Aruz/hece ölçüsü, kafiye, edebi sanatlar.", video: "https://www.youtube.com/results?search_query=AYT+Şiir+Roman+Analizi" }
                ]
            },
            {
                name: "AYT Fen Bilimleri",
                children:[
                    { name: "Fizik", note: "Mekanik, elektrik ve modern fizik kuralları.", video: "https://www.youtube.com/results?search_query=AYT+Fizik" },
                    { name: "Kimya", note: "Organik kimya, hız ve denge hesaplamaları.", video: "https://www.youtube.com/results?search_query=AYT+Kimya" },
                    { name: "Biyoloji", note: "Sistemler, hücresel solunum ve bitki biyolojisi.", video: "https://www.youtube.com/results?search_query=AYT+Biyoloji" },
                    { name: "Geometri", note: "Çemberde alan, katı cisimler ve hacim hesapları.", video: "https://www.youtube.com/results?search_query=AYT+Geometri+Alan+Hacim" }
                ]
            }
        ]
    },
    "KPSS": {
        root: "KPSS Yol Haritası",
        children:[
            {
                name: "Genel Yetenek",
                children:[
                    { name: "Matematik", note: "Problemler ve işlem yeteneği ağırlıklı.", video: "https://www.youtube.com/results?search_query=KPSS+Matematik" },
                    { name: "Türkçe", note: "Sözel mantık ve paragraf anlama becerisi.", video: "https://www.youtube.com/results?search_query=KPSS+Türkçe" }
                ]
            },
            {
                name: "Genel Kültür",
                children:[
                    { name: "Tarih", note: "Osmanlı ve Cumhuriyet dönemi olayları.", video: "https://www.youtube.com/results?search_query=KPSS+Tarih" },
                    { name: "Coğrafya", note: "Türkiye'nin fiziki, beşeri ve ekonomik özellikleri.", video: "https://www.youtube.com/results?search_query=KPSS+Coğrafya" },
                    { name: "Vatandaşlık", note: "Anayasa, temel hukuk ve idare hukuku.", video: "https://www.youtube.com/results?search_query=KPSS+Vatandaşlık" },
                    { name: "Güncel Bilgiler", note: "Yakın zamandaki ulusal ve küresel olaylar.", video: "https://www.youtube.com/results?search_query=KPSS+Güncel+Bilgiler" }
                ]
            }
        ]
    },
    "LGS": {
        root: "LGS Yol Haritası",
        children:[
            {
                name: "Matematik",
                children:[
                    { name: "Temel İşlemler", note: "Çarpanlar, katlar, üslü ve köklü ifadeler.", video: "https://www.youtube.com/results?search_query=LGS+Matematik+Temel+İşlemler" },
                    { name: "Kesir Problemleri", note: "Kesirlerle işlem gerektiren yeni nesil sorular.", video: "https://www.youtube.com/results?search_query=LGS+Kesir+Problemleri" },
                    { name: "Oran-Orantı", note: "Doğru ve ters orantıyı anlama pratiği.", video: "https://www.youtube.com/results?search_query=LGS+Oran+Orantı" },
                    { name: "Geometri", note: "Üçgenler, eşlik, benzerlik ve dönüşüm geometrisi.", video: "https://www.youtube.com/results?search_query=LGS+Geometri" },
                    { name: "Veri Yorumlama", note: "Sütun ve daire grafiklerini okuyabilme.", video: "https://www.youtube.com/results?search_query=LGS+Veri+Yorumlama" },
                    { name: "Mantık Soruları", note: "Uzun metinli, kural çıkarımı istenen sorular.", video: "https://www.youtube.com/results?search_query=LGS+Mantık+Soruları" }
                ]
            },
            {
                name: "Türkçe",
                children:[
                    { name: "Paragraf", note: "Uzun metinleri hızlı okuma ve ana fikri kavrama.", video: "https://www.youtube.com/results?search_query=LGS+Türkçe+Paragraf" },
                    { name: "Sözcükte Anlam", note: "Kelimelerin bağlama göre değişen anlamları.", video: "https://www.youtube.com/results?search_query=LGS+Sözcükte+Anlam" },
                    { name: "Cümlede Anlam", note: "Neden-sonuç, amaç-sonuç, koşul-sonuç ilişkileri.", video: "https://www.youtube.com/results?search_query=LGS+Cümlede+Anlam" },
                    { name: "Dil Bilgisi", note: "Fiilimsiler, cümlenin öğeleri ve çatıları.", video: "https://www.youtube.com/results?search_query=LGS+Dil+Bilgisi" },
                    { name: "Yazım Kuralları", note: "Büyük harflerin kullanımı ve noktalama işaretleri.", video: "https://www.youtube.com/results?search_query=LGS+Yazım+Kuralları" }
                ]
            },
            {
                name: "Fen Bilimleri",
                children:[
                    { name: "Fizik", note: "Basit makineler, basınç ve enerji dönüşümleri.", video: "https://www.youtube.com/results?search_query=LGS+Fen+Fizik" },
                    { name: "Kimya", note: "Maddenin yapısı, periyodik sistem ve asit/bazlar.", video: "https://www.youtube.com/results?search_query=LGS+Fen+Kimya" },
                    { name: "Biyoloji", note: "DNA, genetik kod ve mutasyon kavramları.", video: "https://www.youtube.com/results?search_query=LGS+Fen+Biyoloji" },
                    { name: "Çevre Bilimleri", note: "Madde döngüleri ve sürdürülebilir kalkınma.", video: "https://www.youtube.com/results?search_query=LGS+Çevre+Bilimleri" }
                ]
            },
            {
                name: "İnkılap Tarihi",
                children:[
                    { name: "Kurtuluş Savaşı", note: "Cemiyetler, cepheler ve savaşın genel akışı.", video: "https://www.youtube.com/results?search_query=LGS+İnkılap+Kurtuluş+Savaşı" },
                    { name: "Cumhuriyet Dönemi", note: "Siyasi, hukuki ve toplumsal alandaki inkılaplar.", video: "https://www.youtube.com/results?search_query=LGS+İnkılap+Cumhuriyet+Dönemi" },
                    { name: "Atatürk İlkeleri", note: "Cumhuriyetçilik, milliyetçilik, laiklik vs.", video: "https://www.youtube.com/results?search_query=LGS+Atatürk+İlkeleri" }
                ]
            }
        ]
    },
    "MSÜ": {
        root: "MSÜ (Milli Savunma Üniv.) Yol Haritası",
        children:[
            {
                name: "Matematik",
                children:[
                    { name: "Temel Kavramlar", note: "Sınavın girişi, sayı kümeleri ve işlem yeteneği.", video: "https://www.youtube.com/results?search_query=MSÜ+Matematik+Temel+Kavramlar" },
                    { name: "Problemler", note: "TYT'ye kıyasla daha net ama daha hızlı çözülmesi gereken problemler.", video: "https://www.youtube.com/results?search_query=MSÜ+Problemler" },
                    { name: "Geometri", note: "Üçgen, çokgen ve katı cisimlerdeki kurallar.", video: "https://www.youtube.com/results?search_query=MSÜ+Geometri" }
                ]
            },
            {
                name: "Türkçe",
                children:[
                    { name: "Paragraf", note: "MSÜ'nün zaman kaybettiren ana bölümlerinden biri.", video: "https://www.youtube.com/results?search_query=MSÜ+Türkçe+Paragraf" },
                    { name: "Dil Bilgisi", note: "Sözcük türleri, ses olayları, yazım ve noktalama.", video: "https://www.youtube.com/results?search_query=MSÜ+Dil+Bilgisi" }
                ]
            },
            {
                name: "Sosyal Bilimler",
                children:[
                    { name: "Tarih", note: "Askeri tarih, harita okuma ve Osmanlı/İnkılap dönemi.", video: "https://www.youtube.com/results?search_query=MSÜ+Tarih" },
                    { name: "Coğrafya", note: "Türkiye fiziki haritası, iklimler ve nüfus özellikleri.", video: "https://www.youtube.com/results?search_query=MSÜ+Coğrafya" },
                    { name: "Felsefe ve Din", note: "Kavram bilgisi ve paragraftan çıkarım yapma.", video: "https://www.youtube.com/results?search_query=MSÜ+Felsefe+Din" }
                ]
            },
            {
                name: "Fen Bilimleri",
                children:[
                    { name: "Fizik", note: "Mekanik, optik, elektrik (Genelde bilgi ve yorum ağırlıklı).", video: "https://www.youtube.com/results?search_query=MSÜ+Fizik" },
                    { name: "Kimya", note: "Madde, periyodik tablo, asit ve bazlar.", video: "https://www.youtube.com/results?search_query=MSÜ+Kimya" },
                    { name: "Biyoloji", note: "Canlıların ortak özellikleri, hücre bölünmeleri, kalıtım.", video: "https://www.youtube.com/results?search_query=MSÜ+Biyoloji" }
                ]
            }
        ]
    },
    "DGS": {
        root: "DGS (Dikey Geçiş) Yol Haritası",
        children:[
            {
                name: "Sayısal (Matematik)",
                children:[
                    { name: "Temel Matematik", note: "Rasyonel sayılar, üslü/köklü sayılar ve çarpanlara ayırma.", video: "https://www.youtube.com/results?search_query=DGS+Temel+Matematik" },
                    { name: "Cebir", note: "Denklem çözme, mutlak değer, eşitsizlikler.", video: "https://www.youtube.com/results?search_query=DGS+Cebir" },
                    { name: "Problemler", note: "Sayı-kesir, yaş, hız, işçi-havuz ve yüzde problemleri.", video: "https://www.youtube.com/results?search_query=DGS+Problemler" },
                    { name: "Sayısal Mantık", note: "DGS'nin en ayırt edici bölümüdür; özel kurallı sorular içerir.", video: "https://www.youtube.com/results?search_query=DGS+Sayısal+Mantık" },
                    { name: "Geometri", note: "Üçgenler, dörtgenler, çember ve analitik geometri.", video: "https://www.youtube.com/results?search_query=DGS+Geometri" }
                ]
            },
            {
                name: "Sözel (Türkçe)",
                children:[
                    { name: "Sözcük ve Cümle", note: "Sözcükte anlam ve boşluk tamamlama soruları.", video: "https://www.youtube.com/results?search_query=DGS+Sözcükte+ve+Cümlede+Anlam" },
                    { name: "Paragraf", note: "Paragrafın yapısı, ana düşünce ve yardımcı düşünceler.", video: "https://www.youtube.com/results?search_query=DGS+Paragraf" },
                    { name: "Yer Değiştirme / Akış Bozma", note: "Paragraf düzeni oluşturma taktikleri.", video: "https://www.youtube.com/results?search_query=DGS+Paragraf+Akışı+Bozan+Cümle" },
                    { name: "Sözel Mantık", note: "Kişi, yer, zaman tabloları oluşturma ve analiz etme.", video: "https://www.youtube.com/results?search_query=DGS+Sözel+Mantık" }
                ]
            }
        ]
    },
    "YDS": {
        root: "YDS / YÖKDİL Yol Haritası",
        children:[
            {
                name: "Kelime (Vocabulary)",
                children:[
                    { name: "Fiiller (Verbs)", note: "Akademik fiilleri eş anlamlılarıyla (synonyms) öğrenme.", video: "https://www.youtube.com/results?search_query=YDS+Kelime+Verbs" },
                    { name: "Phrasal Verbs", note: "En sık çıkan öbek fiillerin ezberlenmesi ve bağlam içinde tespiti.", video: "https://www.youtube.com/results?search_query=YDS+Phrasal+Verbs" },
                    { name: "Sıfat ve Zarflar", note: "Metinlerdeki vurguyu anlama açısından kritiktir.", video: "https://www.youtube.com/results?search_query=YDS+Sıfat+Zarf" }
                ]
            },
            {
                name: "Dil Bilgisi (Grammar)",
                children:[
                    { name: "Zamanlar (Tenses)", note: "Aktif/Pasif zaman uyumu ve ipucu kelimeleri.", video: "https://www.youtube.com/results?search_query=YDS+Tenses" },
                    { name: "Bağlaçlar (Conjunctions)", note: "YDS'nin kalbidir! Neden-sonuç, zıtlık, koşul bağlaçları.", video: "https://www.youtube.com/results?search_query=YDS+Bağlaçlar" },
                    { name: "Relative / Noun Clauses", note: "Uzun cümleleri bölüp anlamak için gereklidir.", video: "https://www.youtube.com/results?search_query=YDS+Relative+Clauses" },
                    { name: "Gerund & Infinitive", note: "Fiillerden sonra hangi yapının geleceğini bilme.", video: "https://www.youtube.com/results?search_query=YDS+Gerund+Infinitive" }
                ]
            },
            {
                name: "Okuma ve Çeviri",
                children:[
                    { name: "Cloze Test", note: "Bir paragraf içinde hem gramer hem kelime soran yapılar.", video: "https://www.youtube.com/results?search_query=YDS+Cloze+Test" },
                    { name: "Cümle Tamamlama", note: "Bağlaçlarla birbirine bağlanan yarım cümleleri bulma.", video: "https://www.youtube.com/results?search_query=YDS+Cümle+Tamamlama" },
                    { name: "Çeviri Soruları", note: "Özne ve Yüklem eşleştirmesi ile saniyeler içinde çözülebilir.", video: "https://www.youtube.com/results?search_query=YDS+Çeviri+Taktikleri" },
                    { name: "Paragraf Okuma (Reading)", note: "Ana fikir, detay ve yazarın tutumu (attitude) soruları.", video: "https://www.youtube.com/results?search_query=YDS+Paragraf+Reading" }
                ]
            }
        ]
    },
    "TOEFL": {
        root: "TOEFL Yol Haritası",
        children:[
            {
                name: "Reading",
                children:[
                    { name: "Paragraf anlama", note: "Akademik metnin genel hatlarını kavrama.", video: "https://www.youtube.com/results?search_query=TOEFL+Reading+Paragraph+Understanding" },
                    { name: "Ana fikir", note: "Yazarın asıl anlatmak istediği mesaj.", video: "https://www.youtube.com/results?search_query=TOEFL+Reading+Main+Idea" },
                    { name: "Detay soruları", note: "Metnin içerisindeki spesifik verileri bulma.", video: "https://www.youtube.com/results?search_query=TOEFL+Reading+Detail+Questions" },
                    { name: "Çıkarım soruları", note: "Paragrafta doğrudan yazmayan sonucu üretme.", video: "https://www.youtube.com/results?search_query=TOEFL+Reading+Inference+Questions" }
                ]
            },
            {
                name: "Listening",
                children:[
                    { name: "Konuşma ve ders dinleme", note: "Note-taking (not alma) tekniklerini kullan.", video: "https://www.youtube.com/results?search_query=TOEFL+Listening+Conversations+Lectures" },
                    { name: "Detay soruları", note: "Dinlenen metindeki tarih, mekan ve isimleri kaçırma.", video: "https://www.youtube.com/results?search_query=TOEFL+Listening+Detail+Questions" },
                    { name: "Ana fikir soruları", note: "Dersin veya konuşmanın genel temasını yakala.", video: "https://www.youtube.com/results?search_query=TOEFL+Listening+Main+Idea" }
                ]
            },
            {
                name: "Speaking",
                children:[
                    { name: "Konuşma becerisi", note: "Zaman yönetimi ve akıcı telaffuz (fluency).", video: "https://www.youtube.com/results?search_query=TOEFL+Speaking+Skills" },
                    { name: "Kısa sunum", note: "Belirli bir konu hakkında hazırlıksız konuşma pratiği.", video: "https://www.youtube.com/results?search_query=TOEFL+Speaking+Short+Presentation" },
                    { name: "Soru-cevap", note: "Okuma ve dinleme sonrası tepki verme (Integrated).", video: "https://www.youtube.com/results?search_query=TOEFL+Speaking+Q&A" }
                ]
            },
            {
                name: "Writing",
                children:[
                    { name: "Essay yazma", note: "Gramer hatalarından uzak, açık bir yapı oluşturma.", video: "https://www.youtube.com/results?search_query=TOEFL+Writing+Essay" },
                    { name: "Opinion Task", note: "Verilen konuya kendi düşünceni savunarak yazma.", video: "https://www.youtube.com/results?search_query=TOEFL+Writing+Opinion+Task" },
                    { name: "Integrated Task", note: "Hem okuyup hem dinleyip sentezleyerek metin çıkarma.", video: "https://www.youtube.com/results?search_query=TOEFL+Writing+Integrated+Task" }
                ]
            }
        ]
    }
};

const SORU_HAVUZU = {
    tyt: {
        "2025": [
            { konu: "Türkçe - Paragraf", soru: "Bir paragrafta ana düşünceyi en doğru biçimde ne tanımlar?", secenekler: ["Metindeki örnek cümle", "Yazarın kişisel notu", "Metnin tamamını özetleyen temel mesaj", "En uzun cümle"], dogruIndex: 2, aciklama: "Ana düşünce, paragrafın vermek istediği temel mesajdır." },
            { konu: "Matematik - Problemler", soru: "Bir alışverişte ürün önce %20 indirim, sonra indirimli fiyat üzerinden %10 ek indirim alıyorsa toplam indirim yaklaşık kaç olur?", secenekler: ["%28", "%30", "%32", "%35"], dogruIndex: 0, aciklama: "Ardışık indirimlerde toplam etki çarpanlarla hesaplanır; burada sonuç %28 olur." }
        ],
        "2024": [
            { konu: "Türkçe - Cümlede Anlam", soru: "Aşağıdakilerden hangisi çıkarım sorularında en çok aranır?", secenekler: ["Doğrudan yazılmış bilgi", "Metinden çıkarılabilen sonuç", "Sadece isimler", "Kafiye yapısı"], dogruIndex: 1, aciklama: "Çıkarım sorularında metnin örtük anlamı aranır." },
            { konu: "Fen - Fizik", soru: "Hareket eden bir cismin hızı sabit kalıyorsa aşağıdakilerden hangisi doğrudur?", secenekler: ["İvmesi sıfırdır", "Konumu değişmez", "Yalnızca yönü değişir", "Kütlesi artar"], dogruIndex: 0, aciklama: "Hız sabitse ivme sıfıra yakındır." }
        ]
    },
    ayt: {
        "2025": [
            { konu: "Matematik - Fonksiyon", soru: "Bir fonksiyonun grafiğinde x eksenini kestiği noktalar neyi gösterir?", secenekler: ["Fonksiyonun tanım kümesini", "Fonksiyonun köklerini", "Türevi", "Sürekliliği"], dogruIndex: 1, aciklama: "X ekseni kesişimleri fonksiyonun kökleridir." },
            { konu: "Edebiyat - Cumhuriyet", soru: "Bir yazarın dönemini tanımada en güvenilir ipucu genellikle nedir?", secenekler: ["Eserin kapağı", "Dil, tema ve sanat anlayışı", "Sayfa sayısı", "Kağıt türü"], dogruIndex: 1, aciklama: "Edebi dönemler dil, tema ve anlayışla ayırt edilir." }
        ],
        "2024": [
            { konu: "Matematik - Trigonometri", soru: "Sinüs ve kosinüs ilişkilerinde temel özdeşlik hangisidir?", secenekler: ["sin x + cos x = 1", "sin²x + cos²x = 1", "tan x = 1 / sin x", "cot x = sin x"], dogruIndex: 1, aciklama: "Temel trigonometrik özdeşlik sin²x + cos²x = 1'dir." },
            { konu: "Biyoloji - Hücre", soru: "Protein sentezinde görevli yapılar hangileridir?", secenekler: ["Ribozom ve mRNA", "Lizozom ve sentrozom", "Koful ve çekirdek zarı", "Golgi ve kloroplast"], dogruIndex: 0, aciklama: "Protein sentezinde ribozom ve mRNA temel rol oynar." }
        ]
    },
    kpss: {
        "2025": [
            { konu: "Genel Yetenek - Mantık", soru: "Bir dizide sayıların artış kuralı aranırken ilk bakılması gereken şey nedir?", secenekler: ["Renk", "Aralarındaki fark", "Yazı tipi", "Sayfa numarası"], dogruIndex: 1, aciklama: "Mantık sorularında ardışık farklar sık kullanılır." },
            { konu: "Genel Kültür - Tarih", soru: "Kronolojik sıralama sorularında temel amaç nedir?", secenekler: ["Olayların yerini bulmak", "Olayların zaman sırasını kurmak", "Yazar adını hatırlamak", "Sadece tarih ezberlemek"], dogruIndex: 1, aciklama: "Kronoloji, olayların zaman sırasını anlamayı ölçer." }
        ],
        "2024": [
            { konu: "Genel Yetenek - Türkçe", soru: "Paragrafta yardımcı düşünce neyi destekler?", secenekler: ["Ana düşünceyi", "Başlığı", "Yazım kuralını", "Şiir ölçüsünü"], dogruIndex: 0, aciklama: "Yardımcı düşünceler ana düşünceyi güçlendirir." },
            { konu: "Genel Kültür - Coğrafya", soru: "İklim sorularında yükselti artarsa sıcaklık için genel eğilim nedir?", secenekler: ["Artar", "Azalır", "Değişmez", "Her zaman sabit kalır"], dogruIndex: 1, aciklama: "Yükselti arttıkça sıcaklık genelde düşer." }
        ]
    },
    ales: {
        "2025": [
            { konu: "Sözel - Paragraf", soru: "ALES paragraf sorularında ana amaç çoğunlukla nedir?", secenekler: ["Hızlı tahmin", "Ana fikir ve çıkarım", "Kelime ezberi", "Yazım kuralı"], dogruIndex: 1, aciklama: "ALES sözelde ana fikir ve çıkarım belirleyicidir." },
            { konu: "Sayısal - Problem", soru: "Bir iş 6 kişiyle 12 günde bitiyorsa 3 kişiyle kaç günde biter?", secenekler: ["18", "20", "24", "30"], dogruIndex: 2, aciklama: "İş, kişi sayısıyla ters orantılıdır; süre 24 güne çıkar." }
        ],
        "2024": [
            { konu: "Sözel - Mantık", soru: "Tablo mantığı sorularında en çok hangi beceri ölçülür?", secenekler: ["Renk seçimi", "İlişki kurma", "Hızlı yazma", "Ezbere okuma"], dogruIndex: 1, aciklama: "Tablo mantığında ilişki ve düzen kurma önemlidir." },
            { konu: "Sayısal - Grafik", soru: "Grafik yorumlama sorularında ilk yapılması gereken nedir?", secenekler: ["Başlığı atlamak", "Eksenleri okumak", "Sadece son veriye bakmak", "Soru kökünü okumamak"], dogruIndex: 1, aciklama: "Grafiğin eksenleri ve birimleri önce okunmalıdır." }
        ]
    },
    dgs: {
        "2025": [
            { konu: "Sayısal - Sayı Problemleri", soru: "Bir sayının %25'i kaçta kaçına eşittir?", secenekler: ["1/2", "1/3", "1/4", "1/5"], dogruIndex: 2, aciklama: "%25, dörtte bire eşittir." },
            { konu: "Sözel - Cümlede Anlam", soru: "Bir cümlede vurgu çoğunlukla ne ile ortaya çıkar?", secenekler: ["Cümlenin ilk kelimesi", "Vurgulanan öge", "Nokta sayısı", "Kelimelerin uzunluğu"], dogruIndex: 1, aciklama: "Vurgu, öne çıkarılan ögeyle belirginleşir." }
        ],
        "2024": [
            { konu: "Sayısal - Oran Orantı", soru: "A/B = 2/3 ise B/A kaçtır?", secenekler: ["2/3", "3/2", "1/2", "1/3"], dogruIndex: 1, aciklama: "Ters oran alınır; sonuç 3/2 olur." },
            { konu: "Sözel - Paragraf", soru: "Sözel bölümde paragraf sorularını çözmenin en etkili başlangıcı nedir?", secenekler: ["Soruyu okumamak", "İlk ve son cümleyi dikkate almak", "Şıkları ezberlemek", "Metni atlamak"], dogruIndex: 1, aciklama: "İlk ve son cümleler çoğu zaman ana fikre işaret eder." }
        ]
    },
    lgs: {
        "2025": [
            { konu: "Türkçe - Paragraf", soru: "LGS paragraf sorularında öğrenciden en çok ne beklenir?", secenekler: ["Doğru yazı tipi", "Okuduğunu anlama", "Sadece ezber", "Renk seçimi"], dogruIndex: 1, aciklama: "LGS'de okuduğunu anlama çok belirleyicidir." },
            { konu: "Matematik - Problemler", soru: "Bir havuz 4 muslukla 8 saatte doluyorsa 8 muslukla kaç saatte dolar?", secenekler: ["2", "4", "6", "8"], dogruIndex: 1, aciklama: "Musluk sayısı iki katına çıkarsa süre yarıya iner: 4 saat." }
        ],
        "2024": [
            { konu: "Fen - Basit Makineler", soru: "Kuvvetten kazanç sağlayan düzeneklerde genellikle ne artar?", secenekler: ["Yol", "Renk", "Kütle", "Ses"], dogruIndex: 0, aciklama: "Kuvvetten kazanç varsa yol çoğunlukla artar." },
            { konu: "İnkılap - Kronoloji", soru: "Tarih sorularında olayları sıralarken neye dikkat edilir?", secenekler: ["Yalnızca isimlere", "Zaman akışına", "Kağıt türüne", "Şıklardaki harflere"], dogruIndex: 1, aciklama: "Kronolojik sıralama zaman akışına dayanır." }
        ]
    },
    ydt: {
        "2025": [
            { konu: "Reading - Main Idea", soru: "A reading question asking for the main idea is asking for what?", secenekler: ["A specific detail", "The overall message", "A verb tense", "The last word"], dogruIndex: 1, aciklama: "Main idea questions ask for the text's overall message." },
            { konu: "Vocabulary", soru: "If a word means 'rapid', which option is closest?", secenekler: ["Slow", "Quick", "Silent", "Old"], dogruIndex: 1, aciklama: "Rapid and quick are close in meaning." }
        ],
        "2024": [
            { konu: "Grammar", soru: "Which structure is correct for a simple present positive sentence?", secenekler: ["He play football", "He plays football", "He playing football", "He to play football"], dogruIndex: 1, aciklama: "Third person singular takes -s in simple present." },
            { konu: "Reading - Detail", soru: "A detail question usually asks you to find what?", secenekler: ["The hidden opinion", "A specific piece of information", "The title only", "A synonym list"], dogruIndex: 1, aciklama: "Detail questions focus on a specific fact in the text." }
        ]
    },
    msu: {
        "2025": [
            { konu: "Türkçe - Hız", soru: "MSÜ Türkçede hız kazanmak için ilk alışkanlık nedir?", secenekler: ["Soruyu sonradan okumak", "Kökü ve şıkları birlikte okumak", "Sadece tahmin etmek", "Paragrafı atlamak"], dogruIndex: 1, aciklama: "Kökü ve şıkları birlikte okumak hız kazandırır." },
            { konu: "Matematik - Temel", soru: "Bir tam sayının kendisi ile çarpımı ne olarak adlandırılır?", secenekler: ["Kare", "Küp", "Kök", "Fark"], dogruIndex: 0, aciklama: "Bir sayının kendisiyle çarpımı kare olarak ifade edilir." }
        ],
        "2024": [
            { konu: "Mantık", soru: "Birden fazla koşul verilen sorularda önce ne yapılmalıdır?", secenekler: ["Koşulları maddeleştirmek", "Hepsini ezberlemek", "Şıkları atlamak", "Yalnız ilk koşula bakmak"], dogruIndex: 0, aciklama: "Koşulları maddeleştirmek düzen sağlar." },
            { konu: "Genel Kültür", soru: "Bilgi sorularında doğruya daha hızlı ulaşmak için ne önemlidir?", secenekler: ["Dağınık düşünmek", "Anahtar kelime yakalamak", "Sesli okumamak", "Rastgele cevap vermek"], dogruIndex: 1, aciklama: "Anahtar kelime yakalamak süreci hızlandırır." }
        ]
    }
};