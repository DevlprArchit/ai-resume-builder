import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  error: null,
  
  initializeAuthListener: () => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        set({ 
          user: { 
            uid: user.uid, 
            email: user.email, 
            name: user.displayName 
          }, 
          isLoading: false 
        });
      } else {
        set({ user: null, isLoading: false });
      }
    });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // user state is updated via the auth listener
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Manually trigger user update to include the new display name
      set({ 
        user: { 
          uid: userCredential.user.uid, 
          email: userCredential.user.email, 
          name 
        },
        isLoading: false
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // user state is updated via the auth listener
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error("Logout failed", error);
    }
  }
}));

export default useAuthStore;
