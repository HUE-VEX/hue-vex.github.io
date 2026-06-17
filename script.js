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

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeNavigation();
    }
});

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}
