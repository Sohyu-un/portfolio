// Loaded in the head: establish reveal readiness before any page content can paint.
(() => {
  if (!('IntersectionObserver' in window) || typeof window.IntersectionObserver !== 'function' || !window.matchMedia) return;
  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!motion.matches) root.classList.add('cs-reveal-ready');

  const initialize = () => {
    try {
      const main = document.querySelector('.cs-main');
      if (!main) {
        root.classList.remove('cs-reveal-ready');
        return;
      }
      const targets = new Map();
      const played = new Set();
      const counted = new Set();
      const counters = new Map();
      const chartAnimations = new Set();
      let counterFrame = 0;

      const register = (selector, delay = 0, stagger = 0) => {
        main.querySelectorAll(selector).forEach((element, index) => {
          targets.set(element, delay + index * stagger);
        });
      };
      register('.cs-hero-copy, .cs-section-header, .cs-deposit-header, .cs-redesign-header, .cs-consent-header');
      register('.cs-overview-intro, .cs-deposit-preview, .cs-redesign-preview, .cs-consent-existing, .cs-consent-animation', 100);
      register('.cs-milestone', 100, 100);
      register('.cs-voc-chart', 100);
      register('.cs-voc-issue-group', 250, 100);
      register('.cs-voc-card', 300, 100);
      register('.cs-voc-insight');
      register('.cs-deposit-problem', 200, 100);
      register('.cs-deposit-quote', 200, 100);
      register('.cs-redesign-card', 200, 100);
      register('.cs-consent-problem-list > article', 200, 100);
      register('.cs-consent-quote', 200, 100);
      register('.cs-consent-solutions > article', 200, 100);
      register('.cs-flow-panel', 0, 100);
      register('.cs-edge-header, .cs-edge-values, .cs-edge-layout');

      // Keep the exact strings from the document as the authoritative final values.
      const metrics = new Map([...main.querySelectorAll(
        '.cs-voc-chart-total, .cs-voc-issue-heading strong, .cs-voc-issue-list dd'
      )].map(element => [element, element.textContent]));

      const finishCounters = () => {
        cancelAnimationFrame(counterFrame);
        counterFrame = 0;
        counters.clear();
        metrics.forEach((text, element) => { element.textContent = text; });
      };
      const tickCounters = time => {
        counters.forEach((counter, element) => {
          const progress = Math.max(0, Math.min(1, (time - counter.start) / 1000));
          // Ease out without changing the original final formatting or data.
          const text = progress === 1 ? counter.text : String(Math.floor(
            counter.value * (1 - Math.pow(1 - progress, 3))
          ));
          if (element.textContent !== text) element.textContent = text;
          if (progress === 1) counters.delete(element);
        });
        counterFrame = counters.size ? requestAnimationFrame(tickCounters) : 0;
      };
      const countMetrics = (target, delay) => {
        metrics.forEach((text, element) => {
          if (!target.contains(element) || counted.has(element)) return;
          counted.add(element);
          const value = Number(text.trim());
          if (!Number.isFinite(value)) return;
          counters.set(element, { text, value, start: performance.now() + delay });
        });
        if (counters.size && !counterFrame) counterFrame = requestAnimationFrame(tickCounters);
      };
      const drawChart = target => {
        if (!target.matches('.cs-voc-chart')) return;
        const sweep = target.querySelector('.cs-voc-chart-sweep');
        if (!sweep || !sweep.animate) return;
        // A single clockwise mask draws the unchanged 40/7/49 segments in order.
        const animation = sweep.animate([
          { strokeDasharray: '0 96' },
          { strokeDasharray: '96 0' }
        ], { duration: 1000, delay: 100, easing: 'ease-out', fill: 'backwards' });
        chartAnimations.add(animation);
        animation.onfinish = () => {
          animation.cancel();
          chartAnimations.delete(animation);
        };
      };

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.18) return;
          const target = entry.target;
          observer.unobserve(target);
          if (played.has(target)) return;
          played.add(target);
          if (motion.matches) {
            target.classList.add('cs-reveal-played');
            return;
          }
          try {
            target.style.animationDelay = `${targets.get(target)}ms`;
            target.classList.add('cs-reveal-played', 'cs-reveal-playing');
            drawChart(target);
            countMetrics(target, target.matches('.cs-voc-chart') ? 200 : targets.get(target));
          } catch {
            // Failed animation enhancement must never hide content or change metrics.
            observer.disconnect();
            root.classList.remove('cs-reveal-ready');
            targets.forEach((delay, element) => {
              played.add(element);
              element.classList.add('cs-reveal-played');
              element.classList.remove('cs-reveal-playing');
              element.style.removeProperty('animation-delay');
            });
            finishCounters();
            chartAnimations.forEach(animation => animation.cancel());
            chartAnimations.clear();
          }
        });
      }, { threshold: 0.18 });

      main.addEventListener('animationend', event => {
        if (event.animationName !== 'cs-scroll-in') return;
        event.target.classList.remove('cs-reveal-playing');
        event.target.style.removeProperty('animation-delay');
      });
      const configure = () => {
        observer.disconnect();
        if (motion.matches) {
          root.classList.remove('cs-reveal-ready');
          targets.forEach((delay, element) => {
            played.add(element);
            element.classList.add('cs-reveal-played');
            element.classList.remove('cs-reveal-playing');
            element.style.removeProperty('animation-delay');
          });
          finishCounters();
          chartAnimations.forEach(animation => animation.cancel());
          chartAnimations.clear();
        } else {
          targets.forEach((delay, element) => {
            if (!played.has(element)) observer.observe(element);
          });
        }
      };
      configure();
      motion.addEventListener('change', configure);
    } catch {
      // If setup fails, remove the early opt-in so no content remains hidden.
      root.classList.remove('cs-reveal-ready');
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();

// Edge Case Design: commit warning priority only after a completed move.
(() => {
  const initializeEdge = () => {
    const section = document.querySelector('.cs-edge');
    if (!section) return;
    const LIMIT = 25000;
    const MAX = 40000;
    const MOVE_MS = 900;
    const HOLD_MS = 2200;
    const states = [
      { deposit: 10000, entered: 20000, warning: 0 },
      { deposit: 10000, entered: 32000, warning: 0 },
      { deposit: 35000, entered: 30000, warning: 1 },
      { deposit: 30000, entered: 35000, warning: 1 }
    ];
    const position = value => (value / MAX) * 100;
    const deposit = section.querySelector('.cs-edge-deposit');
    const entered = section.querySelector('.cs-edge-entered');
    const limit = section.querySelector('.cs-edge-limit');
    const counter = section.querySelector('.cs-edge-counter');
    const warnings = section.querySelectorAll('.cs-edge-warning');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let target = 0;
    let phase = 'hold';
    let remaining = HOLD_MS;
    let deadline = 0;
    let timer = null;
    let visible = false;
    const canRun = () => visible && !document.hidden && !motion.matches;
    const place = state => {
      deposit.style.left = `${position(state.deposit)}%`;
      entered.style.left = `${position(state.entered)}%`;
    };
    const commit = () => {
      const state = states[index];
      counter.textContent = `${String(index + 1).padStart(2, '0')} / 04`;
      warnings.forEach((card, warning) => {
        card.classList.toggle('is-active', warning === state.warning);
        card.setAttribute('aria-current', String(warning === state.warning));
      });
      deposit.setAttribute('aria-label', `Deposit: $${state.deposit.toLocaleString('en-US')}`);
      entered.setAttribute('aria-label', `Entered Amount: $${state.entered.toLocaleString('en-US')}`);
    };
    const schedule = () => {
      if (!canRun() || timer !== null) return;
      if (phase === 'move') {
        section.style.setProperty('--cs-edge-move-ms', `${remaining}ms`);
        place(states[target]);
      }
      deadline = performance.now() + remaining;
      timer = window.setTimeout(() => {
        timer = null;
        if (phase === 'hold') {
          phase = 'move';
          target = (index + 1) % states.length;
          remaining = MOVE_MS;
        } else {
          index = target;
          commit();
          phase = 'hold';
          remaining = HOLD_MS;
        }
        schedule();
      }, remaining);
    };
    const pause = () => {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, deadline - performance.now());
      if (phase === 'move') {
        // Freeze rendered positions so neither marker continues while offscreen.
        const depositLeft = getComputedStyle(deposit).left;
        const enteredLeft = getComputedStyle(entered).left;
        section.style.setProperty('--cs-edge-move-ms', '0ms');
        deposit.style.left = depositLeft;
        entered.style.left = enteredLeft;
        void section.offsetWidth;
      }
    };
    const configure = () => {
      if (!canRun()) pause();
      if (motion.matches) {
        index = target = 0;
        phase = 'hold';
        remaining = HOLD_MS;
        section.style.setProperty('--cs-edge-move-ms', '0ms');
        place(states[0]);
        commit();
        void section.offsetWidth;
      } else {
        schedule();
      }
    };
    limit.style.left = `${position(LIMIT)}%`;
    place(states[0]);
    commit();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        configure();
      });
      observer.observe(section.querySelector('.cs-edge-layout'));
    }
    document.addEventListener('visibilitychange', configure);
    motion.addEventListener('change', configure);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEdge, { once: true });
  } else {
    initializeEdge();
  }
})();

