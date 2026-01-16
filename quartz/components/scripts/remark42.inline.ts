export { }
declare global {
    interface Window {
        REMARK42: any
        remark_config: any
    }
}

const REMARK42 = {
    changeTheme: (theme: string) => {
        if (window.REMARK42) {
            window.REMARK42.changeTheme(theme)
        }
    },
}

document.addEventListener("nav", () => {
    const remark42Container = document.getElementById("remark42")
    if (!remark42Container) {
        return
    }

    // Load the script if it hasn't been loaded yet
    if (!window.REMARK42) {
        const script = document.createElement("script")
        script.src = `${remark42Container.dataset.host}/web/embed.js`
        script.async = true
        script.defer = true
        document.head.appendChild(script)

        script.onload = () => {
            // Initial load might be handled automatically by the script if `remark_config` is set correctly beforehand,
            // but explicitly creating it ensures it works with SPA transitions if the script was already loaded.
            if (window.REMARK42) {
                window.REMARK42.createInstance(window.remark_config)
            }
        }
    } else {
        // If script is already loaded, just re-create the instance
        window.REMARK42.createInstance(window.remark_config)
    }
})

// Setup config on initial load and navigation
document.addEventListener("nav", () => {
    const remark42Container = document.getElementById("remark42")
    if (!remark42Container) return

    const theme = document.documentElement.getAttribute("saved-theme") === "dark" ? "dark" : "light"

    window.remark_config = {
        host: remark42Container.dataset.host,
        site_id: remark42Container.dataset.siteId,
        components: ["embed"],
        theme: theme,
        url: window.location.href, // Ensure URL is current
    }
})

// Handle theme changes
document.addEventListener("themechange", (e: CustomEventMap["themechange"]) => {
    const theme = e.detail.theme
    REMARK42.changeTheme(theme)
})
