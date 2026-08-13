import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import useAuthStore from '../store/useAuthStore';
import { ArrowLeft } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    image: ''
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(prev => ({ ...prev, ...profileSnap.data() }));
        } else {
          setProfile(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfile(prev => ({ ...prev, image: url }));
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const cleanProfile = Object.fromEntries(
        Object.entries(profile).filter(([_, v]) => v !== undefined)
      );
      await setDoc(profileRef, cleanProfile, { merge: true });
      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-paper font-mono text-slate text-sm">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-paper pb-20">
      <div className="navbar">
        <a href="/" className="nav-left">
          <div className="mark">R</div>
          <span className="brand">Draftline-Ai</span>
        </a>
      </div>

      <div className="max-w-[700px] mx-auto px-8 pt-11">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-slate hover:text-ink text-[13px] font-medium transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="text-[28px] font-semibold font-display mb-2">Your Profile</h1>
        <p className="text-slate text-[13.5px] mb-8">Set your default details here. When you create a new resume, it will auto-populate with these values.</p>

        <form onSubmit={handleSave} className="bg-surface border border-line rounded-[14px] p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate">Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="input-draftline" placeholder="John Doe" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate">Email Address</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} className="input-draftline" placeholder="john@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate">Phone Number</label>
              <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="input-draftline" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate">Location</label>
              <input type="text" name="location" value={profile.location} onChange={handleChange} className="input-draftline" placeholder="San Francisco, CA" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate">LinkedIn URL</label>
              <input type="url" name="linkedin" value={profile.linkedin} onChange={handleChange} className="input-draftline" placeholder="https://linkedin.com/in/johndoe" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate">GitHub URL</label>
              <input type="url" name="github" value={profile.github} onChange={handleChange} className="input-draftline" placeholder="https://github.com/johndoe" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2 border-t border-line pt-5 mt-2">
              <label className="text-[12px] font-semibold text-slate">Profile Image (For CV Template)</label>
              <p className="text-[11px] text-slate-light mb-1">Only used if you select the "CV (With Photo)" template.</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="input-draftline p-2 text-[12px]" disabled={uploading} />
              {uploading && <p className="text-[11px] text-teal">Uploading...</p>}
              {profile.image && (
                <div className="mt-4">
                  <img src={profile.image} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border border-line" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary px-6 py-2.5">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
