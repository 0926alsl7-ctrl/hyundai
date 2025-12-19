// gsap , lensis 연결 ======================================================
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

// el-carousel__container 높이 계산  ==================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll(".el-carousel__container");

  function setCarouselHeight() {
    containers.forEach((container) => {
      const groups = container.querySelector(".el-carousel__groups");
      if (!groups) return;

      const height = groups.offsetHeight;
      container.style.height = height + "px";
    });
  }

  window.addEventListener("resize", setCarouselHeight);
  window.addEventListener("load", setCarouselHeight);
  setCarouselHeight();
});

// (1) 메인 swiper ================================================================================
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

  let startX = 0;
  let deltaX = 0;
  let isDragging = false;

  const SWIPE_THRESHOLD = 80; // 이 이상 움직여야 슬라이드 전환

  function onStart(x) {
    startX = x;
    deltaX = 0;
    isDragging = true;
    stopAutoPlay();
  }

  function onMove(x) {
    if (!isDragging) return;
    deltaX = x - startX;
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;

    if (deltaX > SWIPE_THRESHOLD) {
      goPrev();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      goNext();
    }

    startAutoPlay();
    deltaX = 0;
  }

  /* ====== mouse ====== */
  main.addEventListener("mousedown", (e) => {
    e.preventDefault();
    onStart(e.clientX);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    onMove(e.clientX);
  });

  window.addEventListener("mouseup", onEnd);

  /* ====== touch ====== */
  main.addEventListener(
    "touchstart",
    (e) => {
      onStart(e.touches[0].clientX);
    },
    { passive: true }
  );

  main.addEventListener(
    "touchmove",
    (e) => {
      onMove(e.touches[0].clientX);
    },
    { passive: true }
  );

  main.addEventListener("touchend", onEnd);

  updateSlide(0);
  startAutoPlay();
});

