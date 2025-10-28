import React from 'react';
import { Contact } from '../../types';
import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';
import { Mail, Phone, MapPin, Edit, MessageSquare, Instagram as InstagramIcon } from 'lucide-react';

interface ContactCardProps {
    contact: Contact;
    onEdit: () => void;
}

const InfoItem: React.FC<{ icon: React.ElementType, value?: string, href?: string }> = ({ icon: Icon, value, href }) => {
    if (!value) return null;
    const content = (
        <span className="flex items-center gap-3 text-sm text-textSecondary">
            <Icon size={16} className="flex-shrink-0" />
            <span className="truncate">{value}</span>
        </span>
    );

    if (href) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{content}</a>
    }
    return content;
};

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit }) => {
    return (
        <Card className="p-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-sm">
                        {contact.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-textPrimary">{contact.name}</h3>
                    </div>
                </div>
                <IconButton onClick={onEdit} className="text-textSecondary hover:text-primary">
                    <Edit size={16} />
                </IconButton>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                <InfoItem icon={Mail} value={contact.email} href={`mailto:${contact.email}`} />
                {/* FIX: Use optional chaining for properties that may not exist on Contact. */}
                <InfoItem icon={Phone} value={contact.phone} href={`tel:${contact.phone}`} />
                <InfoItem icon={MessageSquare} value={contact.whatsapp} href={`https://wa.me/${contact.whatsapp?.replace(/\D/g, '')}`} />
                <InfoItem icon={InstagramIcon} value={contact.instagram} href={contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : undefined} />
                <InfoItem icon={MapPin} value={contact.address?.city && contact.address?.state ? `${contact.address.city}, ${contact.address.state}` : ''} />
            </div>
        </Card>
    );
};

export default ContactCard;