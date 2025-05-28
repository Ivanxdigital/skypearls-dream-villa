import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LeadInfo } from '@/types';
import { leadFormSchema, type LeadFormValues } from '@/lib/schemas';

interface LeadFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: LeadInfo) => void;
}

export function LeadForm({ isOpen, onOpenChange, onSubmit }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: '',
      email: '',
      phone: '',
      sendTranscript: false,
    },
  });

  const processForm = (data: LeadFormValues) => {
    onSubmit(data as LeadInfo);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="dock-chat w-full max-w-full sm:max-w-[425px] md:max-w-[550px] max-h-[80vh] bg-skypearl-white border-skypearl-light shadow-xl z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 duration-300 ease-out"
      >
        <DialogHeader>
          <DialogTitle className="text-skypearl-dark font-playfair">Welcome to Skypearls Villas</DialogTitle>
          <DialogDescription>
            Please provide your first name to start chatting with our AI assistant about our luxury villas in Siargao.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(processForm)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="firstName" className="text-skypearl-dark">First Name *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              className="mt-1 bg-white border-skypearl-light/50 focus:ring-skypearl focus:border-skypearl"
              placeholder="Enter your first name"
              disabled={isSubmitting}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          
          <div className="text-sm text-gray-600 bg-skypearl-light/20 p-3 rounded-lg">
            <p className="font-medium text-skypearl-dark mb-1">For detailed inquiries and villa viewings:</p>
            <p>Our team will share direct contact information during your chat for personalized assistance.</p>
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-skypearl hover:bg-skypearl-dark text-white w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Starting Chat...' : 'Start Chat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}