// (2) quick-menu swiper =============================================================================
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
// (3) electric swiper =================================================================================
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
// (4) Tab1 ==============================================================================================
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

  const tabs = document.querySelectorAll(
    ".slideinfo-list .slideinfo-list__link"
  );

  tabs.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      tabs.forEach((el) => el.classList.remove("is-tab-active"));
      btn.classList.add("is-tab-active");

      updateModelRank(btn.dataset.type);
    });
  });
});
// (5) Tab2 ==============================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const newsData = {
    all: [
      {
        img: "images/hqdefault_1.jpg",
        title:
          "[현대자동차 x 이찬혁] The Snowish Man (더스노우위시맨)│Main Film│현대자동차",
      },
      {
        img: "images/hqdefault_2.jpg",
        title:
          "2025 세계 장애인의 날, 조금 특별한 기상예보 | X-ble MEX | 현대자동차",
      },
      {
        img: "images/hqdefault_3.jpg",
        title:
          "[현대자동차 x 이찬혁] ‘We wish’ (The Snowish Man OST) | 현대자동차",
      },
      {
        img: "images/hqdefault_4.jpg",
        title:
          "[현대 SUV x 이명화] 당신을 아끼는 잔소리 처럼, 당신을 지키는 현대 SUV – 코나 편 | 현대자동차",
      },
    ],

    bluelink: [
      {
        img: "images/hqdefault_5.jpg",
        title: "Bluelink Store | 블루링크 스토어 런칭 | 현대자동차",
      },
      {
        img: "images/hqdefault_6.jpg",
        title: "Bluelink Store | 블루링크 스토어 사용 설명서 | 현대자동차",
      },
      {
        img: "images/hqdefault_7.jpg",
        title:
          "마이현대 | 하나로 통합된 현대자동차 공식 앱 - 국내 서비스 오픈 | 현대자동차",
      },
      {
        img: "images/hqdefault_8.jpg",
        title: "IONIQ | 알면 알수록 더 안심되니까 | 현대자동차",
      },
    ],
    firstcar: [
      {
        img: "images/hqdefault_9.jpg",
        title:
          "후회 없는 첫 차 선택, 이걸 알아야 진짜 아낀다?! | 현대로운 탐구생활 시즌 2 | 현대자동차",
      },
      {
        img: "",
        title: "",
      },
      {
        img: "",
        title: "",
      },
      {
        img: "",
        title: "",
      },
    ],
    hyundaishop: [
      {
        img: "images/hqdefault_10.jpg",
        title: "‘센스’가 필요할 땐, 현대샵에서 l 현대자동차",
      },
      {
        img: "images/hqdefault_11.jpg",
        title:
          "타고만 다니기 아까운 차, 200% 활용법 알아보기 | 현대로운 탐구생활 시즌 2 | 현대자동차",
      },
      {
        img: "images/hqdefault_12.jpg",
        title: "‘집밥’이 필요할 땐, 현대샵에서 l 현대자동차",
      },
      {
        img: "images/hqdefault_13.jpg",
        title: "‘정리’가 필요할 땐, 현대샵에서 l 현대자동차",
      },
    ],
    jannabi: [
      {
        img: "images/hqdefault_14.jpg",
        title:
          "‘아름다운 꿈’ by 잔나비 JANNABI (반짝이는 우정 레이싱 ver.) | 현대자동차",
      },
      {
        img: "images/hqdefault_15.jpg",
        title:
          "'아름다운 꿈' by 잔나비 JANNABI – Visualizer MV Teaser | 현대자동차",
      },
      {
        img: "",
        title: "",
      },
      {
        img: "",
        title: "",
      },
    ],
    hyundaicar: [
      {
        img: "images/hqdefault_1.jpg",
        title:
          "[현대자동차 x 이찬혁] The Snowish Man (더스노우위시맨)│Main Film│현대자동차",
      },
      {
        img: "images/hqdefault_2.jpg",
        title:
          "2025 세계 장애인의 날, 조금 특별한 기상예보 | X-ble MEX | 현대자동차",
      },
      {
        img: "images/hqdefault_3.jpg",
        title:
          "[현대자동차 x 이찬혁] ‘We wish’ (The Snowish Man OST) | 현대자동차",
      },
      {
        img: "images/hqdefault_16.jpg",
        title:
          "[현대 SUV x 이명화] 당신을 아끼는 잔소리 처럼, 당신을 지키는 현대 SUV – 코나 편 | 현대자동차",
      },
    ],
    hyundai: [
      {
        img: "images/hqdefault_17.jpg",
        title: "2025 인제 월드 투어링 카 페스티벌 l 현대자동차",
      },
      {
        img: "images/hqdefault_18.jpg",
        title:
          "현대 N 10주년 기념 필름 - 당신이 있어 N이 있습니다 l 현대자동차",
      },
      {
        img: "images/hqdefault_19.jpg",
        title: "IONIQ 6 N 월드 프리미어 | 현대자동차",
      },
      {
        img: "images/hqdefault_20.jpg",
        title: "아이오닉 6 N 티저ㅣ현대자동차",
      },
    ],
    about: [
      {
        img: "images/hqdefault_21.jpg",
        title: "NEXO의 러브콜에 유재석 님의 화답이 도착했습니다.ㅣ현대자동차",
      },
      {
        img: "images/hqdefault_22.jpg",
        title: "2025 서울모빌리티쇼 현대자동차관 | 현대자동차",
      },
      {
        img: "images/hqdefault_23.jpg",
        title: "The Great Journey, 수소로 움직이는 세상 | 현대자동차",
      },
      {
        img: "images/hqdefault_24.jpg",
        title: "2024 Hyundai Big Town 현장 스케치ㅣ현대자동차",
      },
    ],
    insteroid: [
      {
        img: "images/hqdefault_25.jpg",
        title: "현대자동차 x JDM: Japanese Drift Master 메인 필름 l 현대자동차",
      },
      {
        img: "images/hqdefault_26.jpg",
        title: "현대자동차 x JDM: Japanese Drift Master 티저 l 현대자동차",
      },
      {
        img: "",
        title: "",
      },
      {
        img: "",
        title: "",
      },
    ],
    ioniq: [
      {
        img: "images/hqdefault_27.jpg",
        title: "제 1회 현대차력쇼 : 차능력자를 찾습니다 | 현대자동차",
      },
      {
        img: "images/hqdefault_11.jpg",
        title:
          "타고만 다니기 아까운 차, 200% 활용법 알아보기 | 현대로운 탐구생활 시즌 2 | 현대자동차",
      },
      {
        img: "images/hqdefault_19.jpg",
        title: "IONIQ 6 N 월드 프리미어 | 현대자동차",
      },
      {
        img: "images/hqdefault_28.jpg",
        title: "First glance at IONIQ 6 N | 현대자동차",
      },
    ],
    ev: [
      {
        img: "images/hqdefault_29.jpg",
        title: "2025 코나 일렉트릭 트림, 옵션, 가격 완벽 정리 | 현대자동차",
      },
      {
        img: "images/hqdefault_30.jpg",
        title: "더 뉴 아이오닉 6 트림, 옵션, 가격 완벽 정리 | 현대자동차",
      },
      {
        img: "images/hqdefault_31.jpg",
        title: "넥쏘 편의사양 및 파워트레인 알아보기 I 현대자동차",
      },
      {
        img: "images/hqdefault_21.jpg",
        title: "NEXO의 러브콜에 유재석 님의 화답이 도착했습니다.ㅣ현대자동차",
      },
    ],
  };
  const tagButtons = document.querySelectorAll(".btn-tag");
  const boxNewsList = document.querySelectorAll(".box-news");

  tagButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;

      document.querySelectorAll(".tag").forEach((tag) => {
        tag.classList.remove("select");
      });
      btn.querySelector(".tag").classList.add("select");

      boxNewsList.forEach((box, index) => {
        const data = newsData[key][index];
        const imgWrap = box.querySelector(".img-wrap");
        const descText = box.querySelector(".box-desc-text");

        if (!data || !data.img) {
          box.style.display = "none";
          return;
        }

        box.style.display = "block";
        imgWrap.style.backgroundImage = `url(${data.img})`;
        descText.textContent = data.title;
      });
    });
  });
});
// (6) scroll events ================================================================================================
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
// scroll events =>  header / nav_bar ==========================================================
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

