/*=============== SWIPER ===============*/
let swiperHome = new Swiper(".merch-swiper", {
    // Optional parameters
    // direction: 'vertical',
    loop: true,
    grabCursor: true,
    slidesPerView: "auto",

    // If we need pagination
    // pagination: {
    //   el: '.swiper-pagination',
    // },

    // Navigation arrows
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },

    // And if we need scrollbar
    // scrollbar: {
    //   el: '.swiper-scrollbar',
    // },
    breakpoints: {
        768: { slidesPerView: 3, centeredSlides: "auto" },
        1152: { centeredSlides: "auto", spaceBetween: -64 },
    },
});

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
    origin: "top",
    distance: "60px",
    duration: 2500,
    //reset: true //animations repeat
});

sr.reveal(".merch-swiper");
sr.reveal(".merch-circle", { scale: 1.5, delay: 300 });
sr.reveal(".merch-subcircle", { scale: 1.5, delay: 500 });
sr.reveal(".merch-title", { scale: 1, origin: "bottom", delay: 1200 });
sr.reveal(".swiper-button-prev, .swiper-button-next", { origin: "bottom" });
