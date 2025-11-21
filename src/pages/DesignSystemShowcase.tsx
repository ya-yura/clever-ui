import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Bell, 
  Check, 
  ChevronRight, 
  MoreHorizontal,
  Settings,
  Home,
} from 'lucide-react';

// Import from our new Design System Component Library
import {
  Button,
  Card,
  Badge,
  Avatar,
  ProgressBar,
  Input,
  TextArea,
  Checkbox,
  Toggle,
} from '@/design/components';

const DesignSystemShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(true);

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary p-8 pb-32 font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-surface-tertiary gap-4">
          <div>
            <h1 className="text-4xl font-bold text-content-primary mb-2 tracking-tight">Design System</h1>
            <p className="text-content-secondary text-lg">Cleverence Mobile Proto • v1.0.0</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/')} startIcon={<Home size={18} />}>
              Back to Home
            </Button>
          </div>
        </header>

        {/* 1. Typography Scale */}
        <section className="space-y-6">
          <SectionHeader title="01. Typography" description="Atkinson Hyperlegible scale" />
          
          <Card noPadding className="overflow-hidden">
            <div className="p-8 space-y-8">
              <TypeSpecimen size="text-3xl" label="Display 3XL" weight="font-bold" sizeLabel="36px" />
              <TypeSpecimen size="text-2xl" label="Display 2XL" weight="font-bold" sizeLabel="32px" />
              <TypeSpecimen size="text-xl" label="Heading XL" weight="font-bold" sizeLabel="24px" />
              <TypeSpecimen size="text-lg" label="Heading LG" weight="font-bold" sizeLabel="20px" />
              <TypeSpecimen size="text-base" label="Body Base" weight="font-normal" sizeLabel="16px" />
              <TypeSpecimen size="text-sm" label="Body Small" weight="font-normal" sizeLabel="12px" />
              <TypeSpecimen size="text-xs" label="Caption XS" weight="font-normal" sizeLabel="10px" />
            </div>
          </Card>
        </section>

        {/* 2. Color Palette */}
        <section className="space-y-6">
          <SectionHeader title="02. Colors" description="Semantic palette tokens" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Surface */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary border-b border-surface-tertiary pb-2">Surface</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="surface-primary" hex="#242424" bg="bg-surface-primary" />
                <ColorCard name="surface-secondary" hex="#343436" bg="bg-surface-secondary" />
                <ColorCard name="surface-tertiary" hex="#474747" bg="bg-surface-tertiary" />
                <ColorCard name="surface-inverse" hex="#ffffff" bg="bg-surface-inverse" text="text-surface-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary border-b border-surface-tertiary pb-2">Content</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="content-primary" hex="#ffffff" bg="bg-content-primary" text="text-surface-primary" />
                <ColorCard name="content-secondary" hex="#e3e3dd" bg="bg-content-secondary" text="text-surface-primary" />
                <ColorCard name="content-tertiary" hex="#a7a7a7" bg="bg-content-tertiary" text="text-surface-primary" />
                <ColorCard name="content-inverse" hex="#242424" bg="bg-content-inverse" text="text-content-primary" />
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary border-b border-surface-tertiary pb-2">Brand</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="brand-primary" hex="#daa420" bg="bg-brand-primary" text="text-brand-dark" />
                <ColorCard name="brand-dark" hex="#725a1e" bg="bg-brand-dark" text="text-white" />
                <ColorCard name="brand-secondary" hex="#86e0cb" bg="bg-brand-secondary" text="text-surface-primary" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary border-b border-surface-tertiary pb-2">Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="success" hex="#91ed91" bg="bg-success" text="text-surface-primary" />
                <ColorCard name="warning" hex="#f3a361" bg="bg-warning" text="text-surface-primary" />
                <ColorCard name="error" hex="#ba8f8e" bg="bg-error" text="text-surface-primary" />
                <ColorCard name="info" hex="#86e0cb" bg="bg-info" text="text-surface-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section className="space-y-6">
          <SectionHeader title="03. Buttons" description="Interactive elements" />

          <Card className="space-y-8">
            {/* Standard Buttons */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Standard</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" isLoading>Loading</Button>
              </div>
            </div>

            {/* With Icons */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">With Icons</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" startIcon={<Check size={18} />}>Confirm</Button>
                <Button variant="secondary" startIcon={<Settings size={18} />}>Settings</Button>
                <Button variant="ghost" endIcon={<ChevronRight size={18} />}>Next</Button>
              </div>
            </div>

            {/* Icon Only */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Icon Only</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" size="icon"><Search size={20} /></Button>
                <Button variant="secondary" size="icon"><Bell size={20} /></Button>
                <Button variant="ghost" size="icon"><MoreHorizontal size={20} /></Button>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. Cards */}
        <section className="space-y-6">
          <SectionHeader title="04. Cards" description="Content containers" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Base Card */}
            <Card>
              <h4 className="text-lg font-bold mb-2">Base Card</h4>
              <p className="text-content-secondary text-sm leading-relaxed">
                Standard container with subtle border and no shadow. Used for grouped content.
              </p>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated">
              <h4 className="text-lg font-bold mb-2 text-brand-primary">Elevated Card</h4>
              <p className="text-content-secondary text-sm leading-relaxed">
                Container with soft shadow (`shadow-soft`). Used for floating elements or emphasis.
              </p>
            </Card>

            {/* Interactive Card */}
            <Card variant="interactive">
              <div className="flex justify-between items-start mb-3">
                 <h4 className="text-lg font-bold">Interactive</h4>
                 <Badge label="Click Me" variant="success" />
              </div>
              <p className="text-content-secondary text-sm leading-relaxed">
                Reacts to hover and click. Scales down slightly on active press.
              </p>
            </Card>
          </div>
        </section>

        {/* 5. UI Elements */}
        <section className="space-y-6">
          <SectionHeader title="05. UI Elements" description="Badges, Avatars, Progress" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Avatars & Badges */}
            <Card className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Avatars</h4>
                <div className="flex items-center gap-4">
                  <Avatar size="lg" src="https://i.pravatar.cc/150?img=11" fallback="JD" />
                  <Avatar size="md" fallback="AB" status="online" />
                  <Avatar size="sm" fallback="User" status="offline" />
                  <div className="flex -space-x-3">
                    <Avatar size="sm" fallback="1" className="border-2 border-surface-secondary" />
                    <Avatar size="sm" fallback="2" className="border-2 border-surface-secondary" />
                    <Avatar size="sm" fallback="3" className="border-2 border-surface-secondary" />
                    <div className="w-8 h-8 rounded-full bg-surface-tertiary border-2 border-surface-secondary flex items-center justify-center text-[10px] font-bold text-content-secondary">
                      +5
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Badges & Pills</h4>
                <div className="flex flex-wrap gap-3">
                  <Badge label="Success" variant="success" />
                  <Badge label="Warning" variant="warning" />
                  <Badge label="Error" variant="error" />
                  <Badge label="Info" variant="info" />
                  <Badge label="Neutral" variant="neutral" />
                </div>
              </div>
            </Card>

            {/* Progress & Loading */}
            <Card className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Progress Indicators</h4>
                
                <div className="space-y-2">
                  <ProgressBar value={45} showLabel />
                </div>

                <div className="space-y-2">
                  <ProgressBar value={100} variant="success" showLabel />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Skeleton Loading</h4>
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-surface-tertiary rounded w-3/4"></div>
                  <div className="h-4 bg-surface-tertiary rounded w-1/2"></div>
                  <div className="h-32 bg-surface-tertiary rounded w-full mt-4"></div>
                </div>
              </div>
            </Card>

          </div>
        </section>

        {/* 6. Forms */}
        <section className="space-y-6">
          <SectionHeader title="06. Form Elements" description="Inputs, Toggles, Checkboxes" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Input Fields</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-content-secondary">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="user@example.com"
                  icon={<Search size={18} />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-content-secondary">Bio</label>
                <TextArea 
                  rows={3}
                  placeholder="Tell us about yourself..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-content-secondary">Disabled Input</label>
                <Input 
                  type="text" 
                  disabled
                  value="Cannot edit this" 
                />
              </div>
            </Card>

            {/* Controls */}
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Selection Controls</h4>
              
              {/* Toggle */}
              <Card className="p-3 flex items-center justify-between bg-surface-primary border-surface-tertiary">
                <Toggle 
                  label="Notifications"
                  description="Receive email alerts"
                  checked={toggleState}
                  onChange={() => setToggleState(!toggleState)}
                />
              </Card>

              {/* Checkbox */}
              <Card className="p-3 flex items-center bg-surface-primary border-surface-tertiary">
                <Checkbox 
                  label="Terms of Service"
                  description="I agree to the terms"
                  checked={checkboxState}
                  onChange={() => setCheckboxState(!checkboxState)}
                />
              </Card>

            </Card>
          </div>
        </section>

        {/* 7. Calendar */}
        <section className="space-y-6">
          <SectionHeader title="07. Calendar" description="Date picker component" />
          
          <Card variant="elevated" className="max-w-sm mx-auto md:mx-0 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-content-primary flex items-center gap-2">
                <CalendarIcon size={18} className="text-brand-primary" />
                October 2025
              </h4>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <ChevronRight size={18} className="rotate-180" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <span key={d} className="text-xs font-bold text-content-tertiary py-1">{d}</span>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty days */}
              {[...Array(2)].map((_, i) => <div key={`empty-${i}`} className="p-2" />)}
              
              {/* Days */}
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isSelected = day === 24;
                const isToday = day === 20;
                
                return (
                  <button 
                    key={day}
                    className={`
                      p-2 rounded-lg text-sm font-medium transition-colors
                      ${isSelected ? 'bg-brand-primary text-brand-dark font-bold shadow-soft' : ''}
                      ${isToday && !isSelected ? 'border border-brand-primary text-brand-primary' : ''}
                      ${!isSelected && !isToday ? 'text-content-secondary hover:bg-surface-tertiary' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
};

/* --- Helper Components --- */

const SectionHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="border-l-4 border-brand-primary pl-4">
    <h2 className="text-2xl font-bold text-content-primary">{title}</h2>
    <p className="text-content-secondary">{description}</p>
  </div>
);

const ColorCard = ({ name, hex, bg, text = "text-content-primary" }: { name: string, hex: string, bg: string, text?: string }) => (
  <Card className={`${bg} ${text} flex flex-col justify-between h-24 border-black/5 shadow-soft`}>
    <span className="font-bold text-sm">{name}</span>
    <span className="font-mono text-xs opacity-80 uppercase">{hex}</span>
  </Card>
);

const TypeSpecimen = ({ size, label, weight, sizeLabel }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-surface-tertiary pb-4 last:border-0 last:pb-0">
    <div className={`${size} ${weight} text-content-primary mb-2 md:mb-0`}>
      The quick brown fox
    </div>
    <div className="text-xs font-mono text-content-tertiary flex gap-4">
      <span>{label}</span>
      <span>{sizeLabel}</span>
      <span className="opacity-50">{weight}</span>
    </div>
  </div>
);

export default DesignSystemShowcase;