// scroll events =>  footer / area-floating ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const floating = document.querySelector(".area-floating");
  const footer = document.querySelector("#footer");

  if (!floating || !footer) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          floating.classList.add("mode-footer-show");
        } else {
          floating.classList.remove("mode-footer-show");
        }
      });
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  observer.observe(footer);
});

// (7) mobile 구조변경 - tab area ==================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const tapArea = document.querySelector(".tap-area");
  const innerWrap = document.querySelector(".inner_wrap");
  const topArea = innerWrap.querySelector(".top-area");

  function toMobile() {
    if (tapArea.classList.contains("is-mobile")) return;
    tapArea.classList.add("is-mobile");
    topArea.classList.add("top-mobile-area");
  }

  function toPC() {
    tapArea.classList.remove("is-mobile");
    topArea.classList.remove("top-mobile-area");
  }

  function checkViewport() {
    if (window.innerWidth <= 767) {
      toMobile();
    } else {
      toPC();
    }
  }

  window.addEventListener("resize", checkViewport);
  checkViewport();
});
// (8) pc-gnb 메뉴바 이동 ==================================================================================
const navBar = document.querySelector(".nav_bar");
const bar = document.querySelector("span.bar");
const utilWrap = document.querySelector(".util_wrap");
const logo = document.querySelector(".header .logo");

// ================= bar 이동 =================
function moveBarTo(li) {
  if (!bar || !li) return;

  const rect = li.getBoundingClientRect();

  bar.style.opacity = "1";
  bar.style.width = `${rect.width}px`;
  bar.style.left = `${rect.left}px`;
}

window.addEventListener("resize", () => {
  const active = document.querySelector(".lnb_sub_list.on");
  if (active) {
    moveBarTo(active);
  }
});

