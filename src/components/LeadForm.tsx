import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Switch } from '@/components/ui/switch';
import { LeadInfo } from '@/types'; // Assuming types.ts is in src

export const leadFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(5, { message: 'Phone number is required.' }), // Basic validation, can be improved
  sendTranscript: z.boolean().default(true), // Defaulting to true, implies opt-out
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: LeadInfo) => void;
}

export function LeadForm({ isOpen, onOpenChange, onSubmit }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: '',
      email: '',
      phone: '',
      sendTranscript: true, // Stays true as per current code and PRD screenshot implies it selected
    },
  });

  const processForm = (data: LeadFormValues) => {
    onSubmit(data as LeadInfo); // Ensure type compatibility
    reset();
    // onOpenChange(false); // Dialog closure is handled by ChatGate or parent based on submission success
  };

  // Ensure the dialog doesn't close itself on escape or overlay click if onOpenChange is restrictive
  // Radix Dialog `onOpenChange` is called for these events.
  // The parent component (ChatGate) will manage whether it *actually* closes.

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-skypearl-white border-skypearl-light">
        <DialogHeader>
          <DialogTitle className="text-skypearl-dark font-playfair">Contact Information</DialogTitle>
          <DialogDescription>
            Please provide your details to start chatting with our assistant.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(processForm)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="firstName" className="text-skypearl-dark">First Name</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              className="mt-1 bg-white border-skypearl-light/50 focus:ring-skypearl focus:border-skypearl"
              placeholder="John"
              disabled={isSubmitting}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="text-skypearl-dark">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 bg-white border-skypearl-light/50 focus:ring-skypearl focus:border-skypearl"
              placeholder="john.doe@example.com"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone" className="text-skypearl-dark">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="mt-1 bg-white border-skypearl-light/50 focus:ring-skypearl focus:border-skypearl"
              placeholder="+1234567890"
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="sendTranscript"
              type="button"
              checked={watch('sendTranscript')}
              onCheckedChange={val => setValue('sendTranscript', val)}
              {...register('sendTranscript')}
              disabled={isSubmitting}
            />
            <Label htmlFor="sendTranscript" className="text-skypearl-dark">
              Send chat transcript to my email
            </Label>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-skypearl hover:bg-skypearl-dark text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Start Chat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 