import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { fetchProfiles, createEmployee } from '../services/dataService';
import { UserPlus, Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';

export const EmployeeManager: React.FC = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const loadProfiles = async () => {
        setLoading(true);
        const data = await fetchProfiles();
        setProfiles(data);
        setLoading(false);
    };

    useEffect(() => {
        loadProfiles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            await createEmployee(formData.email, formData.password);
            setMessage({ type: 'success', text: 'Empleado registrado con éxito. Ya puede iniciar sesión.' });
            setFormData({ email: '', password: '' });
            setIsAdding(false);
            await loadProfiles();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al registrar empleado.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Gestión de Empleados</h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium transition"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Empleado
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="mb-8 bg-orange-50 p-6 rounded-lg border border-orange-100 shadow-sm relative">
                    <h3 className="text-base font-semibold text-orange-900 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        Registrar Nuevo Staff
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email del Empleado
                            </label>
                            <input
                                required
                                type="email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-orange-500 focus:ring-orange-500"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="ejemplo@correo.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Contraseña Temporal
                            </label>
                            <input
                                required
                                type="password"
                                minLength={6}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-orange-500 focus:ring-orange-500"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {submitting ? 'Registrando...' : 'Dar de Alta'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {message && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white shadow overflow-hidden border border-gray-100 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado (Email)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID de Usuario</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Cargando lista de staff...
                                </td>
                            </tr>
                        ) : profiles.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">No hay empleados registrados.</td>
                            </tr>
                        ) : profiles.map((p) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {p.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">{p.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