// ================= pc - gnb  =================
document.addEventListener("DOMContentLoaded", () => {
  const lnbItems = document.querySelectorAll(
    ".lnb_sub_list.lnb_02, .lnb_sub_list.lnb_03, .lnb_sub_list.lnb_04, .lnb_sub_list.lnb_05"
  );

  function closeAll() {
    lnbItems.forEach((li) => li.classList.remove("on"));
    header.classList.remove("isBgWhite");
    dimmed.classList.remove("show");
    navBar.classList.remove("is-hidden");

    if (bar) {
      bar.style.opacity = "0";
      bar.style.width = "0";
    }
  }

  lnbItems.forEach((li) => {
    li.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (li.classList.contains("on")) {
        closeAll();
        return;
      }

      closeAll();

      li.classList.add("on");
      header.classList.add("isBgWhite");
      dimmed.classList.add("show");
      navBar.classList.add("is-hidden");

      moveBarTo(li);
    });

    li.querySelector(".btn_close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAll();
    });
  });

  logo.addEventListener("click", closeAll);
  utilWrap.addEventListener("mouseenter", closeAll);
  dimmed.addEventListener("click", closeAll);
});
// ====== mobile 메뉴 sub wrap ======
document.addEventListener("DOMContentLoaded", () => {
  const depthItems = document.querySelectorAll(
    ".lnb_menu .sub_contents .depth1 > li"
  );

  depthItems.forEach((li) => {
    li.addEventListener("click", (e) => {
      if (window.innerWidth > 767) return;

      e.stopPropagation();

      depthItems.forEach((item) => {
        if (item !== li) item.classList.remove("on");
      });

      li.classList.toggle("on");
    });
  });
});
const isMobile = () => window.innerWidth <= 767;

const header = document.querySelector(".header");
const dimmed = document.querySelector(".dimmed");
// ============================= moibile 검색 / 메뉴 버튼 ==================================
// const isMobile = () => window.innerWidth <= 767;
// const mobileSearchOpen = document.querySelector(
//   ".mobile-controller .search-btn"
// );
// const mobileSearchForm = document.querySelector(".m-search");
// const mobileMenuOpen = document.querySelector(".mobile-controller .menu-btn");

// const header = document.querySelector(".header");
// const dimmed = document.querySelector(".dimmed");

// function closeSearch() {
//   mobileSearchForm.classList.remove("on");
//   header.classList.remove("isSearch");
// }

// function closeMenu() {
//   header.classList.remove("isOpen");

//   mobileMenuOpen.querySelector(".menu-ico")?.classList.remove("is-active");
//   document.querySelector(".nav_bar")?.classList.remove("is-hidden");
//   document.querySelector(".header .logo svg")?.classList.remove("color-white");
// }

// function updateDimmed() {
//   dimmed.classList.toggle(
//     "show",
//     header.classList.contains("isSearch") || header.classList.contains("isOpen")
//   );
// }

// mobileSearchOpen.addEventListener("click", () => {
//   if (!isMobile()) return;

//   const isSearchOpen = header.classList.contains("isSearch");

//   closeMenu();

//   if (isSearchOpen) {
//     closeSearch();
//   } else {
//     mobileSearchForm.classList.add("on");
//     header.classList.add("isSearch");
//   }

//   updateDimmed();
// });

// mobileMenuOpen.addEventListener("click", () => {
//   if (!isMobile()) return;
//   const isMenuOpen = header.classList.contains("isOpen");

//   closeSearch();

//   if (isMenuOpen) {
//     closeMenu();
//   } else {
//     header.classList.add("isOpen");

//     mobileMenuOpen.querySelector(".menu-ico")?.classList.add("is-active");
//     document.querySelector(".nav_bar")?.classList.add("is-hidden");
//     document.querySelector(".header .logo svg")?.classList.add("color-white");
//   }

//   updateDimmed();
// });
const mobileSearchOpen = document.querySelector(
  ".mobile-controller .search-btn"
);
const mobileSearchForm = document.querySelector(".m-search");
const mobileMenuOpen = document.querySelector(".mobile-controller .menu-btn");

