/**
 * MARKA RATING TRUST WIDGET INTERACTIONS
 * Isolated vanilla JavaScript block to manage premium interactions:
 * - Debounced hover / mouseleave delayed closing (anti-flicker).
 * - Focus-based popover activation for keyboard navigation.
 * - Esc key immediately closes the dialog.
 * - Backdrop overlay support for mobile viewports.
 * - Accessibility (ARIA attributes, aria-expanded, tabindex, role="dialog").
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const triggers = document.querySelectorAll(".js-marka-trigger");
    const popovers = document.querySelectorAll(".js-marka-popover");
    const backdrops = document.querySelectorAll(".js-marka-backdrop");
    const closeBtns = document.querySelectorAll(".js-marka-close");

    if (!triggers.length || !popovers.length) return;

    let closeTimeout = null;
    let lastOpenedTime = 0;
    const CLOSE_DELAY = 250; // Milliseconds to wait before closing (debounce)

    /**
     * Shows the premium trust popover and backdrop overlay
     */
    function showPopover(trigger, popover, backdrop) {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }

      // Close all other popovers first to be safe
      closeAll();

      popover.classList.add("is-active");
      trigger.setAttribute("aria-expanded", "true");
      lastOpenedTime = Date.now();

      if (backdrop) {
        backdrop.classList.add("is-active");
      }
    }

    /**
     * Hides the popover with a slight delay to allow smooth mouse transfer
     */
    function hidePopoverWithDelay(trigger, popover, backdrop) {
      if (closeTimeout) clearTimeout(closeTimeout);

      closeTimeout = setTimeout(() => {
        popover.classList.remove("is-active");
        trigger.setAttribute("aria-expanded", "false");
        if (backdrop) {
          backdrop.classList.remove("is-active");
        }
      }, CLOSE_DELAY);
    }

    /**
     * Instantly hides all popovers and backdrops
     */
    function closeAll() {
      if (closeTimeout) clearTimeout(closeTimeout);

      triggers.forEach(trigger => trigger.setAttribute("aria-expanded", "false"));
      popovers.forEach(popover => popover.classList.remove("is-active"));
      backdrops.forEach(backdrop => backdrop.classList.remove("is-active"));
    }

    // Set up listeners for each widget instances
    triggers.forEach((trigger, idx) => {
      const popover = popovers[idx];
      const backdrop = backdrops[idx];
      const closeBtn = closeBtns[idx];

      if (!popover) return;

      // Mouse Hover Events (Desktop UX)
      trigger.addEventListener("mouseenter", () => showPopover(trigger, popover, backdrop));
      trigger.addEventListener("mouseleave", () => hidePopoverWithDelay(trigger, popover, backdrop));
      popover.addEventListener("mouseenter", () => {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
      });
      popover.addEventListener("mouseleave", () => hidePopoverWithDelay(trigger, popover, backdrop));

      // Click Events (Toggle support for mobile tap and desktop click)
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const isActive = popover.classList.contains("is-active");
        const timeSinceOpen = Date.now() - lastOpenedTime;
        if (isActive && timeSinceOpen > 200) {
          closeAll();
        } else if (!isActive) {
          showPopover(trigger, popover, backdrop);
        }
      });

      // Keyboard Focus Events (Accessibility UX)
      trigger.addEventListener("focus", () => showPopover(trigger, popover, backdrop));
      trigger.addEventListener("blur", () => hidePopoverWithDelay(trigger, popover, backdrop));

      // Ensure focus within popover keeps it open
      popover.addEventListener("focusin", () => {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
      });
      popover.addEventListener("focusout", (e) => {
        // Only hide if focus left the entire widget/popover container
        if (!popover.contains(e.relatedTarget) && !trigger.contains(e.relatedTarget)) {
          hidePopoverWithDelay(trigger, popover, backdrop);
        }
      });

      // Close button inside the popover
      if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          closeAll();
          trigger.focus(); // Return focus to the trigger
        });
      }

      // Close mobile drawer when backdrop overlay is tapped
      if (backdrop) {
        backdrop.addEventListener("click", closeAll);
      }
    });

    // Global keyboard listener (Esc key)
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        closeAll();
        // Return focus to active trigger if relevant
        const activeTrigger = document.activeElement;
        if (activeTrigger && activeTrigger.classList.contains("js-marka-trigger")) {
          activeTrigger.focus();
        }
      }
    });

    // Close when clicking completely outside the widget and popover area
    document.addEventListener("click", function (e) {
      const clickedTrigger = e.target.closest(".js-marka-trigger");
      const clickedPopover = e.target.closest(".js-marka-popover");

      if (!clickedTrigger && !clickedPopover) {
        closeAll();
      }
    });
  });
})();