// Purchase recording: restart on entry and retry after loading or user interaction.
(() => {
  const initializePurchase = () => {
    const video = document.querySelector('.cs-purchase-video');
    if (!video || !('IntersectionObserver' in window)) return;
    const preview = video.closest('.cs-purchase-preview');
    let visible = false;
    let requested = false;
    let pending = false;
    let restart = true;
    const update = () => {
      const shouldPlay = visible && !document.hidden;
      if (!shouldPlay) {
        requested = false;
        restart = true;
        video.pause();
        return;
      }
      requested = true;
      if (pending || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      if (restart) {
        video.currentTime = 0;
        restart = false;
      }
      if (!video.paused) return;
      video.muted = true;
      video.defaultMuted = true;
      pending = true;
      video.play().then(() => {
        if (!requested) video.pause();
      }).catch(() => {
        // Loading and interaction events below can retry a blocked request.
      }).finally(() => { pending = false; });
    };
    video.muted = true;
    video.defaultMuted = true;
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      update();
    });
    observer.observe(preview);
    video.addEventListener('loadeddata', update);
    video.addEventListener('canplay', update);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('pageshow', update);
    ['pointerdown', 'touchstart', 'scroll'].forEach(event => {
      window.addEventListener(event, update, { passive: true });
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePurchase, { once: true });
  } else {
    initializePurchase();
  }
})();
