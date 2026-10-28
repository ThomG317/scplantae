import { useState } from 'react';
import { useForm } from 'react-hook-form';
import authApi from '@/api/authApi.ts';
import logo from '@/assets/images/logo.svg';
import classNames from 'classnames';
import './App.css';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; description?: string } | null>(null);

  async function handleLogin({ email, password }: LoginFormValues) {
    setFeedback(null);

    try {
      await authApi.login(email, password);
      setFeedback({ type: 'success', message: 'Connexion réussie !', description: 'Le test est concluant, la suite prend racine.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Identifiant ou mot de passe invalide' });
    }
  }

  return (
    <main className="sc-app-shell flex min-h-dvh items-center justify-center p-4 sm:p-6">
      <section className="sc-connection-panel flex w-full max-w-[500px] flex-col items-center overflow-hidden" aria-labelledby="connection-title">
        <div className="flex w-full flex-col items-center">
          <div className="sc-connection-panel__banner h-[140px] w-full" />
          <div className="sc-connection-panel__logo relative -mt-[72px] flex size-36 shrink-0 items-center justify-center pt-3">
            <img src={logo} alt="S&C Plantaé" width="84.0459" height="41.6842" />
          </div>
        </div>

        <div className="flex w-full flex-col gap-12 p-6 sm:p-10">
          <header className="flex flex-col gap-2 text-center">
            <h1 id="connection-title" className="text-2xl font-extrabold">
              Se connecter
            </h1>
            <p className="text-base text-neutral-light">Accédez à votre espace S&amp;C Plantaé</p>
          </header>

          <form className="flex flex-col gap-8" onSubmit={handleSubmit(handleLogin)} aria-busy={isSubmitting}>
            <div role="status" aria-atomic="true" className={feedback ? undefined : 'hidden'}>
              {feedback && (
                <div className="sc-connection-panel__feedback flex items-start gap-3 p-3">
                  <span className={classNames('sc-connection-panel__feedback-icon flex size-8 shrink-0 items-center justify-center', `sc-${feedback.type}`)} aria-hidden="true">
                    <span className="material-symbols-rounded sc-connection-panel__symbol">{feedback.type === 'error' ? 'cancel' : 'check_circle'}</span>
                  </span>
                  <div className="flex min-h-8 min-w-0 flex-1 flex-col justify-center gap-1">
                    <p className="sc-connection-panel__feedback-text">{feedback.message}</p>
                    {feedback.description && <p className="sc-connection-panel__feedback-description">{feedback.description}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="sc-connection-panel__label pl-1" htmlFor="email">
                  Adresse email
                </label>
                <input id="email" {...register('email')} className="sc-connection-panel__input min-h-10 w-full px-3.5 py-1.5" type="email" autoComplete="username" required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="sc-connection-panel__label pl-1" htmlFor="password">
                  Mot de passe
                </label>
                <input id="password" {...register('password')} className="sc-connection-panel__input min-h-10 w-full px-3.5 py-1.5" type="password" autoComplete="current-password" required />
              </div>
            </div>

            <button className="sc-connection-panel__submit inline-flex min-h-10 min-w-10 items-center justify-center px-4 py-2" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
