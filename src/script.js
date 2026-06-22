window.app = function app() {
    return {
        // ---- STATE ----
        tab: 'today',
        darkMode: false,
        childName: 'sweetheart',
        parentName: 'Dad',
        relationship: 'Dad',

        // Message
        currentCategory: 'Love',
        currentMessage: '',
        editMessage: '',

        // Create
        msgCategory: 'Love',
        msgTone: 'neutral',

        // Feelings
        activeFeeling: null,
        feelingResponse: null,

        // Custom form
        customTitle: '',
        customMessage: '',
        customCategory: 'Love',
        customTone: 'neutral',
        customUse: 'both',

        // Favorites
        favorites: [],
        customMessages: [],

        // Toast
        toastMessage: '',
        toastTimeout: null,

        // ---- CATEGORIES & TONES ----
        messageCategories: ['Morning', 'Night', 'Love', 'Proud', 'Confidence', 'Hard Day', 'Mistake', 'School',
            'Friends', 'Worry', 'Courage', 'Sad', 'Angry', 'Lonely', 'Birthday', 'Random'
        ],
        messageTones: ['short', 'sweet', 'deep', 'gentle', 'strong', 'funny', 'fatherly', 'motherly',
            'neutral'],

        feelingsList: {
            sad: 'Sad',
            angry: 'Angry',
            worried: 'Worried',
            lonely: 'Lonely',
            scared: 'Scared',
            leftout: 'Left Out',
            notgoodenough: 'Not Good Enough',
            imessedup: 'I Messed Up'
        },

        // ---- COMPUTED ----
        get greeting() {
            const hour = new Date().getHours();
            let time = 'Good morning';
            if (hour >= 12 && hour < 17) time = 'Good afternoon';
            else if (hour >= 17) time = 'Good evening';
            const name = this.childName || 'sweetheart';
            return `${time}, ${name}`;
        },

        // ---- INIT ----
        init() {
            this.loadAllData();
            // Read initial data-theme from html (IDE may have set it)
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            if (currentTheme === 'light') {
                this.darkMode = false;
            } else if (currentTheme === 'dark') {
                this.darkMode = true;
            } else {
                // default to dark if not set
                this.darkMode = true;
                html.setAttribute('data-theme', 'dark');
            }
            // Apply theme and save to localStorage if needed
            this.applyTheme();
            // set up observer for external theme changes (IDE)
            this.setupThemeObserver();
            this.generateNewMessage();
        },

        // ---- THEME MANAGEMENT ----
        applyTheme() {
            const html = document.documentElement;
            html.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
            // also save to localStorage
            try {
                localStorage.setItem('loveDad_darkMode', JSON.stringify(this.darkMode));
            } catch (e) {}
        },

        toggleTheme() {
            this.darkMode = !this.darkMode;
            this.applyTheme();
        },

        setupThemeObserver() {
            const html = document.documentElement;
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'data-theme') {
                        const newTheme = html.getAttribute('data-theme');
                        const newDark = newTheme === 'dark';
                        if (newDark !== this.darkMode) {
                            this.darkMode = newDark;
                            // save to localStorage
                            try {
                                localStorage.setItem('loveDad_darkMode', JSON.stringify(this
                                .darkMode));
                            } catch (e) {}
                        }
                    }
                });
            });
            observer.observe(html, { attributes: true });
        },

        // ---- TOAST ----
        showToast(msg) {
            this.toastMessage = msg;
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => { this.toastMessage = ''; }, 2400);
        },

        // ---- COPY / SHARE ----
        copyText(text) {
            if (!text) return;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    this.showToast('📋 Copied!');
                }).catch(() => {
                    this.fallbackCopy(text);
                });
            } else {
                this.fallbackCopy(text);
            }
        },
        fallbackCopy(text) {
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            try {
                document.execCommand('copy');
                this.showToast('📋 Copied!');
            } catch (e) {
                this.showToast('Could not copy');
            }
            document.body.removeChild(el);
        },
        shareMessage(text) {
            if (!text) return;
            if (navigator.share) {
                navigator.share({ title: 'Love, Dad.', text: text }).catch(() => {});
            } else {
                this.copyText(text);
            }
        },

        // ---- MESSAGE GENERATION ----
        generateNewMessage() {
            const category = this.currentCategory === 'Random' ?
                this.messageCategories.filter(c => c !== 'Random')[Math.floor(Math.random() * this.messageCategories
                    .filter(c => c !== 'Random').length)] :
                this.currentCategory;
            if (category !== this.currentCategory) this.currentCategory = category;
            const pool = this.getAllMessagesForCategory(category);
            this.currentMessage = pool.length ? pool[Math.floor(Math.random() * pool.length)] :
                "You are deeply loved, no matter what.";
            this.editMessage = this.currentMessage;
            // Reset feeling
            this.activeFeeling = null;
            this.feelingResponse = null;
        },

        selectCategory(cat) {
            this.currentCategory = cat;
            this.generateNewMessage();
        },

        getBuiltInMessages(category) {
            const map = {
                'Morning': this.morningMessages,
                'Night': this.nightMessages,
                'Love': this.loveMessages,
                'Proud': this.prideMessages,
                'Confidence': this.confidenceMessages,
                'Hard Day': this.hardDayMessages,
                'Mistake': this.mistakesMessages,
                'School': this.schoolMessages,
                'Friends': this.friendshipMessages,
                'Worry': this.worryMessages,
                'Courage': this.courageMessages,
                'Sad': this.sadnessMessages,
                'Angry': this.angerMessages,
                'Lonely': this.lonelinessMessages,
                'Birthday': this.birthdayMessages,
            };
            return map[category] || [];
        },

        getAllMessagesForCategory(category) {
            const builtIn = this.getBuiltInMessages(category) || [];
            const custom = this.customMessages
                .filter(c => c.category === category && (c.use === 'both' || c.use === 'child'))
                .map(c => c.message);
            // Add some fallback if empty
            if (builtIn.length === 0 && custom.length === 0) {
                return ["You are loved, always."];
            }
            return [...builtIn, ...custom];
        },

        // ---- CREATE TAB ----
        generateCustomMessage() {
            let category = this.msgCategory;
            if (category === 'Random') {
                const cats = this.messageCategories.filter(c => c !== 'Random');
                category = cats[Math.floor(Math.random() * cats.length)];
                this.msgCategory = category;
            }
            const pool = this.getAllMessagesForCategory(category);
            const msg = pool.length ? pool[Math.floor(Math.random() * pool.length)] :
                "You are deeply loved, no matter what.";
            this.editMessage = msg;
            this.currentMessage = msg;
            this.currentCategory = category;
            this.showToast('✨ New message generated');
        },

        // ---- FEELINGS ----
        showFeeling(key) {
            this.activeFeeling = key;
            this.feelingResponse = this.getFeelingResponse(key);
            // Also set the main message to the validation + love
            if (this.feelingResponse) {
                this.currentMessage = this.feelingResponse.validation + ' ' + this.feelingResponse.love;
                this.currentCategory = '💛 ' + this.feelingsList[key];
            }
        },

        getFeelingResponse(key) {
            const map = {
                sad: {
                    validation: "It's okay to feel sad. You don't have to pretend.",
                    grounding: "Take a slow breath. You are safe.",
                    love: "I love you on sad days too. You are not alone.",
                    nextStep: "Can you do one small thing that brings you comfort?"
                },
                angry: {
                    validation: "Anger is a signal that something matters to you.",
                    grounding: "Pause. Breathe before you react.",
                    love: "I love you even when you're angry. You're still good.",
                    nextStep: "Can you name what's underneath the anger?"
                },
                worried: {
                    validation: "Worry is your mind trying to protect you.",
                    grounding: "One step at a time. You only need to handle the next thing.",
                    love: "You don't have to carry worry alone. I'm here.",
                    nextStep: "Can you write down one worry and set it aside?"
                },
                lonely: {
                    validation: "Feeling lonely is human. You are not forgotten.",
                    grounding: "You are seen and known, even when you feel alone.",
                    love: "I am thinking of you right now. You are loved.",
                    nextStep: "Can you reach out to someone, even a small text?"
                },
                scared: {
                    validation: "Fear is natural. It doesn't mean you're weak.",
                    grounding: "You are safe right now. Breathe deeply.",
                    love: "I believe in you, even when you're scared.",
                    nextStep: "Can you take one small step forward, even if scared?"
                },
                leftout: {
                    validation: "Feeling left out is painful. It's okay to feel that.",
                    grounding: "You belong here. You matter.",
                    love: "You are not excluded from my heart. Never.",
                    nextStep: "Can you do something kind for yourself right now?"
                },
                notgoodenough: {
                    validation: "That feeling is a liar. You are enough.",
                    grounding: "You don't have to prove your worth. It's already there.",
                    love: "I love you because of who you are, not what you do.",
                    nextStep: "Can you name three things you like about yourself?"
                },
                imessedup: {
                    validation: "You made a mistake, but that does not make you a bad kid.",
                    grounding: "Take a breath. This moment doesn't define you.",
                    love: "I love you through mistakes too. Always.",
                    nextStep: "Can you tell the truth, make it right, and move forward?"
                }
            };
            return map[key] || {
                validation: "I'm here with you.",
                grounding: "Breathe.",
                love: "You are loved.",
                nextStep: "Be gentle with yourself."
            };
        },

        // ---- FAVORITES ----
        toggleFavorite(category, text) {
            if (!text || !text.trim()) return;
            const exists = this.favorites.some(f => f.text === text && f.category === category);
            if (exists) {
                this.favorites = this.favorites.filter(f => !(f.text === text && f.category === category));
                this.saveFavorites();
                this.showToast('☆ Removed from saved');
            } else {
                this.favorites.push({ category, text, savedAt: new Date().toISOString() });
                this.saveFavorites();
                this.showToast('⭐ Saved!');
            }
        },
        isFavorite(category, text) {
            if (!text || !text.trim()) return false;
            return this.favorites.some(f => f.text === text && f.category === category);
        },
        removeFavorite(index) {
            if (!confirm('Remove from saved?')) return;
            this.favorites.splice(index, 1);
            this.saveFavorites();
            this.showToast('🗑️ Removed');
        },
        saveFavorites() {
            try { localStorage.setItem('loveDad_favorites', JSON.stringify(this.favorites)); } catch (e) {}
        },

        // ---- CUSTOM MESSAGES ----
        saveCustomMessage() {
            if (!this.customTitle.trim() || !this.customMessage.trim()) {
                this.showToast('✏️ Please enter a title and message.');
                return;
            }
            this.customMessages.push({
                title: this.customTitle.trim(),
                message: this.customMessage.trim(),
                category: this.customCategory,
                tone: this.customTone,
                use: this.customUse,
                createdAt: new Date().toISOString()
            });
            this.customTitle = '';
            this.customMessage = '';
            this.customCategory = 'Love';
            this.customTone = 'neutral';
            this.customUse = 'both';
            this.saveCustomMessages();
            this.showToast('✅ Custom message saved!');
        },
        saveCustomMessages() {
            try { localStorage.setItem('loveDad_customMessages', JSON.stringify(this.customMessages)); } catch (
            e) {}
        },

        // ---- NAMES ----
        saveNames() {
            try {
                localStorage.setItem('loveDad_childName', this.childName);
                localStorage.setItem('loveDad_parentName', this.parentName);
                localStorage.setItem('loveDad_relationship', this.relationship);
            } catch (e) {}
        },

        // ---- DARK MODE ----
        saveDarkMode() {
            // This is now handled by applyTheme, but keep for compatibility
            try { localStorage.setItem('loveDad_darkMode', JSON.stringify(this.darkMode)); } catch (e) {}
        },

        // ---- EXPORT / IMPORT ----
        exportData() {
            const data = {
                childName: this.childName,
                parentName: this.parentName,
                relationship: this.relationship,
                darkMode: this.darkMode,
                favorites: this.favorites,
                customMessages: this.customMessages,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `love-dad-backup-${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showToast('📤 Data exported!');
        },
        importData(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.childName) this.childName = data.childName;
                    if (data.parentName) this.parentName = data.parentName;
                    if (data.relationship) this.relationship = data.relationship;
                    if (data.darkMode !== undefined) {
                        this.darkMode = data.darkMode;
                        this.applyTheme();
                    }
                    if (data.favorites) this.favorites = data.favorites;
                    if (data.customMessages) this.customMessages = data.customMessages;
                    this.saveAllData();
                    this.generateNewMessage();
                    this.showToast('📥 Imported successfully!');
                } catch (err) {
                    this.showToast('❌ Invalid data file.');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        },

        // ---- CLEAR ----
        clearAllData() {
            if (!confirm('⚠️ Delete ALL saved data? This cannot be undone.')) return;
            if (!confirm('Are you sure? All favorites and custom messages will be gone.')) return;
            this.favorites = [];
            this.customMessages = [];
            this.childName = 'sweetheart';
            this.parentName = 'Dad';
            this.relationship = 'Dad';
            this.darkMode = true;
            this.applyTheme();
            this.saveAllData();
            this.generateNewMessage();
            this.showToast('🗑️ All data cleared.');
        },

        // ---- SAVE / LOAD ----
        saveAllData() {
            this.saveNames();
            this.saveDarkMode();
            this.saveFavorites();
            this.saveCustomMessages();
        },
        loadAllData() {
            try {
                const child = localStorage.getItem('loveDad_childName');
                if (child) this.childName = child;
                const parent = localStorage.getItem('loveDad_parentName');
                if (parent) this.parentName = parent;
                const rel = localStorage.getItem('loveDad_relationship');
                if (rel) this.relationship = rel;
                // We'll read darkMode from localStorage but will override with html attribute later
                const dark = localStorage.getItem('loveDad_darkMode');
                if (dark !== null) {
                    // Store temporarily, will be overridden by html attribute in init
                    this.darkMode = JSON.parse(dark);
                }
                const fav = localStorage.getItem('loveDad_favorites');
                if (fav) this.favorites = JSON.parse(fav);
                const custom = localStorage.getItem('loveDad_customMessages');
                if (custom) this.customMessages = JSON.parse(custom);
            } catch (e) { console.warn('Data load error, using defaults.'); }
        },

        // ---- MESSAGE DATA (250+ built-in) ----
        morningMessages: [
            "Good morning, sweetheart. Today is a new day full of possibilities. You are loved.",
            "Wake up, sunshine. The world is better with you in it. Have a beautiful day.",
            "Morning, my love. You don't have to be perfect today—just be you.",
            "Good morning! One day at a time, one step at a time. I believe in you.",
            "Rise and shine, kiddo. You are capable of amazing things.",
            "Morning, brave one. Today is yours. Go make it meaningful.",
            "Good morning! You are loved on good days and hard days.",
            "Wake up with gratitude. You are a gift to this world.",
            "Morning, sweet pea. Start with a gentle heart and see where the day takes you.",
            "Good morning! You don't have to have it all figured out. Just start.",
        ],
        nightMessages: [
            "Good night, my love. You did enough today. Rest peacefully.",
            "Sleep well, sweetheart. Tomorrow is a fresh start.",
            "Good night, brave girl. I'm so proud of you.",
            "Rest your head, my darling. You are deeply loved.",
            "Night night. May your dreams be peaceful and your heart be light.",
            "Sleep tight. You are not alone. I'm always with you.",
            "Good night! You are more than enough. Always.",
            "Rest easy, kiddo. You've done well today.",
            "Sleep peacefully. I love you to the moon and back.",
            "Good night! Tomorrow is another chance to shine.",
        ],
        loveMessages: [
            "I love you. Not because of what you do, but because of who you are.",
            "You are loved more than you know.",
            "My love for you is constant—on good days, hard days, and every day.",
            "You are the best thing I ever did. I love you.",
            "No matter what, I love you. Full stop.",
            "You are deeply, unconditionally loved.",
            "I love you, and I'm so glad you're mine.",
            "You don't have to earn my love. It's already yours.",
            "My heart is full because of you. I love you.",
            "You are loved, always and forever.",
        ],
        prideMessages: [
            "I am so proud of the person you are becoming.",
            "You handled today with grace. I'm proud of you.",
            "I am proud of you, not for what you achieve, but for who you are.",
            "You make me proud every day, just by being you.",
            "I see your effort, and I'm so proud.",
            "You are growing, learning, and trying. That makes me proud.",
            "I am proud of your heart, your kindness, and your strength.",
            "You don't have to be perfect to make me proud. You already do.",
            "I am so proud to be your parent.",
            "Your courage inspires me. I'm so proud.",
        ],
        confidenceMessages: [
            "You are more capable than you know. Trust yourself.",
            "You don't have to be perfect to be amazing.",
            "Your voice matters. Use it.",
            "You have everything you need inside you.",
            "You are enough, just as you are.",
            "Believe in yourself the way I believe in you.",
            "You are stronger than you think.",
            "You can do hard things. I know you can.",
            "Your uniqueness is your strength.",
            "You are worthy, capable, and loved.",
        ],
        hardDayMessages: [
            "Today was hard, but you made it. I'm proud of you.",
            "You don't have to be okay right now. I'm here.",
            "Hard days don't last. You do.",
            "You got through today. That's a win.",
            "It's okay to have a hard day. You're still loved.",
            "One bad day does not define you.",
            "You are not alone in this. I'm with you.",
            "Take a breath. You're going to be okay.",
            "This feeling will pass. You are strong.",
            "You are loved, even when today is hard.",
        ],
        mistakesMessages: [
            "You made a mistake, but that does not make you a bad kid.",
            "Mistakes mean you're learning. Keep going.",
            "One wrong step does not define your whole journey.",
            "You can mess up and still be worthy of love.",
            "Mistakes are how we grow. I'm proud you're trying.",
            "You don't have to be perfect to be valuable.",
            "Tell the truth, make it right, and move forward.",
            "You are not your mistakes. You are so much more.",
            "Everyone makes mistakes. What matters is what you do next.",
            "I love you through mistakes too. Always.",
        ],
        schoolMessages: [
            "You are smart, capable, and you belong at school.",
            "Do your best, and that's enough. I'm proud of you.",
            "School is hard sometimes, but you are strong.",
            "You don't have to be the best. Just be you.",
            "Ask for help when you need it. That's strength.",
            "Your mind is a gift. Use it with kindness.",
            "You are learning, growing, and doing great.",
            "One test doesn't define you. You are so much more.",
            "You are a curious, intelligent person. Keep going.",
            "I believe in you and your ability to learn.",
        ],
        friendshipMessages: [
            "You are a good friend, and you deserve good friends.",
            "Friendship is about kindness, honesty, and trust.",
            "You don't have to be friends with everyone. Just be kind.",
            "You are worthy of strong, healthy friendships.",
            "Be the kind of friend you'd want to have.",
            "It's okay to outgrow friendships. That's part of life.",
            "You are a loyal and caring person. Your friends are lucky.",
            "You are never alone. You have people who love you.",
            "True friends see you and accept you as you are.",
            "You are a gift to your friends.",
        ],
        worryMessages: [
            "Worry is a feeling, not a fact. You are safe.",
            "One step at a time. You don't have to solve everything.",
            "Your mind is trying to protect you. Thank it, and breathe.",
            "You can't control everything, and that's okay.",
            "What if it works out? What if you're okay?",
            "Worry is like a rocking chair—it gives you something to do but doesn't get you anywhere.",
            "You are not alone in your worry. I'm here.",
            "Take a deep breath. You can handle this.",
            "You've survived every hard moment before this one.",
            "Your worry doesn't change the outcome. Your courage does.",
        ],
        courageMessages: [
            "Courage isn't not being scared. It's being scared and trying anyway.",
            "You are braver than you believe.",
            "Every brave step makes the next one easier.",
            "You can be scared and still be brave.",
            "Bravery is doing what's right, even when it's hard.",
            "You have courage in you. I've seen it.",
            "Being afraid doesn't make you weak. It makes you human.",
            "Take one brave step today.",
            "You are courageous just by showing up.",
            "Your heart is brave, even when it trembles.",
        ],
        sadnessMessages: [
            "It's okay to be sad. You don't have to pretend.",
            "Sadness is a normal part of being human.",
            "You are not alone in your sadness.",
            "I love you on sad days too.",
            "Let yourself feel it. It will pass.",
            "You are still worthy, even when you're sad.",
            "Sadness doesn't last forever. You will feel better.",
            "I'm here with you, even in the sad moments.",
            "You are allowed to feel sad. It's okay.",
            "You are loved, even when you're sad.",
        ],
        angerMessages: [
            "Anger is a signal that something matters to you.",
            "You can be angry and still be a good person.",
            "Take a breath before you react.",
            "Your feelings are valid, even the angry ones.",
            "What's underneath the anger? Take a moment.",
            "You are still loved, even when you're angry.",
            "Anger is energy. Use it wisely.",
            "It's okay to feel angry. It's not okay to hurt others.",
            "You can be angry and still be kind.",
            "I love you, even when you're angry.",
        ],
        lonelinessMessages: [
            "You are not forgotten. I'm thinking of you.",
            "Loneliness is a feeling, not a fact.",
            "You are loved, even when you feel alone.",
            "You are not alone. You are seen and known.",
            "I'm here with you, always.",
            "You matter, even when you feel lonely.",
            "Reach out. You are not a burden.",
            "Your loneliness doesn't define you.",
            "You are part of something bigger. You belong.",
            "I love you, and I'm here.",
        ],
        birthdayMessages: [
            "Happy birthday! You are such a gift to me.",
            "Another year, another reason to be proud of you.",
            "You are growing into such an amazing person.",
            "Happy birthday, my love. You are so special.",
            "I'm so grateful you were born. You changed my life.",
            "You are a beautiful soul. Happy birthday.",
            "May this year bring you joy, growth, and love.",
            "You are my greatest joy. Happy birthday.",
            "I love you more than words can say. Happy birthday.",
            "You are a blessing. Happy birthday, sweetheart.",
        ],
    };
}