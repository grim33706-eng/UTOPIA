/* ===== Menu (with keyboard + screen-reader support) ===== */
const menuBtn = document.querySelector(".menu-btn");
const closeBtn = document.querySelector(".close-btn");
const navMenu = document.querySelector(".nav-menu");

const menuTl = gsap.timeline({
    paused: true,
    reversed: true
});

menuTl
    .set(navMenu, {
        pointerEvents: "auto"
    })
    .to(navMenu, {
        height: "95vh",
        opacity: 1,
        duration: 0.6,
        ease: "power3.inOut"
    });

function openMenu() {
    navMenu.removeAttribute("inert");
    menuBtn.setAttribute("aria-expanded", "true");
    menuTl.play();
    closeBtn.focus({ preventScroll: true });
}

function closeMenu(returnFocus = true) {
    menuBtn.setAttribute("aria-expanded", "false");
    menuTl.reverse();
    if (returnFocus) menuBtn.focus({ preventScroll: true });
}

menuBtn.addEventListener("click", openMenu);
closeBtn.addEventListener("click", () => closeMenu());

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menuTl.reversed()) closeMenu();
});

// Hidden menu must not be reachable by keyboard / assistive tech
menuTl.eventCallback("onReverseComplete", () => {
    gsap.set(navMenu, { pointerEvents: "none" });
    navMenu.setAttribute("inert", "");
});

/* ===== In-page anchor links: close menu + smooth scroll via Lenis ===== */
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener("click", (e) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        if (navMenu.contains(link)) closeMenu(false);
        if (typeof lenis !== "undefined") {
            lenis.scrollTo(target, { offset: -90 });
        } else {
            target.scrollIntoView({ behavior: "smooth" });
        }
        history.replaceState(null, "", link.getAttribute("href"));
    });
});

/* ===== Lazy-load videos (performance / Core Web Vitals) =====
   Everything below the hero starts with data-src and only downloads
   when its section is within 600px of the viewport. */
function loadVideos(container) {
    container.querySelectorAll("video").forEach((video) => {
        let changed = false;
        video.querySelectorAll("source[data-src]").forEach((source) => {
            source.src = source.dataset.src;
            source.removeAttribute("data-src");
            changed = true;
        });
        if (changed) {
            video.load();
            const p = video.play();
            if (p && p.catch) p.catch(() => { });
        }
    });
}

const lazySections = document.querySelectorAll(".column-slider, .dragableSlider");

if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                loadVideos(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "600px 0px" });
    lazySections.forEach((section) => io.observe(section));
} else {
    lazySections.forEach(loadVideos);
}
