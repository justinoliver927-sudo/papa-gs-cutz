(function () {
  const form = document.querySelector('[data-forgot-password]');
  const resetForm = document.querySelector('[data-reset-password]');
  const message = document.querySelector('[data-message]');
  const cfg = window.PAPA_CONFIG || {};
  
  const showMessage = (text, success = false) => {
    if (!message) return;
    message.textContent = text;
    message.classList.remove('hidden', 'warning');
    if (!success) message.classList.add('warning');
  };

  const client =
    window.supabase &&
    cfg.supabaseUrl &&
    cfg.supabasePublishableKey
      ? window.supabase.createClient(
          cfg.supabaseUrl,
          cfg.supabasePublishableKey
        )
      : null;

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!client) {
        showMessage('Password recovery is not configured. Please try again later.');
        return;
      }

      const email = document.querySelector('#email')?.value.trim();

      if (!email) {
        showMessage('Enter your email address.');
        return;
      }

      try {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: new URL('reset-password.html', location.href).href
        });

        if (error) {
          showMessage(error.message);
        } else {
          showMessage(
            'If an account exists for that email, a reset link will be sent. Check your inbox and spam folder.',
            true
          );
        }
      } catch (error) {
        showMessage(error.message || 'Could not request a password reset.');
      }
    });
  }

  if (resetForm) {
    resetForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!client) {
        showMessage('Password recovery is not configured. Please try again later.');
        return;
      }

      const password =
        document.querySelector('#newPassword')?.value || '';
      const confirmPassword =
        document.querySelector('#confirmPassword')?.value || '';

      if (password.length < 8) {
        showMessage('Use a password with at least 8 characters.');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('The passwords do not match.');
        return;
      }

      try {
        const { error } = await client.auth.updateUser({
          password: password
        });

        if (error) {
          showMessage(error.message);
        } else {
          showMessage(
            'Password updated successfully. You can now log in with your new password.',
            true
          );
          resetForm.reset();
          setTimeout(() => {
            location.href = 'login.html';
          }, 1800);
        }
      } catch (error) {
        showMessage(error.message || 'Could not update your password.');
      }
    });
  }
})();
