/* ==========================================================================
   Contact form — floating labels, inline validation with a small shake
   micro-interaction on error, and a real submit to Formspree
   (https://formspree.io/f/xgawbben, set as the <form action> in index.html).
   Submitted via fetch rather than a native form POST so the success/error
   states render inline instead of navigating to Formspree's own page.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(field) {
    const input = field.querySelector('input, textarea');
    const value = input.value.trim();
    let valid = true;

    if (input.hasAttribute('required') && value === '') valid = false;
    if (input.type === 'email' && value !== '' && !EMAIL_RE.test(value)) valid = false;

    field.classList.toggle('has-error', !valid);

    if (!valid && typeof gsap !== 'undefined' && !App.utils.prefersReducedMotion()) {
      gsap.fromTo(
        input,
        { x: -6 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
      );
    }

    return valid;
  }

  /**
   * POSTs the form to Formspree (form.action) with the JSON Accept header
   * Formspree's docs specify for AJAX-style submissions — without it,
   * Formspree replies with an HTML page instead of JSON, which would
   * otherwise make every submission look like it failed even when it
   * succeeded.
   */
  async function submitToFormspree(form, formData) {
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });

    if (response.ok) return;

    const data = await response.json().catch(() => null);
    const message =
      data && Array.isArray(data.errors) ? data.errors.map((err) => err.message).join(', ') : 'Submission failed';
    throw new Error(message);
  }

  /** Slow, continuous drift on the two ambient background blobs. */
  function animateBlobs() {
    if (typeof gsap === 'undefined' || App.utils.prefersReducedMotion()) return;

    gsap.to('.contact__blob--a', {
      x: 70,
      y: 50,
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    gsap.to('.contact__blob--b', {
      x: -60,
      y: -40,
      duration: 11,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.5,
    });
  }

  App.initContactForm = () => {
    animateBlobs();

    const form = document.getElementById('contact-form');
    if (!form) return;

    const fields = form.querySelectorAll('[data-field]');
    const statusEl = document.getElementById('form-status');
    const submitBtn = form.querySelector('.contact-form__submit');

    fields.forEach((field) => {
      const input = field.querySelector('input, textarea');
      input.addEventListener('input', () => {
        field.classList.toggle('is-filled', input.value.trim() !== '');
        if (field.classList.contains('has-error')) validateField(field);
      });
      input.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let allValid = true;
      fields.forEach((field) => {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        statusEl.dataset.state = 'error';
        statusEl.textContent = 'Please fix the highlighted fields.';
        return;
      }

      const formData = new FormData(form);
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      statusEl.dataset.state = '';
      statusEl.textContent = '';

      try {
        await submitToFormspree(form, formData);
        statusEl.dataset.state = 'success';
        statusEl.textContent = "Thanks — I'll get back to you within a day or two.";
        App.utils.confettiBurst(submitBtn);
        form.reset();
        fields.forEach((field) => field.classList.remove('is-filled', 'has-error'));
      } catch {
        statusEl.dataset.state = 'error';
        statusEl.textContent = 'Something went wrong — please email me directly instead.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  };
})();
