
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  maxDevices: number;
  maxGeofences: number;
  historyRetention: number; // days
  analytics: boolean;
  isPopular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  expiryDate?: string;
  cardType?: string;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  pdfUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private subscriptionPlansSubject = new BehaviorSubject<SubscriptionPlan[]>([]);
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  private currentPlanSubject = new BehaviorSubject<SubscriptionPlan | null>(null);

  subscriptionPlans$ = this.subscriptionPlansSubject.asObservable();
  paymentMethods$ = this.paymentMethodsSubject.asObservable();
  invoices$ = this.invoicesSubject.asObservable();
  currentPlan$ = this.currentPlanSubject.asObservable();

  private mockSubscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingPeriod: 'monthly',
      features: [
        'Track up to 2 devices',
        'Basic location history (7 days)',
        'Standard geofencing (2 zones)',
        'Email notifications'
      ],
      maxDevices: 2,
      maxGeofences: 2,
      historyRetention: 7,
      analytics: false
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 4.99,
      billingPeriod: 'monthly',
      features: [
        'Track up to 5 devices',
        'Extended location history (30 days)',
        'Advanced geofencing (10 zones)',
        'Email & push notifications',
        'Basic location analytics'
      ],
      maxDevices: 5,
      maxGeofences: 10,
      historyRetention: 30,
      analytics: true,
      isPopular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      billingPeriod: 'monthly',
      features: [
        'Unlimited devices',
        'Complete location history (90 days)',
        'Unlimited geofencing zones',
        'Priority notifications',
        'Advanced analytics & reporting',
        'Premium customer support'
      ],
      maxDevices: 999,
      maxGeofences: 999,
      historyRetention: 90,
      analytics: true
    }
  ];

  private mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      expiryDate: '12/25',
      cardType: 'Visa',
      isDefault: true
    }
  ];

  private mockInvoices: Invoice[] = [
    {
      id: 'INV-001',
      date: new Date(2023, 5, 15),
      amount: 4.99,
      status: 'paid',
      plan: 'Basic Monthly',
      pdfUrl: '#'
    },
    {
      id: 'INV-002',
      date: new Date(2023, 6, 15),
      amount: 4.99,
      status: 'paid',
      plan: 'Basic Monthly',
      pdfUrl: '#'
    }
  ];

  constructor(private authService: AuthService) {
    // Initialize with mock data
    this.subscriptionPlansSubject.next(this.mockSubscriptionPlans);
    this.paymentMethodsSubject.next(this.mockPaymentMethods);
    this.invoicesSubject.next(this.mockInvoices);
    
    // Set the current plan based on the user's subscription type
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const planId = user.subscriptionType || 'free';
        const plan = this.mockSubscriptionPlans.find(p => p.id === planId) || null;
        this.currentPlanSubject.next(plan);
      } else {
        this.currentPlanSubject.next(null);
      }
    });
  }

  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.subscriptionPlans$;
  }

  getCurrentPlan(): Observable<SubscriptionPlan | null> {
    return this.currentPlan$;
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethods$;
  }

  getInvoices(): Observable<Invoice[]> {
    return this.invoices$;
  }

  subscribeToPlan(planId: string): Observable<SubscriptionPlan> {
    const plan = this.mockSubscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    // Update the user's subscription type
    return this.authService.updateSubscription(planId as 'free' | 'basic' | 'premium').pipe(
      delay(1000), // Simulate network delay
      tap(() => {
        this.currentPlanSubject.next(plan);
        
        // If this is a paid plan, also create a new invoice
        if (plan.price > 0) {
          const newInvoice: Invoice = {
            id: `INV-${Math.floor(Math.random() * 1000)}`,
            date: new Date(),
            amount: plan.price,
            status: 'paid',
            plan: `${plan.name} ${plan.billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}`,
            pdfUrl: '#'
          };
          
          const invoices = [newInvoice, ...this.invoicesSubject.value];
          this.invoicesSubject.next(invoices);
        }
      })
    );
  }

  addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Observable<PaymentMethod> {
    const newMethod: PaymentMethod = {
      ...method,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    // If this is set as default, update other methods
    let updatedMethods = [...this.paymentMethodsSubject.value];
    if (newMethod.isDefault) {
      updatedMethods = updatedMethods.map(m => ({
        ...m,
        isDefault: false
      }));
    }
    
    updatedMethods = [...updatedMethods, newMethod];
    this.paymentMethodsSubject.next(updatedMethods);
    
    return of(newMethod).pipe(delay(1000)); // Simulate network delay
  }

  removePaymentMethod(id: string): Observable<boolean> {
    const methods = this.paymentMethodsSubject.value;
    const methodToRemove = methods.find(m => m.id === id);
    
    if (!methodToRemove) {
      return of(false);
    }
    
    // Cannot remove the default payment method if there are others
    if (methodToRemove.isDefault && methods.length > 1) {
      throw new Error('Cannot remove default payment method. Set another as default first.');
    }
    
    const updatedMethods = methods.filter(m => m.id !== id);
    
    // If we just removed the only default method and there are other methods,
    // set the first remaining one as default
    if (methodToRemove.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }
    
    this.paymentMethodsSubject.next(updatedMethods);
    return of(true).pipe(delay(800)); // Simulate network delay
  }

  setDefaultPaymentMethod(id: string): Observable<boolean> {
    const methods = this.paymentMethodsSubject.value;
    const updatedMethods = methods.map(m => ({
      ...m,
      isDefault: m.id === id
    }));
    
    this.paymentMethodsSubject.next(updatedMethods);
    return of(true).pipe(delay(800)); // Simulate network delay
  }
}
