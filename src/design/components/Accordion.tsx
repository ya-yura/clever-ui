import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionContextType {
  openItems: string[];
  toggleItem: (id: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined);

export interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  className = '',
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      }
      return prev.includes(id) ? [] : [id];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={`space-y-2 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  id?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  disabled = false,
  id: propId,
}) => {
  const context = React.useContext(AccordionContext);
  // Generate random ID if not provided
  const id = React.useMemo(() => propId || Math.random().toString(36).substr(2, 9), [propId]);
  
  // Handle uncontrolled state if used outside Accordion wrapper
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  
  const isOpen = context ? context.openItems.includes(id) : localOpen;
  
  const handleToggle = () => {
    if (disabled) return;
    if (context) {
      context.toggleItem(id);
    } else {
      setLocalOpen(!localOpen);
    }
  };

  // Initialize default state in context on mount
  React.useEffect(() => {
    if (context && defaultOpen && !context.openItems.includes(id)) {
      context.toggleItem(id);
    }
  }, []);

  return (
    <div className={`
      border border-surface-tertiary rounded-lg overflow-hidden
      ${disabled ? 'opacity-60' : 'bg-surface-primary'}
    `}>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between p-4 text-left transition-colors
          ${disabled ? 'cursor-not-allowed' : 'hover:bg-surface-secondary'}
        `}
      >
        <span className="font-medium text-content-primary">{title}</span>
        <ChevronDown 
          size={20} 
          className={`
            text-content-tertiary transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>
      
      <div className={`
        transition-all duration-200 ease-in-out
        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-4 pt-0 text-content-secondary border-t border-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};
