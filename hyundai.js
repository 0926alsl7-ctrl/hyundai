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
// swiper==========================
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".kv-main .el-carousel__item");
  const prevBtn = document.querySelector(
    ".kv-main .el-carousel__arrow--left.el-carousel__arrow--custom"
  );
  const nextBtn = document.querySelector(
    ".kv-main .el-carousel__arrow--right.el-carousel__arrow--custom"
  );
  const modelPrev = document.querySelector(".prev-model-name");
  const modelNext = document.querySelector(".next-model-name");
  const indicatorWrap = document.querySelector(".slideinfo-list");
  const toggleBtn = document.querySelector(".btn-control--toggle");

  let current = 0;
  let autoPlay = true;
  let interval = null;

  const names = Array.from(items).map((item) =>
    item.querySelector(".car-name")?.innerText.trim()
  );

  // ▶ 인디케이터(동그라미) 동적으로 생성
  indicatorWrap.innerHTML = "";
  names.forEach((_, i) => {
    const li = document.createElement("li");
    li.classList.add("slideinfo-list__item");
    li.innerHTML = `<button class="slideinfo-list__link" data-index="${i}"></button>`;
    indicatorWrap.appendChild(li);
  });
  const indicators = document.querySelectorAll(".slideinfo-list__link");

  // ▶ 슬라이드 변경 함수
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

  // ★ 초기 상태 강제 리셋
  qItems.forEach((it, i) => {
    it.style.transition = "none"; // 초기 딜레이 없음
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
