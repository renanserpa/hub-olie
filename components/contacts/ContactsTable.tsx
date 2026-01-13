import React from 'react';
import { Contact } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ContactsTableProps {
    contacts: Contact[];
    onEdit: (contact: Contact) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, onEdit }) => {
    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="p-4 font-semibold text-textSecondary">Nome</th>
                                <th className="p-4 font-semibold text-textSecondary">Email</th>
                                <th className="p-4 font-semibold text-textSecondary">Telefone</th>
                                <th className="p-4 font-semibold text-textSecondary">Estágio</th>
                                <th className="p-4 font-semibold text-textSecondary">Tags</th>
                                <th className="p-4 font-semibold text-textSecondary text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map(contact => (
                                <tr key={contact.id} className="border-b border-border hover:bg-accent/50">
                                    <td className="p-4 font-medium text-textPrimary">{contact.name}</td>
                                    <td className="p-4 text-textSecondary">{contact.email}</td>
                                    <td className="p-4 text-textSecondary">{contact.phone}</td>
                                    <td className="p-4">
                                        <Badge variant="secondary">{contact.stage || 'N/A'}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {contact.tags?.map(tag => (
                                                <Badge key={tag} variant="default" className="text-[10px]">{tag}</Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => onEdit(contact)}>
                                            <Edit size={14} className="mr-2" />
                                            Editar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default ContactsTable;
