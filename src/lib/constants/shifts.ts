import { Sun, Sunset, Moon } from 'lucide-react';

export const SHIFTS = [
  { 
    value: 'night', 
    label: 'Nuit (21h30-7h)', 
    icon: Moon, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-600',
    lightBg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  { 
    value: 'day', 
    label: 'Jour (7h-15h)', 
    icon: Sun, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    lightBg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20'
  },
  { 
    value: 'evening', 
    label: 'Soir (15h-21h30)', 
    icon: Sunset, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    lightBg: 'bg-orange-500/10',
    border: 'border-orange-500/20'
  }
] as const;

export type ShiftType = typeof SHIFTS[number]['value'];

export const getShiftInfo = (shiftValue: string) => {
  return SHIFTS.find(shift => shift.value === shiftValue);
};

export const getShiftLabel = (shiftValue: string) => {
  return getShiftInfo(shiftValue)?.label || shiftValue;
};

export const getShiftColor = (shiftValue: string) => {
  return getShiftInfo(shiftValue)?.color || 'text-gray-500';
};