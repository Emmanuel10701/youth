'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building, 
  Briefcase, 
  MapPin, 
  Globe, 
  Home, 
  CheckCircle,
  Pencil,
  Eye,
  EyeOff,
  AlertCircle,
  Loader
} from 'lucide-react';

// --- Reusable Avatar Component ---
const ProfileAvatar = ({ name, avatarUrl }) => {
  const getInitials = (name) => {
    if (!name || name.trim() === '') return 'AD';
    
    const parts = name.trim().split(' ');
    let initials = '';
    
    if (parts.length > 0 && parts[0].length > 0) {
      initials += parts[0][0].toUpperCase();
    }
    
    if (parts.length > 1 && parts[parts.length - 1].length > 0) {
      initials += parts[parts.length - 1][0].toUpperCase();
    }
    
    return initials;
  };

  const initials = getInitials(name);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
      />
    );
  }

  return (
    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold text-3xl border-4 border-white shadow-md">
      {initials}
    </div>
  );
};

// --- Main Component ---
const ProfileSettings = () => {
  const { data: session, status } = useSession();
  const [adminData, setAdminData] = useState(null);
 const [adminId, setAdminId] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

// Fetch admin data when session is available
useEffect(() => {
  const fetchAdminData = async () => {
    if (session?.user?.id) {
      try {
        setIsLoading(true);
        console.log('Fetching admin data for ID:', session.user.id);
        
        const response = await fetch(`/api/admins/${session.user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }
        
        const admin = await response.json();
        console.log('Admin data received:', admin);
        
        setAdminData(admin);
        setAdminId(admin.id);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setErrorMessage('Failed to load admin profile data');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (status === 'authenticated') {
    fetchAdminData();
  }
}, [session, status]); // Added status as dependency
  // Form for general profile information
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset, 
    control, 
    getValues 
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      role: '',
      phoneNumber: '',
      department: '',
      title: '',
      accessLevel: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
    }
  });

  // Reset form when adminData changes
  useEffect(() => {
    if (adminData) {
      reset({
        fullName: adminData.name || '',
        email: adminData.email || '',
        role: adminData.role || '',
        phoneNumber: adminData.phoneNumber || '',
        department: adminData.department || '',
        title: adminData.title || '',
        accessLevel: adminData.accessLevel || '',
        street: adminData.street || '',
        city: adminData.city || '',
        postalCode: adminData.postalCode || '',
        country: adminData.country || '',
      });
    }
  }, [adminData, reset]);

  // Form for password change
  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }, 
    reset: resetPassword, 
    getValues: getPasswordValues 
  } = useForm();
  
  const fullName = useWatch({
    control,
    name: 'fullName',
    defaultValue: adminData?.name || '',
  });

const handleSaveChanges = async (data) => {
  setSuccessMessage('');
  setErrorMessage('');
  
  if (!adminId) {
    setErrorMessage("Admin ID not found. Unable to save changes.");
    console.error("Admin ID is missing");
    return;
  }

  try {
    const response = await fetch(`/api/adminregister/${adminId}`, {
      method: 'PUT', // Change from PATCH to PUT
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        name: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        department: data.department,
        title: data.title,
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        // Include other fields that might be required by your API
        role: data.role || adminData.role,
        accessLevel: data.accessLevel || adminData.accessLevel,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile.');
    }
    
    const updatedProfile = await response.json();
    setAdminData(updatedProfile);
    
    setSuccessMessage('Your profile has been updated successfully!');
    setIsEditing(false);
    
  } catch (error) {
    console.error("Error updating profile:", error);
    setErrorMessage(error.message);
  }
};

const handlePasswordSave = async (data) => {
  setErrorMessage('');
  setSuccessMessage('');
  
  if (!adminId) {
    setErrorMessage("Admin ID not found. Unable to change password.");
    console.error("Admin ID is missing");
    return;
  }

  try {
    const response = await fetch(`/api/adminregister/${adminId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        password: data.newPassword,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update password.');
    }

    setSuccessMessage('Your password has been updated successfully!');
    resetPassword();
    setIsPasswordSectionOpen(false);
  } catch (error) {
    console.error("Error updating password:", error);
    setErrorMessage(error.message || 'Failed to update password');
  }
};


  const handleCancel = () => {
    reset({
      fullName: adminData?.name || '',
      email: adminData?.email || '',
      role: adminData?.role || '',
      phoneNumber: adminData?.phoneNumber || '',
      department: adminData?.department || '',
      title: adminData?.title || '',
      accessLevel: adminData?.accessLevel || '',
      street: adminData?.street || '',
      city: adminData?.city || '',
      postalCode: adminData?.postalCode || '',
      country: adminData?.country || '',
    });
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsPasswordSectionOpen(false);
    resetPassword();
  };
  
// Add loading state for session
if (status === "loading") {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader size={32} className="animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-500 font-medium">Loading session...</p>
      </div>
    </div>
  );
}

if (status === "unauthenticated") {
  return (
    <div className="text-center p-10 bg-white rounded-3xl shadow-lg">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600">Please log in to access your profile.</p>
    </div>
  );
}

if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader size={32} className="animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-500 font-medium">Loading profile...</p>
      </div>
    </div>
  );
}
  
  if (!adminData) {
    return (
      <div className="text-center p-10 bg-white rounded-3xl shadow-lg">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
        <p className="text-gray-600">We couldn't find your admin profile. Please contact support.</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100 w-full mx-auto font-sans"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <ProfileAvatar name={fullName} avatarUrl={adminData?.avatarUrl} />
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{fullName}</h1>
            <p className="text-gray-500 text-lg">{getValues("title")}</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="badge badge-success">{adminData.status}</span>
              <span className="badge badge-primary">{adminData.accessLevel}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          {!isEditing && (
            <motion.button
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1 }}
              whileTap={{ scale: 1 }}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Pencil size={18} /> Edit Profile
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="flex items-center p-4 mb-6 text-sm text-green-800 rounded-xl bg-green-50"
          >
            <CheckCircle size={20} className="mr-2 text-green-600" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="flex items-center p-4 mb-6 text-sm text-red-800 rounded-xl bg-red-50"
          >
            <AlertCircle size={20} className="mr-2 text-red-600" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(handleSaveChanges)} className="space-y-8">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <User size={22} className="text-blue-600" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  id="fullName" 
                  disabled={!isEditing}
                  {...register("fullName", { required: "Full name is required" })} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  id="email" 
                  disabled={!isEditing}
                  {...register("email", { required: "Email is required", pattern: /^\S+@\S+$/i })} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">Please enter a valid email address.</p>}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Lock size={22} className="text-blue-600" /> Security & Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Briefcase size={18} />
                </div>
                <input 
                  type="text" 
                  id="role" 
                  disabled
                  {...register("role")} 
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Globe size={18} />
                </div>
                <input 
                  type="text" 
                  id="accessLevel" 
                  disabled
                  {...register("accessLevel")} 
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
            {isEditing && (
              <div className="md:col-span-2">
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsPasswordSectionOpen(!isPasswordSectionOpen);
                    setErrorMessage('');
                  }}
                  whileHover={{ scale: 1 }}
                  whileTap={{ scale: 1 }}
                  className="w-full text-blue-600 font-semibold py-2 px-4 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors text-center"
                >
                  {isPasswordSectionOpen ? 'Hide Password Fields' : 'Change Password'}
                </motion.button>
              </div>
            )}
          </div>
          <AnimatePresence>
            {isPasswordSectionOpen && isEditing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 border-t border-gray-100 pt-6 overflow-hidden"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">New Password</h3>
                <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="newPassword" 
                        placeholder="Enter new password"
                        {...registerPassword("newPassword", {
                          required: "New password is required.",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters."
                          }
                        })} 
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="confirmPassword" 
                        placeholder="Confirm new password"
                        {...registerPassword("confirmPassword", {
                          required: "Please confirm your new password.",
                          validate: (value) => value === getPasswordValues("newPassword") || "Passwords do not match."
                        })} 
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                        <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>}
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <motion.button
                      type="button"
                      onClick={handleSubmitPassword(handlePasswordSave)}
                      disabled={isPasswordSubmitting}
                      whileHover={{ scale: 1 }}
                      whileTap={{ scale: 1 }}
                      className="bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                      {isPasswordSubmitting ? 'Updating...' : 'Set New Password'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Briefcase size={22} className="text-blue-600" /> Professional Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Phone size={18} />
                </div>
                <input 
                  type="tel" 
                  id="phoneNumber" 
                  disabled={!isEditing}
                  {...register("phoneNumber", { required: "Phone number is required" })} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>}
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Building size={18} />
                </div>
                <input 
                  type="text" 
                  id="department" 
                  disabled={!isEditing}
                  {...register("department")} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title/Position</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Briefcase size={18} />
                </div>
                <input 
                  type="text" 
                  id="title" 
                  disabled={!isEditing}
                  {...register("title")} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
            </div>
          </div>
        </motion.section>
        
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <MapPin size={22} className="text-blue-600" /> Address Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Home size={18} />
                </div>
                <input 
                  type="text" 
                  id="street" 
                  disabled={!isEditing}
                  {...register("street")} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <MapPin size={18} />
                </div>
                <input 
                  type="text" 
                  id="city" 
                  disabled={!isEditing}
                  {...register("city")} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <MapPin size={18} />
                </div>
                <input 
                  type="text" 
                  id="postalCode" 
                  disabled={!isEditing}
                  {...register("postalCode")} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Globe size={18} />
                </div>
                <input 
                  type="text" 
                  id="country" 
                  disabled={!isEditing}
                  {...register("country")} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {isEditing && (
          <div className="flex justify-end gap-4 mt-8">
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1 }}
              whileTap={{ scale: 1 }}
              className="w-full md:w-auto text-gray-600 font-bold py-3 px-8 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1 }}
              whileTap={{ scale: 1 }}
              className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default ProfileSettings;