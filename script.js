// JavaScript interactions will be added here as the portfolio develops.
// The current layout does not require JavaScript.
const heroTitle = document.querySelector(".hero-title");
const page = document.querySelector(".page");

function updateHeroLineBreak() {
  if (!heroTitle) return;

  // 먼저 systems 뒤에 줄바꿈을 적용한 상태로 줄 수를 확인
  heroTitle.classList.remove("use-natural-wrap");

  const styles = window.getComputedStyle(heroTitle);
  const lineHeight = parseFloat(styles.lineHeight);
  const heroHeight = heroTitle.getBoundingClientRect().height;
  const totalLines = Math.round(heroHeight / lineHeight);

  // 전체 Hero가 4줄 이상이면 systems 뒤 줄바꿈 제거
  heroTitle.classList.toggle("use-natural-wrap", totalLines >= 4);
}

if (page) {
  const resizeObserver = new ResizeObserver(updateHeroLineBreak);
  resizeObserver.observe(page);
}

window.addEventListener("load", updateHeroLineBreak);

if (document.fonts) {
  document.fonts.ready.then(updateHeroLineBreak);
}

const header = document.querySelector(".header");

function updateHeaderOnScroll() {
  if (!header) return;

  header.classList.toggle("is-scrolled", window.scrollY > 0);
}

window.addEventListener("scroll", updateHeaderOnScroll, {
  passive: true,
});

window.addEventListener("load", updateHeaderOnScroll);

const projectMediaImages = document.querySelectorAll(".project-media__image");

projectMediaImages.forEach((projectImage) => {
  const staticSrc = projectImage.dataset.static;
  const gifSrc = projectImage.dataset.gif;

  if (!staticSrc || !gifSrc) return;

  projectImage.addEventListener("mouseenter", () => {
    projectImage.src = `${gifSrc}?restart=${Date.now()}`;
  });
  projectImage.addEventListener("mouseleave", () => {
    projectImage.src = staticSrc;
  });
});