function closeMobileSearch() {
  mobileSearchForm.classList.remove("on");
  header.classList.remove("isSearch");
}

function closeMobileMenu() {
  header.classList.remove("isOpen");

  mobileMenuOpen.querySelector(".menu-ico")?.classList.remove("is-active");
  document.querySelector(".nav_bar")?.classList.remove("is-hidden");
  document.querySelector(".header .logo svg")?.classList.remove("color-white");
}

function updateMobileDimmed() {
  dimmed.classList.toggle(
    "show",
    header.classList.contains("isSearch") || header.classList.contains("isOpen")
  );
}

mobileSearchOpen.addEventListener("click", () => {
  if (!isMobile()) return;

  const opened = header.classList.contains("isSearch");
  closeMobileMenu();

  opened
    ? closeMobileSearch()
    : (mobileSearchForm.classList.add("on"), header.classList.add("isSearch"));

  updateMobileDimmed();
});

mobileMenuOpen.addEventListener("click", () => {
  if (!isMobile()) return;

  const opened = header.classList.contains("isOpen");
  closeMobileSearch();

  opened
    ? closeMobileMenu()
    : (header.classList.add("isOpen"),
      mobileMenuOpen.querySelector(".menu-ico")?.classList.add("is-active"),
      document.querySelector(".nav_bar")?.classList.add("is-hidden"),
      document
        .querySelector(".header .logo svg")
        ?.classList.add("color-white"));

  updateMobileDimmed();
});

dimmed.addEventListener("click", () => {
  if (!isMobile()) return;
  closeMobileSearch();
  closeMobileMenu();
  updateMobileDimmed();
});
// search - tab 버튼 ==========================================================
const tabItems = document.querySelectorAll(".m-search__tab .tab-menu__icon");
const tabLists = document.querySelectorAll(".m-tab__list");

tabItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    tabItems.forEach((i) => {
      i.classList.remove("active");
      i.querySelector("button").classList.remove("active");
    });
    tabLists.forEach((list) => list.classList.remove("show"));

    item.classList.add("active");
    item.querySelector("button").classList.add("active");
    tabLists[index].classList.add("show");
  });
});
dimmed.addEventListener("click", () => {
  closeSearch();
  closeMenu();
  updateDimmed();
});

// pc search ==============================================================
// document.addEventListener("DOMContentLoaded", () => {
//   const header = document.querySelector(".header");
//   const dimmed = document.querySelector(".dimmed");
//   const loginBtn = document.querySelector(".btn-login");
//   const languageBtn = document.querySelector(".lang-select");

//   const searchBtn = document.querySelector(".btn_search");
//   const searchWrap = document.querySelector(".search_wrap");
//   const searchInput = searchWrap?.querySelector(".search__bar");

//   const recentSearch = searchWrap?.querySelector(".recent-search");
//   const btnDel = searchWrap?.querySelector(".btn_del");
//   const btnClose = searchWrap?.querySelector(".btn_close");

//   let recentTimer = null;

//   /* ================= 공통 닫기 ================= */
//   function closeSearch() {
//     searchWrap.classList.remove("on");
//     header.classList.remove("isSearch", "isBgWhite");
//     updateDimmed();

//     if (recentTimer) {
//       clearTimeout(recentTimer);
//       recentTimer = null;
//     }

//     recentSearch?.classList.remove("show");
//   }

//   /* ================= recent-search 자동 숨김 ================= */
//   function showRecentTemporarily() {
//     if (!recentSearch) return;

//     recentSearch.classList.add("show");

//     if (recentTimer) clearTimeout(recentTimer);

//     recentTimer = setTimeout(() => {
//       recentSearch.classList.remove("show");
//     }, 2500);
//   }

//   /* ================= 검색 버튼 클릭 ================= */
//   searchBtn?.addEventListener("click", () => {
//     searchWrap.classList.add("on");
//     header.classList.add("isSearch", "isBgWhite");
//     updateDimmed();

//     showRecentTemporarily();
//   });

