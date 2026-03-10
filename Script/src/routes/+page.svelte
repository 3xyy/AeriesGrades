<script>
    import { writable } from "svelte/store";
    import Periods from "./Periods.svelte";
    import Period from "./Period.svelte";
    import { fade } from "svelte/transition";
    import Dashboard from "./Dashboard.svelte";
    import { VERSION } from "./version.js";

    const started = writable(false);
    
    const defaultKeywords = { keywords: "final", version: VERSION };
    export const settings = getSettings();
    
    function getSettings() {
        const { set, subscribe, update } = writable({ version: VERSION, zeros: "no", developer: "off", mode: "default", keywords: "final", edited: false, autologin: "off", autologin_email: "", autologin_password: "", autologin_mode: "google", autogradebook: "off" });
        
        function init() {
            const saved = localStorage.getItem("aeries-grades+-settings");

            if(saved) {
                set(JSON.parse(saved));
            }
        }

        function setSettings(settings) {
            localStorage.setItem("aeries-grades+-settings", JSON.stringify(settings));
            set(settings);
        }

        return {
            set: setSettings,
            subscribe: subscribe,
            init: init
        }
    }

    $: {
        if($settings.keywords != defaultKeywords.keywords && $settings.version == defaultKeywords.version) { 
            $settings.edited = true;
        }
    }    $: {
        if($settings.version != defaultKeywords.version && $settings.edited == false) {
            $settings.keywords = defaultKeywords.keywords;
            $settings.version = defaultKeywords.version;
        }
    }
    
    let current = "";

    function start() {
        // Initialize settings first so they're loaded from localStorage
        settings.init();
        
        if(document.location.href.includes("Dashboard.aspx")) {
            current = "Dashboard";
            
            // Auto redirect to Gradebook Summary if enabled and not manually navigated
            if($settings.autogradebook === "on") {
                const manualNavigation = sessionStorage.getItem("manual-dashboard-navigation");
                
                // Check if user is coming from GradebookSummary (don't redirect in that case)
                const comingFromGradebook = document.referrer && document.referrer.includes("GradebookSummary.aspx");
                
                console.log("[Aeries Grades+] Auto Gradebook Redirect Debug:", {
                    autogradebook: $settings.autogradebook,
                    manualNavigation: manualNavigation,
                    referrer: document.referrer,
                    comingFromGradebook: comingFromGradebook,
                    shouldRedirect: manualNavigation !== "true" && !comingFromGradebook
                });
                
                if(manualNavigation !== "true" && !comingFromGradebook) {
                    // Set a flag to prevent redirect loop
                    sessionStorage.setItem("auto-redirecting", "true");
                    console.log("[Aeries Grades+] Redirecting to GradebookSummary...");
                    window.location.href = location.href.substring(0, location.href.lastIndexOf("/") + 1) + "GradebookSummary.aspx";
                    return;
                } else {
                    // Clear the manual navigation flag for next time
                    sessionStorage.removeItem("manual-dashboard-navigation");
                    console.log("[Aeries Grades+] Not redirecting - manual navigation or coming from gradebook");
                }
            }
        } else {
            current = document.querySelector(".AeriesFullPageParentNavSubLinkMenu > .CurrentPage").innerText;
        }

        $started = true;

        const main = document.getElementById("AeriesFullPageContent");

        onClassChange(main, () => {
            const page = document.getElementById("AeriesFullPageContent");

            open = page.className.includes("blur");
        });

        const top = document.createElement("div");

        top.setAttribute("id", "aeriesgradesplus-top");        main.insertAdjacentElement("afterbegin", top);

        // Add click listener to detect manual navigation to Dashboard
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a');
            if (target && target.href && target.href.includes('Dashboard.aspx')) {
                sessionStorage.setItem("manual-dashboard-navigation", "true");
            }
        });
    }

    let open = false;
    
    function onClassChange(node, callback) {
        let lastClassString = node.classList.toString();

        const mutationObserver = new MutationObserver((mutationList) => {
            for (const item of mutationList) {
                if (item.attributeName == "class") {
                    const classString = node.classList.toString();

                    if (classString != lastClassString) {
                        callback(mutationObserver);
                        lastClassString = classString;
                        break;
                    }
                }
            }
        });

        mutationObserver.observe(node, { attributes: true });

        return mutationObserver;
    }
</script>

{#if !$started}
    <button style="display: none;" id="#start" on:click|preventDefault|stopPropagation={() => { start(); }}>Start</button>
{/if}

{#if open}
    <button transition:fade={{ duration: 100 }} on:click|preventDefault|stopPropagation={() => { document.getElementById("AeriesFullPageContent").click(); }} aria-label="Close Search" class="{$settings.mode == 'dark' ? 'bg-zinc-100 bg-opacity-25' : $settings.mode == 'light' ? 'bg-zinc-900 bg-opacity-25' : 'bg-zinc-900 dark:bg-zinc-100 bg-opacity-25 dark:bg-opacity-25 '} w-full h-full absolute z-10">

    </button>
{/if}

{#if current == "Gradebook"}
    <Periods started={started} {defaultKeywords} {settings}></Periods>
{:else if current == "Gradebook Details"}
    <Period started={started} {settings}></Period>
{:else if current == "Dashboard"}
    <Dashboard started={started} {settings}></Dashboard>
{/if}