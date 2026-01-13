import React from 'react';
import { MarketingSegmentRule } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

interface RuleBuilderProps {
    rules: MarketingSegmentRule[];
    onChange: (rules: MarketingSegmentRule[]) => void;
}

const ruleFields = [
    { value: 'total_spent', label: 'Total Gasto', type: 'number', operators: ['greater_than', 'less_than', 'equals'] },
    { value: 'order_count', label: 'Qtd. Pedidos', type: 'number', operators: ['greater_than', 'less_than', 'equals'] },
    { value: 'last_purchase_days', label: 'Última Compra (dias)', type: 'number', operators: ['greater_than', 'less_than'] },
    { value: 'tags', label: 'Tags', type: 'text', operators: ['contains', 'not_contains'] },
];

const operatorLabels: Record<MarketingSegmentRule['operator'], string> = {
    greater_than: 'Maior que',
    less_than: 'Menor que',
    equals: 'Igual a',
    contains: 'Contém',
    not_contains: 'Não contém',
};

const RuleRow: React.FC<{ rule: MarketingSegmentRule; onUpdate: (field: keyof MarketingSegmentRule, value: any) => void; onDelete: () => void; }> = ({ rule, onUpdate, onDelete }) => {
    const selectedField = ruleFields.find(f => f.value === rule.field);
    const inputType = selectedField?.type || 'text';
    
    return (
        <div className="grid grid-cols-12 gap-2 items-center">
            <select value={rule.field} onChange={e => onUpdate('field', e.target.value)} className="col-span-4 p-2 border rounded-md text-sm">
                {ruleFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <select value={rule.operator} onChange={e => onUpdate('operator', e.target.value)} className="col-span-3 p-2 border rounded-md text-sm">
                {selectedField?.operators.map(op => <option key={op} value={op}>{operatorLabels[op as keyof typeof operatorLabels]}</option>)}
            </select>
            <input
                type={inputType}
                value={rule.value}
                onChange={e => onUpdate('value', inputType === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                className="col-span-4 p-2 border rounded-md text-sm"
            />
            <div className="col-span-1 text-right">
                <IconButton onClick={onDelete} className="text-red-500 hover:bg-red-100 h-8 w-8"><Trash2 size={16} /></IconButton>
            </div>
        </div>
    );
};

const RuleBuilder: React.FC<RuleBuilderProps> = ({ rules, onChange }) => {
    const addRule = () => {
        const newRule: MarketingSegmentRule = {
            id: `rule_${Date.now()}`,
            field: 'total_spent',
            operator: 'greater_than',
            value: 0,
        };
        onChange([...rules, newRule]);
    };

    const updateRule = (index: number, field: keyof MarketingSegmentRule, value: any) => {
        const newRules = [...rules];
        const newRule = { ...newRules[index], [field]: value };

        // Reset operator and value if field changes
        if (field === 'field') {
            const newFieldConfig = ruleFields.find(f => f.value === value);
            newRule.operator = newFieldConfig?.operators[0] as MarketingSegmentRule['operator'];
            newRule.value = newFieldConfig?.type === 'number' ? 0 : '';
        }

        newRules[index] = newRule;
        onChange(newRules);
    };

    const deleteRule = (index: number) => {
        onChange(rules.filter((_, i) => i !== index));
    };

    return (
        <div className="p-3 bg-secondary rounded-lg space-y-3 mt-1">
            {rules.map((rule, index) => (
                <RuleRow
                    key={rule.id}
                    rule={rule}
                    onUpdate={(field, value) => updateRule(index, field, value)}
                    onDelete={() => deleteRule(index)}
                />
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRule} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Regra
            </Button>
        </div>
    );
};

export default RuleBuilder;