//   /* ================= input 클릭 시 recent-search ================= */
//   searchInput?.addEventListener("focus", () => {
//     if (!recentSearch) return;
//     recentSearch.classList.add("show");
//   });

//   /* ================= recent 삭제 ================= */
//   btnDel?.addEventListener("click", (e) => {
//     e.stopPropagation();
//     recentSearch?.classList.remove("show");
//   });

//   /* ================= 닫기 버튼 ================= */
//   btnClose?.addEventListener("click", closeSearch);

//   /* ================= dimmed 클릭 ================= */
//   dimmed?.addEventListener("click", closeSearch);
// });
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.querySelector(".btn_search");
  const searchWrap = document.querySelector(".search_wrap");
  const searchInput = searchWrap?.querySelector(".search__bar");

  const recentSearch = searchWrap?.querySelector(".recent-search");
  const btnDel = searchWrap?.querySelector(".btn_del");
  const btnClose = searchWrap?.querySelector(".btn_close");

  const loginBtn = document.querySelector(".btn-login");
  const languageBtn = document.querySelector(".lang-select");

  let recentTimer = null;

  /* ===== PC 검색 닫기 ===== */
  function closePcSearch() {
    searchWrap.classList.remove("on");
    header.classList.remove("isSearch", "isBgWhite");
    dimmed.classList.remove("show");

    if (recentTimer) clearTimeout(recentTimer);
    recentSearch?.classList.remove("show");
  }

  /* ===== recent 자동 숨김 ===== */
  function showRecentTemporarily() {
    recentSearch?.classList.add("show");

    if (recentTimer) clearTimeout(recentTimer);
    recentTimer = setTimeout(() => {
      recentSearch?.classList.remove("show");
    }, 2500);
  }

  /* ===== 검색 버튼 ===== */
  searchBtn?.addEventListener("click", () => {
    if (isMobile()) return;

    searchWrap.classList.add("on");
    header.classList.add("isSearch", "isBgWhite");
    dimmed.classList.add("show");

    showRecentTemporarily();
  });

  /* ===== input 포커스 ===== */
  searchInput?.addEventListener("focus", () => {
    recentSearch?.classList.add("show");
  });

  /* ===== recent 삭제 ===== */
  btnDel?.addEventListener("click", (e) => {
    e.stopPropagation();
    recentSearch?.classList.remove("show");
  });

  /* ===== 닫기 버튼 ===== */
  btnClose?.addEventListener("click", closePcSearch);

  /* ===== dimmed ===== */
  dimmed?.addEventListener("click", () => {
    if (isMobile()) return;
    closePcSearch();
  });

  /* 🔥 로그인 / 언어 hover 시 강제 종료 🔥 */
  loginBtn?.addEventListener("mouseenter", closePcSearch);
  languageBtn?.addEventListener("mouseenter", closePcSearch);
});
// =============================== (7) mobile 구조변경 - gnb_wrap item- util
function buildMobileUtil() {
  const util = document.querySelector(".util_wrap .util");
  if (!util || util.dataset.built === "true") return;

  util.dataset.built = "true"; // 중복 실행 방지
  util.innerHTML = "";

  // (1) 개인 로그인
  const item1 = document.createElement("div");
  item1.className = "item-util";
  const a1 = document.createElement("a");
  a1.className = "btn-login";
  a1.textContent = "개인 로그인";
  item1.appendChild(a1);

  // (2) 법인 로그인
  const item2 = document.createElement("div");
  item2.className = "item-util";
  const a2 = document.createElement("a");
  a2.className = "btn-login";
  a2.textContent = "법인 로그인";
  item2.appendChild(a2);

  // (3) 언어
  const item3 = document.createElement("div");
  item3.className = "item-util";

  const langBtn = document.createElement("button");
  langBtn.className = "lang-select";
  langBtn.textContent = "KR";

  const langWrap = document.createElement("div");
  langWrap.className = "lang_wrap";

  const ul = document.createElement("ul");

  ["EN", "CN", "월드와이드", "상용글로벌"].forEach((text) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = text;
    li.appendChild(a);
    ul.appendChild(li);
  });

  langWrap.appendChild(ul);
  item3.append(langBtn, langWrap);

  util.append(item1, item2, item3);
}

