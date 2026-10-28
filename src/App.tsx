import { useState } from 'react';
import { useForm } from 'react-hook-form';
import authApi from '@/api/authApi.ts';
import styles from './App.module.css';

const appVersion = __APP_VERSION__;

type LoginFormValues = {
  email: string;
  password: string;
};

export default function App() {
  const { register, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleLogin({ email, password }: LoginFormValues) {
    setFeedback(null);

    try {
      await authApi.login(email, password);
      setFeedback({ type: 'success', message: 'Connexion réussie ! Le test est concluant, la suite prend racine.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'La connexion a échoué. Vérifiez vos identifiants et réessayez.' });
    }
  }

  return (
    <main className={`${styles['app-shell']} grid min-h-dvh grid-cols-1 gap-8 p-4 sm:p-6 lg:grid-cols-5 lg:gap-0`}>
      <section className={`${styles['brand-panel']} hidden flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:px-10 lg:col-span-2 lg:flex lg:py-16`} aria-labelledby="brand-title">
        <div className={`${styles['brand-panel__mark']} flex size-20 items-center justify-center sm:size-24`} aria-hidden="true">
          S&amp;C
        </div>
        <div className="flex max-w-sm flex-col gap-3">
          <h1 id="brand-title" className="text-xl font-extrabold lg:text-2xl">
            S&amp;C Plantaé – l’App
          </h1>
          <p className="text-base">Un espace pour cultiver le conseil.</p>
        </div>
      </section>

      <section className="connection-panel flex flex-col items-center justify-center px-2 pb-6 sm:px-8 lg:col-span-3 lg:px-12 lg:py-12" aria-labelledby="connection-title">
        <div className="flex w-full max-w-md flex-col gap-10">
          <header className="flex flex-col gap-3 text-center">
            <h2 id="connection-title" className="text-2xl font-extrabold">
              Se connecter
            </h2>
            <p className="text-sm text-neutral-light">Le projet prend racine. En attendant, la connexion est prête à être testée.</p>
          </header>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleLogin)}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="email">
                Adresse e-mail
              </label>
              <input id="email" {...register('email')} className={`${styles['connection-panel__input']} w-full px-4 py-3`} type="email" autoComplete="username" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="password">
                Mot de passe
              </label>
              <input id="password" {...register('password')} className={`${styles['connection-panel__input']} w-full px-4 py-3`} type="password" autoComplete="current-password" required />
            </div>

            <button className={`${styles['connection-panel__submit']} ${styles['-primary']} mt-3 inline-flex min-h-12 items-center justify-center px-5 py-3`} type="submit">
              Se connecter
            </button>
            <div role="status" aria-atomic="true">
              {feedback && (
                <p className={`${styles['connection-panel__feedback']} ${styles[`-${feedback.type}`]} px-4 py-3`}>
                  <strong className="block mb-1">{feedback.type === 'success' ? 'Tout est bon !' : 'Connexion impossible'}</strong>
                  {feedback.message}
                </p>
              )}
            </div>
          </form>

          <p className="text-xs text-neutral-light text-center">Version {appVersion} · En cours de création</p>
        </div>
      </section>
    </main>
  );
}
