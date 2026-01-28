// static/js/app.js

// --- STATE ---
const State = {
    user: null,
    dealer: null,
    messages: []
};

// --- DOM ELEMENTS ---
const Elements = {
    chatContainer: document.getElementById('chat-container'),
    inputForm: document.getElementById('input-form'),
    inputField: document.getElementById('chat-input'),
    dealerSelect: document.getElementById('dealer-select'),
    cemLink: document.getElementById('cem-link'),
    cemPhoto: document.getElementById('cem-photo'),
    cemName: document.getElementById('cem-name'),
    cemEmail: document.getElementById('cem-email'),
    loginButton: document.getElementById('btn-login'),
    userInfo: document.getElementById('user-info')
};

// --- MARKDOWN CONFIG ---
marked.setOptions({
    gfm: true,
    breaks: true
});

// --- AUTH LOGIC ---
const initAuth = async () => {
    // 1. Check Session
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
                State.user = data.user;
                console.log("Authenticated as:", State.user);

                // Auto-select dealer if mapped
                if (data.user.dealerUuid) {
                    const mapped = CEMData.DEALERS.find(d => d.vitallyUuid === data.user.dealerUuid);
                    if (mapped) State.dealer = mapped;
                }
            }
        }
    } catch (e) {
        console.error("Auth check failed:", e);
    }

    // 2. Load Persisted Dealer (if not set by SAML)
    if (!State.dealer) {
        const saved = localStorage.getItem('vpm_current_dealer');
        if (saved) {
            State.dealer = JSON.parse(saved);
        } else {
            State.dealer = CEMData.DEALERS[0]; // Default: Keeler
        }
    }

    // 3. Update UI
    updateDealerUI();
    renderAuthStatus();
};

const renderAuthStatus = () => {
    if (State.user) {
        Elements.loginButton.classList.add('hidden');
        Elements.userInfo.textContent = State.user.firstName || State.user.email;
        Elements.userInfo.classList.remove('hidden');
    } else {
        Elements.loginButton.classList.remove('hidden');
        Elements.userInfo.classList.add('hidden');
    }
};

// --- DEALER & CEM LOGIC ---
const updateDealerUI = () => {
    if (!State.dealer) return;

    // Dropdown
    Elements.dealerSelect.value = State.dealer.id;

    // CEM Finder
    const cem = CEMData.getCEMForDealer(State.dealer.id);
    if (cem) {
        Elements.cemName.textContent = cem.name;
        Elements.cemEmail.textContent = cem.email;
        Elements.cemPhoto.src = cem.photoUrl;

        // Calendly Link Logic
        if (cem.calendarLink) {
            Elements.cemLink.href = cem.calendarLink;
            Elements.cemLink.classList.remove('hidden');
            Elements.cemLink.textContent = "Schedule with me";
        } else {
            Elements.cemLink.classList.add('hidden');
        }
    }

    localStorage.setItem('vpm_current_dealer', JSON.stringify(State.dealer));
};

// --- CHAT LOGIC ---
const addMessage = (sender, text) => {
    const msg = {
        id: Date.now(),
        sender,
        text,
        timestamp: new Date()
    };
    State.messages.push(msg);
    renderMessage(msg);
};

const renderMessage = (msg) => {
    const div = document.createElement('div');
    div.className = `flex w-full mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${msg.sender === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground border border-border'
        }`;

    // Markdown for bot, plain text for user
    if (msg.sender === 'bot') {
        bubble.innerHTML = `<div class="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
            ${marked.parse(msg.text)}
        </div>`;
    } else {
        bubble.textContent = msg.text;
    }

    div.appendChild(bubble);
    Elements.chatContainer.appendChild(div);
    Elements.chatContainer.scrollTop = Elements.chatContainer.scrollHeight;
};

const handleSend = async (e) => {
    e.preventDefault();
    const text = Elements.inputField.value.trim();
    if (!text) return;

    addMessage('user', text);
    Elements.inputField.value = '';

    // Logic Routing
    const lower = text.toLowerCase();

    if (lower.includes('review') || lower.includes('performance')) {
        // 1. Detect Dealer Override
        const mentionedDealer = CEMData.getDealerByName(text);
        if (mentionedDealer) {
            State.dealer = mentionedDealer;
            updateDealerUI();
            addMessage('bot', `*Switching context to **${mentionedDealer.name}**...*`);
        }

        // 2. Generate
        addMessage('bot', `*Detailed performance review in progress for **${State.dealer.name}**...*`);
        const review = await CoachService.generateReview(
            State.dealer.vitallyUuid,
            State.dealer.name,
            State.user ? (State.user.firstName || 'User') : "CEM"
        );

        // 3. Append CTA
        const cem = CEMData.getCEMForDealer(State.dealer.id);
        let finalResponse = review;
        if (cem && cem.calendarLink) {
            finalResponse += `\n\n---\n\nIf you would like to review these KPIs or anything else please schedule a Zoom call with me here: [${cem.calendarLink}](${cem.calendarLink})`;
        }

        addMessage('bot', finalResponse);

    } else {
        await new Promise(r => setTimeout(r, 600));
        addMessage('bot', "I am optimized to provide performance reviews. Try asking: *\"Give me a review for this store\"*");
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Populate Select
    CEMData.DEALERS.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.name;
        Elements.dealerSelect.appendChild(opt);
    });

    // Listeners
    Elements.dealerSelect.addEventListener('change', (e) => {
        const selected = CEMData.DEALERS.find(d => d.id === e.target.value);
        if (selected) {
            State.dealer = selected;
            updateDealerUI();
            addMessage('bot', `*Switched to **${selected.name}**.*`);
        }
    });

    Elements.inputForm.addEventListener('submit', handleSend);

    Elements.loginButton.addEventListener('click', () => {
        window.location.href = '/login/saml';
    });

    // Start
    initAuth();

    // Welcome Message
    setTimeout(() => {
        addMessage('bot', `**Virtual Performance Manager** online.\n\nI can analyze live KPIs from Vitally. Ask me for a performance review.`);
    }, 500);
});