// (7) gnb_wrap item- util =======================================================================
const observer = new MutationObserver(() => {
  if (header.classList.contains("isOpen") && window.innerWidth <= 767) {
    buildMobileUtil();
  }
});

observer.observe(header, {
  attributes: true,
  attributeFilter: ["class"],
});

document.addEventListener("click", (e) => {
  const langBtn = e.target.closest(".lang-select");
  if (!langBtn) return;

  langBtn.classList.toggle("is-open");
});

// (7) mobile 구조변경 - quick-menu ==================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const BREAKPOINT = 767;
  const quickMenu = document.querySelector(".quick-menu");

  let isMobile = false;
  const originalHTML = quickMenu.innerHTML;

  function toMobile() {
    if (isMobile) return;
    isMobile = true;

    const items = quickMenu.querySelectorAll(".menu-icon");

    quickMenu.innerHTML = "";

    const item = document.createElement("div");
    item.className = "el-carousel__item";

    const ul = document.createElement("ul");
    ul.className = "items-wrap";

    items.forEach((li) => ul.appendChild(li));
    item.appendChild(ul);
    quickMenu.appendChild(item);
  }

  function toPC() {
    if (!isMobile) return;
    isMobile = false;
    quickMenu.innerHTML = originalHTML;
  }

  function check() {
    window.innerWidth <= BREAKPOINT ? toMobile() : toPC();
  }

  window.addEventListener("resize", check);
  check();
});
// (7) mobile 구조변경 - box-list-slide ==================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const BREAKPOINT = 767;
  const sliders = document.querySelectorAll(".box-list-slide");

  sliders.forEach((slider) => {
    const container = slider.querySelector(".el-carousel__container");
    const layer = slider.querySelector(".el-carousel__layer");
    if (!container || !layer) return;

    const originalHTML = layer.innerHTML;
    let isMobile = false;
    let currentIndex = 0;

    const prevBtn = slider.querySelector(".el-carousel__arrow--left");
    const nextBtn = slider.querySelector(".el-carousel__arrow--right");

    function toMobile() {
      if (isMobile) return;
      isMobile = true;

      const item = layer.querySelector(".el-carousel__item");
      if (!item) return;

      const units = [...item.querySelectorAll(".el-carousel__unit")];
      layer.innerHTML = "";

      units.forEach((unit) => {
        const newItem = document.createElement("div");
        newItem.className = "el-carousel__item";

        const groups = document.createElement("ul");
        groups.className = "el-carousel__groups";

        groups.appendChild(unit);
        newItem.appendChild(groups);
        layer.appendChild(newItem);
      });

      currentIndex = 0;
      createIndicators(layer.children.length);
      updatePositions();
      updateButtons();
    }

    function toPC() {
      if (!isMobile) return;
      isMobile = false;
      layer.innerHTML = originalHTML;

      const ind = slider.querySelector(".el-carousel__indicators");
      if (ind) ind.remove();
    }

    /* ================= 이동 ================= */
    function updatePositions() {
      const items = layer.querySelectorAll(".el-carousel__item");
      const width = container.clientWidth;

      items.forEach((item, index) => {
        const x = (index - currentIndex) * width;
        item.style.transform = `translateX(${x}px)`;
        item.classList.toggle("is-animating", index === currentIndex);
      });
    }

    function moveTo(index) {
      const count = layer.children.length;

      if (!slider.classList.contains("is-loop")) {
        if (index < 0 || index >= count) return;
      }

      if (index < 0) index = count - 1;
      if (index >= count) index = 0;

      currentIndex = index;
      updatePositions();
      updateIndicators();
      updateButtons();
    }

    /* ================= Indicator ================= */
    function createIndicators(count) {
      const old = slider.querySelector(".el-carousel__indicators");
      if (old) old.remove();

      const ul = document.createElement("ul");
      ul.className = "el-carousel__indicators el-carousel__indicators--outside";

      for (let i = 0; i < count; i++) {
        const li = document.createElement("li");
        li.className = "el-carousel__indicator";

        const btn = document.createElement("button");
        btn.className = "el-carousel__button";

        li.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          moveTo(i);
        });

        li.appendChild(btn);
        ul.appendChild(li);
      }

      slider.appendChild(ul);
      updateIndicators();
    }

    function updateIndicators() {
      const dots = slider.querySelectorAll(".el-carousel__indicator");
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentIndex);
      });
    }

    /* ================= 버튼 ================= */
    function updateButtons() {
      if (!prevBtn || !nextBtn) return;
      if (slider.classList.contains("is-loop")) return;

      const count = layer.children.length;
      prevBtn.style.display = currentIndex === 0 ? "none" : "";
      nextBtn.style.display = currentIndex === count - 1 ? "none" : "";
    }

    prevBtn?.addEventListener("click", () => moveTo(currentIndex - 1));
    nextBtn?.addEventListener("click", () => moveTo(currentIndex + 1));
    /* ================= 터치 스와이프 ================= */
    let startX = 0;
    let deltaX = 0;
    let isDragging = false;

    layer.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    layer.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      deltaX = e.touches[0].clientX - startX;
    });

    layer.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;

      const threshold = container.clientWidth * 0.2;

      if (deltaX > threshold) {
        moveTo(currentIndex - 1);
      } else if (deltaX < -threshold) {
        moveTo(currentIndex + 1);
      }

      deltaX = 0;
    });
    /* ================= 반응형 ================= */
    function check() {
      window.innerWidth <= BREAKPOINT ? toMobile() : toPC();
    }

    window.addEventListener("resize", check);
    check();
  });
});
// (7) mobile 구조변경 - electric section ==================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const BREAKPOINT = 767;

  document.querySelectorAll(".electric-carousel").forEach((carousel) => {
    const originalHTML = carousel.innerHTML; // ⭐ PC 구조 저장
    let isMobile = false;

    function transformToMobile() {
      if (isMobile) return;
      isMobile = true;

      const oldList = carousel.querySelector(".electric-lists");
      if (!oldList) return;

      const boxes = oldList.querySelectorAll(".electric-box");
      if (!boxes.length) return;

      const newUl = document.createElement("ul");
      newUl.className = "electric-lists";

      boxes.forEach((box) => {
        const li = document.createElement("li");
        li.className = "electric-item";
        li.appendChild(box);
        newUl.appendChild(li);
      });

      oldList.remove();
      carousel.appendChild(newUl);
    }

    function restoreToPC() {
      if (!isMobile) return;
      isMobile = false;

      carousel.innerHTML = originalHTML; // ⭐ 구조 완전 복구
    }

    function check() {
      if (window.innerWidth <= BREAKPOINT) {
        transformToMobile();
      } else {
        restoreToPC();
      }
    }

    check();
    window.addEventListener("resize", check);
  });
});
// (8) footer 버튼 토글 ==========================================================================
const footerToggleBtn = document.querySelector(
  ".wrap-footer .wrap-menu-toggle .area-icon"
);
const companyMenu = document.querySelector(
  ".wrap-footer .menu-list-company.pc-toggle"
);
const mobileToggleBtn = document.querySelector(
  ".wrap-footer .wrap-menu-toggle .button-toggle"
);
const mobileMenuWrap = document.querySelector(".wrap-footer .wrap-menu-toggle");

footerToggleBtn.addEventListener("click", () => {
  footerToggleBtn.classList.toggle("pc-on");
  companyMenu.classList.toggle("on");
});

mobileToggleBtn.addEventListener("click", () => {
  mobileToggleBtn.classList.toggle("on");
  mobileMenuWrap.classList.toggle("on");
});

const familyBtn = document.querySelector(".family-site .family-site-btn");
const familyList = document.querySelector(".family-site .site-list");
const footerBottom = document.querySelector("#footer .footer-bottom");

familyBtn.addEventListener("click", () => {
  familyList.classList.toggle("on");
  footerBottom.classList.toggle("list-on");
});
