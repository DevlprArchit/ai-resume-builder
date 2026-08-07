import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import useAuthStore from './useAuthStore';

const defaultResumeState = {
  title: 'Untitled Resume',
  templateId: 'modern',
  personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: []
};

const useResumeStore = create((set, get) => ({
  resumes: [],
  currentResume: null,
  isLoading: false,
  error: null,

  fetchResumes: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const q = query(
        collection(db, 'resumes'), 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const resumes = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to standard strings/numbers if necessary
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      
      set({ resumes, isLoading: false });
    } catch (error) {
      // Sometimes ordering requires an index. If so, fallback or log.
      console.error(error);
      set({ error: error.message || 'Failed to fetch resumes', isLoading: false });
    }
  },

  fetchResume: async (id) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const docRef = doc(db, 'resumes', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().userId === userId) {
        set({ 
          currentResume: { _id: docSnap.id, ...docSnap.data() }, 
          isLoading: false 
        });
      } else {
        set({ error: 'Resume not found or unauthorized', isLoading: false });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to fetch resume', isLoading: false });
    }
  },

  createResume: async (title = 'Untitled Resume', templateId = 'modern') => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return null;

    set({ isLoading: true, error: null });
    try {
      const newResume = {
        ...defaultResumeState,
        userId,
        title,
        template: templateId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'resumes'), newResume);
      
      const createdResume = { ...newResume, _id: docRef.id, updatedAt: new Date(), createdAt: new Date() };
      
      set(state => ({ 
        resumes: [createdResume, ...state.resumes], 
        currentResume: createdResume, 
        isLoading: false 
      }));
      
      return docRef.id;
    } catch (error) {
      set({ error: error.message || 'Failed to create resume', isLoading: false });
      return null;
    }
  },

  updateResumeData: (section, data) => {
    set(state => ({
      currentResume: {
        ...state.currentResume,
        [section]: data
      }
    }));
  },

  saveResume: async () => {
    const { currentResume } = get();
    if (!currentResume || !currentResume._id) return;
    
    set({ isLoading: true, error: null });
    try {
      const docRef = doc(db, 'resumes', currentResume._id);
      
      const updateData = { ...currentResume, updatedAt: serverTimestamp() };
      delete updateData._id; // Don't try to overwrite ID
      
      await updateDoc(docRef, updateData);
      
      const savedResume = { ...currentResume, updatedAt: new Date() };
      
      set(state => ({
        resumes: state.resumes.map(r => r._id === savedResume._id ? savedResume : r),
        currentResume: savedResume,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to save resume', isLoading: false });
    }
  },

  deleteResume: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'resumes', id));
      set(state => ({
        resumes: state.resumes.filter(r => r._id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to delete resume', isLoading: false });
    }
  }
}));

export default useResumeStore;
