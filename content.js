
(() => {
    // utilidades
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
 
    function randomAge(min = 18, max = 60) {
        return rand(min, max);
    }

    function dispatchInputEvents(el) {
        try {
            el.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e) { }
        try {
            el.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) { }
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
    function randomAge() {
        return rand(18, 30);
    }
    function submitForm() {
        // 1) buscar <button type="submit">
        let btn = document.querySelector('button[type="submit"]');

        // 2) si no, buscar <input type="submit">
        if (!btn) btn = document.querySelector('input[type="submit"]');

        if (!btn) {
            btn = document.querySelector('.NPEfkd.RveJvd.snByac');
        }
        // 3) fallback: buscar botón por texto
        if (!btn) {
            btn = Array.from(document.querySelectorAll('button, input[type="button"]'))
                .find(el => /Enviar|Submit|Guardar|Continuar/i.test(el.innerText || el.value || ''));
        }

        if (btn) {
            console.log("[FakeFiller] Presionando botón enviar...");
            btn.click();
        } else {
            console.log("[FakeFiller] No encontré botón de enviar.");
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

    // Seleccionar genero en select (elige el primer select que parezca "gender")
    function fillGender() {
        // Busca todos los "radios" personalizados de Google Forms
        const radios = Array.from(document.querySelectorAll('div[role="radio"]'))
            .filter(r => {
                const val = (r.getAttribute("data-value") || r.getAttribute("aria-label") || "").toLowerCase();
                return val.includes("masculino") || val.includes("femenino");
            });

        if (radios.length > 0) {
            // elige aleatorio (o fuerza a masculino si prefieres)
            const choice = radios[Math.floor(Math.random() * radios.length)];
            choice.click();
            console.log("[FakeFiller] Género seleccionado:", choice.getAttribute("data-value") || choice.getAttribute("aria-label"));
        } else {
            console.log("[FakeFiller] No encontré opciones de género en el formulario.");
        }
    }

    function fillLikertQuestions() {
        // Buscar todos los radios de Google Forms
        const radios = Array.from(document.querySelectorAll('div[role="radio"]'));

        // Agruparlos por "radiogroup" (el contenedor padre con role="radiogroup")
        const groups = {};
        radios.forEach(r => {
            const group = r.closest('[role="radiogroup"]');
            if (group) {
                const gid = group.getAttribute('aria-labelledby') || group.id || Math.random();
                if (!groups[gid]) groups[gid] = [];
                groups[gid].push(r);
            }
        });

        // Recorrer cada grupo y elegir solo "De acuerdo" o "Totalmente de acuerdo"
        Object.values(groups).forEach(options => {
            const valid = options.filter(r => {
                const label = (r.getAttribute("data-value") || r.getAttribute("aria-label") || "").toLowerCase();
                return label.includes("de acuerdo") && !label.includes("ni "); // descartar "Ni de acuerdo..."
            });

            if (valid.length > 0) {
                const choice = valid[Math.floor(Math.random() * valid.length)];
                choice.click();
                console.log("[FakeFiller] Likert seleccionado:", choice.getAttribute("data-value") || choice.getAttribute("aria-label"));
            }
        });
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
    
    // rutina principal
    function fillForm() {
        if (clickEnviarOtraRespuesta()) return;
        try { fillEmail(); } catch (e) { console.warn(e); }
        try { fillAge(); } catch (e) { console.warn(e); }
        try { fillGender(); } catch (e) { console.warn(e); }
        try { fillLikertQuestions(); } catch (e) { console.warn(e); }
        console.log('[FakeFiller] Relleno finalizado.');

        // 👉 enviar automáticamente
        setTimeout(submitForm, 1000);
    }

    // Ejecutar
    fillForm();
})();
