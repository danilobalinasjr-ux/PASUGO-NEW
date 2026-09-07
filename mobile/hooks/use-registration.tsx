import { createContext, useContext, useState, type PropsWithChildren } from 'react';

type RegistrationState = {
  email: string;
  password: string;
  registrationId: string;
};

type RegistrationContextValue = {
  registration: RegistrationState | null;
  beginRegistration: (registration: RegistrationState) => void;
  clearRegistration: () => void;
};

const RegistrationContext = createContext<RegistrationContextValue | undefined>(undefined);

export function RegistrationProvider({ children }: PropsWithChildren) {
  const [registration, setRegistration] = useState<RegistrationState | null>(null);

  return (
    <RegistrationContext.Provider
      value={{
        registration,
        beginRegistration: setRegistration,
        clearRegistration: () => setRegistration(null),
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error('useRegistration must be used inside RegistrationProvider.');
  return context;
}