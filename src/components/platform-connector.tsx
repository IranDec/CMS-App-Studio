'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { CMSConfig } from '@/services/cms'; // Assuming cms service exists

const platformSchema = z.object({
  platform: z.enum(['prestashop', 'woocommerce', 'magento', 'opencart', 'shopify'], {
    required_error: 'Please select a CMS platform.',
  }),
  apiUrl: z.string().url({ message: 'Please enter a valid API URL.' }),
  apiKey: z.string().min(10, { message: 'API Key must be at least 10 characters.' }), // Basic validation
});

type PlatformFormData = z.infer<typeof platformSchema>;

const cmsPlatforms = [
  { value: 'prestashop', label: 'Prestashop' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'magento', label: 'Magento' },
  { value: 'opencart', label: 'OpenCart' },
  { value: 'shopify', label: 'Shopify' },
];

export function PlatformConnector() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const form = useForm<PlatformFormData>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      platform: undefined,
      apiUrl: '',
      apiKey: '',
    },
  });

  async function onSubmit(data: PlatformFormData) {
    setIsConnecting(true);
    console.log('Connecting to CMS:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, call getProducts or a similar validation function
    // const isValidConnection = await validateConnection(data as CMSConfig);

    const isValidConnection = Math.random() > 0.3; // Simulate success/failure

    setIsConnecting(false);

    if (isValidConnection) {
      toast({
        title: 'Connection Successful!',
        description: `Successfully connected to ${data.platform}.`,
        variant: 'default', // Use default variant for success
      });
      // Potentially store connection details or trigger next step
       form.reset(); // Reset form on success
    } else {
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to the CMS. Please check your details.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="mt-auto pt-4 border-t">
      <h3 className="text-lg font-medium mb-3 text-primary">Connect Platform</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CMS Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cmsPlatforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourstore.com/api" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your API Key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

// Example validation function (replace with actual API call)
async function validateConnection(config: CMSConfig): Promise<boolean> {
  try {
    // Simulate API check
    console.log('Validating connection for:', config.platform);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Replace with actual API call like getProducts or a specific health check endpoint
    // const products = await getProducts(config);
    // return products.length > 0; // Example check
    return true; // Assume success for now
  } catch (error) {
    console.error('Connection validation failed:', error);
    return false;
  }
}
