const serviceLinks = {
    forum: "https://f.hue.org.cn/",
    drive: "https://wp.wdsj.host/s/dPUj",
    github: "https://github.com/hue-vex"
};

const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");

const closeNavigation = () => {
    if (!navToggle || !siteNav) {
        return;
    }

    navToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
};

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!isOpen));
        siteNav.classList.toggle("is-open", !isOpen);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNavigation);
    });
}

document.querySelectorAll("[data-link-key]").forEach((link) => {
    const key = link.getAttribute("data-link-key");
    const url = serviceLinks[key];

    if (url) {
        link.setAttribute("href", url);
    }

});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeNavigation();
    }
});

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}
