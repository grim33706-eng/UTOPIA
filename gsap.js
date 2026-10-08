const lenis = new Lenis({ smooth: true });

gsap.registerPlugin(ScrollTrigger, Draggable);

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Hero Animation
gsap.from(".hero-overlay h1, .hero-overlay p", {
    opacity: 0,
    y: 80,
    duration: 1.5,
    ease: "power3.out"
});

/* DRAG SLIDERS */
document.querySelectorAll(".dragableSlider").forEach((slider) => {

    const track = slider.querySelector(".drag-track");
    let draggable;

    function createDrag() {
        const maxX = -(track.scrollWidth - slider.clientWidth);
        if (draggable) draggable.kill();
        draggable = Draggable.create(track, {
            type: "x",
            inertia: true,
            edgeResistance: 0.85,
            dragResistance: 0.05,
            allowNativeTouchScrolling: false,
            bounds: { minX: maxX, maxX: 0 }
        })[0];
    }

    createDrag();
    window.addEventListener("resize", createDrag);

    slider.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        const currentX = gsap.getProperty(track, "x");
        const minX = -(track.scrollWidth - slider.clientWidth);
        let nextX = Math.max(minX, Math.min(0, currentX - e.deltaX));
        gsap.to(track, { x: nextX, duration: 0.25, overwrite: true });
    }, { passive: false });

});

/* ======================================
   COLUMN SLIDER SCROLL ANIMATION
====================================== */

const headings = gsap.utils.toArray(".column-heading");
const texts = gsap.utils.toArray(".column-text");
const videos = gsap.utils.toArray(".video-card");

const VIDEO_H = 220;
const GAP = 30;
const itemHeight = VIDEO_H + GAP; // 250px

// Pehla active
headings[0]?.classList.add("active");
texts[0]?.classList.add("active");

// Pin + scroll
const columnTL = gsap.timeline({
    scrollTrigger: {
        trigger: ".column-slider",
        start: "top top",
        end: `+=${itemHeight * (videos.length - 1) + 800}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        pinSpacing: true,
        // markers: true,
    }
});

// Sirf center videos scroll karein
columnTL.to(".video-stack", {
    y: -(itemHeight * (videos.length - 1)),
    ease: "none"
});

// Heading/text switch — video center point cross kare tab
ScrollTrigger.create({
    trigger: ".column-slider",
    start: "top top",
    end: `+=${itemHeight * (videos.length - 1) + 800}`,
    scrub: 1,

    onUpdate: (self) => {
        const activeIndex = Math.min(
            Math.round(self.progress * (videos.length - 1)),
            videos.length - 1
        );

        headings.forEach((h, i) => h.classList.toggle("active", i === activeIndex));
        texts.forEach((t, i) => t.classList.toggle("active", i === activeIndex));
    }
});

ScrollTrigger.refresh();
lenis.on("scroll", ScrollTrigger.update);