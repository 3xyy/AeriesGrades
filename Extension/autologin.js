(function () {
    const SETTINGS_KEY = "aeries-grades+-settings";

    function getSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    async function waitFor(selector, timeout = 8000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                const found = document.querySelector(selector);
                if (found) {
                    observer.disconnect();
                    resolve(found);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for ${selector}`));
            }, timeout);
        });
    }    async function run() {
        const settings = getSettings();

        if (!settings || settings.autologin !== "on") return;

        const email = settings.autologin_email || "";
        const password = settings.autologin_password || "";
        const mode = settings.autologin_mode || "google";

        if (!email) {
            console.warn("[Aeries Grades+] Auto login: No email configured");
            return;
        }

        try {
            // Step 1: Wait for and fill the email field
            const emailInput = await waitFor("#portalAccountUsername");
            emailInput.value = email;
            emailInput.dispatchEvent(new Event("input", { bubbles: true }));
            emailInput.dispatchEvent(new Event("change", { bubbles: true }));
            
            console.log("[Aeries Grades+] Auto login: Filled email");

            // Step 2: Wait for and click the Next button
            const nextBtn = await waitFor("#next");
            
            // Small delay to ensure the form is ready
            await new Promise(r => setTimeout(r, 300));
            
            nextBtn.click();
            console.log("[Aeries Grades+] Auto login: Clicked Next button");

            if (mode === "google") {
                // Google Sign In Mode
                // Step 3: Wait for the Google Sign In button to appear after clicking Next
                const googleLoginBtn = await waitFor("#LoginButton.btn-login.Google");

                // Small delay to ensure the page transition is complete
                await new Promise(r => setTimeout(r, 400));

                // Click the Google Sign In button
                googleLoginBtn.click();

                console.log("[Aeries Grades+] Auto login: Clicked Google Sign In button");
            } else if (mode === "password") {
                // Password Sign In Mode
                if (!password) {
                    console.warn("[Aeries Grades+] Auto login: No password configured");
                    return;
                }

                // Step 3: Wait for and fill the password field
                const passwordInput = await waitFor("#portalAccountPassword");
                passwordInput.value = password;
                passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
                passwordInput.dispatchEvent(new Event("change", { bubbles: true }));
                
                console.log("[Aeries Grades+] Auto login: Filled password");

                // Step 4: Wait for and click the Sign In button
                const signInBtn = await waitFor("#Button1");
                
                // Small delay to ensure the form is ready
                await new Promise(r => setTimeout(r, 300));
                
                signInBtn.click();
                console.log("[Aeries Grades+] Auto login: Clicked Sign In button");
            }

        } catch (err) {
            console.warn("[Aeries Grades+] Auto login failed:", err.message);
        }
    }

    // Run after page is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();
