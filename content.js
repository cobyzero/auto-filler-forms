
(() => {
    // utilidades
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    let isFilling = false;
    let fillTimeout = null;

    function dispatchInputEvents(el) {
        const events = ['focus', 'keydown', 'keypress', 'input', 'keyup', 'change', 'blur'];
        events.forEach(eventName => {
            try {
                el.dispatchEvent(new Event(eventName, { bubbles: true }));
            } catch (e) {}
        });
    }
    function randomEmail() {
        // Genera un correo realista con chance
        return chance.email({ domain: "gmail.com" }); 
        // o chance.email({ domain: "gmail.com" }) si quieres forzar gmail
    }
    // Rellena email con fallback de búsqueda
    function fillEmail() {
        let emailInput = document.querySelector("input[type='email']");
        if (!emailInput) emailInput = findByKeywords(['correo', 'email', 'e-mail', 'mail'], 'input');
        if (emailInput) {
            emailInput.focus?.();
            emailInput.value = randomEmail();
            dispatchInputEvents(emailInput);
            emailInput.blur?.();
            console.log('[FakeFiller] Email puesto:', emailInput.value);
        } else {
            console.log('[FakeFiller] No encontré input de email.');
        }
    }
    function randomAge(min = 18, max = 30) {
        return rand(min, max);
    }
    function submitOrNextForm() {
        let btn = document.querySelector('button[type="submit"]');
        if (!btn) btn = document.querySelector('input[type="submit"]');

        if (!btn) {
            btn = document.querySelector('.NPEfkd.RveJvd.snByac');
        }
        if (!btn) {
            btn = Array.from(document.querySelectorAll('button, input[type="button"], div[role="button"]'))
                .find(el => /Enviar|Submit|Guardar|Continuar|Siguiente|Next/i.test(el.innerText || el.value || ''));
        }

        if (btn) {
            console.log("[FakeFiller] Presionando botón de avanzar/enviar...");
            btn.click();
        } else {
            console.log("[FakeFiller] No se encontró el botón para avanzar/enviar.");
        }
    }

    // Rellena edad con fallback
    function fillAge() {
        let ageInput = document.querySelector("input[type='text']");
        if (!ageInput) ageInput = findByKeywords(['edad', 'age', 'años', 'anos'], 'input');
        if (ageInput) {
            ageInput.focus?.();
            ageInput.value = randomAge();
            dispatchInputEvents(ageInput);
            ageInput.blur?.();
            console.log('[FakeFiller] Edad puesto:', ageInput.value);
        } else {
            console.log('[FakeFiller] No encontré input de edad.');
        }
    }
    // Busca un elemento por palabras clave en name/id/placeholder/aria-label/label text
    function findByKeywords(keywords, selector = 'input, select, textarea') {
        const nodes = Array.from(document.querySelectorAll(selector));
        const lowerKeywords = keywords.map(k => k.toLowerCase());
        for (const el of nodes) {
            const attrs = [
                el.name || '',
                el.id || '',
                el.placeholder || '',
                el.getAttribute('aria-label') || ''
            ].join(' ').toLowerCase();
            if (lowerKeywords.some(k => attrs.includes(k))) return el;

            // buscar label asociado
            if (el.id) {
                const lab = document.querySelector(`label[for="${el.id}"]`);
                if (lab && lowerKeywords.some(k => lab.innerText.toLowerCase().includes(k))) return el;
            }
            // label envolvente
            let parent = el.parentElement;
            if (parent && parent.tagName === 'LABEL' && lowerKeywords.some(k => parent.innerText.toLowerCase().includes(k))) return el;
        }
        return null;
    }

    function clickEnviarOtraRespuesta() {
        const link = Array.from(document.querySelectorAll("a"))
            .find(a => /enviar otra respuesta/i.test(a.innerText || ""));
        
        if (link) {
            console.log("[FakeFiller] Click en 'Enviar otra respuesta'");
            link.click();
            return true;
        } else {
            console.log("[FakeFiller] No encontré el link 'Enviar otra respuesta'");
            return false;
        }
    }

    function getWeightedRandomChoice(options, weights) {
        let sum = 0;
        const optionWeights = options.map(opt => {
            const w = weights ? Number(weights[opt]) : NaN;
            const weight = (isNaN(w) || w < 0) ? 1.0 : w; // default to 1 if not specified
            sum += weight;
            return { option: opt, weight: weight };
        });

        if (sum <= 0) {
            return options[Math.floor(Math.random() * options.length)];
        }

        let r = Math.random() * sum;
        for (const item of optionWeights) {
            r -= item.weight;
            if (r <= 0) {
                return item.option;
            }
        }
        return options[options.length - 1];
    }

    function getGroupTitle(group) {
        let label = group.getAttribute('aria-label');
        if (label) return label.trim();

        const labelledby = group.getAttribute('aria-labelledby');
        if (labelledby) {
            const labelEl = document.getElementById(labelledby);
            if (labelEl) {
                return (labelEl.innerText || labelEl.textContent || '').trim();
            }
        }

        const card = group.closest('.geS5ne, [role="listitem"]');
        if (card) {
            const headingEl = card.querySelector('[role="heading"], .M7eJec, .F9n2F');
            if (headingEl) {
                const cardTitle = (headingEl.innerText || headingEl.textContent || '').trim();
                const rowLabel = group.closest('tr')?.querySelector('td')?.innerText || '';
                if (rowLabel) {
                    return `${cardTitle} - ${rowLabel.trim()}`;
                }
                return cardTitle;
            }
        }
        return null;
    }

    function scanFormQuestions() {
        const questions = [];
        
        // 1. Scan Radiogroups (Multiple Choice, Grids, etc.)
        const radiogroups = document.querySelectorAll('[role="radiogroup"]');
        radiogroups.forEach((group, index) => {
            const title = getGroupTitle(group) || `Pregunta de opción múltiple ${index + 1}`;
            const radios = Array.from(group.querySelectorAll('div[role="radio"]'));
            const options = radios.map(r => (r.getAttribute('data-value') || r.getAttribute('aria-label') || r.innerText || '').trim()).filter(Boolean);
            
            if (options.length > 0) {
                questions.push({
                    id: `rg_${index}`,
                    title: title,
                    type: 'radio',
                    options: [...new Set(options)]
                });
            }
        });

        // 2. Scan Checkbox groups
        const checkboxContainers = document.querySelectorAll('.geS5ne, [role="listitem"]');
        checkboxContainers.forEach((container, index) => {
            const checkboxes = Array.from(container.querySelectorAll('div[role="checkbox"]'));
            if (checkboxes.length === 0) return;

            const headingEl = container.querySelector('[role="heading"], .M7eJec, .F9n2F');
            const title = headingEl ? (headingEl.innerText || headingEl.textContent || '').trim() : `Pregunta de casillas ${index + 1}`;
            
            const options = checkboxes.map(c => (c.getAttribute('data-value') || c.getAttribute('aria-label') || c.innerText || '').trim()).filter(Boolean);

            if (options.length > 0) {
                questions.push({
                    id: `cb_${index}`,
                    title: title,
                    type: 'checkbox',
                    options: [...new Set(options)]
                });
            }
        });

        return questions;
    }

    function fillDynamicQuestions(percentages) {
        // 1. Fill Radiogroups
        const radiogroups = document.querySelectorAll('[role="radiogroup"]');
        radiogroups.forEach(group => {
            const title = getGroupTitle(group);
            if (!title) return;

            const questionConfig = percentages[title] || {};
            const radios = Array.from(group.querySelectorAll('div[role="radio"]'));
            if (radios.length === 0) return;

            const optionMap = {};
            radios.forEach(r => {
                const optText = (r.getAttribute('data-value') || r.getAttribute('aria-label') || r.innerText || '').trim();
                if (optText) {
                    optionMap[optText] = r;
                }
            });

            const optionNames = Object.keys(optionMap);
            if (optionNames.length > 0) {
                const chosenOption = getWeightedRandomChoice(optionNames, questionConfig);
                if (chosenOption && optionMap[chosenOption]) {
                    optionMap[chosenOption].click();
                    console.log(`[FakeFiller] Radio seleccionado para "${title}":`, chosenOption);
                }
            }
        });

        // 2. Fill Checkboxes
        const checkboxContainers = document.querySelectorAll('.geS5ne, [role="listitem"]');
        checkboxContainers.forEach(container => {
            const checkboxes = Array.from(container.querySelectorAll('div[role="checkbox"]'));
            if (checkboxes.length === 0) return;

            const headingEl = container.querySelector('[role="heading"], .M7eJec, .F9n2F');
            const title = headingEl ? (headingEl.innerText || headingEl.textContent || '').trim() : '';
            if (!title) return;

            const questionConfig = percentages[title] || {};

            checkboxes.forEach(c => {
                const optText = (c.getAttribute('data-value') || c.getAttribute('aria-label') || c.innerText || '').trim();
                if (!optText) return;

                const weightVal = questionConfig[optText];
                const threshold = (weightVal !== undefined && !isNaN(Number(weightVal))) ? Number(weightVal) : 50;

                const shouldCheck = (Math.random() * 100) < threshold;
                const isChecked = c.getAttribute('aria-checked') === 'true';

                if (shouldCheck !== isChecked) {
                    c.click();
                }
                console.log(`[FakeFiller] Checkbox para "${title}" - "${optText}":`, shouldCheck ? 'Marcado' : 'Desmarcado');
            });
        });
    }
    
    function watchForPageTransitions(settings) {
        const formEl = document.querySelector('form');
        if (!formEl || window.fakeFillerObserverAttached) return;

        window.fakeFillerObserverAttached = true;

        const observer = new MutationObserver(() => {
            if (isFilling) return;

            clearTimeout(fillTimeout);
            fillTimeout = setTimeout(() => {
                console.log('[FakeFiller] Cambio de página detectado. Re-ejecutando...');
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.get(settings, (currentSettings) => {
                        runFiller(currentSettings);
                    });
                } else {
                    runFiller(settings);
                }
            }, 800);
        });

        observer.observe(formEl, { childList: true, subtree: true });
    }

    function fillGenericTextFields() {
        const textInputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
        textInputs.forEach(el => {
            if (el.type === 'email' || el.value.trim() !== '') return;
            
            const isAge = findByKeywords(['edad', 'age', 'años', 'anos'], 'input') === el;
            if (isAge) return;

            el.focus?.();
            el.value = chance.word({ length: rand(5, 10) });
            dispatchInputEvents(el);
            el.blur?.();
            console.log('[FakeFiller] Input genérico rellenado:', el.value);
        });
    }

    // rutina principal
    function runFiller(settings) {
        if (isFilling) return;
        isFilling = true;

        try { fillEmail(); } catch (e) { console.warn(e); }
        try { fillAge(); } catch (e) { console.warn(e); }
        try { fillGenericTextFields(); } catch (e) { console.warn(e); }
        try { fillDynamicQuestions(settings.percentages || {}); } catch (e) { console.warn(e); }
        console.log('[FakeFiller] Relleno finalizado.');

        setTimeout(() => {
            isFilling = false;
        }, 600);

        // Activar observador de cambios de sección
        watchForPageTransitions(settings);

        if (settings.action === 'submit') {
            const delay = rand(2000, 4500);
            console.log(`[FakeFiller] Esperando ${delay}ms antes de enviar/avanzar...`);
            setTimeout(submitOrNextForm, delay);
        }
    }

    function init() {
        const defaultSettings = {
            trigger: 'auto',
            action: 'submit',
            loop: true,
            percentages: {}
        };

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(defaultSettings, (settings) => {
                console.log('[FakeFiller] Ajustes cargados:', settings);
                
                // Si es la página de fin y el bucle está activado con envío automático, volver a empezar
                if (settings.loop && settings.action === 'submit') {
                    chrome.storage.local.get({ currentLoopCount: 0 }, (loopRes) => {
                        let current = loopRes.currentLoopCount || 0;
                        if (current === 0) {
                            current = 1;
                        }
                        const limit = settings.loopLimit || 0;

                        if (limit > 0 && current >= limit) {
                            console.log(`[FakeFiller] Bucle completado: se alcanzó el límite de ${limit} envíos.`);
                            chrome.storage.local.set({ currentLoopCount: 0 });
                            return;
                        }

                        const nextCount = current + 1;
                        chrome.storage.local.set({ currentLoopCount: nextCount }, () => {
                            console.log(`[FakeFiller] Iniciando envío #${nextCount} de ${limit || 'infinitos'}`);
                            clickEnviarOtraRespuesta();
                        });
                    });
                    return;
                }
                
                // Si es automático, rellenar de inmediato
                if (settings.trigger === 'auto') {
                    runFiller(settings);
                } else {
                    // Aunque no sea automático, configurar observador para que al pasar de página se mantenga atenta
                    watchForPageTransitions(settings);
                }
            });
        } else {
            console.log('[FakeFiller] Entorno de extensión no detectado o storage inaccesible. Usando fallback.');
            if (!clickEnviarOtraRespuesta()) {
                runFiller(defaultSettings);
            }
        }
    }

    // Escuchar mensajes del popup
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        if (!window.fakeFillerListening) {
            window.fakeFillerListening = true;
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if (request.action === "scan") {
                    console.log('[FakeFiller] Petición de escaneo de preguntas recibida.');
                    sendResponse({ questions: scanFormQuestions() });
                    return true;
                }
                if (request.action === "fill") {
                    console.log('[FakeFiller] Petición de rellenado manual recibida.');
                    const defaultSettings = {
                        trigger: 'auto',
                        action: 'submit',
                        loop: true,
                        percentages: {}
                    };
                    chrome.storage.local.get(defaultSettings, (settings) => {
                        runFiller(settings);
                        sendResponse({ status: "success" });
                    });
                    return true;
                }
            });
        }
    }

    // Ejecutar inicialización
    init();
})();
