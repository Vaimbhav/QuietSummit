import { useState } from 'react';
import { updateEmail, UpdateEmailData } from '../../services/profileApi';
import { Mail, Eye, EyeOff } from 'lucide-react';

export default function EmailUpdate() {
    const [formData, setFormData] = useState<UpdateEmailData>({
        newEmail: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const validateForm = (): boolean => {
        if (!formData.newEmail || !formData.password) {
            setError('All fields are required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.newEmail)) {
            setError('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await updateEmail(formData);
            setSuccess('Email updated successfully! Please verify your new email.');
            setFormData({
                newEmail: '',
                password: ''
            });
            setTimeout(() => setSuccess(null), 5000);
        } catch (error: any) {
            console.error('Error updating email:', error);
            setError(error.response?.data?.message || 'Failed to update email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Update Email</h2>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Email Address
                    </label>
                    <input
                        type="email"
                        name="newEmail"
                        value={formData.newEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="your.new.email@example.com"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        You will need to verify your new email address
                    </p>
                </div>

                {/* Password Confirmation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter your current password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Enter your current password to confirm this change
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Email'}
                    </button>
                </div>
            </form>
        </div>
    );
}
