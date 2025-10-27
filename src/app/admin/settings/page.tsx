'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { settingsSchema } from '@/lib/validations';
import { z } from 'zod';

type SettingsData = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      reset(data);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו לטעון את ההגדרות',
        variant: 'destructive',
      });
    }
  }

  async function onSubmit(data: SettingsData) {
    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('שגיאה בעדכון הגדרות');
      }

      toast({
        title: 'ההגדרות עודכנו',
        description: 'השינויים נשמרו בהצלחה',
      });
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>הגדרות מערכת</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="vatRate">אחוז מע״מ</Label>
              <Input
                id="vatRate"
                type="number"
                step="0.01"
                {...register('vatRate', { valueAsNumber: true })}
              />
              {errors.vatRate && (
                <p className="text-sm text-red-500">{errors.vatRate.message}</p>
              )}
              <p className="text-sm text-gray-500">
                לדוגמה: 0.17 עבור 17% מע״מ
              </p>
            </div>

            <div>
              <Label htmlFor="minOrderAmount">מינימום הזמנה (₪)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                step="0.01"
                {...register('minOrderAmount', { valueAsNumber: true })}
              />
              {errors.minOrderAmount && (
                <p className="text-sm text-red-500">
                  {errors.minOrderAmount.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="businessEmail">אימייל עסקי *</Label>
              <Input id="businessEmail" type="email" {...register('businessEmail')} />
              {errors.businessEmail && (
                <p className="text-sm text-red-500">
                  {errors.businessEmail.message}
                </p>
              )}
              <p className="text-sm text-gray-500">
                הזמנות ישלחו לכתובת זו
              </p>
            </div>

            <div>
              <Label htmlFor="logoUrl">URL לוגו</Label>
              <Input id="logoUrl" {...register('logoUrl')} />
              {errors.logoUrl && (
                <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="termsHtml">תנאים</Label>
              <textarea
                id="termsHtml"
                {...register('termsHtml')}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={5}
                placeholder="תנאי עסקה יופיעו ב-PDF"
              />
              {errors.termsHtml && (
                <p className="text-sm text-red-500">{errors.termsHtml.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : 'שמור הגדרות'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
