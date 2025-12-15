// gsap 연결
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    return arguments.length
      ? lenis.scrollTo(value)
      : lenis.scroll.instance.scroll;
  },
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
});
// (1) 메인 swiper ====================================================
document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector(".kv-main");
  if (!main) return;

  const items = main.querySelectorAll(".el-carousel__item");
  const prevBtn = main.querySelector(
    ".el-carousel__arrow--left.el-carousel__arrow--custom"
  );
  const nextBtn = main.querySelector(
    ".el-carousel__arrow--right.el-carousel__arrow--custom"
  );
  const modelPrev = document.querySelector(".prev-model-name");
  const modelNext = document.querySelector(".next-model-name");
  const indicatorWrap = document.querySelector(
    ".keyvisual-wrap .slideinfo-list"
  );
  const toggleBtn = document.querySelector(
    ".keyvisual-wrap .btn-control--toggle"
  );

  let current = 0;
  let autoPlay = true;
  let interval = null;

  const names = Array.from(items).map((item) =>
    item.querySelector(".car-name")?.innerText.trim()
  );

  indicatorWrap.innerHTML = "";
  names.forEach((_, i) => {
    const li = document.createElement("li");
    li.classList.add("slideinfo-list__item");
    li.innerHTML = `<button class="slideinfo-list__link" data-index="${i}"></button>`;
    indicatorWrap.appendChild(li);
  });
  const indicators = document.querySelectorAll(
    ".keyvisual-wrap .slideinfo-list__link"
  );

  function updateSlide(index) {
    items.forEach((el) => el.classList.remove("is-active"));
    items.forEach((el) => el.classList.remove("is-animating"));
    indicators.forEach((el) => el.classList.remove("is-active"));

    items[index].classList.add("is-active");
    items[index].classList.add("is-animating");
    indicators[index].classList.add("is-active");

    const prev = (index - 1 + items.length) % items.length;
    const next = (index + 1) % items.length;

    modelPrev.innerText = names[prev];
    modelNext.innerText = names[next];

    current = index;
  }

  function goNext() {
    updateSlide((current + 1) % items.length);
  }
  function goPrev() {
    updateSlide((current - 1 + items.length) % items.length);
  }

  function startAutoPlay() {
    if (!autoPlay) return;
    interval = setInterval(goNext, 5000);
  }

  function stopAutoPlay() {
    clearInterval(interval);
  }

  toggleBtn.addEventListener("click", () => {
    autoPlay = !autoPlay;

    if (autoPlay) {
      toggleBtn.classList.remove("pause");
      startAutoPlay();
    } else {
      toggleBtn.classList.add("pause");
      stopAutoPlay();
    }
  });

  indicators.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index);
      stopAutoPlay();
      updateSlide(idx);
      startAutoPlay();
    });
  });

  prevBtn.addEventListener("click", () => {
    stopAutoPlay();
    goPrev();
    startAutoPlay();
  });

  nextBtn.addEventListener("click", () => {
    stopAutoPlay();
    goNext();
    startAutoPlay();
  });

  updateSlide(0);
  startAutoPlay();
});

