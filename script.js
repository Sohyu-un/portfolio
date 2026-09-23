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

function restartHeroGif() {
  const heroGif = document.querySelector(".project-hero__image");

  if (!heroGif) return;

  const originalSrc = heroGif.getAttribute("src").split("?")[0];
  heroGif.setAttribute("src", `${originalSrc}?restart=${Date.now()}`);
}

window.addEventListener("pageshow", restartHeroGif);
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
const menuButton = document.querySelector(".menu-button");
const primaryNav = document.querySelector("#primary-nav");

if (menuButton && primaryNav && header) {
  menuButton.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("is-open");

    header.classList.toggle("is-menu-open", isOpen);

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation",
    );
    menuButton.classList.toggle("is-open", isOpen);
  });
}

const projectSections = document.querySelectorAll(".project-section");
const projectToc = document.querySelector(".project-toc");

if (projectSections.length > 0 && projectToc) {
  projectSections.forEach((section, index) => {
    const sectionId = `project-section-${index + 1}`;

    section.id = sectionId;
  });

  const tocHeader = projectToc.parentElement;
  tocHeader?.classList.add("project-section__header--toc");
  const updateProjectTocPosition = () => {
    const summaryTop = projectSections[0].getBoundingClientRect().top;

    projectToc.classList.toggle("is-fixed", summaryTop <= 80);
  };

  const projectTocLinks = projectToc.querySelectorAll(".project-toc__link");

  projectTocLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const targetSection = targetId ? document.querySelector(targetId) : null;

      if (!targetSection) return;

      event.preventDefault();
      history.pushState(null, "", targetId);

      targetSection.classList.remove("is-toc-target");
      requestAnimationFrame(() => {
        targetSection.classList.add("is-toc-target");
      });

      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  const updateProjectToc = (activeSection) => {
    projectTocLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === `#${activeSection.id}`,
      );
    });
  };

  const tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateProjectToc(entry.target);
      });
    },
    {
      rootMargin: "-35% 0px -55%",
      threshold: 0,
    },
  );

  updateProjectToc(projectSections[0]);
  projectSections.forEach((section) => tocObserver.observe(section));
  window.addEventListener("scroll", updateProjectTocPosition, {
    passive: true,
  });
  window.addEventListener("load", updateProjectTocPosition);
  updateProjectTocPosition();
}

const revealTargets = document.querySelectorAll(
  [
    ".hero-title",
    ".project-card",
    ".project-introduction__main",
    ".project-meta",
    ".project-section__header",
    ".project-section__content",
    ".media-detail__visual",
    ".media-detail__content",
    ".image-grid__item",
  ].join(", "),
);

if (revealTargets.length > 0) {
  revealTargets.forEach((element) => {
    element.classList.add("scroll-reveal");

    if (element.matches("img, .project-media")) {
      element.classList.add("scroll-reveal--image");
    }
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px",
      },
    );

    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }
}

(function () {
  const video = document.getElementById("portfolioVideo");
  if (!video) return;

  // 소리 차단을 완벽하게 무력화하기 위해 한 번 더 선언
  video.muted = true;
  video.defaultMuted = true;

  function forcePlay() {
    if (video.paused) {
      video
        .play()
        .then(() => {
          // 자동 재생 성공 시 이벤트 리스너들 제거
          window.removeEventListener("scroll", forcePlay);
          window.removeEventListener("mousemove", forcePlay);
          window.removeEventListener("touchstart", forcePlay);
        })
        .catch((err) =>
          console.log("Autoplay blocked, retrying on next action."),
        );
    }
  }

  // 유저가 페이지에서 행동을 취하는 순간 강제로 autoplay 트리거 작동
  window.addEventListener("scroll", forcePlay, { passive: true });
  window.addEventListener("mousemove", forcePlay, { passive: true });
  window.addEventListener("touchstart", forcePlay, { passive: true }); // 모바일용
})(); // 기존 스크립트 맨 밑의 (function() { ... })(); 코드를 지우고
// 아래 코드를 맨 밑에 붙여넣으세요.

if ("IntersectionObserver" in window) {
  const video = document.getElementById("portfolioVideo");

  if (video) {
    // 비디오용 개별 옵저버 생성: 화면에 10% 이상 등장하면 트리거
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.muted = true;
            video.defaultMuted = true;

            // 화면에 나타나는 즉시 재생 시도
            video.play().catch((err) => {
              // 최초 실패 시 유저가 스크롤 중이므로 액션 이벤트로 재촉발
              const runOnAction = () => {
                video.play();
                window.removeEventListener("scroll", runOnAction);
                window.removeEventListener("touchstart", runOnAction);
              };
              window.addEventListener("scroll", runOnAction, { passive: true });
              window.addEventListener("touchstart", runOnAction, {
                passive: true,
              });
            });

            // 한 번 재생되면 감시 종료
            videoObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    videoObserver.observe(video);
  }
}
