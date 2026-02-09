import { create } from 'zustand';
import { AlertButton } from '../components/common/CustomAlert';

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertStore {
  visible: boolean;
  config: AlertConfig;
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

const useAlertStore = create<AlertStore>((set) => ({
  visible: false,
  config: { title: '' },
  showAlert: (title, message, buttons) => {
    set({
      visible: true,
      config: { title, message, buttons },
    });
  },
  hideAlert: () => {
    set({ visible: false });
  },
}));

export default useAlertStore;