// (2) quick-menu swiper ====================================================
document.addEventListener("DOMContentLoaded", () => {
  const quick = document.querySelector(".quick-menu");
  if (!quick) return;

  const qItems = quick.querySelectorAll(".el-carousel__item");
  const qPrevBtn = quick.querySelector(
    ".el-carousel__arrow--left.el-carousel__arrow--custom"
  );
  const qNextBtn = quick.querySelector(
    ".el-carousel__arrow--right.el-carousel__arrow--custom"
  );
  const qIndicatorLis = quick.querySelectorAll(".el-carousel__indicator");

  let qIndex = 0;
  let isFirstLoad = true;

  qItems.forEach((it, i) => {
    it.style.transition = "none";
    it.style.transform = i === 0 ? "translateX(0px)" : "translateX(720px)";
    it.classList.remove("is-prev", "is-active", "is-animating");
  });

  function updateQuickMenu(newIndex, animate = true) {
    const prev = qIndex;

    qItems.forEach((it) => it.classList.remove("is-active", "is-prev"));

    if (!isFirstLoad && animate) {
      qItems[newIndex].classList.add("is-animating");
      qItems[prev].classList.add("is-animating");
    }

    qItems[newIndex].style.transform = "translateX(0px)";
    qItems[newIndex].classList.add("is-active");

    if (!isFirstLoad) {
      qItems[prev].style.transform =
        newIndex > prev ? "translateX(-720px)" : "translateX(720px)";
      qItems[prev].classList.add("is-prev");
    }

    qIndicatorLis.forEach((li) => li.classList.remove("is-active"));
    qIndicatorLis[newIndex].classList.add("is-active");

    setTimeout(() => {
      qItems.forEach((it) => it.classList.remove("is-animating"));
    }, 100);

    qIndex = newIndex;
    isFirstLoad = false;
  }

  qNextBtn.addEventListener("click", () => {
    updateQuickMenu((qIndex + 1) % qItems.length);
  });

  qPrevBtn.addEventListener("click", () => {
    updateQuickMenu((qIndex - 1 + qItems.length) % qItems.length);
  });

  quick.querySelectorAll(".el-carousel__button").forEach((btn, idx) => {
    btn.addEventListener("click", () => updateQuickMenu(idx));
  });

  updateQuickMenu(0, false);
});
// (3) electric swiper ================================================
document.addEventListener("DOMContentLoaded", () => {
  const electric = document.querySelector(".electric-carousel");
  if (!electric) return;

  const items = electric.querySelectorAll(".el-carousel__item");
  const prevBtn = electric.querySelector(
    ".el-carousel__arrow--left.el-carousel__arrow--custom"
  );
  const nextBtn = electric.querySelector(
    ".el-carousel__arrow--right.el-carousel__arrow--custom"
  );
  const indicators = electric.querySelectorAll(".el-carousel__indicator");

  const ITEM_GAP = 352;
  const total = items.length;
  let index = 0;

  items.forEach((item, i) => {
    item.style.transition = "none";
    item.style.transform = `translateX(${i * ITEM_GAP}px) scale(1)`;
  });

  indicators[0].classList.add("is-active");

  requestAnimationFrame(() => {
    items.forEach((item) => (item.style.transition = ""));
  });

  function updateElectric(newIndex, animate = true) {
    items.forEach((item) => item.classList.remove("is-animating"));

    if (animate) {
      items.forEach((item) => item.classList.add("is-animating"));
    }

    items.forEach((item, i) => {
      const offset = ((i - newIndex + total) % total) * ITEM_GAP;
      item.style.transform = `translateX(${offset}px) scale(1)`;
    });

    indicators.forEach((li) => li.classList.remove("is-active"));
    indicators[newIndex].classList.add("is-active");

    index = newIndex;
  }

  nextBtn.addEventListener("click", () => {
    updateElectric((index + 1) % total);
  });

  prevBtn.addEventListener("click", () => {
    updateElectric((index - 1 + total) % total);
  });

  indicators.forEach((li, i) => {
    li.addEventListener("click", () => updateElectric(i));
  });
});
//  Tab ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const modelData = {
    all: [
      { rank: "1위.", name: "그랜저 Hybrid", img: "images/GN09_EXT.avif" },
      { rank: "2위.", name: "아반떼", img: "images/CN22_EXT.avif" },
      { rank: "3위.", name: "투싼", img: "images/NX17_EXT.avif" },
    ],
    age1: [
      { rank: "1위.", name: "아반떼", img: "images/CN22_EXT.avif" },
      { rank: "2위.", name: "싼타페 Hybrid", img: "images/MX08_EXT.avif" },
      { rank: "3위.", name: "투싼", img: "images/NX17_EXT.avif" },
    ],
    age2: [
      { rank: "1위.", name: "그랜저 Hybrid", img: "images/GN09_EXT.avif" },
      {
        rank: "2위.",
        name: "디 올 뉴 팰리세이드 Hybrid",
        img: "images/FX02_EXT.avif",
      },
      { rank: "3위.", name: "싼타페 Hybrid", img: "images/MX08_EXT.avif" },
    ],
    age3: [
      { rank: "1위.", name: "그랜저 Hybrid", img: "images/GN09_EXT.avif" },
      { rank: "2위.", name: "투싼", img: "images/NX17_EXT.avif" },
      { rank: "3위.", name: "아반떼", img: "images/CN22_EXT.avif" },
    ],
  };

  function updateModelRank(type) {
    const panels = document.querySelectorAll('[id^="tabPanel"]');
    const data = modelData[type];
    if (!data) return;

    panels.forEach((panel, i) => {
      const img = panel.querySelector("img");
      const txt = panel.querySelector(".txt");

      img.src = data[i].img;
      txt.innerHTML = `<span class="raking">${data[i].rank} </span>${data[i].name}`;
    });
  }

  const tabs = document.querySelectorAll(".slideinfo-list__link");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");

      updateModelRank(btn.dataset.type);
    });
  });
});
// scroll ===========================================================
$(".item-util")
  .has(".lang-select")
  .hover(
    function () {
      $(".lang-select").addClass("is-open");
      $(".header").addClass("isBgWhite");
    },
    function () {
      $(".lang-select").removeClass("is-open");
      $(".header").removeClass("isBgWhite");
    }
  );
$(".item-util")
  .has(".login-btn")
  .hover(
    function () {
      $(".login-btn").addClass("is-open");
      $(".header").addClass("isBgWhite");
    },
    function () {
      $(".login-btn").removeClass("is-open");
      $(".header").removeClass("isBgWhite");
    }
  );
// header & nav_bar
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  const navBar = document.querySelector(".nav_bar");

  const scrollTop = window.scrollY;
  const docHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrollPercent = scrollTop / docHeight;

  const progressWidth = Math.min(scrollPercent * 100, 100);

  if (scrollTop > 0) {
    header.classList.add("isFixed");
    navBar.classList.add("isFixed");
  } else {
    header.classList.remove("isFixed");
    navBar.classList.remove("isFixed");
  }

  navBar.style.width = `${progressWidth}%`;
});
