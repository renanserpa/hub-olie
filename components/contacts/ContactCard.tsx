import React from 'react';
import { Contact } from '../../types';
import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';
import { Mail, Phone, MapPin, Edit, MessageSquare, Instagram as InstagramIcon, Smartphone } from 'lucide-react';

interface ContactCardProps {
    contact: Contact;
    onEdit: () => void;
}

const InfoItem: React.FC<{ icon: React.ElementType, value?: string, href?: string, label?: string }> = ({ icon: Icon, value, href, label }) => {
    if (!value) return null;
    const content = (
        <span className="flex items-center gap-3 text-sm text-textSecondary group">
            <Icon size={16} className="flex-shrink-0" />
            <div className="flex flex-col">
                {label && <span className="text-[10px] text-textSecondary/70">{label}</span>}
                <span className="truncate">{value}</span>
            </div>
        </span>
    );

    if (href) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors block">{content}</a>
    }
    return content;
};

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit }) => {
    const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

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
                <InfoItem icon={Mail} value={contact.email} href={`mailto:${contact.email}`} label="Email" />
                
                {contact.landline && (
                    <InfoItem icon={Phone} value={contact.landline} href={`tel:${cleanPhone(contact.landline)}`} label="Fixo" />
                )}
                
                {/* Fallback to legacy 'phone' field if 'mobile' is not set, treating it as mobile/general */}
                <InfoItem 
                    icon={Smartphone} 
                    value={contact.mobile || (!contact.landline ? contact.phone : undefined)} 
                    href={`tel:${cleanPhone(contact.mobile || contact.phone || '')}`} 
                    label="Celular" 
                />
                
                <InfoItem 
                    icon={MessageSquare} 
                    value={contact.whatsapp} 
                    href={`https://wa.me/${cleanPhone(contact.whatsapp || '')}`} 
                    label="WhatsApp"
                />
                
                <InfoItem icon={InstagramIcon} value={contact.instagram} href={contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : undefined} label="Instagram" />
                <InfoItem icon={MapPin} value={contact.address?.city && contact.address?.state ? `${contact.address.city}, ${contact.address.state}` : ''} label="Localização" />
            </div>
        </Card>
    );
};

export default ContactCard;