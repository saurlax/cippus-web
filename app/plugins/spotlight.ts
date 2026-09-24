import type { ObjectDirective } from "vue";

const CARD_SELECTOR = '[data-slot="root"]';
const ACTIVE_ATTRIBUTE = "data-spotlight-active";

const cleanups = new WeakMap<HTMLElement, () => void>();

// 挂在卡片容器上：鼠标在容器内移动时，找到当前悬停的卡片并写入指针坐标。
// 光斑本身由 app.vue 里的 [data-spotlight-active] 规则绘制，不改变布局与点击层。
const spotlight: ObjectDirective<HTMLElement> = {
  mounted(el) {
    if (import.meta.server) {
      return;
    }

    let activeCard: HTMLElement | null = null;
    let frame = 0;
    let pendingEvent: PointerEvent | null = null;

    const clearActive = () => {
      activeCard?.removeAttribute(ACTIVE_ATTRIBUTE);
      activeCard = null;
    };

    const paint = () => {
      frame = 0;
      const event = pendingEvent;
      pendingEvent = null;

      if (!event) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest<HTMLElement>(CARD_SELECTOR) || null;

      // 光标落在卡片之外（例如网格间隙）时，命中到的是容器外层的祖先节点
      if (!card || !el.contains(card)) {
        clearActive();
        return;
      }

      if (card !== activeCard) {
        clearActive();
        activeCard = card;
      }

      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
      card.setAttribute(ACTIVE_ATTRIBUTE, "");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      pendingEvent = event;
      if (!frame) {
        frame = requestAnimationFrame(paint);
      }
    };

    const onPointerLeave = () => {
      pendingEvent = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      clearActive();
    };

    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerleave", onPointerLeave, { passive: true });

    cleanups.set(el, () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (frame) {
        cancelAnimationFrame(frame);
      }
      clearActive();
    });
  },
  unmounted(el) {
    if (import.meta.server) {
      return;
    }

    cleanups.get(el)?.();
    cleanups.delete(el);
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("spotlight", spotlight);
});
