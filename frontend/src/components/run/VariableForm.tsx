import { useState } from 'react';
import { WorkflowVariable } from '@/types/workflows';
import { TextInput } from '@/components/common/TextInput';
import { TextArea } from '@/components/common/TextArea';

interface VariableFormProps {
  variables: WorkflowVariable[];
  onValuesChange: (values: Record<string, any>) => void;
}

export const VariableForm = ({ variables, onValuesChange }: VariableFormProps) => {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    onValuesChange(newValues);
  };

  return (
    <div className="space-y-4">
      {variables.map((variable) => {
        if (variable.type === 'string') {
          if (variable.name.toLowerCase().includes('note')) {
            return (
              <TextArea
                key={variable.name}
                label={variable.label}
                value={values[variable.name] || ''}
                onChange={(e) => handleChange(variable.name, e.target.value)}
                rows={3}
              />
            );
          }
          return (
            <TextInput
              key={variable.name}
              label={variable.label}
              value={values[variable.name] || ''}
              onChange={(e) => handleChange(variable.name, e.target.value)}
            />
          );
        }

        if (variable.type === 'number') {
          return (
            <TextInput
              key={variable.name}
              type="number"
              label={variable.label}
              value={values[variable.name] || ''}
              onChange={(e) => handleChange(variable.name, e.target.value)}
            />
          );
        }

        if (variable.type === 'enum' && variable.options) {
          return (
            <div key={variable.name} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {variable.label}
              </label>
              <select
                value={values[variable.name] || ''}
                onChange={(e) => handleChange(variable.name, e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select...</option>
                {variable.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
