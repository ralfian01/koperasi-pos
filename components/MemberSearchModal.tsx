import React, { useState, useEffect, useCallback } from 'react';
import type { Member } from '../types';
import { searchMembers } from '../services/memberService';

interface MemberSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (member: Member) => void;
}

const MemberSearchModal: React.FC<MemberSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed
            setQuery('');
            setResults([]);
            setIsLoading(false);
            return;
        }

        const handler = setTimeout(() => {
            if (query.length > 1) {
                setIsLoading(true);
                searchMembers(query)
                    .then(setResults)
                    .finally(() => setIsLoading(false));
            } else {
                setResults([]);
            }
        }, 300); // Debounce API call

        return () => {
            clearTimeout(handler);
        };
    }, [query, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSelectMember = (member: Member) => {
        onSelect(member);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg m-4 max-h-[70vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Cari Member</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                </div>
                
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ketik nama atau nomor telepon..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                />

                <div className="mt-4 flex-grow overflow-y-auto">
                    {isLoading && <p className="text-center text-gray-500 py-4">Mencari...</p>}
                    {!isLoading && query.length > 1 && results.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Member tidak ditemukan.</p>
                    )}
                    <ul className="divide-y divide-gray-200">
                        {results.map((member) => (
                            <li key={member.id}>
                                <button
                                    onClick={() => handleSelectMember(member)}
                                    className="w-full text-left p-3 hover:bg-indigo-50 rounded-md transition-colors"
                                >
                                    <p className="font-semibold text-gray-800">{member.name}</p>
                                    <p className="text-sm text-gray-500">{member.phone}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 border-t pt-4 text-right">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberSearchModal;