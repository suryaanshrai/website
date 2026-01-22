export { }
declare global {
    interface Window {
        REMARK42: any
        remark_config: any
        __remark42_script_loading?: boolean
    }
}

const REMARK42 = {
    changeTheme: (theme: string) => {
        if (window.REMARK42) {
            window.REMARK42.changeTheme(theme)
        }
    },
}

function computeRemarkConfig(remark42Container: HTMLElement) {
    const theme = document.documentElement.getAttribute("saved-theme") === "dark" ? "dark" : "light"
    const noFooter = remark42Container.dataset.noFooter === "1"
    const simpleView = remark42Container.dataset.simpleView === "1"

    window.remark_config = {
        host: remark42Container.dataset.host,
        site_id: remark42Container.dataset.siteId,
        components: ["embed"],
        theme: theme,
        no_footer: noFooter,
        simple_view: simpleView,
        url: window.location.href, // Ensure URL is current
    }
}

function loadRemark42Script(remark42Container: HTMLElement) {
    if (window.REMARK42 || window.__remark42_script_loading) {
        return
    }

    window.__remark42_script_loading = true
    const script = document.createElement("script")
    script.src = `${remark42Container.dataset.host}/web/embed.js`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
        window.__remark42_script_loading = false
        if (window.REMARK42) {
            window.REMARK42.createInstance(window.remark_config)
        }
    }

    script.onerror = () => {
        window.__remark42_script_loading = false
    }
}

function ensureRemark42Ready(remark42Container: HTMLElement) {
    computeRemarkConfig(remark42Container)

    // If script is already loaded, just re-create the instance for SPA navigations.
    if (window.REMARK42) {
        window.REMARK42.createInstance(window.remark_config)
        return
    }

    // Otherwise, defer loading until the user is near the comments (or when the browser is idle).
    const load = () => loadRemark42Script(remark42Container)

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    observer.disconnect()
                    load()
                }
            },
            { root: null, rootMargin: "250px 0px", threshold: 0 },
        )
        observer.observe(remark42Container)
    } else if ("requestIdleCallback" in window) {
        ;(window as any).requestIdleCallback(load, { timeout: 2000 })
    } else {
        setTimeout(load, 800)
    }
}

document.addEventListener("nav", () => {
    const remark42Container = document.getElementById("remark42")
    if (!remark42Container) return
    ensureRemark42Ready(remark42Container)
})

// Handle theme changes
document.addEventListener("themechange", (e: CustomEventMap["themechange"]) => {
    const theme = e.detail.theme
    REMARK42.changeTheme(theme)
})
