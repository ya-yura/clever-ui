import React from 'react';
import { useNavigate } from 'react-router-dom';

const DesignSystemShowcase: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary p-8 pb-24 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-8 border-b border-surface-tertiary">
          <div>
            <h1 className="text-3xl font-bold text-content-primary mb-2">Design System</h1>
            <p className="text-content-secondary">Cleverence Mobile Proto • v1.0.0</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-surface-secondary hover:bg-surface-tertiary rounded-lg transition-colors text-content-secondary"
          >
            Exit Showcase
          </button>
        </header>

        {/* 1. Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-brand-primary">1. Colors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Surface */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-content-secondary border-b border-surface-tertiary pb-2">Surface</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="surface-primary" hex="#242424" bg="bg-surface-primary" />
                <ColorCard name="surface-secondary" hex="#343436" bg="bg-surface-secondary" />
                <ColorCard name="surface-tertiary" hex="#474747" bg="bg-surface-tertiary" />
                <ColorCard name="surface-inverse" hex="#ffffff" bg="bg-surface-inverse" text="text-surface-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-content-secondary border-b border-surface-tertiary pb-2">Content</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="content-primary" hex="#ffffff" bg="bg-content-primary" text="text-surface-primary" />
                <ColorCard name="content-secondary" hex="#e3e3dd" bg="bg-content-secondary" text="text-surface-primary" />
                <ColorCard name="content-tertiary" hex="#a7a7a7" bg="bg-content-tertiary" text="text-surface-primary" />
                <ColorCard name="content-inverse" hex="#242424" bg="bg-content-inverse" text="text-content-primary" />
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-content-secondary border-b border-surface-tertiary pb-2">Brand</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="brand-primary" hex="#daa420" bg="bg-brand-primary" text="text-brand-dark" />
                <ColorCard name="brand-dark" hex="#725a1e" bg="bg-brand-dark" text="text-white" />
                <ColorCard name="brand-secondary" hex="#86e0cb" bg="bg-brand-secondary" text="text-surface-primary" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-content-secondary border-b border-surface-tertiary pb-2">Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="success" hex="#91ed91" bg="bg-success" text="text-surface-primary" />
                <ColorCard name="warning" hex="#f3a361" bg="bg-warning" text="text-surface-primary" />
                <ColorCard name="error" hex="#ba8f8e" bg="bg-error" text="text-surface-primary" />
                <ColorCard name="info" hex="#86e0cb" bg="bg-info" text="text-surface-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-brand-primary">2. Typography</h2>
          <div className="space-y-8 p-6 bg-surface-secondary rounded-lg border border-surface-tertiary">
            
            <div className="space-y-2">
              <p className="text-sm text-content-tertiary">3XL / Bold (36px)</p>
              <h1 className="text-4xl font-bold">The quick brown fox jumps over the lazy dog</h1>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-content-tertiary">2XL / Bold (32px)</p>
              <h2 className="text-3xl font-bold">The quick brown fox jumps over the lazy dog</h2>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-content-tertiary">XL / Bold (24px)</p>
              <h3 className="text-2xl font-bold">The quick brown fox jumps over the lazy dog</h3>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-content-tertiary">Large / Bold (20px)</p>
              <h4 className="text-xl font-bold">The quick brown fox jumps over the lazy dog</h4>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-content-tertiary">Base / Regular (16px)</p>
              <p className="text-base">The quick brown fox jumps over the lazy dog. Used for main content bodies.</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-content-tertiary">Small / Regular (12px)</p>
              <p className="text-sm text-content-secondary">The quick brown fox jumps over the lazy dog. Used for metadata and secondary info.</p>
            </div>
             
            <div className="space-y-2">
               <p className="text-sm text-content-tertiary">XS / Regular (10px)</p>
               <p className="text-[10px] text-content-tertiary">The quick brown fox jumps over the lazy dog. Used for tiny labels.</p>
            </div>

          </div>
        </section>

        {/* 3. Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-brand-primary">3. Components</h2>

          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-content-secondary">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="ghost">Ghost Action</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-content-secondary">Cards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Simple Card */}
              <div className="bg-surface-secondary p-4 rounded-lg shadow-soft border border-surface-tertiary">
                <h4 className="text-lg font-bold mb-2">Simple Card</h4>
                <p className="text-content-secondary">This is a standard card container with soft shadow and rounded corners (18px).</p>
              </div>

              {/* Interactive Card */}
              <div className="bg-surface-secondary p-4 rounded-lg shadow-soft border border-surface-tertiary active:scale-95 transition-transform cursor-pointer hover:bg-surface-tertiary">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="text-lg font-bold">Interactive Card</h4>
                   <span className="bg-brand-primary text-brand-dark text-xs font-bold px-2 py-1 rounded-sm">NEW</span>
                </div>
                <p className="text-content-secondary">Tap me! I react to touch interactions.</p>
              </div>

            </div>
          </div>

           {/* Inputs */}
           <div className="space-y-4">
            <h3 className="text-lg font-bold text-content-secondary">Inputs</h3>
            <div className="max-w-md space-y-4">
              <input 
                type="text" 
                placeholder="Enter text..." 
                className="w-full bg-surface-tertiary text-content-primary px-4 py-3 rounded-md border border-surface-tertiary focus:border-brand-primary focus:outline-none placeholder-content-tertiary"
              />
              <input 
                type="text" 
                value="Focused input"
                readOnly
                className="w-full bg-surface-tertiary text-content-primary px-4 py-3 rounded-md border border-brand-primary focus:outline-none"
              />
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};

// Helper Components
const ColorCard = ({ name, hex, bg, text = "text-content-primary" }: { name: string, hex: string, bg: string, text?: string }) => (
  <div className={`${bg} ${text} p-4 rounded-lg shadow-soft flex flex-col justify-between h-24`}>
    <span className="font-bold text-sm">{name}</span>
    <span className="font-mono text-xs opacity-80">{hex}</span>
  </div>
);

const Button = ({ children, variant = "primary", disabled = false }: { children: React.ReactNode, variant?: "primary" | "secondary" | "ghost", disabled?: boolean }) => {
  const baseStyles = "px-6 py-3 rounded-md font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-brand-primary text-brand-dark hover:brightness-110 shadow-soft",
    secondary: "bg-surface-tertiary text-content-primary hover:bg-opacity-80 border border-surface-tertiary",
    ghost: "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-tertiary",
  };

  return (
    <button disabled={disabled} className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
};

export default DesignSystemShowcase;

