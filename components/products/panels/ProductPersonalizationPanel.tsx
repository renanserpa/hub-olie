import React, { useState, useEffect, useMemo } from 'react';
import { Product, AppData, EmbroideryColor, ProductPart, CombinationRule } from '../../../types';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { calculateContrastRatio } from '../../../lib/utils';
import { AlertTriangle, CheckCircle, Type, Trash2, Plus } from 'lucide-react';
import { IconButton } from '../../ui/IconButton';
import { toast } from '../../../hooks/use-toast';
import { MultiSelectPopover } from '../../ui/MultiSelectPopover';

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={cn("bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border shadow-sm", className)}>
        <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const getOptionsForSource = (source: ProductPart['options_source'] | undefined, appData: AppData): { value: string, label: string }[] => {
    if (!source || !appData) return [];
    const mapping: Record<string, any[]> = {
        ...(appData.catalogs.cores_texturas || {}),
        config_materials: appData.config_materials || [],
    };
    const result = mapping[source] || [];
    return result.map(item => ({ value: item.id, label: item.name }));
};


const ProductPersonalizationSimulator: React.FC<{
    appData: AppData;
}> = ({ appData }) => {
    const [embroideryText, setEmbroideryText] = useState('Olie');
    const [embroideryFont, setEmbroideryFont] = useState(appData.catalogs.fontes_monogramas[0]?.id || '');
    const [embroideryColorId, setEmbroideryColorId] = useState(appData.catalogs.cores_texturas.bordado[0]?.id || '');
    const [embroideryHeight, setEmbroideryHeight] = useState(15);
    const [fabricColorId, setFabricColorId] = useState(appData.catalogs.cores_texturas.tecido[0]?.id || '');
    
    const [contrast, setContrast] = useState(1);
    const hasEnoughContrast = contrast >= 4.5;

    useEffect(() => {
        const fabric = appData.catalogs.cores_texturas.tecido.find(c => c.id === fabricColorId);
        const thread = appData.catalogs.cores_texturas.bordado.find(c => c.id === embroideryColorId);
        if (fabric && thread) {
            const ratio = calculateContrastRatio(fabric.hex, thread.hex);
            setContrast(ratio);
        }
    }, [fabricColorId, embroideryColorId, appData.catalogs]);

    const getFontName = (fontId: string) => {
        return appData.catalogs.fontes_monogramas.find(f => f.id === fontId)?.name || 'sans-serif';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                 <Section title="Simulador de Tecido (para Contraste)">
                     <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Cor do Tecido Externo</label>
                        <select value={fabricColorId} onChange={e => setFabricColorId(e.target.value)} className="w-full p-2 border rounded-md">
                            {appData.catalogs.cores_texturas.tecido.map(color => <option key={color.id} value={color.id}>{color.name}</option>)}
                        </select>
                    </div>
                </Section>
                <Section title="Configuração da Personalização">
                    <div className="space-y-4 pt-2">
                            <div>
                                <label className="block text-xs font-medium text-textSecondary mb-1">Texto</label>
                                <input value={embroideryText} onChange={e => setEmbroideryText(e.target.value)} className="w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-textSecondary mb-1">Fonte</label>
                                <select value={embroideryFont} onChange={e => setEmbroideryFont(e.target.value)} className="w-full p-2 border rounded-md">
                                    {appData.catalogs.fontes_monogramas.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-textSecondary mb-1">Cor da Linha</label>
                                <select value={embroideryColorId} onChange={e => setEmbroideryColorId(e.target.value)} className="w-full p-2 border rounded-md">
                                    {appData.catalogs.cores_texturas.bordado.map(color => <option key={color.id} value={color.id}>{color.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-textSecondary mb-1">Altura ({embroideryHeight}mm)</label>
                                <input type="range" min="10" max="25" value={embroideryHeight} onChange={e => setEmbroideryHeight(Number(e.target.value))} className="w-full" />
                            </div>
                    </div>
                </Section>
            </div>
            <div className="space-y-6">
                <Section title="Visualização em Tempo Real">
                     <div 
                        className="w-full aspect-video rounded-lg flex items-center justify-center transition-colors duration-300" 
                        style={{ backgroundColor: appData.catalogs.cores_texturas.tecido.find(c => c.id === fabricColorId)?.hex || '#ccc' }}
                     >
                        <span 
                            className="text-4xl transition-colors duration-300" 
                            style={{ 
                                color: appData.catalogs.cores_texturas.bordado.find(c => c.id === embroideryColorId)?.hex || '#000',
                                fontFamily: getFontName(embroideryFont),
                                fontSize: `${embroideryHeight * 2}px`
                            }}
                        >
                            {embroideryText}
                        </span>
                     </div>
                     <div className={cn(
                        "p-3 rounded-lg text-sm flex items-start gap-3 border",
                        hasEnoughContrast ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                     )}>
                        {hasEnoughContrast ? <CheckCircle className="w-5 h-5 mt-0.5"/> : <AlertTriangle className="w-5 h-5 mt-0.5"/>}
                        <div>
                            <h4 className="font-semibold">Contraste: {contrast.toFixed(2)}:1</h4>
                            <p className="text-xs">{hasEnoughContrast ? "Ótima legibilidade." : "Abaixo do mínimo de 4.5:1. Escolha uma cor mais clara ou escura."}</p>
                        </div>
                     </div>
                </Section>
            </div>
        </div>
    );
};


const ProductPersonalizationPanel: React.FC<{
    product: Product;
    appData: AppData;
    formData: Partial<Product>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
}> = ({ product, appData, formData, setFormData }) => {
    
    const [newPart, setNewPart] = useState({ key: '', name: '', options_source: '' });

    const handlePartChange = <K extends keyof ProductPart>(index: number, field: K, value: ProductPart[K]) => {
        const newParts = [...(formData.configurable_parts || [])];
        newParts[index] = { ...newParts[index], [field]: value };
        setFormData(prev => ({ ...prev, configurable_parts: newParts }));
    };

    const addPart = () => {
        if (!newPart.key || !newPart.name || !newPart.options_source) {
            toast({ title: 'Atenção', description: 'Preencha todos os campos da nova parte.', variant: 'destructive' });
            return;
        }
        const newParts = [...(formData.configurable_parts || []), { id: `part_${Date.now()}`, ...newPart }];
        setFormData(prev => ({ ...prev, configurable_parts: newParts as ProductPart[] }));
        setNewPart({ key: '', name: '', options_source: '' });
    };

    const removePart = (index: number) => {
        const newParts = [...(formData.configurable_parts || [])];
        newParts.splice(index, 1);
        setFormData(prev => ({ ...prev, configurable_parts: newParts }));
    };

    const handleRuleConditionChange = (index: number, field: 'part_key' | 'option_id', value: string) => {
        const newRules = [...(formData.combination_rules || [])];
        const newCondition = { ...newRules[index].condition, [field]: value };
        if (field === 'part_key') newCondition.option_id = '';
        newRules[index] = { ...newRules[index], condition: newCondition };
        setFormData(prev => ({ ...prev, combination_rules: newRules }));
    };

    const handleRuleConsequenceChange = (index: number, field: 'part_key' | 'allowed_option_ids', value: string | string[]) => {
        const newRules = [...(formData.combination_rules || [])];
        const newConsequence = { ...newRules[index].consequence, [field]: value };
        if (field === 'part_key') newConsequence.allowed_option_ids = [];
        newRules[index] = { ...newRules[index], consequence: newConsequence };
        setFormData(prev => ({ ...prev, combination_rules: newRules }));
    };

    const addRule = () => {
        const newRule: CombinationRule = { id: `rule_${Date.now()}`, condition: { part_key: '', option_id: '' }, consequence: { part_key: '', allowed_option_ids: [] } };
        setFormData(prev => ({ ...prev, combination_rules: [...(prev.combination_rules || []), newRule] }));
    };

    const removeRule = (index: number) => {
        const newRules = [...(formData.combination_rules || [])];
        newRules.splice(index, 1);
        setFormData(prev => ({ ...prev, combination_rules: newRules }));
    };

    const optionsSources = Object.keys(appData.catalogs.cores_texturas || {}).concat('config_materials');
    const inputStyle = "w-full px-3 py-1.5 border border-border rounded-lg shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";
    const labelStyle = "block text-xs font-medium text-textSecondary mb-1";

    return (
        <div className="space-y-6">
            <Section title="Partes Configuráveis">
                <div className="space-y-2">
                    {(formData.configurable_parts || []).map((part, index) => (
                        <div key={part.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-secondary/80 rounded-md">
                            <input value={part.key} onChange={e => handlePartChange(index, 'key', e.target.value)} placeholder="chave_unica" className={cn(inputStyle, "col-span-3 font-mono")} />
                            <input value={part.name} onChange={e => handlePartChange(index, 'name', e.target.value)} placeholder="Nome Visível" className={cn(inputStyle, "col-span-4")} />
                            <select value={part.options_source} onChange={e => handlePartChange(index, 'options_source', e.target.value as any)} className={cn(inputStyle, "col-span-4")}>
                                <option value="">Fonte...</option>
                                {optionsSources.map(src => <option key={src} value={src}>{src}</option>)}
                            </select>
                            <IconButton type="button" onClick={() => removePart(index)} className="col-span-1 text-red-500"><Trash2 size={16}/></IconButton>
                        </div>
                    ))}
                </div>
                <div className="mt-2 pt-2 border-t">
                    <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-3"><label className={labelStyle}>Chave</label><input value={newPart.key} onChange={e => setNewPart(p => ({...p, key: e.target.value}))} placeholder="ex: cor_ziper" className={inputStyle} /></div>
                        <div className="col-span-4"><label className={labelStyle}>Nome</label><input value={newPart.name} onChange={e => setNewPart(p => ({...p, name: e.target.value}))} placeholder="ex: Cor do Zíper" className={inputStyle} /></div>
                        <div className="col-span-4"><label className={labelStyle}>Fonte</label><select value={newPart.options_source} onChange={e => setNewPart(p => ({...p, options_source: e.target.value}))} className={inputStyle}><option value="">Fonte de Opções</option>{optionsSources.map(src => <option key={src} value={src}>{src}</option>)}</select></div>
                        <div className="col-span-1"><Button type="button" onClick={addPart} size="icon" className="h-9 w-9"><Plus size={16}/></Button></div>
                    </div>
                </div>
            </Section>

            <Section title="Regras de Combinação (Opcional)">
                 <div className="space-y-3">
                    {(formData.combination_rules || []).map((rule, index) => {
                        const conditionPart = formData.configurable_parts?.find(p => p.key === rule.condition.part_key);
                        const conditionOptions = conditionPart ? getOptionsForSource(conditionPart.options_source, appData) : [];
                        const consequencePart = formData.configurable_parts?.find(p => p.key === rule.consequence.part_key);
                        const consequenceOptions = consequencePart ? getOptionsForSource(consequencePart.options_source, appData) : [];
                        
                        return (
                            <div key={rule.id} className="p-3 bg-secondary/80 rounded-lg space-y-2 relative">
                                <IconButton type="button" onClick={() => removeRule(index)} className="absolute top-1 right-1 text-red-500"><Trash2 size={14}/></IconButton>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">SE</span>
                                    <select value={rule.condition.part_key} onChange={e => handleRuleConditionChange(index, 'part_key', e.target.value)} className={cn(inputStyle, 'w-32')}><option value="">Parte...</option>{(formData.configurable_parts || []).map(p => <option key={p.key} value={p.key}>{p.name}</option>)}</select>
                                    <span>for</span>
                                    <select value={rule.condition.option_id} onChange={e => handleRuleConditionChange(index, 'option_id', e.target.value)} className={cn(inputStyle, 'flex-grow')}><option value="">Opção...</option>{conditionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">ENTÃO</span>
                                     <select value={rule.consequence.part_key} onChange={e => handleRuleConsequenceChange(index, 'part_key', e.target.value)} className={cn(inputStyle, 'w-32')}><option value="">Parte...</option>{(formData.configurable_parts || []).map(p => <option key={p.key} value={p.key} disabled={p.key === rule.condition.part_key}>{p.name}</option>)}</select>
                                    <span>só permite</span>
                                    <MultiSelectPopover options={consequenceOptions} selected={rule.consequence.allowed_option_ids} onChange={val => handleRuleConsequenceChange(index, 'allowed_option_ids', val)} className="flex-grow" />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Button type="button" onClick={addRule} variant="outline" size="sm" className="mt-2"><Plus size={14} className="mr-2"/> Adicionar Regra</Button>
            </Section>

            <ProductPersonalizationSimulator appData={appData} />
        </div>
    );
};

export default ProductPersonalizationPanel;